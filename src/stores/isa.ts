import { writable, get, derived } from 'svelte/store';
import { keyed } from '@humanspeak/svelte-keyed';


import Schema from '@/lib/schemas';

function createIsaStoresSynced() {

    const storeIsaObj = writable({});
    const storeIsaStr = writable('');

    const setIsaObj = (isaObj: any) => {
        storeIsaObj.set(isaObj);
        storeIsaStr.set(JSON.stringify(isaObj, null, 2));
    }

    const updateIsaObj = (isaObj: any) => {
        storeIsaObj.update(isaObj);
        storeIsaStr.set(JSON.stringify(get(storeIsaObj), null, 2));
    }

    const setIsaStr = (isaStr: string) => {
        storeIsaObj.set(JSON.parse(isaStr));
        storeIsaStr.set(isaStr);
    }

    // const addProxies = () => {
    //     let isaObj = get(storeIsaObj);
    //     isaObj = new Proxy(isaObj, miappeInvestigationHandler);
    //     if (isaObj.studies.length > 0) {
    //         for (const [i, study] of isaObj.studies.entries()) {
    //             isaObj.studies[i] = new Proxy(isaObj.studies[i], miappeStudyHandler);
    //         }
    //     }
    //     storeIsaObj.set(isaObj);
    // }

    type IsaObjStore = {
        subscribe: typeof storeIsaObj.subscribe;
        update: typeof updateIsaObj;
        set: typeof setIsaObj;
        // addProxies?: typeof addProxies;
        keyed?: (level: any) => ReturnType<typeof keyed>;
        keyedComments?: (jsonPath: any, commentName: any) => any;
    };

    const storesSynced: {
        isaObj: IsaObjStore;
        isaStr: {
            subscribe: typeof storeIsaStr.subscribe;
            set: typeof setIsaStr;
        };
    } = {
        isaObj: {
            subscribe: storeIsaObj.subscribe,
            update: updateIsaObj,
            set: setIsaObj,
            // addProxies: addProxies,
        },
        isaStr: {
            subscribe: storeIsaStr.subscribe,
            set: setIsaStr
        }
    };

    storesSynced.isaObj.keyed = (level) => keyed(storesSynced.isaObj, level);

    storesSynced.isaObj.keyedComments = (jsonPath, commentName) => {
        const keyedComments = keyed(storesSynced.isaObj, jsonPath);

        const derivedComments = derived(keyedComments, $comments => {
            let comment = $comments.find((c: {name: string, value: string}) => c.name == commentName);
            let value = '';
            if(comment) {
                value = comment.value;
            }
            return value;
        });

        const update = (value: string) => {
            if (!value) {
                value = '';
            }
            keyedComments.update($comments => {
                let comment = $comments.find((c: {name: string, value: string}) => c.name == commentName);
                if(comment) {
                    comment.value = value;
                    $comments = $comments;
                } else {
                    comment = Schema.getComment(commentName, value);
                    $comments = [...$comments, comment];
                }
                return $comments;
            });

        }
        const set = (value: string) => {
            update(value);
        }

        const store = {
            subscribe: derivedComments.subscribe,
            update: update,
            set: set
        }

        return store;
    }

    return storesSynced;

}

const storesIsa = createIsaStoresSynced();

export const isaObj = storesIsa.isaObj;
export const isaStr = storesIsa.isaStr;