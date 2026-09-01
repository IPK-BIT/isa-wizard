const generateRandomString = (length: number) => {
	const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
	const values = crypto.getRandomValues(new Uint8Array(length));
	return values.reduce((acc, x) => acc + possible[x % possible.length], '');
};

const sha256 = async (plain: string) => {
	const encoder = new TextEncoder();
	const data = encoder.encode(plain);
	return window.crypto.subtle.digest('SHA-256', data);
};

const base64encode = (input: ArrayBuffer) => {
	return btoa(String.fromCharCode(...new Uint8Array(input)))
		.replace(/=/g, '')
		.replace(/\+/g, '-')
		.replace(/\//g, '_');
};

/**
 * Generates a fresh PKCE verifier/challenge pair. Call this once per
 * authorization attempt — never reuse a pair across requests.
 */
const generatePkcePair = async () => {
	const codeVerifier = generateRandomString(64);
	const hashed = await sha256(codeVerifier);
	const codeChallenge = base64encode(hashed);
	return { codeVerifier, codeChallenge };
};

export const authorizeClient = async (
	base_url: string,
	client_id: string,
	redirect_uri: string,
	response_type: 'code',
	scope: string,
	code_challenge_method: 'S256'
) => {
	// Fresh verifier + challenge for every authorization attempt, and a
	// fresh state value to protect against CSRF on the callback.
	const { codeVerifier, codeChallenge } = await generatePkcePair();
	const state = generateRandomString(32);

	sessionStorage.setItem('code_verifier', codeVerifier);
	sessionStorage.setItem('oauth_state', state);

	const params = new URLSearchParams({
		client_id,
		redirect_uri,
		response_type,
		scope,
		code_challenge: codeChallenge,
		code_challenge_method,
		state
	});

	const url = new URL(`${base_url}/authorize`);
	url.search = params.toString();

	window.location.href = url.toString();
};

/**
 * Call this on the redirect_uri page before exchanging the code, with the
 * `state` value returned by the provider. Throws if it doesn't match the
 * value generated in authorizeClient, which indicates a possible CSRF /
 * authorization code injection attempt.
 */
export const verifyState = (returnedState: string) => {
	const expectedState = sessionStorage.getItem('oauth_state');
	sessionStorage.removeItem('oauth_state');

	if (!expectedState || returnedState !== expectedState) {
		throw new Error('OAuth state mismatch — possible CSRF attempt. Aborting token exchange.');
	}
};

export const requestToken = async (
	base_url: string,
	grant_type: 'authorization_code',
	code: string,
	redirect_uri: string,
	client_id: string
) => {
	const code_verifier = sessionStorage.getItem('code_verifier');
	// Verifier is single-use: remove it immediately so a leaked/duplicated
	// callback can't be replayed against it.
	sessionStorage.removeItem('code_verifier');

	if (!code_verifier) {
		throw new Error('Missing code_verifier — start the login flow again.');
	}

	const payload = {
		method: 'POST',
		body: new URLSearchParams({
			client_id,
			grant_type,
			code,
			redirect_uri,
			code_verifier
		})
	};

	const res = await fetch(`${base_url}/token`, payload);
	if (!res.ok) {
		const errorBody = await res.text();
		throw new Error(`Token exchange failed (${res.status}): ${errorBody}`);
	}

	const response = await res.json();
	sessionStorage.setItem('access_token', response.access_token);
	return response;
};
