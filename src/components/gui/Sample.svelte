<script>
    import Breadcrumb from "./Breadcrumb.svelte";
    import Pagination from "./Pagination.svelte";

    let samples;
    export { samples as value };

    let pageSize = 10; // Default page size, can be adjusted as needed
    let currentPage = 0; // Current page index, starts from 0
</script>

<h3>Samples</h3>
<Breadcrumb/>

<table id="samples">
    <thead>
        <tr>
            <th>Sample Name</th>
            {#each samples[0].factorValues as factorValue}
                <th>{factorValue.category.factorType.annotationValue} ({factorValue.category.factorType.termAccession})</th>
            {/each}
        </tr>
    </thead>
    {#each samples as sample, idx}
    {#if idx >= currentPage * pageSize && idx < (currentPage + 1) * pageSize}
        <tr>
            <td>{sample.name}</td>
            {#each sample.factorValues as factorValue}
                <td>{factorValue.value}</td>
            {/each}
        </tr>
    {/if}
    {/each}
</table>

<Pagination
    bind:currentPage
    bind:pageSize
    totalCount={samples.length}
/>

<style>
    table#samples {
        border-collapse: collapse;
        overflow: auto;
        display: block;
    }

    table#samples > tr > td {
        padding: 5px 40px 5px 5px;
        border-top: 1px solid rgb(200,200,200);
    }

    table#samples tr th {
        padding: 5px 40px 5px 5px;
        font-weight: 500;
        text-align: left;
    }
</style>