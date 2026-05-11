import { writable, get, derived } from 'svelte/store';
import { keyed } from '@humanspeak/svelte-keyed';
import Schema from '../lib/schemas';

function createIsaStoresSynced() {
	const storeIsaObj = writable({});
	const storeIsaStr = writable('');

	const setIsaObj = (isaObj: any) => {
		storeIsaObj.set(isaObj);
		storeIsaStr.set(JSON.stringify(isaObj, null, 2));
	};

	const updateIsaObj = (isaObj: any) => {
		storeIsaObj.update(isaObj);
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
			let comment = $comments.find((c: { name: string; value: string }) => c.name === commentName);
			let value = comment ? comment.value : '';
			return value;
		});
		const update = (value: string) => {
			if (!value) {
				value = '';
			}
			keyedComments.update(($comments) => {
				let comment = $comments.find(
					(c: { name: string; value: string }) => c.name === commentName
				);
				if (comment) {
					comment.value = value;
					$comments = $comments;
				} else {
					const newComment = Schema.getObjectFromSchema('comment');
					newComment.name = commentName;
					$comments = [...$comments, newComment];
				}
				return $comments;
			});
		};
		const set = (value: string) => {
			update(value);
		};

		const store = {
			subscribe: derivedComments.subscribe,
			update,
			set
		};

		return store;
	};
	return storesSynced;
}

const storesIsa = createIsaStoresSynced();

export const isaObj = storesIsa.isaObj;
export const isaStr = storesIsa.isaStr;
