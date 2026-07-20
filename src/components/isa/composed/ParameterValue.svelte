<script lang="ts">
	import Schema from '../../../lib/schemas';
	import Number from '../singleton/Number.svelte';
	import OntologyAnnotation from '../singleton/OntologyAnnotation.svelte';
	import Select from '../singleton/Select.svelte';
	import String from '../singleton/String.svelte';

	let {
		label = 'Parameter Values',
		attr,
		explanation = '',
		value = $bindable(),
		showLabel = true
	} = $props();

	const typeCommentName = 'type';

	function createTypeComment() {
		const newComment = Schema.getObjectFromSchema('comment');
		if (!newComment) {
			throw new Error('Unable to create parameter type comment from schema.');
		}
		newComment.name = typeCommentName;
		return newComment;
	}

	function getOrCreateTypeComment() {
		const category =
			value.category ??
			(value.category = {} as { comments?: Array<{ name: string; value: string }> });
		const comments = Array.isArray(category.comments) ? category.comments : [];
		const existingComment = comments.find((comment: { name: string; value: string }) => {
			return comment.name === typeCommentName;
		});

		if (existingComment) {
			return existingComment;
		}

		const newComment = createTypeComment();
		category.comments = [...comments, newComment];
		value = {
			...value,
			category: {
				...category,
				comments: category.comments
			}
		};

		return newComment;
	}

	let typeComment = $state(getOrCreateTypeComment());
	let previousType = '';

	function syncTypeComment() {
		const nextType = typeComment.value;
		const typeChanged = previousType !== nextType;
		const category =
			value.category ??
			(value.category = {} as { comments?: Array<{ name: string; value: string }> });
		const comments = Array.isArray(category.comments) ? category.comments : [];
		const commentIndex = comments.findIndex((comment: { name: string; value: string }) => {
			return comment.name === typeCommentName;
		});

		if (commentIndex === -1) {
			const newComment = createTypeComment();
			newComment.value = typeComment.value;
			typeComment = newComment;
			value = {
				...value,
				category: {
					...category,
					comments: [...comments, newComment]
				}
			};
			return;
		}

		const existingComment = comments[commentIndex];
		if (existingComment.value === typeComment.value) {
			typeComment = existingComment;
			return;
		}

		existingComment.value = typeComment.value;
		typeComment = existingComment;
		value = {
			...value,
			category: {
				...category,
				comments: [...comments]
			}
		};

		if (typeChanged) {
			value = {
				...value,
				value: null,
				unit: null
			};
		}

		previousType = nextType;
	}
</script>

<fieldset class="fieldset rounded-box border border-base-300 bg-base-100 p-4">
	<legend class="fieldset-legend">{value.category.parameterName.annotationValue}</legend>

	<div class="w-full">
		<Select
			label="Parameter Type"
			attr="parameterName.comments"
			options={[
				{ label: 'Ontology Term', value: 'ontology-annotation' },
				{ label: 'Text Value', value: 'string' },
				{ label: 'Numerical Measurement', value: 'number' }
			]}
			bind:value={typeComment.value}
			onChange={syncTypeComment}
		/>
	</div>

	{#if typeComment.value === 'string'}
		<String label="Value" attr="value" bind:value={value.value} />
	{:else if typeComment.value === 'number'}
		<Number label="Value" attr="value" bind:value={value.value} />
	{:else if typeComment.value === 'ontology-annotation'}
		<OntologyAnnotation label="Value" attr="value" bind:value={value.value} />
	{/if}

	{#if typeComment.value === 'number'}
		<OntologyAnnotation label="Unit" attr="unit" bind:value={value.unit} />
	{/if}
</fieldset>
