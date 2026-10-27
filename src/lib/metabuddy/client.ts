import { getConfig } from '$lib/config.svelte';
import type { MetabuddyConfig, WizardConfig } from '$lib/types/Config';
import type {
	ConvertResponse,
	ErrorResponse,
	ExplainRequest,
	ExplainResponse,
	MetabuddyErrorKind,
	ValidateRequest,
	ValidateResponse
} from './types';

/**
 * Client for the Metabuddy API (docs/metabuddy/openapi.json).
 * Reads baseUrl, apiKey and timeoutMs from the loaded wizard config.
 */

const DEFAULT_TIMEOUT_MS = 60000;

export class MetabuddyError extends Error {
	kind: MetabuddyErrorKind;
	/** True when a newer request with the same key replaced this one. Callers should ignore it. */
	superseded: boolean;

	constructor(kind: MetabuddyErrorKind, message: string, superseded = false) {
		super(message);
		this.name = 'MetabuddyError';
		this.kind = kind;
		this.superseded = superseded;
	}
}

const TIMEOUT = 'timeout';
const SUPERSEDED = 'superseded';

// One controller per request key, so a new request replaces a stale one.
const inflight = new Map<string, AbortController>();

function getMetabuddyConfig(): MetabuddyConfig | undefined {
	return (getConfig() as WizardConfig).integrations?.metabuddy;
}

async function errorFromResponse(res: Response): Promise<MetabuddyError> {
	let detail: string | undefined;
	try {
		const body = (await res.json()) as ErrorResponse;
		detail = body.detail ?? body.error;
	} catch {
		// Body is empty or not JSON (e.g. the bare 401), fall back to the status text.
	}
	const message = detail ?? (res.statusText || `HTTP ${res.status}`);

	if (res.status === 401 || res.status === 403) {
		return new MetabuddyError('auth', detail ?? 'Missing or invalid API key.');
	}
	// 400, 413 and 422 all mean the request itself was rejected.
	if (res.status >= 400 && res.status < 500) {
		return new MetabuddyError('invalid', message);
	}
	return new MetabuddyError('server', message);
}

async function request<T>(
	path: string,
	init: { body: BodyInit; json: boolean },
	key: string = path
): Promise<T> {
	const cfg = getMetabuddyConfig();
	if (!cfg) {
		throw new MetabuddyError('invalid', 'Metabuddy is not configured.');
	}

	const headers: Record<string, string> = {};
	if (cfg.apiKey) headers['X-API-Key'] = cfg.apiKey;
	// For FormData the browser has to set Content-Type itself (it adds the multipart boundary).
	if (init.json) headers['Content-Type'] = 'application/json';

	inflight.get(key)?.abort(SUPERSEDED);
	const controller = new AbortController();
	inflight.set(key, controller);
	const timer = setTimeout(() => controller.abort(TIMEOUT), cfg.timeoutMs ?? DEFAULT_TIMEOUT_MS);

	try {
		const res = await fetch(`${cfg.baseUrl.replace(/\/+$/, '')}${path}`, {
			method: 'POST',
			headers,
			body: init.body,
			signal: controller.signal
		});
		if (!res.ok) throw await errorFromResponse(res);
		try {
			return (await res.json()) as T;
		} catch (err) {
			if (controller.signal.aborted) throw err;
			throw new MetabuddyError('server', 'Metabuddy returned an invalid response.');
		}
	} catch (err) {
		if (err instanceof MetabuddyError) throw err;
		if (controller.signal.aborted) {
			if (controller.signal.reason === SUPERSEDED) {
				throw new MetabuddyError('network', 'Request superseded by a newer one.', true);
			}
			throw new MetabuddyError(
				'timeout',
				`Metabuddy did not respond within ${(cfg.timeoutMs ?? DEFAULT_TIMEOUT_MS) / 1000} s.`
			);
		}
		throw new MetabuddyError('network', 'Could not reach Metabuddy.');
	} finally {
		clearTimeout(timer);
		if (inflight.get(key) === controller) inflight.delete(key);
	}
}

export function explain(req: ExplainRequest, key?: string): Promise<ExplainResponse> {
	return request<ExplainResponse>('/explain', { body: JSON.stringify(req), json: true }, key);
}

export function validate(req: ValidateRequest, key?: string): Promise<ValidateResponse> {
	return request<ValidateResponse>('/validate', { body: JSON.stringify(req), json: true }, key);
}

/** `form` carries `scope`, `files` (repeated), `existingIsa` (JSON string) and optional `prompt`. */
export function convert(form: FormData, key?: string): Promise<ConvertResponse> {
	return request<ConvertResponse>('/convert', { body: form, json: false }, key);
}
