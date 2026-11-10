import { writable, get, derived } from 'svelte/store';
import { keyed } from '@humanspeak/svelte-keyed';
import Schema from '$lib/schemas';
import type { ISAInvestigationSchema } from '$lib/types/isa.generated';

function createIsaStoresSynced() {
	const initialIsa = Schema.getObjectFromSchema('investigation') as ISAInvestigationSchema;
	const storeIsaObj = writable<ISAInvestigationSchema>(initialIsa);
	const storeIsaStr = writable('');

	const setIsaObj = (isaObj: ISAInvestigationSchema) => {
		storeIsaObj.set(isaObj);
		storeIsaStr.set(JSON.stringify(isaObj, null, 2));
	};

	const updateIsaObj = (
		isaObj:
			Partial<ISAInvestigationSchema> | ((prev: ISAInvestigationSchema) => ISAInvestigationSchema)
	) => {
		if (typeof isaObj === 'function') {
			storeIsaObj.update(isaObj as (prev: ISAInvestigationSchema) => ISAInvestigationSchema);
		} else {
			storeIsaObj.update((prev) => ({ ...prev, ...isaObj }));
		}
		storeIsaStr.set(JSON.stringify(get(storeIsaObj), null, 2));
	};

	const setIsaStr = (isaStr: string) => {
		storeIsaObj.set(JSON.parse(isaStr));
		storeIsaStr.set(isaStr);
	};

	const storesSynced = {
		isaObj: {
			subscribe: storeIsaObj.subscribe,
			update: updateIsaObj,
			set: setIsaObj,
			keyed: (lvl: string) => keyed(storesSynced.isaObj, lvl),
			keyedComments: (jsonPath: string, commentName: string) => {
				return {} as any;
			},
			keyedCommentGroup: (jsonPath: string, commentNames: Record<string, string>) => {
				return {} as any;
			}
		},
		isaStr: {
			subscribe: storeIsaStr.subscribe,
			set: setIsaStr
		}
	};

	storesSynced.isaObj.keyed = (lvl: string) => {
		return keyed(storesSynced.isaObj, lvl);
	};

	storesSynced.isaObj.keyedComments = (jsonPath: string, commentName: string) => {
		const keyedComments = keyed(storesSynced.isaObj, jsonPath);

		const derivedComments = derived(keyedComments, ($comments) => {
			// Ensure $comments is an array to avoid undefined errors
			if (!Array.isArray($comments)) return '';

			let comment = $comments.find((c: { name: string; value: string }) => c.name === commentName);
			return comment ? comment.value : '';
		});

		const update = (value: string) => {
			if (!value) {
				value = '';
			}
			keyedComments.update(($comments) => {
				// Initialize as empty array if undefined
				let commentsList = Array.isArray($comments) ? [...$comments] : [];
				let comment = commentsList.find(
					(c: { name: string; value: string }) => c.name === commentName
				);

				if (comment) {
					comment.value = value;
				} else {
					const newComment = Schema.getObjectFromSchema('comment');
					newComment!.name = commentName;
					newComment!.value = value; // Ensure the initial typed value is captured immediately!
					commentsList.push(newComment);
				}
				return commentsList;
			});
		};

		const set = (value: string) => {
			update(value);
		};

		return {
			subscribe: derivedComments.subscribe,
			update,
			set
		};
	};

	/**
	 * Several comments of one `comments` array as a single object store, e.g.
	 * `{ latitude: 'Study Latitude', ... }` <-> `{ latitude: '48.85', ... }`. Used by composed
	 * widgets that edit a few related comments together. Keys missing on `set` are left untouched.
	 */
	storesSynced.isaObj.keyedCommentGroup = (
		jsonPath: string,
		commentNames: Record<string, string>
	) => {
		const keyedComments = keyed(storesSynced.isaObj, jsonPath);

		const derivedGroup = derived(keyedComments, ($comments) => {
			const list = Array.isArray($comments) ? $comments : [];
			return Object.fromEntries(
				Object.entries(commentNames).map(([key, name]) => [
					key,
					list.find((c: { name: string; value: string }) => c.name === name)?.value ?? ''
				])
			) as Record<string, string>;
		});

		const set = (values: Record<string, string>) => {
			keyedComments.update(($comments) => {
				const commentsList = Array.isArray($comments) ? [...$comments] : [];
				for (const [key, name] of Object.entries(commentNames)) {
					if (!(key in values)) continue;
					const value = values[key] ?? '';
					const comment = commentsList.find(
						(c: { name: string; value: string }) => c.name === name
					);
					if (comment) {
						comment.value = value;
					} else {
						const newComment = Schema.getObjectFromSchema('comment');
						newComment!.name = name;
						newComment!.value = value;
						commentsList.push(newComment);
					}
				}
				return commentsList;
			});
		};

		return {
			subscribe: derivedGroup.subscribe,
			set,
			update: (fn: (v: Record<string, string>) => Record<string, string>) => {
				let current: Record<string, string> = {};
				derivedGroup.subscribe((v) => (current = v))();
				set(fn(current));
			}
		};
	};
	return storesSynced;
}

const storesIsa = createIsaStoresSynced();

export const isaObj = storesIsa.isaObj;
export const isaStr = storesIsa.isaStr;
