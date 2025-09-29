<script lang="ts">
    import Svelecte from "svelecte";

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

    let license = $state(value || '');
    $effect(() => {
        value = license;
    });

    async function handleFetch(response: {licenses: Array<any>}) {
        return response.licenses.map((license: any) => {
            return {
                text: license.name,
                value: license.licenseId
            }
        });
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
            {#if value}
            <div>
                <span>{value}</span>
                <button class="btn btn-warning" onclick={() => { value = ''; license = '';}}>Remove</button>
            </div>
            {:else}
            <Svelecte
                bind:value={license}
                fetch='https://raw.githubusercontent.com/spdx/license-list-data/main/json/licenses.json'
                fetchCallback={handleFetch}
            />
            {/if}
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

    div.label-wrapper {
        width: 20%;
    }

    div.input-wrapper {
        width: 80%;
        display: flow-root;
    }

    div.input-wrapper div {
        display: flex;
        align-items: center;
        gap: 1rem;
        border: 1px solid black;
        border-radius: 4px;
        width: 100%;
    }
    button {
        margin-left: auto;
    }
</style>