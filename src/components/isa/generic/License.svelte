<script lang="ts">
  import { explanationAction } from "@/actions/explanation";
  import { explanationStore } from "@/stores/ExplanationStore.svelte";
  import Svelecte from "svelecte";
  import { onMount } from "svelte";

  type License = {
    name: string;
    licenseId: string;
  };

  let { label = "", isaLevel = "", attr, value: license = $bindable(), showLabel = true, focus = false } = $props();

  if (!label) {
    label = attr;
  }

  let searchResult = $derived(license === "" ? null : license); // fix svelecte warning because empty string is not identified as null

  async function handleFetch(response: { licenses: Array<License> }) {
    return response.licenses.map((license) => {
      return {
        text: license.name,
        value: license.licenseId,
      };
    });
  }

  onMount(() => {
    // because Svelecte Componenet cant use use:... action must be manually added
    const svelecteElement = document.getElementById("svelecte-" + attr);
    if (svelecteElement) {
      explanationAction(svelecteElement, attr);
    }
  });
</script>

<section>
  <div>
    <div class="label-wrapper">
      {#if showLabel}
        <label for="input-{label}">{label}</label>
      {/if}
    </div>
    <div class="input-wrapper">
      {#if license}
        <div>
          <span>{license}</span>
          <button
            class="btn btn-warning"
            onclick={() => {
              license = "";
            }}>Remove</button
          >
        </div>
      {:else}
        <Svelecte
          inputId={"svelecte-" + attr}
          bind:value={searchResult}
          fetch="https://raw.githubusercontent.com/spdx/license-list-data/main/json/licenses.json"
          fetchCallback={handleFetch}
          onChange={() => {
            if (searchResult) license = searchResult;
          }}
        />
      {/if}
    </div>
  </div>
</section>

<style>
  section div {
    padding: 0.5rem;
    margin: 0;
    box-sizing: border-box;
    align-items: center;
    display: flex;
    align-content: flex-start;
    flex-flow: row wrap;
  }

  div.label-wrapper {
    width: 20%;
  }

  div.input-wrapper {
    width: 80%;
    display: flow-root;
  }

  div.input-wrapper div {
    display: flex;
    align-items: center;
    gap: 1rem;
    border: 1px solid black;
    border-radius: 4px;
    width: 100%;
  }
  button {
    margin-left: auto;
  }
</style>
