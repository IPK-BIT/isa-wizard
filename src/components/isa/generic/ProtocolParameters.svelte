<script lang="ts">
  import Schema from "@/lib/schemas";
  import String from "./String.svelte";
  import { onMount } from "svelte";
  import ProtocolParameter from "./ProtocolParameter.svelte";
  import AutocompleteWidget from "@/components/ts4nfdi/AutocompleteWidget.svelte";
  import { SvelteMap, SvelteSet } from "svelte/reactivity";
  import { isaObj } from "@/stores/isa";

  interface Parameter {
    label: string;
    iri: string;
    ontology_name: string;
    type: string;
  }

  let { value: protocolParameters = $bindable() } = $props();

  function _getParameter(parameterName: string) {
    let parameter = Schema.getObjectFromSchema("protocol_parameter");
    parameter.parameterName = Schema.getObjectFromSchema("ontology_annotation");
    parameter.parameterName.annotationValue = parameterName;

    let commentForValue = Schema.getObjectFromSchema("comment");
    commentForValue.name = "value";
    commentForValue.value = "";
    parameter.comments = [commentForValue];
    return parameter;
  }

  let tmp: Parameter;
  let countParameters = $state(0);
  function addParameter(parameter: Parameter) {
    if (protocolParameters.find((p: any) => p.parameterName.termAccession === parameter.iri)) {
      console.error(`Parameter with iri: ${parameter.iri} already added!`);
      return;
    }

    const paramSchema = _getParameter(parameter.label);
    paramSchema.parameterName.termSource = parameter.ontology_name;
    paramSchema.parameterName.termAccession = parameter.iri;

    protocolParameters = [...protocolParameters, paramSchema];
    countParameters++;

    //             {
    //               "@id": "",
    //               "name": "unit",
    //               "value": {
    //                 "@id": "",
    //                 "annotationValue": "",
    //                 "termSource": "",
    //                 "termAccession": "",
    //                 "comments": []
    //               }
  }

  function removeParameter(index: number) {
    protocolParameters = [...protocolParameters.slice(0, index), ...protocolParameters.slice(index + 1)];
  }
</script>

<div id="parameters" class="parameters-container">
  <h3>Protocol Parameters</h3>

  <div>
    {#key countParameters}
    <AutocompleteWidget
      api={"https://api.terminology.tib.eu/api/"}
      parameter={"fieldList=description,label,iri,short_form,ontology_name&collection=dataplant&type=class"}
      singleSelection={true}
      selectionChangedEvent={(selectedOptions: Parameter[]) => {
        tmp = selectedOptions[0]; // only one parameter because of singleSelection = true
      }}
    />
    {/key}

    <button type="button" class="btn btn-secondary" onclick={() => addParameter(tmp)}>Add Parameters</button>

    {#each protocolParameters, i}
      <ProtocolParameter remove={(index: number) => removeParameter(index)} index={i} bind:value={protocolParameters[i]} />
    {/each}
  </div>
</div>

<!-- <String label={"Protocol Parameters"} attr="parameters" /> -->
