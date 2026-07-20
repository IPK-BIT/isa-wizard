<script lang="ts">
	import Number from '../singleton/Number.svelte';
	import OntologyAnnotation from '../singleton/OntologyAnnotation.svelte';
	import String from '../singleton/String.svelte';
	import Schema from '../../../lib/schemas';

	let {
		label = 'Protocol Parameter',
		attr,
		explanation = '',
		value: characteristic = $bindable(),
		showLabel = true,
		onRemove
	} = $props();

	const displayLabel = $derived(label || attr);
	let editMode = $state(false);

	type CharacteristicValueType = 'string' | 'number' | 'ontology';

	function getCharacteristicValueType() {
		if (typeof characteristic.value === 'number') return 'number';
		if (typeof characteristic.value === 'string') return 'string';
		return 'ontology';
	}

	function createEmptyCharacteristicValue(type: CharacteristicValueType) {
		if (type === 'string') return '';
		if (type === 'number') return 0;
		return Schema.getObjectFromSchema('ontology_annotation');
	}

	function switchCharacteristicValueType(type: CharacteristicValueType) {
		characteristic.value = createEmptyCharacteristicValue(type);
		if (type !== 'number') {
			characteristic.unit = undefined;
		}
	}
</script>

<div
	class="rounded-lg border bg-base-200 p-4"
	style="border-color: color-mix(in oklab, var(--color-base-content) 20%, #0000);"
>
	<div class="flex justify-end">
		<button class="btn btn-sm btn-error" onclick={onRemove}> Remove </button>
	</div>

	<OntologyAnnotation
		label="Characteristic Type"
		attr="category.characteristicType"
		explanation="The type of the characteristic, e.g. 'Genus', 'Temperature', etc."
		bind:value={characteristic.category.characteristicType}
		showLabel={true}
	/>

	<fieldset class="mt-4 fieldset">
		<legend class="fieldset-legend">Characteristic Value Type</legend>
		<div class="join w-full">
			<button
				type="button"
				class="btn join-item w-1/3 btn-outline btn-sm"
				class:btn-accent={getCharacteristicValueType() === 'string'}
				onclick={() => switchCharacteristicValueType('string')}
			>
				String
			</button>
			<button
				type="button"
				class="btn join-item w-1/3 btn-outline btn-sm"
				class:btn-accent={getCharacteristicValueType() === 'number'}
				onclick={() => switchCharacteristicValueType('number')}
			>
				Number
			</button>
			<button
				type="button"
				class="btn join-item w-1/3 btn-outline btn-sm"
				class:btn-accent={getCharacteristicValueType() === 'ontology'}
				onclick={() => switchCharacteristicValueType('ontology')}
			>
				Ontology Annotation
			</button>
		</div>
	</fieldset>

	{#if getCharacteristicValueType() === 'string'}
		<String
			label="Characteristic Value"
			attr="value"
			explanation="The value of the characteristic, e.g. 'Homo sapiens', '37', etc."
			bind:value={characteristic.value}
			showLabel={true}
		/>
	{:else if getCharacteristicValueType() === 'number'}
		<Number
			label="Characteristic Value"
			attr="value"
			explanation="The value of the characteristic, e.g. 'Homo sapiens', '37', etc."
			bind:value={characteristic.value}
			showLabel={true}
		/>
		<OntologyAnnotation
			label="Characteristic Unit"
			attr="unit"
			explanation="The unit of the characteristic, e.g. 'degrees Celsius', 'seconds', etc."
			bind:value={characteristic.unit}
			showLabel={true}
		/>
	{:else}
		<OntologyAnnotation
			label="Characteristic Value"
			attr="value"
			explanation="The value of the characteristic, e.g. 'Homo sapiens', '37', etc."
			bind:value={characteristic.value}
			showLabel={true}
		/>
	{/if}
</div>
