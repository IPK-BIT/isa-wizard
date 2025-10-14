<script lang="ts">
  import Svelecte from "svelecte";
  import { onMount } from "svelte";
  import OntologyAnnotation from "./OntologyAnnotation.svelte";

  interface FetchORCID {
    "expanded-result": Array<{
      "orcid-id": string;
      "given-names": string;
      "family-names": string;
      "email": string;
      "institution-name": Array<string>;
    }>;
  }

  interface SelectionORCID {
    name: string;
    familyName: string;
    emails: string[];
    institutions: string[];
  }

  let { value: person = $bindable(), countPeople = 1, index, removePerson } = $props();

  let mode: "view" | "edit" = $state("view");

  onMount(() => {
    if (
      !person.comments.find((c: { name: string; value: string }) => {
        return c.name === "Person ID";
      })
    ) {
      person.comments = [...person.comments, { name: "Person ID", value: "" }];
    }
  });

  let orcid: string = $derived(
    person.comments.find((c: { name: string; value: string }) => {
      return c.name === "Person ID";
    })?.value || ""
  );

  $effect(() => {
    if (
      person &&
      orcid !==
        person.comments.find((c: { name: string; value: string }) => {
          return c.name === "Person ID";
        })?.value
    ) {
      let idx = person.comments.findIndex(
        (c: { name: string; value: string }) => {
          return c.name === "Person ID";
        }
      );
      if (idx !== -1) {
        person.comments[idx].value = orcid;
      } else {
        person.comments = [
          ...person.comments,
          { name: "Person ID", value: orcid },
        ];
      }
    }
  });

  function handleOrcidFetch(data: FetchORCID) {
    if (data && data["expanded-result"] && data["expanded-result"].length > 0) {
      let results = data["expanded-result"].map((item) => {
        return {
          text: `${item["given-names"]} ${item["family-names"]} - ${item["institution-name"].length > 0 ? item["institution-name"].join(", ") : "No affiliation"}`,
          value: `https://orcid.org/${item["orcid-id"]}`,
          name: item["given-names"],
          familyName: item["family-names"],
          emails: item["email"],
          institutions: item["institution-name"],
        };
      });
      console.log("ORCID results:", results);
      return results;
    } else {
      console.log("No ORCID results found");
      return [];
    }
  }

  /**
   * Set given values from selected ORCID Object to person 
   * @param selection - ORCID Selection with information about selected person
   */
  function handleSelectORCID(selection: SelectionORCID) {
    person.firstName = selection.name ?? "";
    person.lastName = selection.familyName ?? "";
    person.affiliation =
      selection.institutions.length > 0 ? selection.institutions.at(0) : ""; // Show only most recent institution?
    person.email =
      selection.emails.length > 0 ? selection.emails.join(",") : ""; // Show only one email?
  }

</script>

<section>
  <div class="container">
    {#if mode === "view"}
      <div class="person-viewer">
        <div>
          {#if person.firstName === "" && person.lastName === ""}
            <i>Unnamed Person</i>
          {:else}
            {person.firstName} {person.midInitials} {person.lastName}
          {/if}
          {#if person.affiliation}
            , {person.affiliation}
          {/if}
          {#if person.address}
            , {person.address}
          {/if}
          <br />

          {#if person.email}
            <br /> Email: {person.email}
          {/if}
          {#if person.phone}
            <br /> Phone: {person.phone} <br />
          {/if}

          {#if orcid}
            ORCID: <a target="_blank" href={orcid}>{orcid}</a>
          {/if}

          Contributions
        </div>
        <div class="controls">
          <button
            class="btn btn-secondary"
            onclick={() => {
              mode = "edit";
            }}>Edit</button
          >
          {#if countPeople > 1}
            <button class="btn btn-warning" onclick={() => removePerson(index)}>Delete</button>
          {/if}
        </div>
      </div>
    {:else}
      <div class="person-editor">
        <div>
          <div class="name">
            <input
              placeholder="First Name"
              type="text"
              bind:value={person.firstName}
            />
            <input
              placeholder="Mid Initials"
              type="text"
              bind:value={person.midInitials}
            />
            <input
              placeholder="Last Name"
              type="text"
              bind:value={person.lastName}
            />
          </div>
          <div style="gap: .5rem; display: flex; flex-direction: column;">
            <input
              placeholder="Affiliation"
              type="text"
              bind:value={person.affiliation}
            />
            <input
              placeholder="Address"
              type="text"
              bind:value={person.address}
            />
            <input placeholder="Email" type="text" bind:value={person.email} />
            <input placeholder="Phone" type="text" bind:value={person.phone} />
            {#if orcid}
              <div class="orcid-wrapper">
                <span>{orcid}</span>
                <button
                  class="btn btn-warning"
                  onclick={() => {
                    orcid = "";
                  }}>Remove</button
                >
              </div>
            {:else}
              <Svelecte
                placeholder="ORCID"
                bind:value={orcid}
                valueAsObject={false}
                fetch="https://pub.orcid.org/v3.0/expanded-search/?q=[query]"
                fetchProps={{
                  headers: { "Content-Type": "application/vnd.orcid+json" },
                }}
                fetchCallback={handleOrcidFetch}
                onChange={(selection: SelectionORCID) => handleSelectORCID(selection)}
              />
            {/if}
            <OntologyAnnotation />
          </div>
        </div>
        <div class="controls">
          <button
            class="btn btn-secondary"
            onclick={() => {
              mode = "view";
            }}>Stop Editing</button
          >
          {#if countPeople > 1}
            <button class="btn btn-warning" onclick={() => removePerson(index)}>Remove {person.firstName}</button>
          {/if}
        </div>
      </div>
    {/if}
  </div>
</section>

<style>
  section {
    margin-bottom: 1rem;
  }

  section div.container {
    border: 1px solid black;
    border-radius: 4px;
    padding: 0.5rem;
    margin: 0;
    box-sizing: border-box;
    align-items: center;
    display: flex;
    align-content: flex-start;
    flex-flow: row wrap;
  }

  div.person-viewer {
    padding: 0.5rem;
    width: 100%;
    display: flex;
    flex-flow: row wrap;
    align-content: flex-start;
  }

  div.person-viewer div:not(.controls) {
    width: 79%;
  }

  div.person-viewer div.controls {
    width: 20%;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    align-items: flex-end;
  }

  div.person-viewer div.controls button {
    width: 4rem;
  }

  div.person-editor {
    width: 100%;
    display: flex;
    flex-direction: column;
    align-content: flex-start;
  }

  div.person-editor div.controls {
    display: flex;
    flex-direction: row;
    gap: 0.5rem;
    justify-content: flex-end;
    width: 100%;
    margin: 0.5rem 0;
  }

  div.name {
    display: grid;
    grid-template-columns: 2fr 1fr 2fr;
    gap: 0.5rem;
    margin-bottom: 0.5rem;
    width: 100%;
  }

  div.person-editor input {
    width: 100%;
  }

  div.orcid-wrapper {
    display: flex;
    gap: 0.5rem;
    align-items: center;
    justify-content: space-between;
    padding: 0.5rem;
    border: 1px solid black;
    border-radius: 4px;
  }
</style>
