<script lang="ts" module>
  let rolesAvailable: any[] = $state([]);
  const mapAccessionToLabel = new Map();

  /**
   * Fetch Roles with API and make them modular/globally accessible for this component
   */
  async function getCreditOntologyTerms() {
    let apiurl = "https://www.ebi.ac.uk/ols4/api/select?q=rol&ontology=CRO&rows=92";

    let response = await fetch(apiurl, {
      method: "GET",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
    });

    let result = await response.json();

    rolesAvailable = result["response"]["docs"].map((node: any) => {
      let accUrl = "http://purl.obolibrary.org/obo/" + node["obo_id"];
      mapAccessionToLabel.set(accUrl, node["label"]);
      return {
        accession: accUrl,
        name: node["label"],
        description: node["description"][0],
      };
    });

    rolesAvailable = rolesAvailable.filter((role: any) => role.accession.includes("CREDIT:"));
  }

  getCreditOntologyTerms();
</script>

<script lang="ts">
  import { untrack } from "svelte";
  import Schemas from "@/lib/schemas.js";
  import type { OntologyAnnotation } from "@/lib/schemas/types_isa";

  let { roles = $bindable(), mode = "edit" } = $props();

  let rolesSelected: any[] = $state([]);
  let showRolesDescriptions: boolean = $state(false);
  let rolesReadable: any[] = $state([]);

  /**
   * Synchronize checkboxes with ISA String role ontology annotation
   */
  function onChange() {
    let emptyOA = Schemas.getObjectFromSchema<OntologyAnnotation>("ontology_annotation");

    roles = [];
    for (let roleAccession of rolesSelected) {
      let role: any = rolesAvailable.find((role: any) => role.accession === roleAccession);

      let _emptyOA: OntologyAnnotation = Object.assign({}, emptyOA);

      _emptyOA.termSource = "CREDIT";
      _emptyOA.termAccession = role.accession;
      _emptyOA.annotationValue = role.name;

      roles = [...roles, _emptyOA];
      rolesReadable = rolesSelected.map((r) => mapAccessionToLabel.get(r));
    }
  }

  // synchronize ISA String with checkboxes
  $effect(() => {
    // track roles for ISA String changes, but not rolesSelected because this would trigger a feedback loop
    const currentRoles = roles;
    untrack(() => {
      rolesSelected = currentRoles.map((roleOA: OntologyAnnotation) => roleOA.termAccession);
      rolesReadable = rolesSelected.map((r) => mapAccessionToLabel.get(r));
    });
  });
</script>

<section style="position: relative;" class:section-bordered={mode === "edit"}>
  <h5>Contributions of this person</h5>

  {#if mode === "view"}
    {#if rolesReadable.length > 0}
      <p style="margin: 5px 0 0 0;">{rolesReadable.join(", ")}</p>
    {:else}
      <p style="margin-bottom: 0;">No contributions</p>
    {/if}
  {:else}
    <button class="btn btn-secondary" style="position: absolute; top: 8px; right: 10px; margin:0;" onclick={() => (showRolesDescriptions = !showRolesDescriptions)}>{showRolesDescriptions == true ? "Hide" : "Show"} role descriptions</button>

    <div id="roles">
      {#each rolesAvailable as role, i}
        <div class="role">
          <input id="checkbox-{i}" type="checkbox" value={role.accession} bind:group={rolesSelected} onchange={onChange} />
          <div>
            <label for="checkbox-{i}"
              >{role.name}
              {#if showRolesDescriptions}
                <p>
                  {role.description.replace('"', "").replace('"', "").replace("[]", "")}
                </p>
              {/if}
            </label>
          </div>
        </div>
      {/each}
    </div>
  {/if}
</section>

<style>
  h5 {
    padding: 0;
    margin: 0;
    font-size: 100%;
    color: black;
    font-weight: 500;
  }
  section {
    margin-top: 10px;
    /*background: rgb(235,235,235);*/
  }

  .section-bordered {
    border: 1px solid rgb(0, 0, 0);
    padding: 10px;
    background: white;
  }

  button {
    margin-top: 15px;
  }

  #roles {
    /*display: flow-root;*/
    margin-top: 15px;
    display: grid;
    row-gap: 0.5em;
    column-gap: 1em;
    grid-template-columns: repeat(2, 1fr);
    /*grid-template-rows: masonry;*/
    /*height: 150px;
    overflow-y: scroll;*/
    /*border: 1px solid rgb(150,150,150);*/
    padding: 10px;
  }

  div.role {
    /*float: left;*/
    position: relative;
    /*margin-bottom: 10px;*/
    border: 0px solid rgb(200, 200, 200);
    /*padding: 6px;*/
    /*width: 49%;*/
    /*background: white;*/
  }

  div.role label {
    font-weight: 400;
  }

  div.role input {
    position: absolute;
    top: 2px;
    left: 7px;
  }

  div.role div {
    margin-left: 30px;
  }

  div.role p {
    margin: 5px 0 10px 0;
    font-size: 0.8em;
  }
</style>
