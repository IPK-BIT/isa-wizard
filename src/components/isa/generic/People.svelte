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

    /**
     * Called from child (Person) component with props
     * @param index - person index in people array
     */
    function removePerson(index: number) { 
        people.splice(index, 1);
        people = [...people];
    }
</script>

<section>
    <div>
        <h3>{label}</h3>
        {#each people, i}
            <Person bind:value={people[i]} index={i} countPeople={people.length} removePerson={(index: number) => removePerson(index)} />
        {/each}
        <button class="btn" onclick={addPerson}>Add {__person__}</button>
    </div>
</section>