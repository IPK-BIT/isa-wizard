/**
 * Simple Store for explanation attribute which will be set by explanation actions.
 * The current attribute is then used to show explanation details in Explanation component
 */
class ExplanationStore {
    attr: string = $state("");

    constructor() {}

    setAttr(attr: string){
        this.attr = attr;
    }

    reset() {
        this.attr = "";
    }

}

export const explanationStore = new ExplanationStore();