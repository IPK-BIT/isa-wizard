<script lang="ts">
  import Schema from "@/lib/schemas";
  import Svelecte from "svelecte";
  import { onMount } from "svelte";

  export interface OntologyResult {
    label?: string;
    value?: string;
    description?: string[];
    iri?: string;
    ontology_name?: string;
    short_form?: string;
  }

  interface Props {
    value?: any;
    placeholder?: string;
    searchResult: OntologyResult | null;
    fetchUrl?: string;
    fetchCallback?: any;
    onChangeCallback: any;
  }

  let {
    value = $bindable(),
    placeholder = "Search ontology...",
    searchResult = $bindable(),
    fetchUrl = "https://api.terminology.tib.eu/api/select?q=[query]&fieldList=description,label,iri,ontology_name,type,short_form",
    fetchCallback = handleFetch,
    onChangeCallback = () =>{console.log("hey")},
  }: Props = $props();

  let selectedValue: OntologyResult | null = $state(null);

  function handleFetch(data: { response: { docs: OntologyResult[] } }) {
    let results = data.response.docs;
    let values = results.map((result: OntologyResult) => {
      return {
        label: result.label,
        value: result,
        description: result.description?.[0] ?? null,
        iri: result.iri,
        ontology_name: result.ontology_name,
        short_form: result.short_form,
        text: `${result.label} > ${result.short_form}`,
      };
    });

    if (values.length > 0) {
      return values;
    } else {
      return [];
    }
  }

</script>

{#if !searchResult}
  <Svelecte {placeholder} bind:value={searchResult} fetch={fetchUrl} {fetchCallback} onChange={onChangeCallback}>
    {#snippet option(opt, inputValue)}
      {@const ontology = opt as OntologyResult}
      <div class="unit-container">
        <div class="ontology-label">
          {ontology.label}
          [{ontology.ontology_name}]
        </div>
        <div class="ontology-description">
          {#if ontology.description}
            {ontology.description}
          {/if}
        </div>

        <div class="ontology-iri">
          {ontology.iri}
        </div>
      </div>
    {/snippet}
  </Svelecte>
{/if}

{#if searchResult}
  <div class="type-container">
    <p>{searchResult.label} ({searchResult.short_form})</p>
    <div class="button-container">
      <button class="btn btn-warning" aria-label="remove component type" onclick={() => (searchResult = null)}> X </button>
    </div>
  </div>
{/if}

<style>
  .button-container {
    display: flex;
    justify-content: flex-end;
    padding: 4px 0px;
  }

  .type-container {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .type-container button {
    width: 20px;
    height: 20px;
    display: flex;
    justify-content: center;
    align-items: center;
  }

  .unit-container {
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    align-items: flex-start;
  }

  .ontology-label {
    font-weight: bold;
  }

  .ontology-description {
    display: -webkit-box;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 1;
    -webkit-box-align: start;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .ontology-iri {
    font-size: 0.8em;
    color: #666;
  }
</style>
