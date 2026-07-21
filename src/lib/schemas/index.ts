import investigation from './investigation_schema.json';
import study from './study_schema.json';
import assay from './assay_schema.json';
import comment from './comment_schema.json';
import publication from './publication_schema.json';
import ontology_annotation from './ontology_annotation_schema.json';
import person from './person_schema.json';
import protocol from './protocol_schema.json';
import protocol_parameter from './protocol_parameter_schema.json';
import protocol_component from './protocol_component_schema.json';
import material from './material_schema.json';
import source from './source_schema.json';
import sample from './sample_schema.json';
import material_attribute from './material_attribute_schema.json';
import material_attribute_value from './material_attribute_value_schema.json';
import factor from './factor_schema.json';
import factor_value from './factor_value_schema.json';
import process from './process_schema.json';
import process_parameter_value from './process_parameter_value_schema.json';
import data from './data_schema.json';

const mapping = {
	investigation: investigation,
	study: study,
	assay: assay,
	comment: comment,
	publication: publication,
	ontology_annotation: ontology_annotation,
	person: person,
	protocol: protocol,
	protocol_parameter: protocol_parameter,
	protocol_component: protocol_component,
	material: material,
	source: source,
	sample: sample,
	material_attribute: material_attribute,
	material_attribute_value: material_attribute_value,
	factor: factor,
	factor_value: factor_value,
	process: process,
	process_parameter_value: process_parameter_value,
	data: data
};

export default class Schema {
	static getObjectFromSchema(identifier: string, maxDepth = 2, currentDepth = 0) {
		if (currentDepth >= maxDepth) {
			return null;
		}

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
			} else if ('$ref' in value) {
				obj[key] = this.getObjectFromSchema(
					value.$ref.split('_').slice(0, -1).join('_'),
					maxDepth,
					currentDepth + 1
				);
			} else if ('anyOf' in value) {
				obj[key] = getDataByJsonType(value.anyOf[0].type);
				if (obj[key] === null) {
					obj[key] = this.getObjectFromSchema(
						value.anyOf[0].$ref.split('_').slice(0, -1).join('_'),
						maxDepth,
						currentDepth + 1
					);
				}
			} else {
				obj[key] = undefined;
			}
		}

		return obj;
	}
}
