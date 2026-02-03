<script lang="ts">
  import { toIsaTab } from "@/lib/getIsaTab";
  import { JsonController, ARC } from "@nfdi4plants/arctrl";

  import { config } from "@/lib/appstate.svelte";
  import { isaObj } from "@/stores/isa";
  import Schema from "@/lib/schemas";
  import { downloadZip } from "client-zip";
  import type { Investigation } from "@/lib/schemas/types_isa";
  import Gitlab from "./Gitlab.svelte";
  import { gitlab_response } from "@/stores/gitlab-api";
  import { generateCodeVerifier, generateCodeChallenge, login, type Authentication } from "@/lib/gitlab";
  import { arcReadyISA, fulfillWriteContracts, type FilesInZip } from "@/utils/arcExport";

  async function tryLogin(authentication: Authentication) {
    let codeVerifier = generateCodeVerifier();
    let codeChallenge = await generateCodeChallenge(codeVerifier);

    localStorage.setItem("code_verifier", codeVerifier);

    login(authentication, codeChallenge, $isaObj);
  }

  // FIXME: Converting is possible but some fields are [object object]
  function convertToIsaTabArchive() {
    let ontoRef1 = Schema.getObjectFromSchema("ontology_source_reference");
    ontoRef1.name = "OBI";
    ontoRef1.file = "http://bioportal.bioontology.org/ontologies/1123";
    ontoRef1.version = "47893";
    ontoRef1.description = "Ontology for Biomedical Investigations";

    let ontoRef2 = Schema.getObjectFromSchema("ontology_source_reference");
    ontoRef2.name = "EFO";
    ontoRef2.file = "";
    ontoRef2.version = "v 1.26";
    ontoRef2.description = "ArrayExpress Experimental Factor Ontology";

    $isaObj["ontologySourceReferences"] = [ontoRef1, ontoRef2];

    toIsaTab($isaObj);
  }

  function saveIsaAsJson() {
    const a = document.createElement("a");
    a.href = URL.createObjectURL(
      new Blob([JSON.stringify($isaObj, null, 2)], {
        type: "application/json",
      })
    );
    a.setAttribute("download", "isa.json");
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }

  async function toArc() {
    let cleanISA = arcReadyISA($isaObj);

    let isaJsonString = JSON.stringify(cleanISA);
    let investigation = JsonController.Investigation.fromISAJsonString(isaJsonString);

    let arc = new ARC(investigation);
    let contracts = arc.GetWriteContracts();

    const filesInZip = (await fulfillWriteContracts(contracts, "ZIP")) as FilesInZip[];
    const blob = await downloadZip(filesInZip).blob();

    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "arc.zip";
    link.click();
    link.remove();
  }
</script>

<hr />
<section></section>

<h3>Export Options</h3>

<div>
  {#each config.export as option}
    <div class="flex-row card">
      <div class="">
        <h5>{option?.label ?? ""}</h5>
        <p>{option?.description ?? ""}</p>
      </div>
      <div class="items-center align-right">
        {#if option.type === "gitlab"}
          {#if !$gitlab_response.access_token}
            <button class="btn btn-huge" onclick={() => tryLogin(option?.config?.authentication)}>Login</button>
          {:else}
            <Gitlab auth_config={option.config.authentication} />
          {/if}
        {:else if option.type === "arc"}
          <button class="btn btn-huge" onclick={() => toArc()}>Export</button>
        {:else if option.type === "isa-json"}
          <button class="btn btn-huge" onclick={saveIsaAsJson}>Export</button>
        {:else if option.type === "isa-tab"}
          <button class="btn btn-huge" onclick={convertToIsaTabArchive}>Export</button>
        {/if}
      </div>
    </div>
  {/each}
</div>

<style>
  .card {
    padding: 1rem;
    border: 1px solid #ccc;
    border-radius: 5px;
    margin-bottom: 1rem;
  }

  .flex-row {
    display: flex;
    flex-direction: row;
  }

  .items-center {
    display: flex;
    align-items: center;
  }

  .align-right {
    margin-left: auto;
  }

  .btn-huge {
    padding: 1rem 2rem;
    width: 10rem;
  }
</style>
