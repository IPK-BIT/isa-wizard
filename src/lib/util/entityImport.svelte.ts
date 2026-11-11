const identity = (e: any): string | undefined => e?.['@id'] ?? e?.name;

/**
 * Appends clones of `selected` to `existing`, skipping entities whose `@id` (or, lacking one, `name`)
 * is already present. Clones keep `@id`/`name`, so the assay entity and the study entity are the same
 * entity by identity, while avoiding object aliasing inside the store.
 */
export function appendUniqueEntities<T extends object>(existing: T[] | undefined, selected: T[]): T[] {
	const result = [...(existing ?? [])];
	const seen = new Set(result.map(identity).filter(Boolean));
	for (const item of selected) {
		const key = identity(item);
		if (key && seen.has(key)) continue;
		if (key) seen.add(key);
		result.push(structuredClone($state.snapshot(item)) as T);
	}
	return result;
}
