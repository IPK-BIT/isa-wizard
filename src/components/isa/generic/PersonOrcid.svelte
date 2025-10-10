<script lang="ts">
export let comments: Array<Object>;

import { onMount, createEventDispatcher } from 'svelte';
const dispatch = createEventDispatcher();

import Svelecte from 'svelecte';

import Schemas from '@/lib/schemas.js';

let orcid;

async function getAccessToken() {
    let url = 'https://pub.orcid.org/oauth/token';

    let postOptions = {
        method: 'POST',
        cache: "no-cache",
        mode: "no-cors",
        headers: {
            'Content-Type': 'application/json; charset=utf-8',
            'Authorization' : 'client_id:APP-ON4H0IG0Z62ABQQB, client_secret:25708c62-db57-450e-8d2f-b95fd796319b'
        },
        redirect: 'follow'
    }

    let response = await fetch(url, postOptions);
    console.log(response.json());
}

async function handleFetch(query) {
    const url = 'https://pub.orcid.org/v3.0/expanded-search/?q='+query;

    let postOptions = {
        method: 'GET',
        //cache: "no-cache",
        mode: "cors",
        headers: {
            'Content-Type': 'application/vnd.orcid+json'
        },
        //redirect: 'follow'
    }

    let response = await fetch(url, postOptions);
    let resultJson = await response.json();

    resultJson['expanded-result'] = resultJson['expanded-result'].filter(item => item['institution-name'].length > 0 ? true : false);

    let result = resultJson['expanded-result'].map(item => {

        let searchResultItem = [];

        searchResultItem.push(item['given-names']+' '+item['family-names']);
        if (item['institution-name'][0]) {
            searchResultItem.push(item['institution-name'][0]);
        }
        searchResultItem.push('ORCID: '+item['orcid-id']);

        let newItem = {
            id: 'https://orcid.org/'+item['orcid-id'],
            name: searchResultItem.join(', '),
            firstName: item['given-names'],
            lastName: item['family-names'],
            affiliation: item['institution-name'][0] || '',
            email: item['email'] || '',
            phone: item['phone'] || '',
            address: item['address'] || '',
        }

        return newItem;
    });

    return result;
}

function onChange() {
    comments = [...comments, {name:'Person ID', value: orcid.id}];
    dispatch('change', {value: orcid});
}

function remove() {
    comments = comments.filter(comment => comment.value !== orcid);
    orcid = null;
}

function init() {
    let orcidComment = comments.find(comment => comment.value.includes('orcid.org'));
    if (orcidComment) {
        orcid = {
            id: orcidComment.value
        };
    }
}

onMount(() => {
    //getAccessToken();
    init();
});

function orcidRenderer(item, _isSelection, _inputValue) {
    return _isSelection
        ? `${item.firstName} ${item.lastName} (${item.id})`
        : `<div style="display: flex; justify-content: space-between;"><span>${item.firstName} ${item.lastName}, ${item.affiliation}</span><span>${item.id}</span></div>`;
}

</script>

<section style="position: relative;">

    <h5 style="margin-bottom: 10px; padding: 0;">ORCID of this person</h5>

    {#if orcid}
    <a target="_blank" href="{orcid.id}">{orcid.id}</a> <button on:click|preventDefault={() => remove()} class="btn btn-warning" style="position: absolute; top: 8px; right: 10px; margin:0;">Remove ORCID</button>
    {:else}

    <Svelecte name="selection"
        bind:value={orcid}
        valueAsObject={true}
        placeholder="Search for people on ORCID.org by typing in their name"
        fetch={handleFetch}
        renderer={orcidRenderer}
        on:change={onChange}
    />
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
    margin-bottom: 20px;
    border: 1px solid rgb(0,0,0);
    background: white;
    padding: 10px;
}
button {
    /*margin-top: 15px;*/
}
</style>