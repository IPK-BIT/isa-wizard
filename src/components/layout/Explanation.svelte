<script lang="ts">
    import { config } from "@/lib/appstate.svelte";
    import { explanationStore } from "@/stores/ExplanationStore.svelte";

    // Convert explanation array from config in ID -> Object format
    const explanations = config?.explanations?.reduce((result, obj) => {
        result[obj.id] = obj;
        return result;
    }, {});
</script>

<section>
    {#if explanationStore.attr !== undefined && explanationStore.attr !== "" && explanations?.[explanationStore.attr] !== undefined}
        <div id="explanation-content" class="bbox">
            <strong>Explanation:</strong>
            <p>{explanations[explanationStore.attr].definition}</p>

            {#if explanations[explanationStore.attr].example}
                <strong>Example:</strong>
                <p>{explanations?.[explanationStore.attr]?.example}</p>
            {/if}
        </div>
    {/if}
</section>

<style>
    #explanation-content {
        margin-top: 20px;
    }

    p {
        margin-top: 3px;
    }
</style>
