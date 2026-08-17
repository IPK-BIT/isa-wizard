<script lang="ts">
	import { getAppstate, updateAppstate } from '../../../lib/appstate.svelte';
	import Schema from '../../../lib/schemas';
	import { isaObj } from '../../../stores/isa';
	import BreadcrumbWidget from '../../ts4nfdi/BreadcrumbWidget.svelte';
	import EditAsButton from '../building-blocks/EditAsButton.svelte';
	import Materials from '../building-blocks/Materials.svelte';
	import Person from '../building-blocks/Person.svelte';
	import ProcessSequence from '../building-blocks/ProcessSequence.svelte';
	import Protocols from '../building-blocks/Protocols.svelte';
	import Publication from '../building-blocks/Publication.svelte';
	import TemplateCards from '../building-blocks/TemplateCards.svelte';

	let { value: study = $bindable(), config } = $props();

	function switchToTemplate(template: any) {
		let emptyObj = Schema.getObjectFromSchema('assay');
		study.assays = [...(study.assays ?? []), emptyObj];
		study = study; // trigger reactivity

		updateAppstate({
			template: template.metadata.code,
			isaLvl:
				getAppstate().isaLvl + '.assays[' + (study.assays ? study.assays.length - 1 : 0) + ']',
			currentStepIndex: 0,
			mode: 'wizard',
			guiType: 'investigation'
		});
	}

	function openAssay(index: number) {
		updateAppstate({
			currentStepIndex: 0,
			mode: 'gui',
			isaLvl: getAppstate().isaLvl + '.assays[' + index + ']',
			guiType: 'assay'
		});
	}

	function openStudy(template: any) {
		updateAppstate({
			template: template.metadata.code,
			isaLvl: getAppstate().isaLvl,
			currentStepIndex: 0,
			mode: 'wizard',
			guiType: 'investigation'
		});
	}

	function openInvestigation() {
		updateAppstate({
			currentStepIndex: 0,
			mode: 'gui',
			isaLvl: 'investigation',
			guiType: 'investigation'
		});
	}
</script>

<div class="flex justify-between">
	<div class="breadcrumbs text-sm">
		<ul>
			<li>
				<button onclick={openInvestigation}>{$isaObj.title || 'Untitled Investigation'}</button>
			</li>
			<li>{study.title || 'Untitled Study'}</li>
		</ul>
	</div>
	<div>
		{#await Object.values(config.templates).filter((t: any) => t.metadata.type === 'study')}
			<p>Loading...</p>
		{:then studyTemplates}
			<EditAsButton
				templates={studyTemplates}
				emptyMessage="No study templates available"
				onSelect={openStudy}
			/>
		{:catch error}
			<p>Error loading study templates: {error.message}</p>
		{/await}
	</div>
</div>

<div>
	<table class="table w-full table-fixed">
		<tbody>
			<!-- <tr>
				<th class="w-1/4 align-top">Filename</th>
				<td class="w-3/4">{study.filename}</td>
			</tr> -->
			<tr>
				<th class="w-1/4 align-top">Identifier</th>
				<td class="w-3/4">{study.identifier}</td>
			</tr>
			<tr>
				<th class="w-1/4 align-top">Title</th>
				<td class="w-3/4">{study.title}</td>
			</tr>
			<tr>
				<th class="w-1/4 align-top">Description</th>
				<td class="w-3/4">{study.description}</td>
			</tr>
			<tr>
				<th class="w-1/4 align-top">Submission Date</th>
				<td class="w-3/4"
					>{study.submissionDate ? new Date(study.submissionDate!).toLocaleDateString() : ''}</td
				>
			</tr>
			<tr>
				<th class="w-1/4 align-top">Public Release Date</th>
				<td class="w-3/4"
					>{study.publicReleaseDate
						? new Date(study.publicReleaseDate!).toLocaleDateString()
						: ''}</td
				>
			</tr>
			<tr>
				<th class="w-1/4 align-top">Publications</th>
				<td class="w-3/4">
					<ul>
						{#each study.publications as publication}
							<li><Publication {publication} /></li>
						{/each}
					</ul>
				</td>
			</tr>
			<tr>
				<th class="w-1/4 align-top">People</th>
				<td class="w-3/4">
					<ul>
						{#each study.people as person}
							<li><Person {person} /></li>
						{/each}
					</ul>
				</td>
			</tr>
			<tr>
				<th class="w-1/4 align-top">Study Design Descriptors</th>
				<td class="w-3/4">
					<div class="overflow-x-auto">
					<table class="table w-full">
						<thead>
							<tr>
								<th>Annotation Value</th>
								<th>Term Accession</th>
							</tr>
						</thead>
						<tbody>
							{#each study.studyDesignDescriptors as studyDesignDescriptor (studyDesignDescriptor)}
								<tr>
									<td>{studyDesignDescriptor.annotationValue}</td>
									<td
										><BreadcrumbWidget
											api={config['lookup-services'].ts.api}
											iri={studyDesignDescriptor.termAccession}
											ontologyId={studyDesignDescriptor.termSource}
										/></td
									>
								</tr>
							{/each}
						</tbody>
					</table>
					</div>
				</td>
			</tr>
			<tr>
				<th class="w-1/4 align-top">Protocols</th>
				<td class="w-3/4">
					<Protocols protocols={study.protocols} {config} />
				</td>
			</tr>
			<tr>
				<th class="w-1/4 align-top">Materials</th>
				<td class="w-3/4">
					<Materials materials={study.materials} {config} />
				</td>
			</tr>
			<tr>
				<th class="w-1/4 align-top">Process Sequence</th>
				<td class="w-3/4">
					<ProcessSequence processes={study.processSequence} {config} />
				</td>
			</tr>
			<tr>
				<th class="w-1/4 align-top">Assays</th>
				<td class="w-3/4">
					<div>
						{#if study.assays && study.assays.length === 0}
							<span class="text-sm text-neutral/75 italic">No assays defined</span>
						{/if}
						<div class="overflow-x-auto">
						<table class="table">
							<tbody>
								{#each study.assays as assay, i (assay)}
									<tr class="hover:cursor-pointer hover:bg-primary/10" onclick={() => openAssay(i)}>
										<td>
											<span
												>{assay.filename ||
													assay.comments?.find(
														(c: { name: string; value: string }) => c.name === 'title'
													)?.value ||
													`Assay ${i + 1}`}</span
											>
										</td>
									</tr>
								{/each}
							</tbody>
						</table>
						</div>
					</div>
					<div class="mt-2">
						{#await Object.values(config.templates).filter((t: any) => t.metadata.type === 'assay')}
							<p>Loading...</p>
						{:then assayTemplates}
							<TemplateCards
								templates={assayTemplates}
								heading="Add a new assay"
								emptyMessage="No assay templates available"
								onSelect={switchToTemplate}
							/>
						{:catch error}
							<p>Error loading assay templates: {error.message}</p>
						{/await}
					</div>
				</td>
			</tr>
			<tr>
				<th class="w-1/4 align-top">Comments</th>
				<td class="w-3/4">
					{#if study.comments && study.comments.length > 0}
						<div class="overflow-x-auto">
						<table class="table w-full">
							<thead>
								<tr>
									<th>Name</th>
									<th>Value</th>
								</tr>
							</thead>
							<tbody>
								{#each study.comments as comment}
									<tr>
										<td>{comment.name}</td>
										<td>{comment.value}</td>
									</tr>
								{/each}
							</tbody>
						</table>
						</div>
					{/if}
				</td>
			</tr>
		</tbody>
	</table>
</div>