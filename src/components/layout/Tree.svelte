<script lang="ts">
	import { getAppstate, updateAppstate } from '../../lib/appstate.svelte';
	import { isaObj } from '../../stores/isa';
	import {
		constructAssayPath,
		constructStudyPath,
		parseIsaLvl
	} from '../../lib/util/breadcrumbUtils';

	const activeNode = $derived.by(() => parseIsaLvl(getAppstate().isaLvl));

	function openInvestigation() {
		updateAppstate({
			currentStepIndex: 0,
			mode: 'gui',
			isaLvl: 'investigation',
			guiType: 'investigation'
		});
	}

	function openStudy(studyIndex: number) {
		updateAppstate({
			currentStepIndex: 0,
			mode: 'gui',
			isaLvl: constructStudyPath(studyIndex),
			guiType: 'study'
		});
	}

	function openAssay(studyIndex: number, assayIndex: number) {
		updateAppstate({
			currentStepIndex: 0,
			mode: 'gui',
			isaLvl: constructAssayPath(studyIndex, assayIndex),
			guiType: 'assay'
		});
	}

	function isActivePath(path: string) {
		return getAppstate().isaLvl === path;
	}

	function isActiveStudy(studyIndex: number) {
		return activeNode.level === 'study' && activeNode.studyIndex === studyIndex;
	}

	function isActiveAssay(studyIndex: number, assayIndex: number) {
		return (
			activeNode.level === 'assay' &&
			activeNode.studyIndex === studyIndex &&
			activeNode.assayIndex === assayIndex
		);
	}
</script>

<nav class="card bg-base-100 shadow-md">
	<div class="card-body gap-2 p-4">
		<div class="flex items-center justify-between">
			<h2 class="text-sm font-semibold tracking-wide text-base-content/70 uppercase">Navigation</h2>
		</div>

		<ul class="menu gap-1 menu-sm p-0">
			<li>
				<button
					class:active={isActivePath('investigation')}
					class="justify-start"
					onclick={openInvestigation}
				>
					<span class="font-medium">{$isaObj.title || 'Untitled Investigation'}</span>
				</button>
				{#if $isaObj.studies?.length}
					<ul class="mt-1 border-l border-base-300 pl-3">
						{#each $isaObj.studies as study, studyIndex (study)}
							<li class="mb-1">
								<button
									class:active={isActiveStudy(studyIndex)}
									class="justify-start"
									onclick={() => openStudy(studyIndex)}
								>
									<span class="truncate">{study.title || 'Untitled Study'}</span>
								</button>
								{#if study.assays?.length}
									<ul class="mt-1 border-l border-base-300 pl-3">
										{#each study.assays as assay, assayIndex (assay)}
											<li>
												<button
													class:active={isActiveAssay(studyIndex, assayIndex)}
													class="justify-start"
													onclick={() => openAssay(studyIndex, assayIndex)}
												>
													<span class="truncate">
														{assay.filename || 'Untitled Assay'}
													</span>
												</button>
											</li>
										{/each}
									</ul>
								{/if}
							</li>
						{/each}
					</ul>
				{/if}
			</li>
		</ul>
	</div>
</nav>
