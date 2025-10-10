<script>
    import Schemas from "@/lib/schemas";
    import Study from "./Study.svelte";

 
    let studies;
    export { studies as value };
    export let attr = '';

    function addStudy() {
        let emptyStudy = Schemas.getObjectFromSchema('study');
        studies = [...studies, emptyStudy];
    }
</script>

<section>
    <h3>Studies</h3>

    {#each studies as study}
        <Study
            bind:value={study}
            idx={studies.indexOf(study)}
        />
    {/each}

    <button class="btn" on:click={addStudy}>Add Study</button>
</section>