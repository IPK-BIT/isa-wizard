import { explanationStore } from "@/stores/ExplanationStore.svelte";
import { untrack } from "svelte";
import type { Action } from "svelte/action";

/**
 * Creates an action to use for HTML Elements.
 * When focused, the element sets the elements dataset attribute in the Explanation store.
 * This will trigger the Explanation Component to show its data
 * @param node the html node element
 * @param attr explanation attribut containing the explanation information
 */
export const explanationAction: Action<HTMLElement, string> = (node, attr) => {
        if(!attr) return;

        const onFocus = () => explanationStore.setAttr(attr);
        const onBlur= () => {
            // untrack is used here to avoid svelte unsafe mutation error (reset is called from template expression sometimes)
            untrack(() =>  explanationStore.reset());
        }

        node.addEventListener('focus', onFocus)
        node.addEventListener('blur', onBlur);

        // Remove event listeners when HTML Element is removed from the DOM 
        return {
            destroy() {
                node.removeEventListener('focus', onFocus);
                node.removeEventListener('blur', onBlur);
            }
        }
    }