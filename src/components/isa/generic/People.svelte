<script lang="ts">
    import Schema from "@/lib/schemas";
    import Person from "./Person.svelte";

    let {
        attr = '',
        componentConfig = {},
        label = 'People',
        value: people = $bindable(),
    } = $props();

    if (!label) {
        label = attr;
    }

    let __person__ = label==='Authors' ? 'Author' : 'Person';

    function addPerson() {
        people = [...people, Schema.getObjectFromSchema('person')];
    }
</script>

<section>
    <div>
        <h3>{label}</h3>
        {#each people as _, i}
            <Person bind:value={people[i]} countPeople={people.length} />
        {/each}
        <button class="btn" onclick={addPerson}>Add {__person__}</button>
    </div>
</section>