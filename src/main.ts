import { mount } from "svelte";
import App from "./App.svelte";
import { init } from "./stores/gitlab-api";

await init(); // Handle gitlab init in case of oauth redirect flow

// Extend the Window interface to include 'isawizard'
declare global {
  interface Window {
    isawizard: {
      startApp: typeof startApp;
    };
  }
}

let useShadowDOM = false;

function startApp(containerId: string, params: any) {
  const _containerId = `#${containerId}`;
  const container = document.querySelector(_containerId);
  let target: Element | ShadowRoot | null = null;

  if (useShadowDOM) {
    target = container?.attachShadow({ mode: "open" }) ?? null;
  } else {
    target = container;
  }

  if (!target) {
    throw new Error("Target container not found");
  }

  const config = {
    general: params.config?.general,
    export: params.config?.export,
    checklist: params.config?.checklist,
    prefill: params.prefill,
    steps: params.steps,
    explanations: params.explanations
  };

  return mount(App, {
    target: target,
    props: config
  });
}

window.isawizard = {
  startApp: startApp
};