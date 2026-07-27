import { writable, get, derived } from 'svelte/store';
import { keyed } from '@humanspeak/svelte-keyed';
import Schema from '../lib/schemas';
import type { ISAInvestigationSchema } from '../lib/types/isa.generated';

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
	return storesSynced;
}

const storesIsa = createIsaStoresSynced();

export const isaObj = storesIsa.isaObj;
export const isaStr = storesIsa.isaStr;
