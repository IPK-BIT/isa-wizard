import { convertIsaJsonToZip } from 'isa4js';
import { isEmptyOntologyAnnotation, withAssayFileNames } from './common';

/** Replaces values isa4js would print as "[object Object]" (empty ontology terms) with "". */
function blankEmptyTermValues(entries: any[] | undefined): any[] | undefined {
	return entries?.map((entry) =>
		isEmptyOntologyAnnotation(entry?.value) ? { ...entry, value: '' } : entry
	);
}

function prepareNode(node: any): any {
	if (!node || typeof node !== 'object') return node;
	return node.characteristics
		? { ...node, characteristics: blankEmptyTermValues(node.characteristics) }
		: node;
}

/**
 * isa4js only recognises data files whose type contains "data file" and
 * labels everything else (e.g. "Image File") as "Material". It does, however,
 * take the column header for entries in `materials.otherMaterials` from their
 * `type`, so data files are registered there for the export.
 */
function prepareTable(table: any): any {
	if (!table) return table;
	const dataFiles: any[] = table.dataFiles ?? [];
	const fileNames = new Set(dataFiles.map((f) => f?.name));
	const otherMaterials = (table.materials?.otherMaterials ?? []).filter(
		(m: any) => !fileNames.has(m?.name)
	);
	return {
		...table,
		materials: {
			...table.materials,
			otherMaterials: [
				...otherMaterials,
				...dataFiles.filter((f) => f?.name && f?.type).map((f) => ({ name: f.name, type: f.type }))
			]
		},
		processSequence: (table.processSequence ?? []).map((process: any) => ({
			...process,
			parameterValues: blankEmptyTermValues(process.parameterValues),
			inputs: process.inputs?.map(prepareNode),
			outputs: process.outputs?.map(prepareNode)
		}))
	};
}

export function prepareIsaJsonForIsaTab(data: any): any {
	const named = withAssayFileNames(data, (id) => `a_${id}.txt`);
	return {
		...named,
		studies: (named.studies ?? []).map((study: any) => ({
			...prepareTable(study),
			assays: (study.assays ?? []).map(prepareTable)
		}))
	};
}

export async function convertIsaJsonToIsaTab(data: any): Promise<Blob> {
	return (await convertIsaJsonToZip(prepareIsaJsonForIsaTab(data), 'blob')) as Blob;
}
