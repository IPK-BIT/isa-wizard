import investigation from './investigation.json';
import study from './study.json';
import assay from './assay.json';
import comment from './comment.json';
import publication from './publication.json';
import ontology_annotation from './ontology_annotation.json';
import person from './person.json';

const mapping = {
	investigation: investigation,
	study: study,
	assay: assay,
	comment: comment,
	publication: publication,
	ontology_annotation: ontology_annotation,
	person: person
};

export default class Schema {
	static getObjectFromSchema(identifier: string) {
		let schema = mapping[identifier as keyof typeof mapping];
		if (!schema) {
			throw new Error(`Schema with identifier ${identifier} not found.`);
		}

		const getDataByJsonType = (type: string) => {
			switch (type) {
				case 'string':
					return '';
				case 'array':
					return [];
				case 'object':
					return {};
				default:
					return null;
			}
		};

		let obj: { [key: string]: any } = {};
		let keys = [];

		for (const [key, value] of Object.entries(schema.properties)) {
			keys.push(key);

			if ('type' in value && (value.type === 'string' || value.type === 'array')) {
				obj[key] = getDataByJsonType(value.type);
			} else if ('type' in value && value.type === 'object') {
				let entries: [string, any][] = [];
				if ('properties' in value) {
					entries = Object.entries(value.properties as Record<string, any>);
				}

				if (entries.length === 0) {
					obj[key] = {};
				} else {
					obj[key] = Object.fromEntries(
						entries.map(([k, v]) => [k, getDataByJsonType((v as { type: string }).type)])
					);
				}
			} else {
				obj[key] = {};
			}
		}

		return obj;
	}
}
