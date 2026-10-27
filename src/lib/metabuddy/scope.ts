import { get } from 'svelte/store';
import { getAppstate } from '$lib/appstate.svelte';
import { isaObj } from '$stores/isa';
import { joinIsaPath, parseIsaLvl } from '$lib/util/breadcrumbUtils';
import type { ISAInvestigationSchema } from '$lib/types/isa.generated';
import type { IsaJson } from './types';

const UNSAFE_KEYS = ['__proto__', 'constructor', 'prototype'];

/** Splits a path like `studies[0].publications` into `['studies', '0', 'publications']`. */
export function pathTokens(path: string): string[] {
	return path.match(/[^.[\]]+/g) ?? [];
}

/** True for the scopes that address the whole document (empty path or the level name). */
export function isRootScope(scope: string): boolean {
	return !scope || scope === 'investigation';
}

/**
 * Builds the Metabuddy `scope` (and explain `field`) from the current app state:
 * the level path (`isaLvl`) plus the step's relative `jsonPath`, e.g. `studies[0].publications`.
 * Without a step path it is the level path alone, or `guiType` at the investigation level.
 */
export function buildScope(stepJsonPath?: string): string {
	const { isaLvl, guiType } = getAppstate();
	const atRoot = parseIsaLvl(isaLvl).level === 'investigation';

	if (!stepJsonPath) return atRoot && !isaLvl ? guiType : isaLvl;
	return joinIsaPath(isaLvl, stepJsonPath);
}

/**
 * Returns the sub-tree at `scope` from a convert response.
 * Assumes `response.isaJson` is the whole isaObj and `scope` is an absolute path from its root.
 * This is the only place that knows that shape.
 */
export function extractScoped(response: { isaJson?: IsaJson }, scope: string): unknown {
	const root = response.isaJson;
	// Level names without a path (investigation level) address the whole document.
	if (isRootScope(scope)) return root;

	let node: unknown = root;

	for (const key of pathTokens(scope)) {
		if (node == null || typeof node !== 'object') return undefined;
		node = (node as Record<string, unknown>)[key];
	}
	return node;
}

function setIn(node: unknown, tokens: string[], value: unknown): unknown {
	if (node == null || typeof node !== 'object') return undefined;
	const [head, ...rest] = tokens;
	if (UNSAFE_KEYS.includes(head)) return undefined;

	const copy: any = Array.isArray(node) ? [...node] : { ...node };
	if (Array.isArray(node)) {
		// Replace an item or append right behind the last one, never leave holes
		const index = Number(head);
		if (!Number.isInteger(index) || index < 0 || index > node.length) return undefined;
		if (index === node.length && rest.length) return undefined;
	} else if (!(head in node) && rest.length) {
		// Only the last segment may be new, so a typo in the scope does not invent containers
		return undefined;
	}

	if (rest.length) {
		const child = setIn((node as any)[head], rest, value);
		if (child === undefined) return undefined;
		copy[head] = child;
	} else {
		copy[head] = value;
	}
	return copy;
}

/**
 * Returns a copy of `root` with the sub-tree at `scope` replaced by `value`, or `undefined` when
 * the path cannot be followed. Only the objects and arrays along the path are copied, everything
 * else keeps its identity. A root scope returns `value` itself.
 */
export function setAtPath<T>(root: T, scope: string, value: unknown): T | undefined {
	if (isRootScope(scope)) return value as T;
	return setIn(root, pathTokens(scope), value) as T | undefined;
}

/**
 * Writes `value` into the ISA document at `scope` and nothing outside of it. Root scopes replace
 * the whole document. Returns false (and leaves the store alone) when the path does not exist.
 */
export function applyScoped(scope: string, value: unknown): boolean {
	if (value == null || (isRootScope(scope) && typeof value !== 'object')) return false;
	// Detach from the response object, so later edits do not write back into the preview.
	// JSON instead of structuredClone, because the value may be a Svelte state proxy.
	const next = setAtPath(get(isaObj), scope, JSON.parse(JSON.stringify(value)));
	if (next === undefined) return false;
	// set() also refreshes the JSON text shown in the right column
	isaObj.set(next as ISAInvestigationSchema);
	return true;
}
