<script>
  import Breadcrumb from "./Breadcrumb.svelte";

  import { isaObj } from "@/stores/isa";
  import { wizardStore } from "@/stores/WizardStore.svelte";

  let { value: study, jsonPath = "" } = $props();

  function openMaterial() {
    wizardStore.simpleGuiLevel = {
      type: "Material",
      jsonPath: `${jsonPath}.materials.sources`,
    };
    wizardStore.simpleGuiBreadcrumb = [
      { name: $isaObj.title ?? "Untitled Investigation", fn: () => (wizardStore.simpleGuiLevel = { type: "Investigation", jsonPath: "" }) },
      { name: study.title ?? "Untitled Study", fn: () => (wizardStore.simpleGuiLevel = { type: "Study", jsonPath }) },
      { name: "Materials", fn: () => {} },
    ];
  }

  function openSample() {
    wizardStore.simpleGuiLevel = {
      type: "Sample",
      jsonPath: `${jsonPath}.materials.samples`,
    };
    wizardStore.simpleGuiBreadcrumb = [
      { name: $isaObj.title ? $isaObj.title : "Untitled Investigation", fn: () => (wizardStore.simpleGuiLevel = { type: "Investigation", jsonPath: "" }) },
      { name: study.title ? study.title : "Untitled Study", fn: () => (wizardStore.simpleGuiLevel = { type: "Study", jsonPath }) },
      { name: "Samples", fn: () => {} },
    ];
  }

  function openProtocol(idx) {
    wizardStore.simpleGuiLevel = {
      type: "Protocol",
      jsonPath: `${jsonPath}.protocols[${idx}]`,
    };
    wizardStore.simpleGuiBreadcrumb = [
      {
        name: $isaObj.title ? $isaObj.title : "Untitled Investigation",
        fn: () => {
          wizardStore.simpleGuiLevel = { type: "Investigation", jsonPath: "" };
        },
      },
      {
        name: study.title ? study.title : "Untitled Study",
        fn: () => {
          wizardStore.simpleGuiLevel = { type: "Study", jsonPath };
        },
      },
      { name: `${study.protocols[idx].name} Protocol`, fn: () => {} },
    ];
  }
</script>

<section>
  <h3>Study</h3>
  <Breadcrumb />

  {#if study}
    <table id="study">
      <tbody>
        <tr>
          <td>Title</td>
          <td>{study.title}</td>
        </tr>
        <tr>
          <td>Identifier</td>
          <td>{study.identifier}</td>
        </tr>
        <tr>
          <td>Description</td>
          <td>{study.description}</td>
        </tr>
        <tr>
          <td>Date of submission</td>
          <td>{study.submissionDate}</td>
        </tr>
        <tr>
          <td>Date of public release</td>
          <td>{study.publicReleaseDate}</td>
        </tr>
        <tr>
          <td>People</td>
          <td>
            {#if study.people.length > 0}
              <ul>
                {#each study.people as person}
                  {@const orcid = person.comments.find((comment) => comment.value.includes("orcid.org"))?.value}
                  <li>
                    {person.firstName}
                    {person.lastName}, {person.affiliation}, {person.address}
                    {#if orcid}
                      <br />ORCID: <a target="_blank" href={orcid}>{orcid}</a>
                    {/if}
                  </li>
                {/each}
              </ul>
            {:else}
              No people associated with this study.
            {/if}
          </td>
        </tr>
        <tr>
          <td>Publications</td>
          <td>
            {#if study.publications.length > 0}
              <ul>
                {#each study.publications as publication}
                  <li>
                    {publication.title} - {publication.authorList}
                    {#if publication.doi}
                      <br />DOI: <a href={`https://doi.org/${publication.doi}`} target="_blank">{publication.doi}</a>
                    {/if}
                  </li>
                {/each}
              </ul>
            {:else}
              No publications associated with this study.
            {/if}
          </td>
        </tr>
        <tr>
          <td>Protocols</td>
          <td>
            {#if study.protocols.length > 0}
              <table class="subtable">
                <tbody>
                  <tr>
                    <th>Name</th>
                    <th>Version</th>
                    <th>URI</th>
                  </tr>
                  {#each study.protocols as protocol, idx}
                    <tr>
                      <td>
                        <button type="button" class="link" style="background: none; border: none" onclick={() => openProtocol(idx)}>{protocol.name}</button>
                      </td>
                      <td>{protocol.version}</td>
                      <td><a href={protocol.uri} target="_blank">{protocol.uri}</a></td>
                    </tr>
                  {/each}
                </tbody>
              </table>
            {:else}
              No protocols associated with this study.
            {/if}
          </td>
        </tr>
        <tr>
          <td>Materials</td>
          <td>
            {#if study.materials.sources.length > 0}
              <table class="subtable">
                <tbody>
                  <tr>
                    <th>Name</th>
                  </tr>
                  {#each study.materials.sources as material, idx}
                    {#if idx < 5}
                      <tr>
                        <td>{material.name}</td>
                      </tr>
                    {/if}
                  {/each}
                </tbody>
              </table>
              <p style="font-style: italic; font-size: .9em">Showing first 5 of <a class="link" onclick={openMaterial}>{study.materials.sources.length} materials</a></p>
            {:else}
              No materials associated with this study.
            {/if}
          </td>
        </tr>
        <tr>
          <td>Samples</td>
          <td>
            {#if study.materials.samples.length > 0}
              <table class="subtable">
                <tbody>
                  <tr>
                    <th>Name</th>
                  </tr>
                  {#each study.materials.samples as material, idx}
                    {#if idx < 5}
                      <tr>
                        <td>{material.name}</td>
                      </tr>
                    {/if}
                  {/each}
                </tbody>
              </table>
              <p style="font-style: italic; font-size: .9em">Showing first 5 of <a class="link" onclick={openSample}>{study.materials.samples.length} samples</a></p>
            {:else}
              No materials associated with this study.
            {/if}
          </td>
        </tr>
        <tr>
          <td>Comments</td>
          <td>
            {#if study.comments.length > 0}
              <table class="subtable">
                <tbody>
                  <tr>
                    <th>Name</th>
                    <th>Value</th>
                  </tr>
                  {#each study.comments as comment}
                    <tr>
                      <td>{comment.name}</td>
                      <td>{comment.value}</td>
                    </tr>
                  {/each}
                </tbody>
              </table>
            {:else}
              No comments available.
            {/if}
          </td>
        </tr>
      </tbody>
    </table>
  {/if}
</section>

<!-- 
<pre>
    {JSON.stringify(study, null, 2)}
</pre> -->

<style>
  table#study {
    width: 100%;
    border-collapse: collapse;
    border: 0px solid rgb(160, 160, 160);
  }

  table#study > tbody > tr > td {
    border-top: 1px solid rgb(180, 180, 180);
    padding: 12px 10px;
    vertical-align: top;
  }

  table#study > tbody > tr:nth-child(1) > td {
    border: 0;
  }

  table#study > tbody > tr > td:nth-child(1) {
    font-weight: 500;
    width: 200px;
  }

  table.subtable {
    border-collapse: collapse;
  }

  table.subtable > tbody > tr > td {
    padding: 5px 40px 5px 5px;
    border-top: 1px solid rgb(200, 200, 200);
  }

  table.subtable tr th {
    padding: 5px 40px 5px 5px;
    font-weight: 500;
    text-align: left;
  }

  .link {
    color: hsl(145, 83%, 28%);
    cursor: pointer;
  }
</style>
