<script lang="ts">
	import orcid from '../../../assets/orcid.png';

	let { person } = $props();
</script>

<div class="flex flex-col">
	<div class="flex space-x-2">
		<span>{person.firstName} {person.lastName}</span>
		{#if person.comments && person.comments.find((c: { name: string; value: string }) => c.name === 'Person ID')?.value}
			<a
				href={'https://orcid.org/' +
					person.comments.find((c: { name: string; value: string }) => c.name === 'Person ID')
						?.value}
				target="_blank"
			>
				<img class="w-5" alt="ORCID" src={orcid} />
			</a>
		{/if}
	</div>
	<span class="text-xs italic">{person.affiliation}</span>
</div>
