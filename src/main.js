import App from './App.svelte'

const useShadowDOM = true;

function startApp(containerId, params) {

    const _containerId = '#' + containerId;
    const container = document.querySelector(_containerId);
    let target;

    if (useShadowDOM) {
        target = container.attachShadow({ mode: "open" });
    } else {
        target = container;
    }

    const config = {
        general: params.config?.general,
        export: params.config?.export,
        checklist: params.config?.checklist,
        prefill: params.prefill,
        steps: params.steps,
        explanations: params.explanations
    }

    const app = new App({
        target: target,
        props: {
            config: config
        }
    });
    return app;
}

window.miappeWizard = {
    startApp: startApp
}

//export default app