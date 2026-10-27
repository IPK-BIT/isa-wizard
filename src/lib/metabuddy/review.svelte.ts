import { get } from 'svelte/store';
import { getConfig } from '$lib/config.svelte';
import { isaObj } from '$stores/isa';
import type { WizardConfig } from '$lib/types/Config';
import { isRootScope, pathTokens } from './scope';
import type { ConvertResponse } from './types';

/**
 * Fields a conversion flagged as "needs review": paths with a confidence score and paths that
 * could not be inferred (`warnings`). Filled when the user confirms a conversion.
 * Paths are kept in one canonical form (`studies[0].people[1].email`), see normalizePath().
 */

const DEFAULT_CONFIDENCE_THRESHOLD = 0.7;

let confidence: Record<string, number> = $state({});
let warnings: string[] = $state([]);

/** `studies.0.title`, `$.studies[0].title` and `studies[0].title` all become `studies[0].title`. */
export function normalizePath(path: string): string {
	const tokens = pathTokens(path);
	if (tokens[0] === '$') tokens.shift();
	return tokens
		.map((token, i) => (/^\d+$/.test(token) ? `[${token}]` : i ? `.${token}` : token))
		.join('');
}

function inScope(path: string, scope: string): boolean {
	if (isRootScope(scope)) return true;
	const base = normalizePath(scope);
	return path === base || path.startsWith(`${base}.`) || path.startsWith(`${base}[`);
}

/**
 * The confidence scores and warnings of a convert response, normalised and limited to `scope`.
 * Only the sub-tree at the scope is applied, so flags for paths outside of it would point at
 * fields that did not change.
 */
export function scopedReview(
	response: Pick<ConvertResponse, 'confidence' | 'warnings'>,
	scope: string
): { confidence: Record<string, number>; warnings: string[] } {
	const scores: Record<string, number> = {};
	for (const [path, score] of Object.entries(response.confidence ?? {})) {
		const key = normalizePath(path);
		if (typeof score === 'number' && inScope(key, scope)) scores[key] = score;
	}
	const paths = (response.warnings ?? []).map(normalizePath).filter((p) => inScope(p, scope));
	return { confidence: scores, warnings: [...new Set(paths)] };
}

/** Records the review hints of a confirmed conversion. Replaces older hints inside `scope`. */
export function setReview(scoped: ReturnType<typeof scopedReview>, scope: string) {
	const kept = Object.fromEntries(
		Object.entries(confidence).filter(([path]) => !inScope(path, scope))
	);
	confidence = { ...kept, ...scoped.confidence };
	warnings = [...warnings.filter((p) => !inScope(p, scope)), ...scoped.warnings];
}

function threshold(): number {
	const cfg = (getConfig() as WizardConfig).integrations?.metabuddy;
	return cfg?.confidenceThreshold ?? DEFAULT_CONFIDENCE_THRESHOLD;
}

/**
 * The canonical paths under which a conversion may have flagged a field. A comment-backed field
 * (`commentName`) has no plain path: it is addressed by the synthetic `<jsonPath>.<commentName>`
 * (also what is sent to explain as `field`) and by the position of its comment in the store
 * (`<jsonPath>[2]`, which covers `<jsonPath>[2].value`).
 */
function fieldPaths(jsonPath: string, commentName?: string): string[] {
	const path = normalizePath(jsonPath);
	if (commentName == null) return [path];

	const paths = [normalizePath(`${path}.${commentName}`)];
	let comments: unknown = get(isaObj);
	for (const token of pathTokens(path)) {
		comments =
			comments != null && typeof comments === 'object' ? (comments as any)[token] : undefined;
	}
	const index = Array.isArray(comments) ? comments.findIndex((c) => c?.name === commentName) : -1;
	if (index >= 0) paths.push(`${path}[${index}]`);
	return paths;
}

function isFlagged(path: string): boolean {
	const score = confidence[path];
	return warnings.includes(path) || (score !== undefined && score < threshold());
}

/**
 * Whether the field at `jsonPath` (absolute from the document root) should be reviewed: its score
 * is below the confidence threshold, or it is listed in the warnings. Flags on paths below the
 * field count for it too (`people[0].email` flags `people`), `score` is then the lowest one.
 * For comment-backed fields pass the `commentName`.
 */
export function needsReview(
	jsonPath: string,
	commentName?: string
): { score?: number } | undefined {
	// Nothing was converted yet, skip the path work
	if (!warnings.length && !Object.keys(confidence).length) return undefined;

	const scopes = fieldPaths(jsonPath, commentName);
	const flagged = [...new Set([...Object.keys(confidence), ...warnings])].filter(
		(path) => isFlagged(path) && scopes.some((scope) => inScope(path, scope))
	);
	if (!flagged.length) return undefined;

	const scores = flagged.map((path) => confidence[path]).filter((score) => score !== undefined);
	return scores.length ? { score: Math.min(...scores) } : {};
}

/** Drops the hints of one field and everything below it, e.g. once the user edited it. */
export function clearReview(jsonPath: string, commentName?: string) {
	const scopes = fieldPaths(jsonPath, commentName);
	const hit = (path: string) => scopes.some((scope) => inScope(path, scope));
	confidence = Object.fromEntries(Object.entries(confidence).filter(([path]) => !hit(path)));
	warnings = warnings.filter((path) => !hit(path));
}

export function resetReview() {
	confidence = {};
	warnings = [];
}
