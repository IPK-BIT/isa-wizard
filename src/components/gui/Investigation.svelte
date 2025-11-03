<script lang="ts">
  import { isaObj } from "@/stores/isa.js";
  // import { simpleGuiBreadcrumb, simpleGuiLevel } from '@/stores/wizard';
  import { wizardStore } from "@/stores/WizardStore.svelte";
  import Breadcrumb from "./Breadcrumb.svelte";

  function personORCID(person) {
    let orcid = person.comments.find((comment) => comment.value.includes("orcid.org"));
    if (orcid) {
      return orcid.value;
    } else {
      return false;
    }
  }

  function openStudy(elem) {
    wizardStore.simpleGuiLevel = {
      type: "Study",
      jsonPath: `studies[${elem}]`,
    };
    wizardStore.simpleGuiBreadcrumb = [
      { name: $isaObj.title ? $isaObj.title : "Untitled Investigation", fn: () => (wizardStore.simpleGuiLevel = { type: "Investigation", jsonPath: "" }) },
      { name: $isaObj.studies[elem].title ? $isaObj.studies[elem].title : "Untitled study", fn: () => (wizardStore.simpleGuiLevel = { type: "Study", jsonPath: `studies[${elem}]` }) },
    ];
  }
</script>

<section>
  <h3>Investigation</h3>
  <Breadcrumb />

  <table id="investigation">
    <tbody>
      <tr>
        <td><strong>Title</strong></td>
        <td>{$isaObj.title}</td>
      </tr>
      <tr>
        <td><strong>Identifier</strong></td>
        <td>{$isaObj.identifier}</td>
      </tr>
      <tr>
        <td><strong>Description</strong></td>
        <td>{$isaObj.description}</td>
      </tr>
      <tr>
        <td><strong>Date of submission</strong></td>
        <td>{$isaObj.submissionDate}</td>
      </tr>
      <tr>
        <td><strong>Date of public release</strong></td>
        <td>{$isaObj.publicReleaseDate}</td>
      </tr>
      <tr>
        <td><strong>People</strong></td>
        <td>
          {#if $isaObj.people.length > 0}
            <ul>
              {#each $isaObj.people as person}
                {@const orcid = personORCID(person)}
                <li>
                  {person.firstName}
                  {person.lastName}, {person.affiliation}, {person.address}
                  {#if orcid}
                    <br />ORCID: {orcid}
                  {/if}
                </li>
              {/each}
            </ul>
          {:else}
            None
          {/if}
        </td>
      </tr>
      <tr>
        <td><strong>Publications</strong></td>
        <td>
          {#if $isaObj.publications.length > 0}
            <ul>
              {#each $isaObj.publications as publication}
                <li>
                  {publication.authorList}<br />
                  <span style="font-weight: 500; font-style: italic;">{publication.title}</span><br />
                  {#if publication.doi}DOI: <a href="https://doi.org/{publication.doi}" target="_blank">{publication.doi}</a>{/if}
                  {#if publication.pubMedID}Pubmed ID: {publication.pubMedID}{/if}
                </li>
              {/each}
            </ul>
          {:else}
            None
          {/if}
        </td>
      </tr>
      <tr>
        <td><strong>Comments</strong></td>
        <td>
          {#if $isaObj.comments.length > 0}
            <table class="subtable">
              <tbody>
                <tr>
                  <th><strong>Name</strong></th>
                  <th><strong>Value</strong></th>
                </tr>
                {#each $isaObj.comments as comment}
                  <tr>
                    <td>{comment["name"]}</td>
                    <td>{comment["value"]}</td>
                  </tr>
                {/each}
              </tbody>
            </table>
          {:else}
            None
          {/if}
        </td>
      </tr>
      <tr>
        <td><strong>Studies</strong></td>
        <td>
          {#if $isaObj.studies.length > 0}
            {#each $isaObj.studies as study, i}
              <button class="link" onclick={() => openStudy(i)}>
                {study.title ? study.title : "Untitled study"}
              </button>
            {/each}
          {:else}
            None
          {/if}
        </td>
      </tr>
    </tbody>
  </table>
</section>

<style>
  table#investigation {
    width: 100%;
    border-collapse: collapse;
    border: 0px solid rgb(160, 160, 160);
  }

  table#investigation > tbody > tr > td {
    border-top: 1px solid rgb(180, 180, 180);
    padding: 12px 10px;
    vertical-align: top;
  }

  table#investigation > tbody > tr:nth-child(1) > td {
    border: 0;
  }

  table#investigation > tbody > tr > td:nth-child(1) {
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

  ul {
    margin: 0;
    padding: 0 0 0 20px;
  }

  div {
    margin-top: 50px;
  }

  p.attr {
    margin: 0;
    padding: 0;
    font-weight: 500;
    font-size: 1em;
  }

  p.value {
    margin: 0;
    padding: 0;
    font-size: 1.2em;
  }

  .link {
    border: none;
    background-color: transparent;
    font-size: medium;
    color: hsl(145, 83%, 33%);
    text-decoration: underline;
    cursor: pointer;
  }

  .link:hover {
    color: hsl(145, 83%, 43%);
  }
</style>
