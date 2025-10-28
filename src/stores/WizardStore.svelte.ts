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
      fn: () => {},
    },
  ]);
}

export const wizardStore = new WizardStore();
