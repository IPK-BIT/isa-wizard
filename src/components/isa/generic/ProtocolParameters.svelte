<script lang="ts">
  import Schema from "@/lib/schemas";
  import ProtocolParameter from "./ProtocolParameter.svelte";
  import AutocompleteWidget from "@/components/ts4nfdi/AutocompleteWidget.svelte";

  interface Parameter {
    label: string;
    iri: string;
    ontology_name: string;
    type: string;
  }

  let { value: protocolParameters = $bindable(), attr } = $props();

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

  let selectInput: Parameter | null = $state(null);
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
    countParameters++; // This will trigger rerendering from Autocomplete widget
  }

  function removeParameter(index: number) {
    protocolParameters = [...protocolParameters.slice(0, index), ...protocolParameters.slice(index + 1)];
  }
</script>

<div id="parameters" class="parameters-container">
  <p>Protocol Parameters</p>

  <div>
    {#key countParameters}
      <AutocompleteWidget
        api={"https://api.terminology.tib.eu/api/"}
        parameter={"fieldList=description,label,iri,short_form,ontology_name&collection=dataplant&type=class"}
        singleSelection={true}
        selectionChangedEvent={(selectedOptions: Parameter[]) => {
          selectInput = selectedOptions[0] ?? null; // only one parameter at idx=0 because of singleSelection = true
        }}
      />
    {/key}

    <button
      type="button"
      class="btn btn-secondary"
      disabled={selectInput === null}
      onclick={() => {
        if (selectInput) addParameter(selectInput);
      }}>Add Parameter</button
    >

    {#each protocolParameters, i}
      <ProtocolParameter remove={(index: number) => removeParameter(index)} index={i} bind:value={protocolParameters[i]} />
    {/each}
  </div>
</div>

<style>
  .parameters-container {
    display: grid;
    grid-template-columns: 20% 80%;
    padding: 8px;
  }

  .parameters-container p,
  div {
    padding: 8px;
  }

  .parameters-container div {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  button {
    max-width: 150px;
  }

  button.btn:disabled {
    background: lightgray !important;
    cursor: not-allowed;
  }
</style>
