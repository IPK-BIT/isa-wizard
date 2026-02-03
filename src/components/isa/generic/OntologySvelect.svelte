<script lang="ts" module>
  export interface OntologyResult {
    label?: string;
    value?: string;
    description?: string[];
    iri?: string;
    ontology_name?: string;
    short_form?: string;
  }
</script>

<script lang="ts">
  import Svelecte from "svelecte";

  interface Props {
    value?: any;
    placeholder?: string;
    searchResult: OntologyResult | string | null;
    fetchUrl?: string;
    fetchCallback?: any;
    onChangeCallback?: any;
    renderer?: any;
  }

  let {
    value = $bindable(),
    placeholder = "Search ontology...",
    searchResult = $bindable(),
    fetchUrl = "https://api.terminology.tib.eu/api/select?q=[query]&fieldList=description,label,iri,ontology_name,type,short_form",
    fetchCallback = handleFetch,
    onChangeCallback,
    renderer,
  }: Props = $props();

  function handleFetch(data: { response: { docs: OntologyResult[] } }) {
    let results = data.response.docs;
    let values = results.map((result: OntologyResult) => {
      return {
        label: result.label,
        description: result.description?.[0] ?? null,
        iri: result.iri,
        ontology_name: result.ontology_name,
        short_form: result.short_form,
        text: `${result.label} (${result.short_form})`,
        value: result,
      };
    });

    if (values.length > 0) {
      return values;
    } else {
      return [];
    }
  }
</script>

<Svelecte {placeholder} bind:value={searchResult} fetch={fetchUrl} {fetchCallback} onChange={onChangeCallback} {renderer}>
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

<style>
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
