<script lang="ts">
	import { keyed } from '@humanspeak/svelte-keyed';
	import String from '../singleton/String.svelte';
	import { derived } from 'svelte/store';
	import Orcid from '../singleton/Orcid.svelte';

	let {
		label = 'Person',
		attr,
		explanation = '',
		value: person = $bindable(),
		showLabel = true,
		onRemove
	} = $props();

	const displayLabel = $derived(label || attr);
	let editMode = $state(false);

	function handleOrcidChange(selection: {
		familyName: string;
		name: string;
		institutions: string[];
		emails: string[];
	}) {
		person.firstName = selection.name ?? '';
		person.lastName = selection.familyName ?? '';
		person.affiliation = selection.institutions.length > 0 ? selection.institutions.at(0) : '';
		person.email = selection.emails.length > 0 ? selection.emails.join(',') : '';
	}

	let orcid: string = $derived(
		person?.comments?.find((c: { name: string; value: string }) => {
			return c.name === 'Person ID';
		})?.value || ''
	);

	$effect(() => {
		if (
			person &&
			orcid !==
				person?.comments?.find((c: { name: string; value: string }) => {
					return c.name === 'Person ID';
				})?.value
		) {
			let idx =
				person?.comments?.findIndex((c: { name: string; value: string }) => {
					return c.name === 'Person ID';
				}) ?? -1;
			if (idx !== -1 && person?.comments?.[idx]) {
				person.comments[idx].value = orcid;
			} else if (person.comments) {
				person.comments = [...person.comments, { name: 'Person ID', value: orcid }];
			}
		}
	});
</script>

<div class="space-y-4 rounded-lg border border-neutral bg-base-200 p-4">
	<div class="flex items-center justify-between">
		<div class="flex items-center space-x-4">
			{#if !editMode}
				<div class="flex flex-col">
					<span class="text-sm text-neutral/90">
						{#if person.firstName || person.lastName}
							{person.firstName} {person.lastName}
						{:else}
							<span class="text-neutral/75 italic">No name provided</span>
						{/if}
					</span>
					<span class="label text-xs">
						{#if orcid}
							{orcid}
						{:else}
							<span class="text-neutral/75 italic">No ORCID provided</span>
						{/if}
					</span>
				</div>
			{/if}
			{#if showLabel}
				<h3 class="text-lg font-semibold">{displayLabel}</h3>
			{/if}
		</div>
		<div>
			<button
				type="button"
				class="btn mr-2 btn-secondary btn-sm"
				onclick={() => (editMode = !editMode)}
				title={editMode ? 'Switch to view mode' : 'Switch to edit mode'}
			>
				{editMode ? 'View' : 'Edit'}
			</button>
			{#if onRemove}
				<button type="button" class="btn btn-error btn-sm" onclick={onRemove} title="Remove person">
					Remove
				</button>
			{/if}
		</div>
	</div>

	{#if explanation}
		<p class="label text-sm">{explanation}</p>
	{/if}

	{#if editMode}
		<div class="space-y-4">
			<Orcid
				label="ORCID"
				attr="comment"
				explanation="The ORCID of the person"
				bind:value={orcid}
				showLabel={true}
				onChange={handleOrcidChange}
			/>

			<String
				label="First Name"
				attr="firstName"
				explanation="The first name of the person"
				bind:value={person.firstName}
				showLabel={true}
			/>

			<String
				label="Middle Initials"
				attr="midInitials"
				explanation="The middle name initials of the person"
				bind:value={person.midInitials}
				showLabel={true}
			/>

			<String
				label="Last Name"
				attr="lastName"
				explanation="The last name of the person"
				bind:value={person.lastName}
				showLabel={true}
			/>

			<String
				label="Email Address"
				attr="email"
				explanation="The email address of the person"
				bind:value={person.email}
				showLabel={true}
			/>

			<String
				label="Fax Number"
				attr="fax"
				explanation="The fax number of the person"
				bind:value={person.fax}
				showLabel={true}
			/>

			<String
				label="Address"
				attr="address"
				explanation="The address of the person"
				bind:value={person.address}
				showLabel={true}
			/>

			<String
				label="Affiliation"
				attr="affiliation"
				explanation="The affiliation of the person"
				bind:value={person.affiliation}
				showLabel={true}
			/>
		</div>
	{/if}
</div>
