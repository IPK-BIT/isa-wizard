<script lang="ts">
export let publication;
export let index = null;

import Comments from '@/components/isa/generic/Comments.svelte';

import { explanationActionFactory } from '@/actions/explanation.js';
import { getContext, createEventDispatcher } from 'svelte';
const isaLevel = getContext('isaLevel');
const dispatch = createEventDispatcher();

let explanationAction = explanationActionFactory(isaLevel);

async function onChange() {
    if (!publication.doi) {
        publication.title = '';
        publication.authorList = '';
        return;
    }
    const response = await fetch('https://doi.org/' + publication.doi, {
        headers: {
            'Accept': 'application/vnd.citationstyles.csl+json'
        }
    });
    const data = await response.json();
    if (data) {
        publication.title = data.title;
        publication.authorList = data.author.map(a => a.given + ' ' + a.family).join(', ');
    }
}
</script>

<section>

    <div class="attr entity">
        <!--<h4>Publication</h4>-->

        <div class="pure-g">
            <div class="pure-u-1-2" style="padding-right: 15px;">
                <input type="text" on:change={onChange} use:explanationAction data-attr="doi" bind:value={publication.doi} placeholder="DOI">
            </div>
            <div class="pure-u-1-2">
                <input type="text" on:change use:explanationAction data-attr="pubMedID" bind:value={publication.pubMedID} placeholder="PubMed ID">
            </div>
        </div>

        <input type="text" on:change use:explanationAction data-attr="title" bind:value={publication.title} placeholder="Publication title"> <br />

        <input type="text" on:change use:explanationAction data-attr="authorList" bind:value={publication.authorList} placeholder="Author list">

        <div style="margin-top: 15px;text-align: right;">
            <button class="btn btn-warning" on:click={() => dispatch('removePublication', {index} )}>Remove</button>
        </div>

        <!--<Comments on:change bind:value={publication.comments} />-->

    </div>

</section>


<style>
section {
    /*background: rgba(0,0,0,0.05);*/
    border: 1px solid rgb(150,150,150);
    padding: 10px;
    margin-bottom: 20px;
    /* background: rgb(240,240,240);background: rgb(240,240,240); */
}

input {
    margin: 0 20px 5px 0;
    width: 100%;
}
div.entity {
    /*background: rgba(0,0,0,0.05);*/
}
</style>