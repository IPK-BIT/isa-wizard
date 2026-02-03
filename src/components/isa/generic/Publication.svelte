<script lang="ts">
  let { publication = $bindable(), index, removePublication } = $props();

  let lastFetch = "";
  let loading = $state(false);
  let error = $state("");
  /**
   * Automatically fetch DOI information and autofill title and author List if possible
   * Only fetch if the doi is different from last fetch, so that paste Event and Change Event does not trigger fetch twice
   * If doi is empty => reset input fields
   */
  async function fetchDOI(doi: string) {
    if (!doi) {
      lastFetch = "";
      error = "";
      publication.title = "";
      publication.authorList = "";
      return;
    }
    if (doi === lastFetch) {
      return;
    }

    try {
      lastFetch = doi;
      loading = true;
      error = "";
      const response = await fetch("https://doi.org/" + doi, {
        headers: {
          Accept: "application/vnd.citationstyles.csl+json",
        },
      });

      if (!response.ok) {
        throw new Error(`Could not get DOI informations (${doi})`);
      }

      const data = await response.json();

      if (data) {
        publication.title = Array.isArray(data.title) ? data.title[0] : (data.title ?? "");
        const authors = Array.isArray(data.author)
          ? data.author.map((a: any) => {
              const given = a.given ?? "";
              const family = a.family ?? "";
              return [given, family].filter(Boolean).join(" ").trim();
            })
          : [];
        publication.authorList = authors.join(", ");
      }
    } catch (err) {
      console.error(err);
      error = err as string;
    } finally {
      loading = false;
    }
  }

  /**
   * Svelte will detect a paste Event and if clipboardData contains text => call onchange to fetch DOI Data
   * @param event - onpaste Event
   */
  function detectCopyPaste(event: ClipboardEvent) {
    const text = event.clipboardData?.getData("text") ?? "";
    fetchDOI(text);
  }
</script>

<section>
  <div class="publication-container">
    <div class="row-0">
      <input type="text" onchange={() => fetchDOI(publication.doi)} onpaste={(e) => detectCopyPaste(e)} data-attr="doi" bind:value={publication.doi} placeholder="DOI" />
      <input type="text" data-attr="pubMedID" bind:value={publication.pubMedID} placeholder="PubMed ID" />
    </div>
    <div>
      <input type="text" data-attr="title" bind:value={publication.title} placeholder="Publication title" />
    </div>
    <div>
      <input type="text" data-attr="authorList" bind:value={publication.authorList} placeholder="Author list" />
    </div>

    <div class="row-bottom">
      {#if loading}
        <div>loading...</div>
      {:else}
        <div style="color: red;">{error}</div>
      {/if}

      <button class="btn btn-warning" onclick={() => removePublication(index)}>Remove</button>
    </div>
  </div>
</section>

<style>
  .publication-container {
    display: flex;
    flex-direction: column;
  }

  .row-0 {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 8px;
  }

  .row-bottom {
    display: flex;
    justify-content: space-between;
  }

  .row-bottom button {
    margin-left: auto;
    height: 32px;
  }

  section {
    border: 1px solid rgb(150, 150, 150);
    padding: 10px;
    margin-bottom: 20px;
  }

  input {
    margin: 0 20px 5px 0;
    width: 100%;
  }
</style>
