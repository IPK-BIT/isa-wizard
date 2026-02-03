<script lang="ts">
  import Investigation from "@/components/gui/Investigation.svelte";
  import Study from "@/components/gui/Study.svelte";
  import Protocol from "@/components/gui/Protocol.svelte";
  import Material from "@/components/gui/Material.svelte";
  import Sample from "@/components/gui/Sample.svelte";
  import Process from "@/components/gui/Process.svelte";
  import ComponentWrapper from "@/components/questionnaire/ComponentWrapper.svelte";
  import { isaObj } from "@/stores/isa";
  import { wizardStore } from "@/stores/WizardStore.svelte";
  import Exports from "../export/Exports.svelte";

  const component = {
    Investigation: Investigation,
    Study: Study,
    Protocol: Protocol,
    Material: Material,
    Sample: Sample,
    Process: Process,
  };

  wizardStore.simpleGuiBreadcrumb = [
    {
      name: $isaObj.title ?? "Untitled Investigation",
      fn: () => {
        (wizardStore.simpleGuiLevel.type = "Investigation"), (wizardStore.simpleGuiLevel.jsonPath = "");
      },
    },
  ];

  wizardStore.simpleGuiLevel = {
    type: "Investigation",
    jsonPath: "",
  };
</script>

{#key wizardStore.simpleGuiLevel.jsonPath}
  <ComponentWrapper component={component[wizardStore.simpleGuiLevel.type]} jsonPath={wizardStore.simpleGuiLevel.jsonPath} />
{/key}

<Exports />
