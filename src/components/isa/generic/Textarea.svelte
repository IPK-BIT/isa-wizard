<script lang="ts">
    let {
        label = '',
        isaLevel = '',
        attr,
        value = $bindable(),
        showLabel = true,
        focus = false
    } = $props();

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
            <textarea id="input-{label}" bind:value={value}></textarea>
        </div>
    </div>
</section>

<style>
    section div {
        padding: .5rem;
        margin: 0;
        box-sizing: border-box;
        align-items: center;
        display: flex;
        align-content: flex-start;
        flex-flow: row wrap;
    }

    textarea {
        width: 100%;
        min-height: 4rem;
        resize: vertical;
    }

    div.label-wrapper label {
        vertical-align: top;
    }
    
    div.label-wrapper {
        width: 20%;
    }

    div.input-wrapper {
        width: 80%;
    }

</style>