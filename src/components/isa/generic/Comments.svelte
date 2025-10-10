<script lang="ts">

let comments: Array<Object>;
export { comments as value };
export let attr = '';

import { createEventDispatcher } from 'svelte';
const dispatch = createEventDispatcher();

if (!comments) {
    comments = [];
}

import Schemas from '@/lib/schemas.js';
import Comment from '@/components/isa/generic/Comment.svelte';

const addComment = () => {
    let emptyComment = Schemas.getObjectFromSchema('comment');
    comments = [...comments, emptyComment];
    dispatch('change');
}

function onRemoveComment(event) {
    comments.splice(event.detail.index, 1);
    comments = [...comments];
    dispatch('change');
}
</script>

<section>

    <div class="attr">
        <h3>Comments</h3>

        {#if comments.length > 0}
        {#each comments as comment, index}
        <Comment on:change on:removeComment={onRemoveComment} bind:comment {index} />
        {/each}
        {:else}
        <p><i>No comments have yet been created.</i></p>
        {/if}

        <button class="btn add" on:click|preventDefault={() => addComment()}>Add Comment</button>
    </div>

</section>


<style>
    section {
        margin-top: 10px;
        margin-bottom: 10px;
        border: 1px solid rgb(150,150,150);
        /* background: rgba(0,0,0,0.05);
        border-radius: 8px;
        box-shadow: 3px 3px 3px rgba(0,0,0,0.1); */
    }
    h3 {
        display: inline;
        margin: 0 10px 10px 0;
        font-weight: 500;
    }
</style>