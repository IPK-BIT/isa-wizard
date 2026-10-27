<script lang="ts">
	import { getAppstate } from '$lib/appstate.svelte';
	import { getConfig } from '$lib/config.svelte';
	import { componentTypes, fieldTypes } from '$lib/config/mapping';
	import type { WizardConfig } from '$lib/types/Config';
	import { joinIsaPath } from '$lib/util/breadcrumbUtils';
	import { isaObj } from '$stores/isa';

	let {
		label = '',
		attr,
		attr2 = undefined,
		explanation = '',
		showLabel = true,
		type,
		metabuddy = false
	} = $props();

	// Absolute path of the field from the document root, e.g. `studies[0].title`
	const path = $derived(joinIsaPath(getAppstate().isaLvl, attr));

	let value = $derived.by(() =>
		attr2 != null ? isaObj.keyedComments(path, attr2) : isaObj.keyed(path)
	);

	// Metabuddy hooks. Everything Metabuddy is loaded on demand, so a disabled feature costs nothing.
	const features = $derived((getConfig() as WizardConfig).integrations?.metabuddy?.features);
	const isField = $derived(!!type && type in fieldTypes);

	// Review hints exist only after a confirmed conversion, so they are only loaded with `convert`
	let review: typeof import('$lib/metabuddy/review.svelte') | undefined = $state();
	$effect(() => {
		if (features?.convert && !review)
			import('$lib/metabuddy/review.svelte').then((m) => (review = m));
	});
	const hint = $derived(review?.needsReview(path, attr2));

	// DOM events only come from the user, a conversion writes into the store without any. The
	// explain button and the badge sit outside of the element that listens.
	function edited(e: Event) {
		if (!hint) return;
		// Select and clear widgets change the value without an input event
		if (
			e.type === 'click' &&
			!(isField && (e.target as Element).closest('button, [role="option"]'))
		) {
			return;
		}
		review?.clearReview(path, attr2);
	}
</script>

{#snippet badge()}
	<span
		class="badge badge-sm badge-warning"
		title={hint?.score !== undefined ? `Confidence ${hint.score}` : 'Could not be inferred'}
	>
		needs review
	</span>
{/snippet}

{#if type}
	{@const Component =
		fieldTypes[type as keyof typeof fieldTypes] ??
		componentTypes[type as keyof typeof componentTypes]}
	{#if Component}
		<div class="relative">
			{#if isField}
				<!-- Next to the legend row of the field, which every field type renders first -->
				<div class="absolute top-0 right-0 flex items-center gap-1">
					{#if hint}{@render badge()}{/if}
					{#if features?.explain && metabuddy}
						{#await import('$components/metabuddy/FieldExplain.svelte') then { default: FieldExplain }}
							<FieldExplain {label} {path} commentName={attr2} />
						{/await}
					{/if}
				</div>
			{:else if hint}
				<div class="mb-1 flex justify-end">{@render badge()}</div>
			{/if}
			<!-- svelte-ignore a11y_no_static_element_interactions, a11y_click_events_have_key_events -->
			<div
				class={hint
					? 'border-l-4 border-warning pl-2 [&_.input]:[--input-color:var(--color-warning)] [&_.textarea]:[--input-color:var(--color-warning)]'
					: ''}
				oninput={edited}
				onchange={edited}
				onclick={edited}
			>
				<Component {label} {attr} {explanation} {showLabel} bind:value={$value} />
			</div>
		</div>
	{/if}
{/if}
