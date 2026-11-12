<script lang="ts">
	import { isaObj } from '$stores/isa';
	import { getAppstate } from '$lib/appstate.svelte';
	import type { DatahubConfig } from '$lib/types/Config';
	import type { GitlabNamespace, Visibility } from '$lib/datahub/api';
	import { datahubClient, datahubSession, signIn, signOut } from '$lib/datahub/session.svelte';
	import { arcTargetFor, exportArcToDatahub, type DatahubExportResult } from '$lib/datahub/export';

	let { config }: { config: DatahubConfig } = $props();

	const hubName = 'PLANTdataHUB';

	let namespaces = $state<GitlabNamespace[]>([]);
	let namespaceId = $state<number | null>(null);
	let visibility = $state<Visibility>('private');
	let loadingNamespaces = $state(false);
	let busy = $state(false);
	let result = $state<DatahubExportResult | null>(null);
	/** null: unknown/checking */
	let targetExists = $state<boolean | null>(null);

	const client = $derived(datahubSession.token ? datahubClient(config) : null);
	const target = $derived(arcTargetFor($isaObj));
	const namespace = $derived(namespaces.find((n) => n.id === namespaceId) ?? null);
	const targetPath = $derived(namespace && target ? `${namespace.full_path}/${target.path}` : null);

	$effect(() => {
		if (!client) return;
		loadingNamespaces = true;
		client
			.listNamespaces()
			.then((list) => {
				namespaces = list.sort((a, b) =>
					a.kind === b.kind ? a.full_path.localeCompare(b.full_path) : a.kind === 'user' ? -1 : 1
				);
				namespaceId ??= namespaces[0]?.id ?? null;
			})
			.catch((err) => (datahubSession.error = err.message))
			.finally(() => (loadingNamespaces = false));
	});

	// Whether the export creates a project or proposes a merge request
	$effect(() => {
		const path = targetPath;
		targetExists = null;
		if (!client || !path) return;
		let current = true;
		client
			.findProject(path)
			.then((project) => current && (targetExists = project !== null))
			.catch(() => current && (targetExists = null));
		return () => (current = false);
	});

	async function handleSignIn() {
		datahubSession.error = null;
		try {
			await signIn(config, { isa: $isaObj, appstate: { ...getAppstate() } });
		} catch (err) {
			datahubSession.error = err instanceof Error ? err.message : String(err);
		}
	}

	async function handleSignOut() {
		await signOut(config);
		namespaces = [];
		namespaceId = null;
		result = null;
	}

	async function handleExport() {
		if (!client || !namespace || busy) return;
		busy = true;
		result = null;
		datahubSession.error = null;
		try {
			result = await exportArcToDatahub(client, $isaObj, namespace, visibility);
			targetExists = true;
		} catch (err) {
			console.error('PLANTdataHUB export failed:', err);
			datahubSession.error = err instanceof Error ? err.message : String(err);
		} finally {
			busy = false;
		}
	}
</script>

<div class="flex flex-col gap-4 p-6">
	<div class="max-w-xl space-y-1">
		<div class="flex items-center gap-2">
			<h3 class="text-base font-medium text-base-content">ARC on {hubName}</h3>
			<span class="badge font-mono badge-sm text-[10px] badge-neutral">GIT</span>
		</div>
		<p class="text-sm leading-relaxed text-base-content/60">
			Create the ARC as a project on {hubName}. If it already exists, the changes are proposed as a
			merge request. Experimental
		</p>
	</div>

	{#if datahubSession.error}
		<div class="alert text-sm alert-error">{datahubSession.error}</div>
	{/if}

	{#if !client}
		<div>
			<button class="btn rounded-xl btn-md btn-primary" onclick={handleSignIn}>
				Sign in to {hubName}
			</button>
			<p class="mt-2 text-xs text-base-content/60">
				You will be redirected to {hubName} and back. Your current work is kept.
			</p>
		</div>
	{:else}
		<div class="flex items-center gap-2 text-sm">
			<span>Signed in as <strong>@{datahubSession.user?.username}</strong></span>
			<button class="btn btn-ghost btn-xs" onclick={handleSignOut}>Sign out</button>
		</div>

		<div class="grid gap-4 sm:grid-cols-2">
			<label class="form-control">
				<span class="label-text mb-1">Namespace</span>
				<select
					class="select-bordered select w-full select-sm"
					bind:value={namespaceId}
					disabled={loadingNamespaces || busy}
				>
					{#if loadingNamespaces}
						<option value={null}>Loading…</option>
					{/if}
					{#each namespaces as ns (ns.id)}
						<option value={ns.id}>{ns.full_path}{ns.kind === 'user' ? ' (personal)' : ''}</option>
					{/each}
				</select>
			</label>
			<label class="form-control">
				<span class="label-text mb-1">Visibility</span>
				<select
					class="select-bordered select w-full select-sm"
					bind:value={visibility}
					disabled={busy || targetExists === true}
				>
					<option value="private">Private</option>
					<option value="internal">Internal</option>
					<option value="public">Public</option>
				</select>
			</label>
		</div>

		{#if !target}
			<p class="text-sm text-warning">
				Give the investigation an identifier or a title to name the ARC.
			</p>
		{:else if targetPath}
			<p class="text-sm text-base-content/70">
				<strong>{target.name}</strong> → <code>{targetPath}</code><br />
				{#if targetExists === true}
					This project already exists. The ISA metadata will be pushed to a new branch and a merge
					request will be opened. Nothing is changed on the main branch until you merge it.
				{:else if targetExists === false}
					A new project will be created.
				{/if}
			</p>
		{/if}

		<div>
			<button
				class="btn gap-2 rounded-xl px-5 font-medium text-white btn-md btn-success"
				disabled={busy || !target || !namespace || targetExists === null}
				onclick={handleExport}
			>
				{#if busy}
					<span class="loading loading-xs loading-spinner"></span>
					Exporting...
				{:else if targetExists}
					Create merge request
				{:else}
					Create ARC
				{/if}
			</button>
		</div>

		{#if result}
			<div class="alert text-sm alert-success">
				{#if result.kind === 'created'}
					<span
						>ARC created: <a class="link" href={result.url} target="_blank" rel="noopener"
							>{result.url}</a
						></span
					>
				{:else}
					<span>
						Merge request opened:
						<a class="link" href={result.url} target="_blank" rel="noopener">{result.url}</a>
					</span>
				{/if}
			</div>
		{/if}
	{/if}
</div>
