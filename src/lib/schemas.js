import Ajv from 'ajv';

import { miappeInvestigationHandler, miappeStudyHandler } from './miappeMappers';


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


const ajv = new Ajv({ allErrors: true });

const mapping = {
    assay: assay_schema,
    comment: comment_schema,
    data: data_schema,
    factor: factor_schema,
    factor_value: factor_value_schema,
    investigation: investigation_schema,
    material_attribute: material_attribute_schema,
    material_attribute_value: material_attribute_value_schema,
    material: material_schema,
    ontology_annotation: ontology_annotation_schema,
    ontology_source_reference: ontology_source_reference_schema,
    person: person_schema,
    process: process_schema,
    process_parameter_value: process_parameter_value_schema,
    protocol_component: protocol_component_schema,
    protocol_parameter: protocol_parameter_schema,
    protocol: protocol_schema,
    publication: publication_schema,
    sample: sample_schema,
    source: source_schema,
    study: study_schema
}


//const mainSchema = JSON.parse(investigation_schema);
//console.log(investigation_schema);


for (let [schemaId, schema] of Object.entries(mapping)) {
    //console.log(schemaId);
    //console.log(schema);
    //ajv.addSchema(schema, schemaId + '_schema.json');
    //break;
}


export default class Schemas {

    static pathSchemaFiles = 'data/vendor/isa_json_schemas/';
    static cache = {};
    
    /*static async getSchema(identifier) {
        if (this.cache[identifier] === undefined) {
            let path = this.pathSchemaFiles+identifier+'_schema.json';
            const response = await fetch(path);
            const json = await response.json();
            this.cache[identifier] = json;
        }
        return this.cache[identifier];
    }*/

    static getSchema(identifier) {
        return mapping[identifier];
    }

    static getObjectFromSchema(identifier) {
        //let schema = await Schemas.getSchema(identifier);
        let schema = mapping[identifier];

        const getDatatypeByJsonType = (type) => {
            let types = {
                'string': '',
                'array': [],
                'object': {}
            }
            return types[type];
        }

        let obj = {};
        let keys = [];
        for (const [k, v] of Object.entries(schema.properties)) {
            keys.push(k);

            if (v['type'] === 'string') {
                obj[k] = '';
            } else if (v['type'] === 'array') {
                obj[k] = [];
            } else if (v['type'] === 'object') {
                let entries = Object.entries(v['properties']);
                obj[k] = Object.fromEntries( entries.map(x => [x[0], getDatatypeByJsonType(x[1]['type']) ]) );
            }  else if (v['anyOf'] !== undefined) {
                if (v['anyOf'][0]['type'] === 'string') {
                    obj[k] = '';
                }
            } else {
                obj[k] = {};
            }

            // anyOf
        }

        return obj;
    }

    static getMiappeInvestigation(prefill) {
        let emptyInvestigation = Schemas.getObjectFromSchema("investigation");
        let investigationWithPrefill = Schemas.addPrefill(emptyInvestigation, prefill);

        //return new Proxy(investigationWithPrefill, miappeInvestigationHandler);
        return investigationWithPrefill;
    }


    static addPrefill(investigation, prefill) {
        if (prefill) {
            for (let item of prefill) {
                if (item.type === 'person' && item.isaMapping.entity === 'investigation') {
                    let person = Schemas.getPerson(item.values);
                    investigation.people = [...investigation.people, person];
                }

                if (item.type === 'comment') {
                    let comment = Schemas.getComment(item.values.name, item.values.value);
                    if (item.isaMapping.entity === 'investigation') {
                        investigation.comments = [...investigation.comments, comment];
                    } else if (item.isaMapping.entity === 'study') {
                        if (investigation.studies.length == 0) {
                            let study = Schemas.getMiappeStudy();
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
                            let study = Schemas.getMiappeStudy();
                            investigation.studies = [study];
                        }
                        investigation.studies[item.isaMapping.studyIndex][item.isaMapping.attribute] = item.value;
                    }
                }
            }
        }
        return investigation;
    }

    static getMiappeStudy() {
        //return new Proxy(Schemas.getObjectFromSchema("study"), miappeStudyHandler);
        return Schemas.getObjectFromSchema("study");
    }

    static createCharacteristicObject(key, value) {
        let emptyCharacteristic = Schemas.getObjectFromSchema('material_attribute_value');
        emptyCharacteristic.value = value;

        let emptyOntologyAnnotation = Schemas.getObjectFromSchema('ontology_annotation');
        emptyOntologyAnnotation.annotationValue = key;
        let emptyCategory = Schemas.getObjectFromSchema('material_attribute');
        emptyCategory.characteristicType = emptyOntologyAnnotation;
        emptyCharacteristic.category = emptyCategory;

        emptyOntologyAnnotation = Schemas.getObjectFromSchema('ontology_annotation');
        emptyCharacteristic.unit = null;

        return emptyCharacteristic;
    }

    static getSource(name, characteristics) {
        let source = Schemas.getObjectFromSchema('source');
        source.name = name;

        let _characteristics = [];
        for (let [key, value] of Object.entries(characteristics)) {
            let material_attribute_value = Schemas.getObjectFromSchema('material_attribute_value');
            material_attribute_value.category = Schemas.getObjectFromSchema('material_attribute');
            material_attribute_value.unit = Schemas.getObjectFromSchema('ontology_annotation');
            material_attribute_value.category.characteristicType = Schemas.getObjectFromSchema('ontology_annotation');
            material_attribute_value.category.characteristicType.annotationValue = key;
            material_attribute_value.value = value;
    
            _characteristics.push(material_attribute_value);
        }

        source.characteristics = _characteristics;
        return source;
    }

    static getPerson(attrs) {
        let person = Schemas.getObjectFromSchema('person');
        return Object.assign(person, attrs);
    }

    static getComment(name, value) {
        let comment = Schemas.getObjectFromSchema('comment');
        return Object.assign(comment, {name, value});
    }

    static validateIsaJson(dataToValidate) {
        const validate = ajv.compile(investigation_schema);
        const isValid = validate(dataToValidate);
        if (isValid) {
            console.log('Validation passed');
        } else {
            console.log('Validation failed');
            console.log(validate.errors);
        }
    }
}