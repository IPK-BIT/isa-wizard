// @ts-expect-error – @fslab/fsspreadsheet does not declare types
import { Xlsx } from '@fslab/fsspreadsheet';
import { ARC, JsonController } from '@nfdi4plants/arctrl';
import { downloadZip } from 'client-zip';
import { isEmptyOntologyAnnotation, isEmptyValue, withAssayFileNames } from './common';

export interface ArcFile {
	/** Path inside the ARC, e.g. `studies/<id>/isa.study.xlsx` */
	path: string;
	content: Uint8Array;
}

const ISA_DTO_TYPES: unknown[] = ['ISA_Investigation', 'ISA_Study', 'ISA_Assay'];

/** Converts ISA-JSON into the files of an ARC (ISA spreadsheets plus folder skeleton). */
export async function buildArcFiles(data: any): Promise<ArcFile[]> {
	const investigation = JsonController.Investigation.fromISAJsonString(
		JSON.stringify(sanitizeIsaJson(withAssayFileNames(data, (id) => `assays/${id}/isa.assay.xlsx`)))
	);
	const contracts = ARC.fromArcInvestigation(investigation).GetWriteContracts();

	const files: ArcFile[] = [];
	for (const contract of contracts) {
		if (contract.Operation !== 'CREATE') continue;
		if (ISA_DTO_TYPES.includes(contract.DTOType)) {
			files.push({ path: contract.Path, content: await Xlsx.toBytes(contract.DTO) });
		} else if (contract.DTOType === 'PlainText') {
			// `.gitkeep`s and READMEs that make up the ARC folder structure
			files.push({
				path: contract.Path,
				content: new TextEncoder().encode(typeof contract.DTO === 'string' ? contract.DTO : '')
			});
		} else {
			throw new Error(`Unsupported ARC write contract for ${contract.Path}: ${contract.DTOType}`);
		}
	}
	return files;
}

export function isIsaSpreadsheet(path: string): boolean {
	return /(^|\/)isa\.(investigation|study|assay)\.xlsx$/.test(path);
}

export async function convertIsaJsonToArc(data: any): Promise<Blob> {
	const files = await buildArcFiles(data);
	const lastModified = new Date();
	return downloadZip(files.map((f) => ({ name: f.path, lastModified, input: f.content }))).blob();
}

/** Placeholder process created by the wizard for previousProcess/nextProcess. */
function isEmptyProcess(value: unknown): boolean {
	if (value === null || typeof value !== 'object') return false;
	const p = value as Record<string, any>;
	return (
		isEmptyValue(p.name) &&
		isEmptyValue(p['@id']) &&
		!p.executesProtocol &&
		!p.inputs?.length &&
		!p.outputs?.length
	);
}

/**
 * The wizard fills optional ISA objects (units, technology types, ...) with
 * empty placeholders. ARCtrl treats these as real values and fails on them
 * (e.g. an ontology term value combined with an "empty" unit cannot be
 * represented as a table cell), so they are removed before the conversion.
 */
export function sanitizeIsaJson(data: unknown): unknown {
	if (Array.isArray(data)) return data.map(sanitizeIsaJson);
	if (data === null || typeof data !== 'object') return data;

	const result: Record<string, unknown> = {};
	for (const [key, value] of Object.entries(data as Record<string, unknown>)) {
		if (key === '@id' && isEmptyValue(value)) continue;
		if (isEmptyOntologyAnnotation(value) && key !== 'value') continue;
		if ((key === 'previousProcess' || key === 'nextProcess') && isEmptyProcess(value)) continue;
		if (value === null) continue;
		result[key] = sanitizeIsaJson(value);
	}
	return result;
}
