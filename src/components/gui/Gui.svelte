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
  // import Exports from "../export/Exports.svelte";
  // import Wrapper from "./Wrapper.svelte";

  // import { simpleGuiBreadcrumb, simpleGuiLevel } from "@/stores/wizard";
  // import Study from "./Study.svelte";
  // import { isaObj } from "@/stores/isa";
  // import Material from "./Material.svelte";
  // import Sample from "./Sample.svelte";
  // import Protocol from "./Protocol.svelte";
  // import Process from "./Process.svelte";

  const component = {
    Investigation: Investigation,
    Study: Study,
    Protocol: Protocol,
    Material: Material,
    Sample: Sample,
    Process: Process,
  };

  type ComponentKey = keyof typeof component;

  // $simpleGuiBreadcrumb = [
  //     { name: $isaObj.title?$isaObj.title:'Untitled Investigation', fn: () => $simpleGuiLevel = { type: 'Investigation', jsonPath: '' } }
  // ];

  // $simpleGuiLevel = {
  //     type: 'Investigation',
  //     jsonPath: ''
  // };

  wizardStore.simpleGuiBreadcrumb = [
    {
      name: isaObj.title ?? "Untitled Investigation",
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
