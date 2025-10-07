import assay_schema from '@/lib/schemas/assay_schema.json';
import comment_schema from '@/lib/schemas/comment_schema.json';
import data_schema from '@/lib/schemas/data_schema.json';
import factor_schema from '@/lib/schemas/factor_schema.json';
import factor_value_schema from '@/lib/schemas/factor_value_schema.json';
import investigation_schema from '@/lib/schemas/investigation_schema.json';
import material_attribute_schema from '@/lib/schemas/material_attribute_schema.json';
import material_attribute_value_schema from '@/lib/schemas/material_attribute_value_schema.json';
import material_schema from '@/lib/schemas/material_schema.json';
import ontology_annotation_schema from '@/lib/schemas/ontology_annotation_schema.json';
import ontology_source_reference_schema from '@/lib/schemas/ontology_source_reference_schema.json';
import person_schema from '@/lib/schemas/person_schema.json';
import process_schema from '@/lib/schemas/process_schema.json';
import process_parameter_value_schema from '@/lib/schemas/process_parameter_value_schema.json';
import protocol_component_schema from '@/lib/schemas/protocol_component_schema.json';
import protocol_parameter_schema from '@/lib/schemas/protocol_parameter_schema.json';
import protocol_schema from '@/lib/schemas/protocol_schema.json';
import publication_schema from '@/lib/schemas/publication_schema.json';
import sample_schema from '@/lib/schemas/sample_schema.json';
import source_schema from '@/lib/schemas/source_schema.json';
import study_schema from '@/lib/schemas/study_schema.json';

const mapping = {
    'assay': assay_schema,
    'comment': comment_schema,
    'data': data_schema,
    'factor': factor_schema,
    'factor_value': factor_value_schema,
    'investigation': investigation_schema,
    'material_attribute': material_attribute_schema,
    'material_attribute_value': material_attribute_value_schema,
    'material': material_schema,
    'ontology_annotation': ontology_annotation_schema,
    'ontology_source_reference': ontology_source_reference_schema,
    'person': person_schema,
    'process': process_schema,
    'process_parameter_value': process_parameter_value_schema,
    'protocol_component': protocol_component_schema,
    'protocol_parameter': protocol_parameter_schema,
    'protocol': protocol_schema,
    'publication': publication_schema,
    'sample': sample_schema,
    'source': source_schema,
    'study': study_schema
}

export default class Schema {
    static getObjectFromSchema(identifier: string) {
        let schema = mapping[identifier as keyof typeof mapping];
        if (!schema) {
            throw new Error(`No schema found for identifier: ${identifier}`);
        }

        const getDataTypeByJsonType = (type: string) => {
            let types = {
                'string': '',
                'array': [],
                'object': {},
            }
            return types[type as keyof typeof types];
        }

        let obj: { [key: string]: any } = {};
        let keys = [];

        for (const [k,v] of Object.entries(schema.properties)) {
            keys.push(k);

            if (v['type'] === 'string') {
                obj[k] = '';
            } else if (v['type'] === 'array') {
                obj[k] = [];
            } else if (v['type'] === 'object') {
                let entries = Object.entries(v['properties'] || {});
                if (entries.length === 0) {
                    obj[k] = {};
                } else {
                    obj[k] = Object.fromEntries(entries.map( (x) => [x[0], getDataTypeByJsonType((x[1] as { type: string })['type'])] ));
                }
            } else if (v['anyOf'] !== undefined) {
                if (v['anyOf'][0]['type'] !== undefined) {
                    obj[k] = '';
                }
            } else {
                obj[k] = {};
            }
        }
        return obj;
    }

    static getComment(name: string, value: any) {
        let comment = this.getObjectFromSchema('comment');
        comment.name = name;
        comment.value = value;
        return comment;
    }

    static getPrefilledInvestigation(prefill: any[]) {
        let emptyInvestigation = Schema.getObjectFromSchema("investigation");
        let investigationWithPrefill = Schema.addPrefill(emptyInvestigation, prefill);

        //return new Proxy(investigationWithPrefill, miappeInvestigationHandler);
        return investigationWithPrefill;
    }

    static addPrefill(investigation: any, prefill: any[]) {
        if (prefill) {
            for (let item of prefill) {
                if (item.type === 'person' && item.isaMapping.entity === 'investigation') {
                    let person = Schema.getPerson(item.values);
                    investigation.people = [...investigation.people, person];
                }

                if (item.type === 'comment') {
                    let comment = Schema.getComment(item.values.name, item.values.value);
                    if (item.isaMapping.entity === 'investigation') {
                        investigation.comments = [...investigation.comments, comment];
                    } else if (item.isaMapping.entity === 'study') {
                        if (investigation.studies.length == 0) {
                            let study = Schema.getObjectFromSchema('study');
                            investigation.studies = [study];
                        }
                        investigation.studies[item.isaMapping.studyIndex].comments = [...investigation.studies[item.isaMapping.studyIndex].comments, comment];
                    }
                }

                if (item.type === 'value') {
                    if (item.isaMapping.entity === 'investigation') {
                        investigation[item.isaMapping.attribute] = item.value;
                    } else if (item.isaMapping.entity === 'study') {
                        if (investigation.studies.length == 0) {
                            let study = Schema.getObjectFromSchema('study');
                            investigation.studies = [study];
                        }
                        investigation.studies[item.isaMapping.studyIndex][item.isaMapping.attribute] = item.value;
                    }
                }
            }
        }
        return investigation;
    }

    static getPerson(values: any[]) {
        let person = Schema.getObjectFromSchema('person');
        return Object.assign(person, values);
    }

     static createCharacteristicObject(key, value) {
        let emptyCharacteristic = Schema.getObjectFromSchema('material_attribute_value');
        emptyCharacteristic.value = value;

        let emptyOntologyAnnotation = Schema.getObjectFromSchema('ontology_annotation');
        emptyOntologyAnnotation.annotationValue = key;
        let emptyCategory = Schema.getObjectFromSchema('material_attribute');
        emptyCategory.characteristicType = emptyOntologyAnnotation;
        emptyCharacteristic.category = emptyCategory;

        emptyOntologyAnnotation = Schema.getObjectFromSchema('ontology_annotation');
        emptyCharacteristic.unit = null;

        return emptyCharacteristic;
    }
}