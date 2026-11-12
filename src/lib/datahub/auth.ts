import type { DatahubConfig } from '$lib/types/Config';

/**
 * OAuth 2.0 authorization code flow with PKCE against a GitLab instance (PLANTdataHUB),
 * using a full-page redirect. The wizard keeps its document only in memory, so the caller
 * passes a snapshot that is stashed in sessionStorage and handed back after the redirect.
 */

const PENDING_KEY = 'isa-wizard:datahub:pending';
const DEFAULT_SCOPE = 'api';

export interface DatahubToken {
	accessToken: string;
	/** Epoch milliseconds */
	expiresAt: number;
}

export interface RedirectResult<S> {
	snapshot: S;
	token?: DatahubToken;
	error?: string;
}

interface PendingLogin<S> {
	state: string;
	verifier: string;
	redirectUri: string;
	snapshot: S;
}

export function baseUrl(config: DatahubConfig): string {
	return config.url.replace(/\/+$/, '');
}

function defaultRedirectUri(): string {
	return `${window.location.origin}${window.location.pathname}`;
}

function base64Url(bytes: Uint8Array): string {
	let binary = '';
	for (const byte of bytes) binary += String.fromCharCode(byte);
	return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function randomString(byteLength: number): string {
	return base64Url(crypto.getRandomValues(new Uint8Array(byteLength)));
}

async function codeChallenge(verifier: string): Promise<string> {
	const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(verifier));
	return base64Url(new Uint8Array(digest));
}

/** Stashes `snapshot` and redirects the page to the GitLab sign-in. Does not return. */
export async function startLogin<S>(config: DatahubConfig, snapshot: S): Promise<void> {
	if (!crypto?.subtle) {
		throw new Error('Signing in requires a secure context (HTTPS or localhost).');
	}
	const verifier = randomString(32);
	const pending: PendingLogin<S> = {
		state: randomString(16),
		verifier,
		redirectUri: config.redirectUri ?? defaultRedirectUri(),
		snapshot
	};
	try {
		sessionStorage.setItem(PENDING_KEY, JSON.stringify(pending));
	} catch (err) {
		throw new Error(
			'Your work could not be saved before signing in (browser storage unavailable or full). ' +
				'Download it as ISA-JSON first.'
		);
	}

	const params = new URLSearchParams({
		client_id: config.clientId,
		redirect_uri: pending.redirectUri,
		response_type: 'code',
		scope: config.scope ?? DEFAULT_SCOPE,
		state: pending.state,
		code_challenge: await codeChallenge(verifier),
		code_challenge_method: 'S256'
	});
	window.location.assign(`${baseUrl(config)}/oauth/authorize?${params}`);
}

function readPending<S>(): PendingLogin<S> | null {
	try {
		const raw = sessionStorage.getItem(PENDING_KEY);
		return raw ? (JSON.parse(raw) as PendingLogin<S>) : null;
	} catch {
		return null;
	}
}

/** Removes the OAuth response parameters from the address bar. */
function cleanUrl(): void {
	const url = new URL(window.location.href);
	for (const key of ['code', 'state', 'error', 'error_description']) url.searchParams.delete(key);
	window.history.replaceState(window.history.state, '', url);
}

/**
 * Completes a sign-in when the page was loaded as the OAuth redirect of a login started by
 * `startLogin`. Returns `null` otherwise, leaving the URL untouched (the host page may use
 * `code`/`state` parameters itself).
 */
export async function completeLogin<S>(config: DatahubConfig): Promise<RedirectResult<S> | null> {
	const params = new URLSearchParams(window.location.search);
	const state = params.get('state');
	if (!state) return null;
	const pending = readPending<S>();
	if (!pending || pending.state !== state) return null;

	try {
		sessionStorage.removeItem(PENDING_KEY);
	} catch {
		// ignore
	}
	cleanUrl();

	const { snapshot } = pending;
	const error = params.get('error');
	if (error) {
		return { snapshot, error: params.get('error_description') ?? error };
	}
	const code = params.get('code');
	if (!code) return { snapshot, error: 'The sign-in response did not contain a code.' };

	try {
		const response = await fetch(`${baseUrl(config)}/oauth/token`, {
			method: 'POST',
			headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
			body: new URLSearchParams({
				client_id: config.clientId,
				code,
				grant_type: 'authorization_code',
				redirect_uri: pending.redirectUri,
				code_verifier: pending.verifier
			})
		});
		const body = await response.json().catch(() => ({}));
		if (!response.ok || !body.access_token) {
			return {
				snapshot,
				error: `Sign-in failed: ${body.error_description ?? body.error ?? response.statusText}`
			};
		}
		return {
			snapshot,
			token: {
				accessToken: body.access_token,
				expiresAt: Date.now() + (Number(body.expires_in) || 7200) * 1000
			}
		};
	} catch (err) {
		return { snapshot, error: `Sign-in failed: ${err instanceof Error ? err.message : err}` };
	}
}

/** Best-effort token revocation on sign-out. */
export async function revokeToken(config: DatahubConfig, token: DatahubToken): Promise<void> {
	try {
		await fetch(`${baseUrl(config)}/oauth/revoke`, {
			method: 'POST',
			headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
			body: new URLSearchParams({ client_id: config.clientId, token: token.accessToken })
		});
	} catch {
		// The token expires anyway
	}
}
