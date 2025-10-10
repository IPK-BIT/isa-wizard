<script>
export let person;
export let index;
export let countPeople = 1;
export let componentConfig = {};

import { createEventDispatcher } from 'svelte';
const dispatch = createEventDispatcher();

import Comments from '@/components/isa/generic/Comments.svelte';

import OntologyAnnotations from '@/components/isa/generic/OntologyAnnotations.svelte';
import PersonRoles from './PersonRoles.svelte';
import PersonOrcid from './PersonOrcid.svelte';

import ontologyMapping from '@/lib/ontologyMapping';

let mode = 'view'; // view | edit;



function getRoles(person) {
    return person.roles.map(roleOA => roleOA.termAccession);
}

function getOrcid(person) {
    let orcid = person.comments.find(c => c.value.includes('orcid.org'));
    if (orcid) {
        return orcid.value;
    } else {
        return false;
    }
}

function removePerson() {
    person = {};
    dispatch('removePerson', {index} );
}

function onChange(e) {
    let p = e.detail.value;
    person.firstName = p.firstName;
    person.lastName = p.lastName;
    person.affiliation = p.affiliation;
    person.email = p.email;
    person.phone = p.phone;
    person.address = p.address;
    dispatch('change');
}

let orcid;

$: orcid = getOrcid(person);

</script>

<section class:edit-mode={mode === 'edit'}>

    <div class="attr">

        {#if mode === 'view'}

            <div class="pure-g">
                <div class="pure-u-21-24">
                    {#if person.firstName === '' && person.lastName === ''}
                    <i>Unnamed person</i>
                    {:else}
                    {person.firstName} {person.midInitials} {person.lastName},
                    {/if}
                    {#if person.affiliation !== ''}
                    {person.affiliation},
                    {/if}
                    {person.address}<br />

                    {#if person.email}
                    <br />E-Mail: {person.email}<br />
                    {/if}
                    {#if person.phone}
                    Phone: {person.phone}<br />
                    {/if}

                    {#if orcid}
                    ORCID: <a target="_blank" href="{orcid}">{orcid}</a>
                    {/if}

                    <PersonRoles on:change bind:roles={person.roles} ontology={ontologyMapping['Person.role']} mode="view" />
                </div>
                <div class="pure-u-3-24" style="text-align: right;">
                    <button class="btn btn-secondary" style="width: 60px;" on:click={() => mode = 'edit'}>Edit</button> <br />
                    <!-- {#if countPeople > 1} -->
                    <button class="btn btn-warning" style="margin-top: 10px; width: 60px;" on:click={removePerson}>Delete</button>
                    <!-- {/if} -->
                </div>
            </div>

        {:else}

            <PersonOrcid on:change={onChange} bind:comments={person.comments} />
            <div class="pure-g">
                <div class="pure-u-1-3">
                    <input on:change type="text" bind:value={person.firstName} placeholder="First name" style="width: 100%;"> 
                </div>
                <div class="pure-u-1-3" style="padding: 0 10px 0 10px;">
                    <input on:change type="text" bind:value={person.midInitials} placeholder="Mid initials" style="width: 100%;">
                </div>
                <div class="pure-u-1-3">
                    <input on:change type="text" bind:value={person.lastName} placeholder="Last name" style="width: 100%;">
                </div>
            </div>

            <input on:change type="text" bind:value={person.address} placeholder="Address" style="width: 100%;"> <br />
            <input on:change type="text" bind:value={person.affiliation} placeholder="Affiliation" style="width: 100%;"> <br />

            <input on:change type="text" bind:value={person.email} placeholder="Email address" style="width: 100%;"> <br />
            <input on:change type="text" bind:value={person.phone} placeholder="Phone number" style="width: 100%;"> <br />

            <!--<OntologyAnnotations on:change bind:ontologyAnnotations={person.roles} ontology={ontologyMapping['Person.role']} />-->


            <PersonRoles on:change bind:roles={person.roles} ontology={ontologyMapping['Person.role']} mode="edit" />

            {#if componentConfig.showComments}
            <Comments on:change bind:value={person.comments} />
            {/if}

            <div style="display: flow-root; height: 40px; padding-top: 20px;">
                
                <!-- {#if countPeople > 1} -->
                <button class="btn btn-warning" style="float: right; margin-left: 30px;" on:click={removePerson}>Remove {person.firstName}</button>
                <!-- {/if} -->

                <button class="btn btn-secondary" style="float: right;" on:click={() => mode = 'view'}>Stop editing</button>
            </div>

        {/if}

    </div>

</section>


<style>

section {
    margin-bottom: 30px;
}

.edit-mode {
    background: rgb(240,240,240);
}

h4 {
    margin-bottom: 20px !important;
}

div.attr {
    padding: 20px;
}

section {
    /*background: rgba(0,0,0,0.05);*/
    border: 1px solid rgb(150,150,150);
    padding: 0px;
}
input {
    margin-bottom: 10px;
}

div.person-name > div {
    padding: 0 6px 0 6px;
}

</style>