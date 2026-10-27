<script lang="ts">
	import { get } from 'svelte/store';
	import { getAppstate, updateAppstate } from '$lib/appstate.svelte';
	import { isaObj } from '$stores/isa';
	import { validate, MetabuddyError } from '$lib/metabuddy/client';
	import { buildScope } from '$lib/metabuddy/scope';
	import type { ValidateResponse, ValidationIssue } from '$lib/metabuddy/types';
	import { constructAssayPath, constructStudyPath, parseIsaLvl } from '$lib/util/breadcrumbUtils';
	import ErrorState from './ErrorState.svelte';

	const severities = [
		{ key: 'error', label: 'Errors', badge: 'badge-error' },
		{ key: 'warning', label: 'Warnings', badge: 'badge-warning' },
		{ key: 'suggestion', label: 'Suggestions', badge: 'badge-info' }
	] as const;

	let loading = $state(false);
	let result: ValidateResponse | null = $state(null);
	let error: MetabuddyError | null = $state(null);

	async function run() {
		loading = true;
		error = null;
		try {
			result = await validate({ scope: buildScope(), isaJson: get(isaObj) }, 'validate');
		} catch (err) {
			if (err instanceof MetabuddyError && err.superseded) return;
			result = null;
			error =
				err instanceof MetabuddyError ? err : new MetabuddyError('network', 'Validation failed.');
		} finally {
			loading = false;
		}
	}

	function issuesOf(severity: string) {
		return (result?.issues ?? []).filter((i) => i.severity === severity);
	}

	// Best effort: jump to the study/assay that contains the field. Only in GUI mode, so a
	// running wizard is not pulled away.
	function target(issue: ValidationIssue) {
		if (getAppstate().mode !== 'gui' || !issue.field) return undefined;
		const { studyIndex, assayIndex } = parseIsaLvl(issue.field);
		if (studyIndex === undefined) return undefined;
		return assayIndex === undefined
			? { isaLvl: constructStudyPath(studyIndex), guiType: 'study' }
			: { isaLvl: constructAssayPath(studyIndex, assayIndex), guiType: 'assay' };
	}

	function open(issue: ValidationIssue) {
		const t = target(issue);
		if (t) updateAppstate({ ...t, mode: 'gui' });
	}
</script>

<div class="card bg-base-100 p-4 shadow-md">
	<h3 class="mb-2 text-sm font-semibold">Validation</h3>
	<button class="btn btn-primary btn-sm" onclick={run} disabled={loading}>
		{#if loading}
			<span class="loading loading-sm loading-spinner"></span>
			Checking...
		{:else}
			Run check
		{/if}
	</button>

	{#if error}
		<div class="mt-3">
			<ErrorState {error} onretry={run} />
		</div>
	{:else if result}
		<div class="mt-3 flex flex-col gap-3">
			<div class="badge {result.valid ? 'badge-success' : 'badge-error'}">
				{result.valid ? 'Valid' : 'Not valid'}
			</div>
			{#each severities as { key, label, badge }}
				{@const issues = issuesOf(key)}
				{#if issues.length}
					<div>
						<div class="mb-1 flex items-center gap-2 text-xs font-semibold">
							{label}
							<span class="badge badge-sm {badge}">{issues.length}</span>
						</div>
						<ul class="flex flex-col gap-2">
							{#each issues as issue}
								<li class="rounded-md border border-base-300 p-2 text-sm">
									{#if target(issue)}
										<button class="link text-left link-hover" onclick={() => open(issue)}>
											{issue.message}
										</button>
									{:else}
										<span>{issue.message}</span>
									{/if}
									{#if issue.field}
										<div class="font-mono text-xs opacity-60">{issue.field}</div>
									{/if}
									{#if issue.suggestion}
										<div class="mt-1 text-xs opacity-80">{issue.suggestion}</div>
									{/if}
								</li>
							{/each}
						</ul>
					</div>
				{/if}
			{/each}
			{#if !result.issues?.length}
				<p class="text-sm opacity-70">No issues found.</p>
			{/if}
		</div>
	{/if}
</div>
