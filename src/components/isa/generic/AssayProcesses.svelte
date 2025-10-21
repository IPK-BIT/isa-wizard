<script lang="ts">
  import ImageProcesses from "./ImageProcesses.svelte";

  interface Study {
    studyDbId: string; // The ID which uniquely identifies a study within the given database server - MIAPPE V1.1 (DM-11) Study unique ID - Unique identifier comprising the name or identifier for the institution/database hosting the submission of the study data, and the identifier of the study in that institution.
    studyName: string; // The human readable name for a study - MIAPPE V1.1 (DM-12) Study title - Human-readable text summarising the study
  }

  interface Image {
    imageDbId: string; // The unique identifier of an image
    imageURL?: string; // The complete, absolute URI path to the image file. Images might be stored on a different host or path than the BrAPI web server.
    description?: string; // The human readable description of an image.
    imageName?: string; // The human readable name of an image. Might be the same as 'imageFileName', but could be different.
    imageFileName?: string; // The name of the image file. Might be the same as 'imageName', but could be different.
    imageFileSize?: string; // The size of the image in Bytes.
  }

  let { componentConfig = {}, value = $bindable() } = $props();

  let brapiURL = $derived(componentConfig.brapiBaseURL);
  let allStudies: Study[] = $state([]); // all available studies
  let selectedStudy: Study | null = $state(null);
  let allImages: Image[] = $state([]); // all images fetched from BrAPI server for the selected study
  let visibleImages: Image[] = $state([]);
  let loading: boolean = $state(false);
  const PAGE_SIZE = 8; // controls how many image cards are shown initially before Load More Button gets visible
  let page = 0;
  let approve = $derived.by(() => (value.processSequence.length > 0 ? true : false)); // If processes are in ISA String, then table should be loaded (approve = true)

  let errorLog = $state(""); // This is for showing errors which can occur when fetching data from BrAPI server

  /**
   * Fetching data from the specified URL
   * @param parameter - programs, studies, images etc.
   */
  async function fetchBrapiData(parameter: string) {
    loading = true;
    errorLog = "";

    try {
      if (!brapiURL) {
        throw new Error("Please specify a brapi url");
      }

      const response = await fetch(brapiURL + parameter, {
        headers: { Accept: "application/json" },
        method: "GET",
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText} `);
      }

      const data = await response.json();
      if (!data) {
        console.warn("No data returned from BrAPI Server!");
        return;
      }

      return data.result?.data ?? [];
    } catch (error) {
      console.error(`${error}`);
      errorLog = `${error}`;
    } finally {
      loading = false;
    }
  }

  /**
   * Load available images for the selected study
   */
  async function loadImages() {
    // If BrAPI Server supports GET /images/studyDbId => uncomment the line below
    // const images = await fetchBrapiData(`images?studyDbId=${selectedStudy}`);
    const images = await fetchBrapiData("images");
    allImages = images;
    visibleImages = allImages.slice(0, PAGE_SIZE);
  }

  function loadMoreImages() {
    page += 1;
    const next = allImages.slice(0, (page + 1) * PAGE_SIZE);
    visibleImages = next;
  }

  /**
   * Just for testing. Can be deleted if not needed anymore
   */
  async function testMultipleImages(amount: number) {
    for (let i = 0; i < amount; i++) {
      allImages.push(...(await fetchBrapiData("images")));
    }
    visibleImages = allImages.slice(0, PAGE_SIZE);
  }

  function reset() {
    approve = false;
  }
</script>

{#if !approve}
  <div class="grid padding">
    <!-- First Row -->
    <div class="flex-center padding">
      <label for="server-input"> Server: </label>
    </div>
    <div class="server-container">
      <input id="server-input" bind:value={brapiURL} type="text" class="input-url" placeholder="URL of the BrAPI endpoint. Usually of the form /brapi/v2/" />
      <div class="flex-center">
        <button class="btn large" style="min-width: 150px;" onclick={async () => (allStudies = (await fetchBrapiData("studies")) ?? [])}>Load</button>
      </div>
    </div>

    <!-- Second Row -->
    {#if allStudies.length > 0}
      <div class="flex-center padding">
        <label for="study-select"> Study: </label>
      </div>
      <div class="server-container">
        <select id="study-select" bind:value={selectedStudy} class="study-select" style="flex: 1;" disabled={allStudies.length === 0}>
          {#each allStudies as study}
            <option value={study.studyDbId} class="option">{study.studyDbId} - {study.studyName}</option>
          {/each}
        </select>
        <div class="flex-center">
          <button
            class="btn large"
            style="min-width: 150px;"
            onclick={async () => {
              await loadImages();
              // just for testing
              // testMultipleImages(10);
            }}>Find Images</button
          >
        </div>
      </div>

      <!-- Third Row -->
      <div class="padding">
        <p>{allImages.length} Images found</p>
      </div>
      <div class="image-grid">
        {#each visibleImages as img}
          <div class="image-card">
            <div class="image-meta">
              <div class="filename">{img.imageFileName}</div>
              <div class="description">{img.description}</div>
              <a class="link" href={img.imageURL} target="_blank" rel="noopener">
                {img.imageDbId}
              </a>
            </div>
          </div>
        {/each}

        <div class="button-container">
          {#if visibleImages.length < allImages.length}
            <button class="btn btn-secondary" onclick={loadMoreImages}>Load more</button>
          {/if}
        </div>
      </div>
    {/if}
  </div>

  {#if allImages.length > 0}
    <div class="btn-container padding">
      <button disabled={false} class:disabled={false} class="btn btn-primary" onclick={() => (approve = true)}>Approve</button>
    </div>
  {/if}

  <div class="grid padding">
    {#if loading}
      <p class="padding">loading...</p>
    {/if}

    {#if errorLog}
      <p class="padding" style="color: red;">{errorLog}</p>
    {/if}
  </div>
{:else}
  <ImageProcesses bind:value {allImages} {reset} />
{/if}

<style>
  /* .grid and .padding are used as a workaround to set the basic form layout from isa wizard  */
  .grid {
    display: grid;
    grid-template-columns: 20% 80%;
  }

  .padding {
    padding: 8px;
  }

  .flex-center {
    display: flex;
    align-items: center;
  }

  .server-container {
    display: flex;
    flex-direction: row;
    gap: 4px;
    padding: 16px 0px;
  }

  #server-input {
    flex: 1;
  }

  .image-grid {
    display: grid;
    grid-template-columns: 1fr 1fr 1fr 1fr;
    gap: 1rem;
    margin-top: 1rem;
  }

  .button-container {
    grid-column: 2 / span 2;
    display: flex;
    justify-content: center;
  }

  .button-container button {
    width: 50%;
  }

  .image-card {
    background: #fff;
    border: 1px solid #ddd;
    border-radius: 12px;
    padding: 0.75rem;
    display: flex;
    flex-direction: column;
    transition: box-shadow 0.2s ease;
  }

  .image-card:hover {
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }

  .image-meta {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
  }

  .filename {
    font-weight: 600;
    font-size: 0.95rem;
    color: #222;
  }

  .description {
    font-size: 0.85rem;
    color: #555;
    overflow: hidden;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
  }

  .link {
    font-size: 0.8rem;
    color: #3178c6;
    text-decoration: none;
    word-break: break-all;
  }

  .link:hover {
    text-decoration: underline;
  }

  .input-url {
    width: 75%;
  }

  .study-select {
    min-width: 300px;
    padding: 8px;
  }

  .btn-container {
    display: flex;
    justify-content: end;
  }

  .btn-container > .btn {
    width: 150px;
    height: 50px;
  }

  button.btn.disabled {
    background: linear-gradient(0deg, hsl(0, 0%, 70%) 0%, hsl(0, 0%, 85%) 100%) !important;
    color: black;
  }
</style>
