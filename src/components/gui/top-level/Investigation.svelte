<script lang="ts">
	import Person from '../building-blocks/Person.svelte';

	import Publication from '../building-blocks/Publication.svelte';
	import TemplateCards from '../building-blocks/TemplateCards.svelte';

	import { isaObj } from '../../../stores/isa';
	import { updateAppstate } from '../../../lib/appstate.svelte';
	import Schema from '../../../lib/schemas';

	let { config, value = $bindable() } = $props();

	function switchToTemplate(template: any) {
		let emptyObj = Schema.getObjectFromSchema('study');

        if (!emptyObj) {
            return;
        }
		
		$isaObj.studies = [...($isaObj.studies ?? []), emptyObj];
		$isaObj = $isaObj; // trigger reactivity

		updateAppstate({
			template: template.metadata.code,
			isaLvl: 'studies[' + ($isaObj.studies ? $isaObj.studies.length - 1 : 0) + ']',
			currentStepIndex: 0,
			mode: 'wizard',
			guiType: 'investigation'
		});
	}

	function openInvestigation() {
		updateAppstate({
			template: 'investigation',
			isaLvl: '',
			currentStepIndex: 0,
			mode: 'wizard',
			guiType: 'investigation'
		});
	}

	function openStudy(index: number) {
		updateAppstate({
			currentStepIndex: 0,
			mode: 'gui',
			isaLvl: 'studies[' + index + ']',
			guiType: 'study'
		});
	}
</script>

<div class="flex justify-between">
	<div class="breadcrumbs text-sm">
		<ul>
			<li>{$isaObj.title || 'Untitled Investigation'}</li>
		</ul>
	</div>
	<div>
		<button class="btn btn-primary btn-sm" onclick={openInvestigation}>Edit Investigation</button>
	</div>
</div>

<table class="table w-full table-fixed">
	<tbody>
		<!-- <tr>
			<th class="w-1/4 align-top">Filename</th>
			<td>{$isaObj.filename}</td>
		</tr> -->
		<tr>
			<th class="w-1/4 align-top">Identifier</th>
			<td>{$isaObj.identifier}</td>
		</tr>
		<tr>
			<th class="w-1/4 align-top">Title</th>
			<td>{$isaObj.title}</td>
		</tr>
		<tr>
			<th class="w-1/4 align-top">Description</th>
			<td>{$isaObj.description}</td>
		</tr>
		<tr>
			<th class="w-1/4 align-top">Submission Date</th>
			<td>{$isaObj.submissionDate ? new Date($isaObj.submissionDate!).toLocaleDateString() : ''}</td
			>
		</tr>
		<tr>
			<th class="w-1/4 align-top">Public Release Date</th>
			<td
				>{$isaObj.publicReleaseDate
					? new Date($isaObj.publicReleaseDate!).toLocaleDateString()
					: ''}</td
			>
		</tr>
		<tr>
			<th class="w-1/4 align-top">Publications</th>
			<td>
				<ul>
					{#each $isaObj.publications as publication}
						<li>
							<Publication {publication} />
						</li>
					{/each}
				</ul>
			</td>
		</tr>
		<tr>
			<th class="w-1/4 align-top">People</th>
			<td>
				<ul>
					{#each $isaObj.people as person}
						<li>
							<Person {person} />
						</li>
					{/each}
				</ul>
			</td>
		</tr>
		<tr>
			<th class="w-1/4 align-top">Studies</th>
			<td>
				<div>
					{#if $isaObj.studies && $isaObj.studies.length === 0}
						<span class="text-sm text-neutral/75 italic">No studies defined</span>
					{/if}
					<div class="overflow-x-auto">
					<table class="table">
						<tbody>
							{#each $isaObj.studies as study, i (study)}
								<tr class="hover:cursor-pointer hover:bg-primary/10" onclick={() => openStudy(i)}>
									<td>
										<span>{study.title || 'Untitled Study'}</span>
									</td>
									<td>
										<div class="flex space-x-2">
											{#each study.studyDesignDescriptors as studyDesignDescriptor (studyDesignDescriptor)}
												<span class="badge badge-sm badge-secondary"
													>{studyDesignDescriptor.annotationValue}</span
												>
											{/each}
										</div>
									</td>
								</tr>
							{/each}
						</tbody>
					</table>
					</div>
				</div>
				<div class="mt-2">
					{#await Object.values(config.templates).filter((t: any) => t.metadata.type === 'study')}
						<p>Loading...</p>
					{:then studyTemplates}
						<TemplateCards
							templates={studyTemplates}
							heading="Add a new study"
							emptyMessage="No study templates available"
							onSelect={switchToTemplate}
						/>
					{:catch error}
						<p>Error loading study templates: {error.message}</p>
					{/await}
				</div>
			</td>
		</tr>
		<tr>
			<th class="w-1/4 align-top">Comments</th>
			<td>
				<div class="overflow-x-auto">
				<table class="table w-full">
					<thead>
						<tr>
							<th>Name</th>
							<th>Value</th>
						</tr>
					</thead>
					<tbody>
						{#each $isaObj.comments as comment}
							<tr>
								<td>{comment.name}</td>
								<td>{comment.value}</td>
							</tr>
						{/each}
					</tbody>
				</table>
				</div>
			</td>
		</tr>
	</tbody>
</table>