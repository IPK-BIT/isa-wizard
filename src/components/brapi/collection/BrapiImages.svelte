<script lang="ts">
	import Svelecte from 'svelecte';
	import Select from "$components/isa/singleton/Select.svelte";
	import String from "$components/isa/singleton/String.svelte";
	import Modal from "$components/layout/Modal.svelte";
	import Schema from "../../../lib/schemas";

	interface Call {
		service: string;
		methods: string[];
	}

	interface Image {
		imageDbId: string;
		imageName: string;
		imageFileName: string;
		imageTimeStamp: string;
		imageURL: string;
		mimeType: string;
	}

	type LevelKey = 'trial' | 'study' | 'germplasm' | 'observationUnit';

	interface FilterLevel {
		key: LevelKey;
		endpoint: string;
		valueField: string;
		labelField: string;
		paramName: string; // query param this level's selected id is passed as when filtering the NEXT level / images
		label: string;
		plural: string;
		virtualList?: boolean;
	}

	// The four BrAPI filter levels (Trial -> Study -> Germplasm -> Observation Unit) all
	// behave identically: fetch a paginated list (optionally scoped to the previous
	// level's selection), let the user pick one, and reset everything below when the
	// selection changes. Driving all four from one config avoids repeating that logic
	// (and its markup) four times.
	const LEVELS: FilterLevel[] = [
		{ key: 'trial', endpoint: '/trials', valueField: 'trialDbId', labelField: 'trialName', paramName: 'trialDbId', label: 'Trial', plural: 'trials' },
		{ key: 'study', endpoint: '/studies', valueField: 'studyDbId', labelField: 'studyName', paramName: 'studyDbId', label: 'Study', plural: 'studies' },
		{ key: 'germplasm', endpoint: '/germplasm', valueField: 'germplasmDbId', labelField: 'germplasmName', paramName: 'germplasmDbId', label: 'Germplasm', plural: 'germplasm', virtualList: true },
		{ key: 'observationUnit', endpoint: '/observationunits', valueField: 'observationUnitDbId', labelField: 'observationUnitName', paramName: 'observationUnitDbId', label: 'Observation Unit', plural: 'observation units', virtualList: true }
	];

	const pickerBorderStyle = "border-color: color-mix(in oklab, var(--color-base-content) 20%, #0000);";

	let {
		label = 'Data Files',
		attr,
		explanation = '',
		value: files = $bindable(),
		showLabel = true
	} = $props();

	const displayLabel = $derived(label || attr);

	let baseUrl = $state('');
	let authorizationHeader = $state('');

	async function requestBrapi(endpoint: string, parameters?: URLSearchParams | Record<string, string> ) {
		try {
			const searchParams = parameters instanceof URLSearchParams
				? parameters
				: parameters
					? new URLSearchParams(parameters)
					: undefined;
			const response = await fetch(baseUrl + endpoint + (searchParams?.toString() ? `?${searchParams.toString()}` : ''), {
				headers: {
					'Authorization': authorizationHeader??undefined
				}
			})
			return await response.json();
		} catch (e) {
			console.error(e);
		}
	}

	/**
	 * BrAPI list endpoints are paginated (`metadata.pagination`) and only return one
	 * page per request. This walks every page and returns the combined `data` array,
	 * optionally stopping after `maxPages` (reporting whether more pages existed).
	 * `maxPages: Infinity` walks every page - used for the final "Request Images" call,
	 * where we need every matching result, not just enough to fill a dropdown.
	 */
	async function requestBrapiPages(endpoint: string, parameters: Record<string, string> = {}, maxPages = Infinity) {
		const pageSize = 1000;
		let page = 0;
		let all: any[] = [];
		let truncated = false;
		// eslint-disable-next-line no-constant-condition
		while (true) {
			const response = await requestBrapi(endpoint, { ...parameters, page: `${page}`, pageSize: `${pageSize}` });
			const data = response?.result?.data ?? [];
			all = all.concat(data);
			const pagination = response?.metadata?.pagination;
			const totalPages = pagination?.totalPages ?? 1;
			page += 1;
			if (!pagination || data.length === 0) break;
			if (page >= totalPages) break;
			if (page >= maxPages) { truncated = true; break; }
		}
		return { data: all, truncated };
	}

	// Dropdown lists are fetched locally (not via svelecte's remote `fetch` mode) and
	// searched client-side, because BrAPI servers vary in whether/how they support
	// text search on name fields (e.g. some only match `trialName` exactly, others
	// support wildcards) - we can't rely on any particular filtering behavior server-side.
	// Each list is capped at MAX_LIST_PAGES pages; if a server has more than that many
	// matching records, narrow it down with a parent filter above.
	const MAX_LIST_PAGES = 10;

	let connected: boolean|undefined = $state(undefined);
	let imagesSupported: boolean|undefined = $state(undefined);

	// Filters - all optional and independent of each other. Selecting one narrows
	// the results of the ones "below" it, but none of them are required.
	let selected: Record<LevelKey, string|undefined> = $state({
		trial: undefined,
		study: undefined,
		germplasm: undefined,
		observationUnit: undefined
	});

	let lists: Record<LevelKey, any[]> = $state({
		trial: [],
		study: [],
		germplasm: [],
		observationUnit: []
	});

	let truncated: Record<LevelKey, boolean> = $state({
		trial: false,
		study: false,
		germplasm: false,
		observationUnit: false
	});

	let images: Image[] = $state([]);

	async function loadLevel(i: number) {
		const level = LEVELS[i];
		const prev = i > 0 ? LEVELS[i - 1] : undefined;
		const params: Record<string, string> = prev && selected[prev.key] ? { [prev.paramName]: selected[prev.key]! } : {};
		const { data, truncated: wasTruncated } = await requestBrapiPages(level.endpoint, params, MAX_LIST_PAGES);
		lists[level.key] = data;
		truncated[level.key] = wasTruncated;
	}

	// Load (or reload) each list once connected, and whenever its parent filter changes -
	// each effect reads only the state it actually depends on (level 0 has no parent, so
	// it only reloads on connect).
	for (let i = 0; i < LEVELS.length; i++) {
		const idx = i;
		$effect(() => {
			if (connected) {
				if (idx > 0) selected[LEVELS[idx - 1].key];
				loadLevel(idx);
			}
		});
	}

	async function testConnection() {
		const response = await requestBrapi('/serverinfo');
		console.log(response);
		if (response) {
			connected = true;
			imagesSupported = !!response.result?.calls?.some((call: Call) => call.service === 'images' && call.methods?.includes('GET'));
		} else {
			connected = false;
			imagesSupported = undefined;
		}
	}

	// A parent filter changing invalidates whatever was selected below it, since
	// that selection may no longer belong to the newly filtered set.
	function resetBelow(i: number) {
		for (let j = i + 1; j < LEVELS.length; j++) selected[LEVELS[j].key] = undefined;
	}

	async function requestImages() {
		const filters: Record<string, string> = {};
		for (const level of LEVELS) {
			if (selected[level.key]) filters[level.paramName] = selected[level.key]!;
		}
		const { data } = await requestBrapiPages('/images', filters);
		images = data;
	}

	function addImages() {
		const commentNames = ['mimeType', 'imageTimeStamp', 'imageURL'] as const;
		for (let image of images) {
			let fileTemplate = Schema.getObjectFromSchema('data');
			fileTemplate!.name = image.imageFileName ?? image.imageName ?? image.imageURL;
			fileTemplate!.type = 'Raw Data File';
			for (let commentName of commentNames) {
				let comment = Schema.getObjectFromSchema('comment');
				comment!.name = commentName;
				comment!.value = image[commentName];
				fileTemplate!.comments.push(comment)
			}
			files = [...files, fileTemplate];
		}
	}

	function removeImage(i: number) {
		if (i < 0) return;
		files = files.filter((_: unknown, idx: number) => idx !== i);
	}

</script>

<fieldset class="fieldset">
<legend class="fieldset-legend">{displayLabel}</legend>
	<section class="border rounded-lg space-y-2 p-2" 
			style="border-color: color-mix(in oklab, var(--color-base-content) 20%, #0000);">
	{#if files.length}
	<table class="table">
		<thead>
			<tr>
				<th>Image Name</th>
				<th>Image Type</th>
				<th>Time Stamp</th>
				<th>MIME Type</th>
				<th></th>
			</tr>
		</thead>
		<tbody>
			{#each files as file, i (i)}
			{#if file.comments.find((c: {name: string}) => c.name==='mimeType') && file.comments.find((c: {name: string}) => c.name==='mimeType').value.includes('image')}
			<tr>
				<td>
					<String label="File Name" attr="name" bind:value={files[i].name} showLabel={false} />
				</td>
				<td>
					<Select
						label="File Type"
						attr="type"
						options={[
							{ label: 'Raw Data File', value: 'Raw Data File' },
							{ label: 'Derived Data File', value: 'Derived Data File' },
							{ label: 'Image File', value: 'Image File' },
							{ label: 'Acquisition Parameter Data File', value: 'Acquisition Parameter Data File' },
							{ label: 'Derived Spectral Data File', value: 'Derived Spectral Data File' },
							{ label: 'Protein Assignment File', value: 'Protein Assignment File' },
							{ label: 'Raw Spectral Data File', value: 'Raw Spectral Data File' },
							{ label: 'Peptide Assignment File', value: 'Peptide Assignment File' },
							{ label: 'Array Data File', value: 'Array Data File' },
							{ label: 'Derived Array Data File', value: 'Derived Array Data File' },
							{ label: 'Post Translational Modification Assignment File', value: 'Post Translational Modification Assignment File' },
							{ label: 'Derived Array Data Matrix File', value: 'Derived Array Data Matrix File' },
							{ label: 'Free Induction Decay Data File', value: 'Free Induction Decay Data File' },
							{ label: 'Metabolite Assignment File', value: 'Metabolite Assignment File' },
							{ label: 'Array Data Matrix File', value: 'Array Data Matrix File' }
						]}
						bind:value={files.type}
						showLabel={false}
					/>
				</td>
				<td><span class="badge badge-info badge-outline">{file.comments.find((c: {name: string; value: string})=>c.name==='mimeType').value}</span></td>
				<td>{file.comments.find((c: {name: string; value: string})=>c.name==='imageTimeStamp').value}</td>
				<td><button class="btn btn-error btn-outline btn-sm" onclick={()=>removeImage(i)}>Remove</button></td>
			</tr>
			{/if}
			{/each}
		</tbody>
	</table>
	{:else}
	<span class="p-4 label italic">No images imported yet</span>
	{/if}
	</section>
	<p class="label">You can import image metadata from the BrAPI Server</p>
	<Modal class="w-11/12 max-w-5xl max-h-[85vh]" label="Import Images" onopen={()=>{}} onapprove={addImages}>
		<h2 class="text-lg font-semibold">Import Images from BrAPI Server</h2>
		<fieldset class="fieldset bg-base-200 border-base-300 rounded-box w-full border p-4">
			<legend class="fieldset-legend">Connection Details</legend>

			<label for="base-url" class="label">BrAPI Base URL</label>
			<input id="base-url" type="text" class="input w-full" bind:value={baseUrl}/>

			<label for="authorization" class="label">Authorization Header</label>
			<input id="authorization" type="text" class="input w-full" bind:value={authorizationHeader}/>

			<button class="btn btn-secondary" onclick={testConnection}>Test Connection</button>
			{#if connected !== undefined}
			<span class="label {connected?'text-success':'text-error'}">{connected?'Connected successfully':'Connection failed'}</span>
			{#if connected && imagesSupported === false}
			<span class="label text-warning">This server doesn't advertise BrAPI Images support in its /serverinfo response - the request below may still fail.</span>
			{/if}
			{/if}
		</fieldset>
		{#if connected}
		<fieldset class="fieldset bg-base-200 border-base-300 rounded-box w-full border p-4">
			<legend class="fieldset-legend">Import Images</legend>

			{#each LEVELS as level, i (level.key)}
			<section class="border rounded-lg" style={pickerBorderStyle}>
				<fieldset class="fieldset p-4">
					<legend class="fieldset-legend">{level.label}</legend>
					<Svelecte
						bind:value={selected[level.key]}
						options={lists[level.key]}
						valueField={level.valueField}
						labelField={level.labelField}
						virtualList={level.virtualList}
						clearable
						placeholder="--Select a {level.label}--"
						onChange={() => resetBelow(i)}
					/>
					{#if truncated[level.key]}
					<span class="label text-warning">
						Showing first {lists[level.key].length} {level.plural} only
						{#if i > 0} - select a {LEVELS[i - 1].label} above to narrow this down.{:else} - server has more.{/if}
					</span>
					{/if}
				</fieldset>
			</section>
			{/each}

			<button class="btn btn-secondary" onclick={requestImages}>Request Images</button>

			{#if images.length}
			<table class="table">
				<thead>
					<tr>
						<th>Image Name</th>
						<th>File Name</th>
						<th>MIME Type</th>
						<th>Timestamp</th>
					</tr>
				</thead>
				<tbody>
					{#each images as image}
						<tr>
							<td>{image.imageName}</td>
							<td>{image.imageFileName}</td>
							<td><span class="badge badge-info badge-outline">{image.mimeType}</span></td>
							<td>{new Date(image.imageTimeStamp).toLocaleString()}</td>
						</tr>
					{/each}
				</tbody>
			</table>
			{/if}

		</fieldset>

		{/if}
	</Modal>
</fieldset>