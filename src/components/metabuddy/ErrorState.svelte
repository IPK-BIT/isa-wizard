<script lang="ts">
	import type { MetabuddyErrorKind } from '$lib/metabuddy/types';

	let {
		error,
		onretry = undefined
	}: { error: { kind: MetabuddyErrorKind; message: string }; onretry?: () => void } = $props();

	const titles: Record<MetabuddyErrorKind, string> = {
		network: 'Metabuddy is not reachable',
		timeout: 'Metabuddy took too long to answer',
		auth: 'Metabuddy rejected the API key',
		invalid: 'Metabuddy could not process the request',
		server: 'Metabuddy had a problem'
	};

	const hints: Record<MetabuddyErrorKind, string> = {
		network: 'Check your connection and the configured server URL.',
		timeout: 'The request was cancelled. You can try again.',
		auth: 'Check the apiKey in the Metabuddy configuration.',
		invalid: '',
		server: 'This is probably temporary, try again in a moment.'
	};

	// network/timeout messages are generic, the others carry the server's detail text
	const showMessage = $derived(error.kind !== 'network');
</script>

<div role="alert" class="alert alert-soft alert-error">
	<div class="flex flex-col gap-1 text-sm">
		<span class="font-semibold">{titles[error.kind]}</span>
		{#if showMessage}
			<span>{error.message}</span>
		{/if}
		{#if hints[error.kind]}
			<span class="opacity-80">{hints[error.kind]}</span>
		{/if}
	</div>
	{#if onretry}
		<button class="btn btn-sm" onclick={onretry}>Retry</button>
	{/if}
</div>
