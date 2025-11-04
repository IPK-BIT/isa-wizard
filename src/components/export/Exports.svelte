<script lang="ts">
  import { generateCodeChallenge, generateCodeVerifier, login } from "@/lib/gitlab";
  // import { config } from "@/stores/config";
  // import { gitlab_response } from "@/stores/gitlab-api";
  // import { isaObj } from "@/stores/isa";
  // import Gitlab from "./Gitlab.svelte";
  import { getIsaTab, toIsaTab } from "@/lib/getIsaTab";
  import { ArcInvestigation_fromJsonString } from "@nfdi4plants/arctrl/ISA/ISA.Json/Investigation";
  import { toFsWorkbook } from "@nfdi4plants/arctrl/ISA/ISA.Spreadsheet/ArcInvestigation";
  import { ARC } from "@nfdi4plants/arctrl";

  // import { Xlsx } from "@fslab/fsspreadsheet";

  import { config } from "@/lib/appstate.svelte";
  import { isaObj } from "@/stores/isa";
  import Schema from "@/lib/schemas";
  import { downloadZip } from "client-zip";
  // import Schemas from "@/lib/schemas";

  async function tryLogin(authentication) {
    let codeVerifier = generateCodeVerifier();
    let codeChallenge = await generateCodeChallenge(codeVerifier);

    localStorage.setItem("code_verifier", codeVerifier);

    login(authentication, codeChallenge, $isaObj);
  }

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

  // function toArc() {
  //   let isaJsonString = JSON.stringify($isaObj);
  //   let investigation = JsonController.Investigation.fromISAJsonString(isaJsonString);

  //   // let study = JsonController.Study.fromISAJsonString(myJson)[0]; // the second value are registered assays
  //   // let assay = JsonController.Assay.fromISAJsonString(myJson);

  //   // let inv = new ArcInvestigation(investigation);

  //   console.log(investigation);
  // }

  async function toArc() {
    const investigation = ArcInvestigation_fromJsonString(JSON.stringify($isaObj, null, 2));
    console.log(investigation);
    let fswb = toFsWorkbook(investigation);

    let arc = new ARC(investigation);
    arc.UpdateFileSystem();
    let contracts = arc.GetWriteContracts();
    console.log(contracts);

    fulfillWriteContracts(contracts);
    return true;
  }

  async function fulfillWriteContracts(contracts) {
    let filesInZip = [];

    for (const contract of contracts) {
      if ((contract.Operation = "CREATE")) {
        if (contract.DTO == undefined) {
        } else if (contract.DTOType == "ISA_Assay" || contract.DTOType == "ISA_Study" || contract.DTOType == "ISA_Investigation") {
          let xlsxBytes = await Xlsx.toBytes(contract.DTO);

          filesInZip.push({
            name: contract.Path,
            lastModified: new Date(),
            input: xlsxBytes,
          });
        } else if (contract.DTOType == "PlainText") {
        } else {
          console.log("Warning: The given contract is not a correct ARC write contract: ", contract);
        }
      }
    }

    console.log(filesInZip);

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
          <!-- {#if !$gitlab_response.access_token} -->
          {#if true}
            <button class="btn btn-huge" onclick={() => tryLogin(option?.config?.authentication)}>Login</button>
          {:else}
            <!-- <Gitlab auth_config={option.config.authentication} /> -->
          {/if}
        {:else if option.type === "arc"}
          <button class="btn btn-huge" onclick={toArc}>Export</button>
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
