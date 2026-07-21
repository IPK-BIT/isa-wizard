<script lang="ts">
	import { convertIsaJsonToZip } from 'isa4js';
	import { isaObj } from '../../stores/isa';

	interface ExportOption {
		id: string;
		title: string;
		description: string;
		filename: string;
		formatBadge: string;
		action: (data: Record<string, any>) => Promise<Blob | string>;
	}

	let loadingId = $state<string | null>(null);
	let errorMessage = $state<string | null>(null);

	function prepareAssayFilenames(investigationJson: Record<string, any>): Record<string, any> {
		// Deep clone or copy to avoid mutating the raw store state directly if unwanted
		const clonedJson = JSON.parse(JSON.stringify(investigationJson));

		for (const study of clonedJson.get?.("studies") || clonedJson.studies || []) {
			const studyId = study.identifier || 'unknown_study';

			const assays = study.assays || [];
			for (let i = 0; i < assays.length; i++) {
				const assay = assays[i];
				let assayId: string | null = null;
				for (const comment of assay.comments || []) {
					if (comment.name === 'identifier') {
						assayId = comment.value;
						break;
					}
				}

				if (!assayId) {
					assayId = `assay${i}`;
				}

				assay.filename = `a_${studyId}-${assayId}.txt`;
			}
		}

		return clonedJson;
	}

	function triggerDownload(content: Blob | string, filename: string) {
		const blob =
			content instanceof Blob ? content : new Blob([content], { type: 'text/plain;charset=utf-8' });

		const url = URL.createObjectURL(blob);
		const link = document.createElement('a');
		link.href = url;
		link.download = filename;

		document.body.appendChild(link);
		link.click();

		document.body.removeChild(link);
		URL.revokeObjectURL(url);
	}

	const exportOptions: ExportOption[] = [
		{
			id: 'isa-tab',
			title: 'ISA-Tab',
			description: 'Export as standard ISA-Tab directory compressed into a ZIP archive.',
			filename: 'isa-tab-archive.zip',
			formatBadge: 'ZIP',
			action: async (data) => {
				const preparedData = prepareAssayFilenames(data);
				return (await convertIsaJsonToZip(preparedData, 'blob')) as Blob;
			}
		},
		{
			id: 'isa-json',
			title: 'ISA-JSON',
			description: 'Export raw ISA metadata as a structured JSON file.',
			filename: 'isa.json',
			formatBadge: 'JSON',
			action: async (data) => JSON.stringify(data, null, 2)
		}
	];

	async function handleExport(option: ExportOption) {
		if (loadingId) return;
		loadingId = option.id;
		errorMessage = null;

		try {
			const content = await option.action($isaObj);
			triggerDownload(content, option.filename);
		} catch (err) {
			console.error(`Export failed for ${option.id}:`, err);
			errorMessage = err instanceof Error ? err.message : 'An error occurred during export.';
		} finally {
			loadingId = null;
		}
	}
</script>

<details class="collapse-arrow collapse mb-4 border border-base-300 bg-base-100">
	<summary class="collapse-title font-semibold">
		<h2 class="text-xl font-bold tracking-tight text-base-content">Export Data</h2>
		<p class="mt-1 text-sm text-base-content/70">Select a format to download your ISA metadata.</p>
	</summary>
	<div class="collapse-content text-sm">
		{#if errorMessage}
			<div
				class="flex items-center gap-2 border-b border-error/20 bg-error/10 p-4 text-sm text-error"
			>
				<svg
					xmlns="http://www.w3.org/2000/svg"
					class="h-5 w-5 shrink-0 stroke-current"
					fill="none"
					viewBox="0 0 24 24"
					><path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
					/></svg
				>
				<span>{errorMessage}</span>
			</div>
		{/if}

		<!-- Export Items List -->
		<div class="divide-y divide-base-200/60">
			{#each exportOptions as option (option.id)}
				<div
					class="hover:bg-base-50/50 flex flex-col justify-between gap-4 p-6 transition-colors sm:flex-row sm:items-center"
				>
					<div class="max-w-xl space-y-1">
						<div class="flex items-center gap-2">
							<h3 class="text-base font-medium text-base-content">{option.title}</h3>
							<span class="badge font-mono badge-sm text-[10px] badge-neutral"
								>{option.formatBadge}</span
							>
						</div>
						<p class="text-sm leading-relaxed text-base-content/60">
							{option.description}
						</p>
					</div>

					<div class="shrink-0">
						<button
							class="btn gap-2 rounded-xl px-5 font-medium text-white btn-md btn-success"
							disabled={loadingId !== null}
							onclick={() => handleExport(option)}
						>
							{#if loadingId === option.id}
								<span class="loading loading-xs loading-spinner"></span>
								Exporting...
							{:else}
								<svg
									xmlns="http://www.w3.org/2000/svg"
									fill="none"
									viewBox="0 0 24 24"
									stroke-width="2"
									stroke="currentColor"
									class="h-4 w-4"
								>
									<path
										stroke-linecap="round"
										stroke-linejoin="round"
										d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3"
									/>
								</svg>
								Download
							{/if}
						</button>
					</div>
				</div>
			{/each}
		</div>
	</div>
</details>