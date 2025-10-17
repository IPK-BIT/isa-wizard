<script lang="ts">
    import Svelecte from "svelecte";

    let { value: rorid = $bindable(), label = "" } = $props();

    let searchResult = $derived(rorid === "" ? null : rorid); // fix svelecte warning because empty string is not identified as null

    function handleFetch(data: { items: any[] }) {
        console.log(data.items);
        let items = data.items;
        let results = items.map((i) => {
            let names = Array.isArray(i.names) ? i.names.map((name) => name.value) : i.names;

            return {
                value: i.id,
                label: names.join(", "),

                names: names,
                ror: i.id,
            };
        });

        if (results.length > 0) {
            return results;
        } else {
            return [];
        }
    }

    function remove() {
        rorid = "";
    }
</script>

<section class="grid padding">
    <div class="padding">
        <div>{label}</div>
    </div>
    <div class="padding">
        {#if rorid}
            <div style="border: 1px solid black; padding: 9px; display: flow-root;">
                <a target="_blank" href={rorid}>{rorid}</a>
                <button onclick={() => remove()} class="btn btn-warning" style="float:right;">Remove</button>
            </div>
        {:else}
            <Svelecte
                bind:value={searchResult}
                placeholder="Search for your institute by its name..."
                fetch={"https://api.ror.org/v2/organizations?query=[query]"}
                fetchCallback={handleFetch}
                onChange={() => {
                    if (searchResult) rorid = searchResult;
                }}
            >
                {#snippet option(opt, inputValue)}
                    <div class="">
                        <div class="ror-label">
                            {opt.label}
                        </div>
                        <div class="ror-id">
                            {opt.ror}
                        </div>
                    </div>
                {/snippet}
            </Svelecte>
        {/if}
    </div>
</section>

<style>
    .grid {
        display: grid;
        grid-template-columns: 20% 80%;
    }

    .padding {
        padding: 8px;
    }
</style>
