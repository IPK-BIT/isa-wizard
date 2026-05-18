<script lang="ts">
	import doi from '../../../assets/doi.png';

	let { publication } = $props();
</script>

<div class="flex space-x-2">
	<span>{publication.title}</span>
	<a href={'https://doi.org/' + publication.doi} target="_blank">
		<img class="w-5" alt="DOI" src={doi} />
	</a>
</div>
<span class="text-xs italic"
	>{(publication.authorList?.split(',')?.length ?? 0) > 8
		? publication.authorList?.split(',').slice(0, 5).join(', ') + ' et al.'
		: publication.authorList}</span
>
