<script lang="ts">
    import { explanationAction } from "@/actions/explanation";

    let { label = "", isaLevel = "", attr, value = $bindable(), showLabel = true, focus = false } = $props();

    if (!label) {
        label = attr;
    }
</script>

<section>
    <div>
        <div class="label-wrapper">
            {#if showLabel}
                <label for="input-{label}">{label}</label>
            {/if}
        </div>
        <div class="input-wrapper">
            <input type="date" id="input-{label}" bind:value use:explanationAction={attr} />
        </div>
    </div>
</section>

<style>
    section div {
        padding: 0.5rem;
        margin: 0;
        box-sizing: border-box;
        align-items: center;
        display: flex;
        align-content: flex-start;
        flex-flow: row wrap;
    }

    div.label-wrapper {
        width: 20%;
    }

    div.input-wrapper {
        width: 80%;
    }

    input {
        width: 100%;
    }
</style>
