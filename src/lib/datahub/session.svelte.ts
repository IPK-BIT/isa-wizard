import type { DatahubConfig } from '$lib/types/Config';
import { GitlabClient, type GitlabUser } from './api';
import { baseUrl, completeLogin, revokeToken, startLogin, type DatahubToken } from './auth';

/** What is restored after the sign-in redirect. */
export interface WizardSnapshot {
	isa: any;
	appstate: Record<string, unknown>;
}

/**
 * PLANTdataHUB sign-in state. The access token is kept in memory only: it is gone after a
 * reload, and a new sign-in is a quick redirect while the GitLab session is still active.
 */
export const datahubSession = $state({
	token: null as DatahubToken | null,
	user: null as GitlabUser | null,
	error: null as string | null,
	/** The page was just loaded as the sign-in redirect */
	returnedFromLogin: false
});

export function datahubClient(config: DatahubConfig): GitlabClient | null {
	const token = datahubSession.token;
	if (!token || token.expiresAt <= Date.now()) return null;
	return new GitlabClient(baseUrl(config), token.accessToken);
}

export function signIn(config: DatahubConfig, snapshot: WizardSnapshot): Promise<void> {
	return startLogin(config, snapshot);
}

export async function signOut(config: DatahubConfig): Promise<void> {
	const token = datahubSession.token;
	datahubSession.token = null;
	datahubSession.user = null;
	if (token) await revokeToken(config, token);
}

/**
 * Call once when the widget starts. If the page is the sign-in redirect, finishes the sign-in
 * and returns the wizard state saved before leaving.
 */
export async function handleDatahubRedirect(config: DatahubConfig): Promise<WizardSnapshot | null> {
	const result = await completeLogin<WizardSnapshot>(config);
	if (!result) return null;

	datahubSession.returnedFromLogin = true;
	datahubSession.error = result.error ?? null;
	if (result.token) {
		datahubSession.token = result.token;
		try {
			datahubSession.user = await new GitlabClient(
				baseUrl(config),
				result.token.accessToken
			).getUser();
		} catch (err) {
			datahubSession.token = null;
			datahubSession.error = `Sign-in failed: ${err instanceof Error ? err.message : err}`;
		}
	}
	return result.snapshot;
}
