/** Minimal GitLab REST API (v4) client for the PLANTdataHUB export. */

export interface GitlabUser {
	id: number;
	username: string;
	name: string;
}

export interface GitlabNamespace {
	id: number;
	name: string;
	full_path: string;
	kind: 'user' | 'group';
}

export interface GitlabProject {
	id: number;
	name: string;
	path_with_namespace: string;
	web_url: string;
	default_branch: string | null;
	empty_repo: boolean;
}

export interface GitlabMergeRequest {
	iid: number;
	web_url: string;
}

export type Visibility = 'private' | 'internal' | 'public';

export interface CommitAction {
	action: 'create' | 'update';
	file_path: string;
	content: string;
	encoding: 'base64';
}

export class GitlabError extends Error {
	constructor(
		readonly status: number,
		message: string
	) {
		super(message);
	}
}

function errorMessage(body: any, fallback: string): string {
	const message = body?.message ?? body?.error_description ?? body?.error;
	if (!message) return fallback;
	if (typeof message === 'string') return message;
	if (Array.isArray(message)) return message.join(', ');
	// Validation errors: { path: ['has already been taken'], ... }
	return Object.entries(message)
		.map(([field, errors]) => `${field} ${([] as unknown[]).concat(errors).join(', ')}`)
		.join('; ');
}

export function toBase64(bytes: Uint8Array): string {
	let binary = '';
	const chunk = 0x8000;
	for (let i = 0; i < bytes.length; i += chunk) {
		binary += String.fromCharCode(...bytes.subarray(i, i + chunk));
	}
	return btoa(binary);
}

export class GitlabClient {
	constructor(
		private readonly baseUrl: string,
		private readonly accessToken: string
	) {}

	private async request(method: string, path: string, body?: unknown): Promise<Response> {
		const response = await fetch(`${this.baseUrl}/api/v4${path}`, {
			method,
			headers: {
				Authorization: `Bearer ${this.accessToken}`,
				...(body !== undefined ? { 'Content-Type': 'application/json' } : {})
			},
			body: body !== undefined ? JSON.stringify(body) : undefined
		});
		if (!response.ok && response.status !== 404) {
			const data = await response.json().catch(() => null);
			const fallback =
				response.status === 401
					? 'Your PLANTdataHUB session has expired. Please sign in again.'
					: `${response.status} ${response.statusText}`;
			throw new GitlabError(response.status, errorMessage(data, fallback));
		}
		return response;
	}

	private async json<T>(method: string, path: string, body?: unknown): Promise<T> {
		const response = await this.request(method, path, body);
		if (response.status === 404) throw new GitlabError(404, `Not found: ${path}`);
		return response.json();
	}

	getUser(): Promise<GitlabUser> {
		return this.json('GET', '/user');
	}

	/** The user's personal namespace and the groups they are a member of. */
	async listNamespaces(): Promise<GitlabNamespace[]> {
		const namespaces: GitlabNamespace[] = [];
		for (let page = 1; page <= 20; page++) {
			const response = await this.request('GET', `/namespaces?per_page=100&page=${page}`);
			namespaces.push(...(await response.json()));
			if (!response.headers.get('X-Next-Page')) break;
		}
		return namespaces;
	}

	async findProject(fullPath: string): Promise<GitlabProject | null> {
		const response = await this.request('GET', `/projects/${encodeURIComponent(fullPath)}`);
		return response.status === 404 ? null : response.json();
	}

	createProject(params: {
		name: string;
		path: string;
		namespace_id: number;
		visibility: Visibility;
		description?: string;
	}): Promise<GitlabProject> {
		return this.json('POST', '/projects', {
			...params,
			default_branch: 'main',
			initialize_with_readme: false
		});
	}

	async fileExists(projectId: number, filePath: string, ref: string): Promise<boolean> {
		const response = await this.request(
			'HEAD',
			`/projects/${projectId}/repository/files/${encodeURIComponent(filePath)}?ref=${encodeURIComponent(ref)}`
		);
		return response.status !== 404;
	}

	commit(
		projectId: number,
		params: {
			branch: string;
			start_branch?: string;
			commit_message: string;
			actions: CommitAction[];
		}
	): Promise<{ id: string; web_url: string }> {
		return this.json('POST', `/projects/${projectId}/repository/commits`, params);
	}

	createMergeRequest(
		projectId: number,
		params: {
			source_branch: string;
			target_branch: string;
			title: string;
			description?: string;
			remove_source_branch?: boolean;
		}
	): Promise<GitlabMergeRequest> {
		return this.json('POST', `/projects/${projectId}/merge_requests`, params);
	}
}
