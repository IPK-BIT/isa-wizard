<script>
export let label = '';
let rorid = '';
export { rorid as value };
export let showLabel = true;

import Svelecte from 'svelecte';


async function handleFetch(query) {
    const url = 'https://api.ror.org/v2/organizations?query='+query;

    let postOptions = {
        method: 'GET',
        mode: 'cors',
        headers: {
            'Content-Type': 'application/vnd.orcid+json'
        },
    }

    let response = await fetch(url, postOptions);
    let resultJson = await response.json();

    let result = resultJson['items'].map(item => {
        let searchResultItem = [];
        searchResultItem.push(item.names.find(n=>n['types'].includes('ror_display')).value);
        if (item.locations) {
            searchResultItem.push(item.locations[0].geonames_details.name);
            searchResultItem.push(item.locations[0].geonames_details.country_name);
        }

        let newItem = {
            id: item.id,
            name: searchResultItem.join(', ')
        }

        return newItem;
    });
    console.log(result);
    return result;
}

function remove() {
    rorid = '';
}

</script>

<section>

    <div class="attr pure-g v-center">
        <div class="pure-u-5-24">
            {#if showLabel}
            <label>{label}</label>
            {/if}
        </div>
        <div class="pure-u-19-24">
            {#if rorid}
            <div style="border: 1px solid black; height: 40px; padding: 9px; display: flow-root;">
                <a target="_blank" href="{rorid}">{rorid}</a> <button on:click|preventDefault={() => remove()} class="btn btn-warning" style="float:right;">Remove</button>
            </div>
            {:else}
            <Svelecte name="selection"
                style="border: 1px solid black; height: 40px;"
                bind:value={rorid}
                valueAsObject={false}
                placeholder="Search for your institute by its name..."
                fetch={handleFetch}
            />
            {/if}
        </div>
    </div>


</section>


<style>
:global(.svelecte-control) {
    --sv-active-border: 0px solid white !important;
    --sv-border-color: white !important;
}	
</style>