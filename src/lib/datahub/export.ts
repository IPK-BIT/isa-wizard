import { buildArcFiles, isIsaSpreadsheet } from '$lib/export/arc';
import {
	toBase64,
	type CommitAction,
	type GitlabClient,
	type GitlabNamespace,
	type GitlabProject,
	type Visibility
} from './api';

export interface ArcTarget {
	/** Display name of the GitLab project (the investigation title) */
	name: string;
	/** URL path of the project inside the namespace (the slugified identifier) */
	path: string;
}

export type DatahubExportResult =
	{ kind: 'created'; url: string } | { kind: 'merge-request'; url: string; projectUrl: string };

/** GitLab project paths: letters, digits, `_`, `-`, `.`; no special character at start or end. */
export function toProjectPath(value: string): string {
	return value
		.normalize('NFKD')
		.replace(/[̀-ͯ]/g, '')
		.toLowerCase()
		.replace(/[^a-z0-9_.-]+/g, '-')
		.replace(/[-_.]{2,}/g, '-')
		.replace(/^[-_.]+|[-_.]+$/g, '')
		.replace(/\.(git|atom)$/, '');
}

/** Project name from the investigation title, path from its identifier (or the title). */
export function arcTargetFor(investigation: any): ArcTarget | null {
	const title = String(investigation?.title ?? '').trim();
	const identifier = String(investigation?.identifier ?? '').trim();
	const path = toProjectPath(identifier) || toProjectPath(title);
	if (!path) return null;
	return { name: title || identifier, path };
}

function branchName(): string {
	return `isa-wizard/export-${new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19)}`;
}

async function createArc(
	client: GitlabClient,
	investigation: any,
	target: ArcTarget,
	namespace: GitlabNamespace,
	visibility: Visibility
): Promise<DatahubExportResult> {
	const files = await buildArcFiles(investigation);
	const project = await client.createProject({
		name: target.name,
		path: target.path,
		namespace_id: namespace.id,
		visibility,
		description: String(investigation?.description ?? '').slice(0, 2000)
	});
	await pushToEmptyProject(client, project, files);
	return { kind: 'created', url: project.web_url };
}

async function pushToEmptyProject(
	client: GitlabClient,
	project: GitlabProject,
	files: Awaited<ReturnType<typeof buildArcFiles>>
): Promise<void> {
	await client.commit(project.id, {
		branch: project.default_branch || 'main',
		commit_message: 'Create ARC with ISA Wizard',
		actions: files.map((f) => ({
			action: 'create',
			file_path: f.path,
			content: toBase64(f.content),
			encoding: 'base64'
		}))
	});
}

/**
 * Proposes the export as a merge request on a new branch, so nothing on the default branch is
 * overwritten without review. ISA spreadsheets are replaced; other files of the ARC skeleton
 * (`.gitkeep`, READMEs) are only added when missing, everything else stays untouched.
 */
async function proposeUpdate(
	client: GitlabClient,
	investigation: any,
	project: GitlabProject
): Promise<DatahubExportResult> {
	const files = await buildArcFiles(investigation);
	if (project.empty_repo || !project.default_branch) {
		await pushToEmptyProject(client, project, files);
		return { kind: 'created', url: project.web_url };
	}

	const target = project.default_branch;
	const actions: CommitAction[] = [];
	for (const file of files) {
		const exists = await client.fileExists(project.id, file.path, target);
		if (exists && !isIsaSpreadsheet(file.path)) continue;
		actions.push({
			action: exists ? 'update' : 'create',
			file_path: file.path,
			content: toBase64(file.content),
			encoding: 'base64'
		});
	}

	const branch = branchName();
	await client.commit(project.id, {
		branch,
		start_branch: target,
		commit_message: 'Update ISA metadata with ISA Wizard',
		actions
	});
	const mergeRequest = await client.createMergeRequest(project.id, {
		source_branch: branch,
		target_branch: target,
		title: 'Update ISA metadata from ISA Wizard',
		description:
			'This merge request was created by the ISA Wizard export. It replaces the ISA metadata ' +
			'files (`isa.*.xlsx`) and adds missing ARC folders. Please review the changes before merging.',
		remove_source_branch: true
	});
	return { kind: 'merge-request', url: mergeRequest.web_url, projectUrl: project.web_url };
}

/**
 * Exports the investigation as an ARC into `namespace`. Creates a new project, or, if a project
 * with the target path already exists, opens a merge request against it.
 */
export async function exportArcToDatahub(
	client: GitlabClient,
	investigation: any,
	namespace: GitlabNamespace,
	visibility: Visibility
): Promise<DatahubExportResult> {
	const target = arcTargetFor(investigation);
	if (!target) {
		throw new Error('The investigation needs an identifier or a title to name the ARC.');
	}
	const existing = await client.findProject(`${namespace.full_path}/${target.path}`);
	return existing
		? proposeUpdate(client, investigation, existing)
		: createArc(client, investigation, target, namespace, visibility);
}
