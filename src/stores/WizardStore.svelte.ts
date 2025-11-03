class WizardStore {
  wizard = $state({
    steps: 0,
    currentStep: 0,
  });

  simpleGuiLevel = $state({
    type: "Investigation",
    jsonPath: "",
  });

  simpleGuiBreadcrumb = $state([
    {
      name: "",
      fn: () => {}, // fn function should be in the format () => {}, without the curly brackets svelte will throw a warning => [assignment_value_stale]
    },
  ]);
}

export const wizardStore = new WizardStore();
