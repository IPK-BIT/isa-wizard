const ONTOLOGY_FIELDS = ['annotationValue', 'termSource', 'termAccession'];

export function isEmptyValue(value: unknown): boolean {
	return value === undefined || value === null || value === '';
}

/** An ontology annotation (or `{}`) without any term information. */
export function isEmptyOntologyAnnotation(value: unknown): boolean {
	if (value === null || typeof value !== 'object' || Array.isArray(value)) return false;
	const obj = value as Record<string, unknown>;
	const keys = Object.keys(obj).filter((k) => k !== '@id' && k !== 'comments');
	if (!keys.every((k) => ONTOLOGY_FIELDS.includes(k))) return false;
	return (
		keys.every((k) => isEmptyValue(obj[k])) &&
		(!Array.isArray(obj.comments) || obj.comments.length === 0)
	);
}

function toIdentifier(value: unknown): string {
	return typeof value === 'string' ? value.trim().replace(/[^a-zA-Z0-9_\- ]+/g, '_') : '';
}

/** Extracts the identifier from an ISA-Tab (`a_<id>.txt`) or ARC (`assays/<id>/isa.assay.xlsx`) filename. */
function identifierFromFileName(fileName: unknown): string {
	if (typeof fileName !== 'string') return '';
	const name = fileName
		.trim()
		.replace(/^assays[\\/]/, '')
		.replace(/[\\/]isa\.assay\.xlsx$/, '')
		.replace(/^a_/, '')
		.replace(/\.txt$/, '');
	return toIdentifier(name);
}

/**
 * Assays created in the wizard have no `filename`/identifier. Exporters derive
 * the assay's file or folder name from it, so a readable one is assigned here:
 * the assay's `title` comment, else its measurement type, else `assay_<n>`.
 * An existing filename is reused as identifier. Returns a copy; the input is not mutated.
 */
export function withAssayFileNames(data: any, toFileName: (identifier: string) => string): any {
	if (!Array.isArray(data?.studies)) return data;
	const used = new Set<string>();
	let counter = 0;
	return {
		...data,
		studies: data.studies.map((study: any) => {
			if (!Array.isArray(study?.assays)) return study;
			return {
				...study,
				assays: study.assays.map((assay: any) => {
					counter++;
					const title = assay?.comments?.find((c: any) => c?.name === 'title')?.value;
					const base =
						identifierFromFileName(assay?.filename) ||
						toIdentifier(title) ||
						toIdentifier(assay?.measurementType?.annotationValue) ||
						`assay_${counter}`;
					let identifier = base;
					for (let i = 2; used.has(identifier); i++) identifier = `${base}_${i}`;
					used.add(identifier);
					return { ...assay, filename: toFileName(identifier) };
				})
			};
		})
	};
}
