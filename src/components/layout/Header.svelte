<script lang="ts">
	import logo from '../../assets/logo.png';

	let { config } = $props();
</script>

<header class="border-b border-neutral bg-base-100 shadow-md">
	{#if config?.name}
		<div class="flex items-center space-x-4 p-2">
			<h1 class="text-2xl font-bold">{config?.name || 'ISA Wizard'}</h1>
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
</header>
