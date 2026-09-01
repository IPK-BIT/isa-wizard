<script lang="ts">
	import logo from '$assets/logo.png';
	import { authorizeClient } from '$lib/auth/oauth';

	let { config } = $props();

	async function startAuthFlow() {
		authorizeClient(
			`${config['integrations']['fairdom'].url}/oauth`,
			config['integrations']['fairdom'].clientId,
			window.location.origin,
			'code',
			config['integrations']['fairdom'].scope,
			'S256'
		);
	}
</script>

<div class="navbar bg-base-100 shadow-sm">
	<div class="flex-1">
		{#if config?.general.name}
			<div class="flex items-center space-x-4 p-2">
				<h1 class="text-2xl font-bold">{config?.general.name || 'ISA Wizard'}</h1>
				<div class="flex items-center space-x-2">
					<img class="w-12" src={logo} alt="ISA Wizard" />
					<div class="flex flex-col items-center">
						<span class="text-xs italic">powered by</span>
						<span class="font-bold">ISA Wizard</span>
					</div>
				</div>
			</div>
		{:else}
			<img class="w-12" src={logo} alt="ISA Wizard" />
			<h1>ISA Wizard</h1>
		{/if}
	</div>
	<div class="flex-none">
		<button class="btn btn-ghost" onclick={startAuthFlow}> Login </button>
	</div>
</div>
