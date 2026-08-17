<script lang="ts">
	let {
		templates,
		label = 'Edit as',
		emptyMessage = 'No templates available',
		onSelect
	}: {
		templates: any[];
		label?: string;
		emptyMessage?: string;
		onSelect: (template: any) => void;
	} = $props();
</script>

{#if templates.length === 0}
	<p class="text-sm text-neutral/75 italic">{emptyMessage}</p>
{:else if templates.length === 1}
	<button class="btn btn-primary btn-sm" onclick={() => onSelect(templates[0])}>
		Edit as {templates[0].metadata.label}
	</button>
{:else}
	<div class="dropdown dropdown-end">
		<div tabindex="0" role="button" class="btn btn-primary btn-sm">
			{label}
			<svg
				xmlns="http://www.w3.org/2000/svg"
				viewBox="0 0 20 20"
				fill="currentColor"
				class="h-4 w-4"
			>
				<path
					fill-rule="evenodd"
					d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"
					clip-rule="evenodd"
				/>
			</svg>
		</div>
		<!-- svelte-ignore a11y_no_noninteractive_tabindex -->
		<ul tabindex="0" class="dropdown-content menu menu-sm z-10 w-56 rounded-box bg-base-100 p-2 shadow">
			{#each templates as template (template.metadata.code)}
				<li>
					<button onclick={() => onSelect(template)}>{template.metadata.label}</button>
				</li>
			{/each}
		</ul>
	</div>
{/if}