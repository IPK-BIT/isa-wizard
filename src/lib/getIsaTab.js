// @ts-nocheck
import { downloadZip } from "client-zip";

// Uses the small backend at https://github.com/IPK-BIT/isa-json2tab 
export function getIsaTab(isa_json) {
    let serviceUrl = 'https://webapps.ipk-gatersleben.de/isa-json2tab/json2tab';

    return fetch(serviceUrl, {
        method: 'POST',
        cache: 'no-cache',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(isa_json)
    })
        .then((result) => result.blob())
        .then((blob) => {
            if (blob != null) {
                let url = window.URL.createObjectURL(blob);
                let a = document.createElement('a');
                a.href = url;
                a.download = "isa-tab.zip";
                document.body.appendChild(a);
                a.click();
                a.remove();
            }
        });
}

export async function toIsaTab(isa_json) {
    const filesInZip = [];

    let i_content = writeInvestigation(isa_json);
    filesInZip.push({
        name: isa_json.filename || 'i_' + isa_json.title.replaceAll(' ', '-').toLowerCase() + '.txt',
        lastModified: new Date(),
        input: i_content.join('\n')
    });
    isa_json.studies.forEach((study) => {
        let s_content = writeStudyFile(study);
        filesInZip.push({
            name: study.filename || 's_' + study.title.replaceAll(' ', '-').toLowerCase() + '.txt',
            lastModified: new Date(),
            input: s_content.join('\n')
        });
        study.assays.forEach((assay) => {
            let a_content = writeAssayFile(assay);
            let name = assay.comments.find((c) => c.name === 'Title')?.value ?? "undefined.txt";
            filesInZip.push({
                name: assay.filename || 'a_' + name.replaceAll(' ', '-').toLowerCase() + '.txt',
                lastModified: new Date(),
                input: a_content.join('\n')
            });
        })
    });

    const blob = await downloadZip(filesInZip).blob();
    const link = document.createElement("a")
    link.href = URL.createObjectURL(blob)
    link.download = "isa-tab.zip"
    link.click()
    link.remove()
}

function writeInvestigation(isa_json) {
    const investigation_content = [];
    // TODO: Allow comments on more places

    // Write ONTOLOGY SOURCE REFERENCES
    investigation_content.push('ONTOLOGY SOURCE REFERENCE');
    let tmp = [['Term Source Name'], ['Term Source File'], ['Term Source Version'], ['Term Source Description']];
    isa_json.ontologySourceReferences.forEach((ontology) => {
        tmp[0] = tmp[0].concat('\t' + ontology.name);
        tmp[1] = tmp[1].concat('\t' + ontology.file);
        tmp[2] = tmp[2].concat('\t' + ontology.version);
        tmp[3] = tmp[3].concat('\t' + ontology.description);
    });
    tmp.forEach((line) => {
        investigation_content.push(line.join(''));
    });
    tmp = [];
    // Write INVESTIGATION
    investigation_content.push('INVESTIGATION');
    investigation_content.push('Investigation Identifier\t' + isa_json.identifier);
    investigation_content.push('Investigation Title\t' + isa_json.title);
    investigation_content.push('Investigation Description\t' + isa_json.description);
    investigation_content.push('Investigation Submission Date\t' + isa_json.submissionDate);
    investigation_content.push('Investigation Public Release Date\t' + isa_json.publicReleaseDate);
    isa_json.comments.forEach((comment) => {
        investigation_content.push(`Comment[${comment.name}]\t` + comment.value);
    });
    //WRITE INVESTIGATION PUBLICATIONS
    investigation_content.push('INVESTIGATION PUBLICATIONS');
    tmp = [['Investigation PubMed ID\t'], ['Investigation Publication DOI'], ['Investigation Publication Author List'], ['Investigation Publication Title'], ['Investigation Publication Status'], ['Investigation Publication Status Term Accession Number'], ['Investigation Publication Status Term Source REF']];
    isa_json.publications.forEach((publication) => {
        tmp[0] = tmp[0].concat('\t' + publication.pubMedID);
        tmp[1] = tmp[1].concat('\t' + publication.doi);
        tmp[2] = tmp[2].concat('\t' + publication.authorList);
        tmp[3] = tmp[3].concat('\t' + publication.title);
        tmp[4] = tmp[4].concat('\t' + publication.status.annotationValue);
        tmp[5] = tmp[5].concat('\t' + publication.status.termAccession);
        tmp[6] = tmp[6].concat('\t' + publication.status.termSource);
    });
    tmp.forEach((line) => {
        investigation_content.push(line.join(''));
    });
    tmp = [];
    // Write INVESTIGATION CONTACTS
    investigation_content.push('INVESTIGATION CONTACTS');
    tmp = [['Investigation Person First Name'], ['Investigation Person Last Name'], ['Investigation Person Mid Initials'], ['Investigation Person Email'], ['Investigation Person Phone'], ['Investigation Person Fax'], ['Investigation Person Address'], ['Investigation Person Affiliation'], ['Investigation Person Roles'], ['Investigation Person Roles Term Accession Number'], ['Investigation Person Roles Term Source REF']];
    isa_json.people.forEach((person) => {
        tmp[0] = tmp[0].concat('\t' + person.firstName);
        tmp[1] = tmp[1].concat('\t' + person.lastName);
        tmp[2] = tmp[2].concat('\t' + person.midInitials);
        tmp[3] = tmp[3].concat('\t' + person.email);
        tmp[4] = tmp[4].concat('\t' + person.phone);
        tmp[5] = tmp[5].concat('\t' + person.fax);
        tmp[6] = tmp[6].concat('\t' + person.address);
        tmp[7] = tmp[7].concat('\t' + person.affiliation);

        let annotationValues = [];
        let termAccessions = [];
        let termSources = [];
        person.roles.forEach((role) => {
            annotationValues.push(role.annotationValue);
            termAccessions.push(role.termAccession);
            termSources.push(role.termSource);
        });
        tmp[8] = tmp[8].concat('\t' + annotationValues.join(';'));
        tmp[9] = tmp[9].concat('\t' + termAccessions.join(';'));
        tmp[10] = tmp[10].concat('\t' + termSources.join(';'));
    });
    tmp.forEach((line) => {
        investigation_content.push(line.join(''));
    });
    tmp = [];
    isa_json.studies.forEach((study) => {
        // Write STUDY
        investigation_content.push('STUDY');
        investigation_content.push('Study Identifier\t' + study.identifier);
        investigation_content.push('Study Title\t' + study.title);
        investigation_content.push('Study Description\t' + study.description);
        investigation_content.push('Study Submission Date\t' + study.submissionDate);
        investigation_content.push('Study Public Release Date\t' + study.publicReleaseDate);
        investigation_content.push('Study File Name\t' + (study.filename ? study.filename : `s_${study.title.replaceAll(' ', '-').toLowerCase()}.txt`));
        // Write STUDY DESIGN DESCRIPTORS
        investigation_content.push('STUDY DESIGN DESCRIPTORS');
        tmp = [['Study Design Descriptor Type'], ['Study Design Descriptor Type Term Accession Number'], ['Study Design Descriptor Type Term Source REF']];
        study.studyDesignDescriptors.forEach((descriptor) => {
            tmp[2] = tmp[2].concat('\t' + descriptor.annotationValue);
            tmp[0] = tmp[0].concat('\t' + descriptor.termAccession);
            tmp[1] = tmp[1].concat('\t' + descriptor.termSource);
        });
        tmp.forEach((line) => {
            investigation_content.push(line.join(''));
        });
        tmp = [];
        // Write STUDY PUBLICATIONS
        investigation_content.push('STUDY PUBLICATIONS');
        tmp = [['Study PubMed ID'], ['Study Publication DOI'], ['Study Publication Author List'], ['Study Publication Title'], ['Study Publication Status'], ['Study Publication Status Term Accession Number'], ['Study Publication Status Term Source REF']];
        study.publications.forEach((publication) => {
            tmp[0] = tmp[0].concat('\t' + publication.pubMedID);
            tmp[1] = tmp[1].concat('\t' + publication.doi);
            tmp[2] = tmp[2].concat('\t' + publication.authorList);
            tmp[3] = tmp[3].concat('\t' + publication.title);
            tmp[4] = tmp[4].concat('\t' + publication.status.annotationValue);
            tmp[5] = tmp[5].concat('\t' + publication.status.termAccession);
            tmp[6] = tmp[6].concat('\t' + publication.status.termSource);
        });
        tmp.forEach((line) => {
            investigation_content.push(line.join(''));
        });
        tmp = [];
        // Write STUDY FACTORS
        investigation_content.push('STUDY FACTORS');
        tmp = [['Study Factor Name'], ['Study Factor Type'], ['Study Factor Type Term Accession Number'], ['Study Factor Type Term Source REF']];
        let factors = [];
        study.materials.samples.forEach((sample) => {
            sample.factorValues.forEach((factor) => {
                if (!factors.find((f) => f.factorName === factor.factorName)) {
                    factors.push(factor);
                }
            });
        });
        factors.forEach((factor) => {
            tmp[0] = tmp[0].concat('\t' + factor.category.factorName);
            tmp[1] = tmp[1].concat('\t' + factor.category.factorType.annotationValue);
            tmp[2] = tmp[2].concat('\t' + factor.category.factorType.termAccession);
            tmp[3] = tmp[3].concat('\t' + factor.category.factorType.termSource);
        });
        tmp.forEach((line) => {
            investigation_content.push(line.join(''));
        });
        tmp = [];
        // Write STUDY ASSAYS
        investigation_content.push('STUDY ASSAYS');
        tmp = [
            ['Study Assay Measurement Type'],
            ['Study Assay Measurement Type Term Accession Number'],
            ['Study Assay Measurement Type Term Source REF'],
            ['Study Assay Technology Type'],
            ['Study Assay Technology Type Term Accession Number'],
            ['Study Assay Technology Type Term Source REF'],
            ['Study Assay Technology Platform'],
            ['Study Assay File Name']
        ];
        study.assays.forEach((assay, i) => {
            let title = assay.comments.find((c) => c.name === 'Title')?.value;
            if (!title) {
                title = 'assay-' + (i + 1);
            }
            tmp[0] = tmp[0].concat('\t' + (assay.measurementType.annotationValue || ''));
            tmp[1] = tmp[1].concat('\t' + (assay.measurementType.termAccession || ''));
            tmp[2] = tmp[2].concat('\t' + (assay.measurementType.termSource || ''));
            tmp[3] = tmp[3].concat('\t' + (assay.technologyType.annotationValue || ''));
            tmp[4] = tmp[4].concat('\t' + (assay.technologyType.termAccession || ''));
            tmp[5] = tmp[5].concat('\t' + (assay.technologyType.termSource || ''));
            tmp[6] = tmp[6].concat('\t' + (assay.technologyPlatform || ''));
            tmp[7] = tmp[7].concat('\t' + (assay.filename ? assay.filename : `a_${title.replaceAll(' ', '-').toLowerCase()}.txt`));
        });
        tmp.forEach((line) => {
            investigation_content.push(line.join(''));
        });
        tmp = [];
        //Write STUDY PROTOCOLS
        investigation_content.push('STUDY PROTOCOLS');
        tmp = [
            ['Study Protocol Name'],
            ['Study Protocol Type'],
            ['Study Protocol Type Term Accession Number'],
            ['Study Protocol Type Term Source REF'],
            ['Study Protocol Description'],
            ['Study Protocol URI'],
            ['Study Protocol Version'],
            ['Study Protocol Parameters Name'],
            ['Study Protocol Parameters Term Accession Number'],
            ['Study Protocol Parameters Term Source REF'],
            ['Study Protocol Components Name'],
            ['Study Protocol Components Type'],
            ['Study Protocol Components Type Term Accession Number'],
            ['Study Protocol Components Type Term Source REF']
        ];
        study.protocols.forEach((protocol) => {
            tmp[0] = tmp[0].concat('\t' + protocol.name);
            tmp[1] = tmp[1].concat('\t' + (protocol.protocolType.annotationValue || ''));
            tmp[2] = tmp[2].concat('\t' + (protocol.protocolType.termAccession || ''));
            tmp[3] = tmp[3].concat('\t' + (protocol.protocolType.termSource || ''));
            tmp[4] = tmp[4].concat('\t' + (protocol.description || ''));
            tmp[5] = tmp[5].concat('\t' + (protocol.uri || ''));
            tmp[6] = tmp[6].concat('\t' + (protocol.version || ''));
            let annotationValues = [];
            let termAccessions = [];
            let termSources = [];
            protocol.parameters.forEach((parameter) => {
                annotationValues.push(parameter.parameterName.annotationValue);
                termAccessions.push(parameter.parameterName.termAccession);
                termSources.push(parameter.parameterName.termSource);
            });
            tmp[7] = tmp[7].concat('\t' + annotationValues.join(';'));
            tmp[8] = tmp[8].concat('\t' + termAccessions.join(';'));
            tmp[9] = tmp[9].concat('\t' + termSources.join(';'));
            let componentNames = [];
            annotationValues = [];
            termAccessions = [];
            termSources = [];
            protocol.components.forEach((component) => {
                componentNames.push(component.componentName);
                annotationValues.push(component.componentType.annotationValue);
                termAccessions.push(component.componentType.termAccession);
                termSources.push(component.componentType.termSource);
            });
            tmp[10] = tmp[10].concat('\t' + componentNames.join(';'));
            tmp[11] = tmp[11].concat('\t' + annotationValues.join(';'));
            tmp[12] = tmp[12].concat('\t' + termAccessions.join(';'));
            tmp[13] = tmp[13].concat('\t' + termSources.join(';'));
        });
        tmp.forEach((line) => {
            investigation_content.push(line.join(''));
        });
        tmp = [];
        // Write STUDY CONTACTS
        investigation_content.push('STUDY CONTACTS');
        tmp = [['Study Person First Name'], ['Study Person Last Name'], ['Study Person Mid Initials'], ['Study Person Email'], ['Study Person Phone'], ['Study Person Fax'], ['Study Person Address'], ['Study Person Affiliation'], ['Study Person Roles'], ['Study Person Roles Term Accession Number'], ['Study Person Roles Term Source REF']];
        study.people.forEach((person) => {
            tmp[0] = tmp[0].concat('\t' + person.firstName);
            tmp[1] = tmp[1].concat('\t' + person.lastName);
            tmp[2] = tmp[2].concat('\t' + person.midInitials);
            tmp[3] = tmp[3].concat('\t' + person.email);
            tmp[4] = tmp[4].concat('\t' + person.phone);
            tmp[5] = tmp[5].concat('\t' + person.fax);
            tmp[6] = tmp[6].concat('\t' + person.address);
            tmp[7] = tmp[7].concat('\t' + person.affiliation);

            let annotationValues = [];
            let termAccessions = [];
            let termSources = [];
            person.roles.forEach((role) => {
                annotationValues.push(role.annotationValue);
                termAccessions.push(role.termAccession);
                termSources.push(role.termSource);
            });
            tmp[8] = tmp[8].concat('\t' + annotationValues.join(';'));
            tmp[9] = tmp[9].concat('\t' + termAccessions.join(';'));
            tmp[10] = tmp[10].concat('\t' + termSources.join(';'));
        });
        tmp.forEach((line) => {
            investigation_content.push(line.join(''));
        });
        tmp = [];
    });
    return investigation_content;
}

function writeStudyFile(isa_study) {
    const study_content = [];

    // Write Header
    const header = [];
    header.push('Source Name');
    isa_study?.processSequence[0]?.inputs?.forEach((source) => {
        source.characteristics.forEach((characteristic) => {
            if (!header.includes('Characteristic[' + characteristic.category.characteristicType.annotationValue + ']')) {
                header.push('Characteristic[' + characteristic.category.characteristicType.annotationValue + ']');
                header.push('Term Source REF');
                header.push('Term Accession Number');
            }
        });
    });

    header.push('Protocol REF');
    isa_study?.processSequence[0]?.parameterValues?.forEach((parameterValue) => {
        if (!header.includes('Parameter[' + parameterValue.category.parameterName.annotationValue + ']')) {
            header.push('Parameter[' + parameterValue.category.parameterName.annotationValue + ']');
            header.push('Term Source REF');
            header.push('Term Accession Number');
            if (parameterValue?.annotationValue || parameterValue?.unit?.annotationValue) {
                // Ontology Annotations can be direct parameter values or units
                header.push('Unit');
                header.push('Term Source REF');
                header.push('Term Accession Number');
            }
        }
    });

    header.push('Sample Name');
    isa_study?.processSequence[0]?.outputs?.forEach((sample) => {
        sample.factorValues.forEach((factor) => {
            if (!header.includes('Factor Value[' + factor.category.factorName + ']')) {
                header.push('Factor Value[' + factor.category.factorName + ']');
                header.push('Term Source REF');
                header.push('Term Accession Number');
            }
        });
    });
    study_content.push(header.join('\t'));

    // Write Process
    for (let i = 0; i < isa_study?.processSequence[0]?.inputs?.length; i++) {
        const process = [];
        const source = isa_study.processSequence[0].inputs[i];
        process.push(source.name);
        source.characteristics.forEach((characteristic) => {
            process.push(characteristic.value);
            process.push("");
            process.push("");
        });
        process.push(isa_study.processSequence[0].executesProtocol.name);
        isa_study?.processSequence[0]?.parameterValues?.forEach((parameterValue) => {
            process.push(parameterValue.value);
            process.push("");
            process.push("");
            if (parameterValue?.unit?.annotationValue) {
                process.push(parameterValue.unit?.annotationValue ?? "-");
                process.push(parameterValue.unit?.termSource ?? "-");
                process.push(parameterValue.unit?.termAccession ?? "-");
            } else if (parameterValue.annotationValue) {
                // If the ontology annotation is a direct parameter Value
                process.push(parameterValue?.annotationValue ?? "-");
                process.push(parameterValue?.termSource ?? "-");
                process.push(parameterValue?.termAccession ?? "-");
            }
        });

        const sample = isa_study?.processSequence[0]?.outputs[i];
        process.push(sample.name);
        sample.factorValues.forEach((factor) => {
            process.push(factor.value);
            process.push("");
            process.push("");
        });
        study_content.push(process.join('\t'));
    }
    return study_content;
}

function writeAssayFile(isa_assay) {
    const assay_content = [];
    // Write Header
    const header = [];
    header.push('Sample Name');
    isa_assay?.processSequence[0]?.inputs?.forEach((sample) => {
        sample.characteristics.forEach((characteristic) => {
            if (!header.includes('Characteristic[' + characteristic.category.characteristicType.annotationValue + ']')) {
                header.push('Characteristic[' + characteristic.category.characteristicType.annotationValue + ']');
                header.push('Term Source REF');
                header.push('Term Accession Number');
            }
        });
    });

    header.push('Protocol REF');
    isa_assay?.processSequence[0]?.parameterValues?.forEach((parameterValue) => {
        if (!header.includes('Parameter[' + parameterValue.category.parameterName.annotationValue + ']')) {
            header.push('Parameter[' + parameterValue.category.parameterName.annotationValue + ']');
            header.push('Term Source REF');
            header.push('Term Accession Number');
            if (parameterValue.unit.annotationValue) {
                header.push('Unit');
                header.push('Term Source REF');
                header.push('Term Accession Number');
            }
        }
    });

    header.push('Raw Data File');

    assay_content.push(header.join('\t'));

    // Write Process
    for (let i = 0; i < isa_assay?.processSequence[0]?.inputs?.length; i++) {
        const process = [];
        const sample = isa_assay.processSequence[0].inputs[i];
        process.push(sample.name);
        sample.characteristics.forEach((characteristic) => {
            process.push(characteristic.value);
            process.push("");
            process.push("");
        });
        process.push(isa_assay.processSequence[0].executesProtocol.name);
        isa_assay?.processSequence[0]?.parameterValues?.forEach((parameterValue) => {
            process.push(parameterValue.value);
            process.push("");
            process.push("");
            if (parameterValue.unit.annotationValue) {
                process.push(parameterValue.unit.annotationValue);
                process.push(parameterValue.unit.termSource);
                process.push(parameterValue.unit.termAccession);
            }
        });
        process.push(isa_assay.processSequence[0].outputs[i].name);
        assay_content.push(process.join('\t'));
    }

    return assay_content;
}

const example_isa_json = {
    "comments": [],
    "description": "We could alternatively use the class constructor's parameters to set some default values at the time of creation, however we want to demonstrate how to use the object's instance variables to set values.",
    "identifier": "i1",
    "ontologySourceReferences": [
        {
            "description": "Ontology for Biomedical Investigations",
            "file": "",
            "name": "OBI",
            "version": ""
        }
    ],
    "people": [{
        "@id": "",
        "lastName": "Feser",
        "firstName": "Manuel",
        "midInitials": "",
        "email": "feser@ipk-gatersleben.de",
        "phone": "696",
        "fax": "",
        "address": "CORRENSSTRASSE 3",
        "affiliation": "IPK Gatersleben",
        "roles": [
            {
                "@id": "",
                "annotationValue": "software role",
                "termSource": "CREDIT",
                "termAccession": "http://purl.obolibrary.org/obo/CREDIT:00000009",
                "comments": []
            },
            {
                "@id": "",
                "annotationValue": "data curation role",
                "termSource": "CREDIT",
                "termAccession": "http://purl.obolibrary.org/obo/CREDIT:00000002",
                "comments": []
            }
        ],
        "comments": [
            {
                "name": "Person ID",
                "value": "https://orcid.org/0000-0001-6546-1818"
            }
        ]
    }],
    "publicReleaseDate": "2016-11-03",
    "publications": [],
    "studies": [
        {
            "assays": [
                {
                    "characteristicCategories": [],
                    "comments": [],
                    "dataFiles": [
                        {
                            "@id": "#data/rawdatafile-140407662277632",
                            "comments": [],
                            "name": "sequenced-data-0",
                            "type": "Raw Data File"
                        },
                        {
                            "@id": "#data/rawdatafile-140407662277920",
                            "comments": [],
                            "name": "sequenced-data-1",
                            "type": "Raw Data File"
                        },
                        {
                            "@id": "#data/rawdatafile-140407662278208",
                            "comments": [],
                            "name": "sequenced-data-2",
                            "type": "Raw Data File"
                        }
                    ],
                    "filename": "",
                    "materials": {
                        "otherMaterials": [
                            {
                                "@id": "#material/extract-140407662277488",
                                "characteristics": [],
                                "name": "extract-0",
                                "type": "Extract Name"
                            },
                            {
                                "@id": "#material/extract-140407662277776",
                                "characteristics": [],
                                "name": "extract-1",
                                "type": "Extract Name"
                            },
                            {
                                "@id": "#material/extract-140407662278064",
                                "characteristics": [],
                                "name": "extract-2",
                                "type": "Extract Name"
                            }
                        ],
                        "samples": [
                            {
                                "@id": "#sample/140407662726064",
                                "characteristics": [],
                                "factorValues": [],
                                "name": "sample_material-0"
                            },
                            {
                                "@id": "#sample/140407662726016",
                                "characteristics": [],
                                "factorValues": [],
                                "name": "sample_material-1"
                            },
                            {
                                "@id": "#sample/140407662276816",
                                "characteristics": [],
                                "factorValues": [],
                                "name": "sample_material-2"
                            }
                        ]
                    },
                    "measurementType": {
                        "@id": "#a5b16cf0-e854-4406-8353-0b5594029cad",
                        "annotationValue": "",
                        "comments": [],
                        "termAccession": "",
                        "termSource": ""
                    },
                    "processSequence": [
                        {
                            "@id": "#process/140407662277344",
                            "comments": [],
                            "date": "",
                            "executesProtocol": {
                                "@id": "#140407662277296"
                            },
                            "inputs": [
                                {
                                    "@id": "#sample/140407662726064"
                                }
                            ],
                            "name": "",
                            "nextProcess": {
                                "@id": "#process/140407662277584"
                            },
                            "outputs": [
                                {
                                    "@id": "#material/extract-140407662277488"
                                }
                            ],
                            "parameterValues": [],
                            "performer": ""
                        },
                        {
                            "@id": "#process/140407662277584",
                            "comments": [],
                            "date": "",
                            "executesProtocol": {
                                "@id": "#140407662277440"
                            },
                            "inputs": [
                                {
                                    "@id": "#material/extract-140407662277488"
                                }
                            ],
                            "name": "assay-name-0",
                            "outputs": [
                                {
                                    "@id": "#data/rawdatafile-140407662277632"
                                }
                            ],
                            "parameterValues": [],
                            "performer": "",
                            "previousProcess": {
                                "@id": "#process/140407662277344"
                            }
                        },
                        {
                            "@id": "#process/140407662277680",
                            "comments": [],
                            "date": "",
                            "executesProtocol": {
                                "@id": "#140407662277296"
                            },
                            "inputs": [
                                {
                                    "@id": "#sample/140407662726016"
                                }
                            ],
                            "name": "",
                            "nextProcess": {
                                "@id": "#process/140407662277872"
                            },
                            "outputs": [
                                {
                                    "@id": "#material/extract-140407662277776"
                                }
                            ],
                            "parameterValues": [],
                            "performer": ""
                        },
                        {
                            "@id": "#process/140407662277872",
                            "comments": [],
                            "date": "",
                            "executesProtocol": {
                                "@id": "#140407662277440"
                            },
                            "inputs": [
                                {
                                    "@id": "#material/extract-140407662277776"
                                }
                            ],
                            "name": "assay-name-1",
                            "outputs": [
                                {
                                    "@id": "#data/rawdatafile-140407662277920"
                                }
                            ],
                            "parameterValues": [],
                            "performer": "",
                            "previousProcess": {
                                "@id": "#process/140407662277680"
                            }
                        },
                        {
                            "@id": "#process/140407662277968",
                            "comments": [],
                            "date": "",
                            "executesProtocol": {
                                "@id": "#140407662277296"
                            },
                            "inputs": [
                                {
                                    "@id": "#sample/140407662276816"
                                }
                            ],
                            "name": "",
                            "nextProcess": {
                                "@id": "#process/140407662278160"
                            },
                            "outputs": [
                                {
                                    "@id": "#material/extract-140407662278064"
                                }
                            ],
                            "parameterValues": [],
                            "performer": ""
                        },
                        {
                            "@id": "#process/140407662278160",
                            "comments": [],
                            "date": "",
                            "executesProtocol": {
                                "@id": "#140407662277440"
                            },
                            "inputs": [
                                {
                                    "@id": "#material/extract-140407662278064"
                                }
                            ],
                            "name": "assay-name-2",
                            "outputs": [
                                {
                                    "@id": "#data/rawdatafile-140407662278208"
                                }
                            ],
                            "parameterValues": [],
                            "performer": "",
                            "previousProcess": {
                                "@id": "#process/140407662277968"
                            }
                        }
                    ],
                    "technologyPlatform": "",
                    "technologyType": {
                        "@id": "#4ab4818b-d0e4-4023-9d49-5871348bbeca",
                        "annotationValue": "",
                        "comments": [],
                        "termAccession": "",
                        "termSource": ""
                    },
                    "unitCategories": []
                }
            ],
            "characteristicCategories": [],
            "comments": [],
            "description": "Like with the Investigation, we could use the class constructor to set some default values, but have chosen to demonstrate in this example the use of instance variables to set initial values.",
            "factors": [],
            "filename": "s_study.txt",
            "identifier": "s1",
            "materials": {
                "otherMaterials": [],
                "samples": [
                    {
                        "@id": "#sample/140407662726064",
                        "characteristics": [],
                        "factorValues": [],
                        "name": "sample_material-0"
                    },
                    {
                        "@id": "#sample/140407662726016",
                        "characteristics": [],
                        "factorValues": [],
                        "name": "sample_material-1"
                    },
                    {
                        "@id": "#sample/140407662276816",
                        "characteristics": [],
                        "factorValues": [],
                        "name": "sample_material-2"
                    }
                ],
                "sources": [
                    {
                        "@id": "#source/140410343052864",
                        "characteristics": [],
                        "name": "source_material"
                    }
                ]
            },
            "people": [
                {
                    "address": "",
                    "affiliation": "University of Life",
                    "comments": [],
                    "email": "",
                    "fax": "",
                    "firstName": "Alice",
                    "lastName": "Robertson",
                    "midInitials": "",
                    "phone": "",
                    "roles": [
                        {
                            "@id": "#1bf3dcab-00dc-4db0-be74-a3308aa1b1fe",
                            "annotationValue": "submitter",
                            "comments": [],
                            "termAccession": "",
                            "termSource": ""
                        }
                    ]
                }
            ],
            "processSequence": [
                {
                    "@id": "#process/140407662277008",
                    "comments": [],
                    "date": "",
                    "executesProtocol": {
                        "@id": "#140407662952352"
                    },
                    "inputs": [
                        {
                            "@id": "#source/140410343052864"
                        }
                    ],
                    "name": "",
                    "outputs": [
                        {
                            "@id": "#sample/140407662726064"
                        },
                        {
                            "@id": "#sample/140407662726016"
                        },
                        {
                            "@id": "#sample/140407662276816"
                        }
                    ],
                    "parameterValues": [],
                    "performer": ""
                }
            ],
            "protocols": [
                {
                    "@id": "#140407662952352",
                    "comments": [],
                    "components": [],
                    "description": "",
                    "name": "sample collection",
                    "parameters": [],
                    "protocolType": {
                        "@id": "#ce0a95c0-8b1f-4c77-9b8b-cd1002f7287c",
                        "annotationValue": "sample collection",
                        "comments": [],
                        "termAccession": "",
                        "termSource": ""
                    },
                    "uri": "",
                    "version": ""
                },
                {
                    "@id": "#140407662277296",
                    "comments": [],
                    "components": [],
                    "description": "",
                    "name": "extraction",
                    "parameters": [],
                    "protocolType": {
                        "@id": "#a3d58318-7592-427b-9c64-a3e330528a8c",
                        "annotationValue": "material extraction",
                        "comments": [],
                        "termAccession": "",
                        "termSource": ""
                    },
                    "uri": "",
                    "version": ""
                },
                {
                    "@id": "#140407662277440",
                    "comments": [],
                    "components": [],
                    "description": "",
                    "name": "sequencing",
                    "parameters": [],
                    "protocolType": {
                        "@id": "#c8c6cd3e-3d38-4d19-b685-dfb9683b9e74",
                        "annotationValue": "material sequencing",
                        "comments": [],
                        "termAccession": "",
                        "termSource": ""
                    },
                    "uri": "",
                    "version": ""
                }
            ],
            "publicReleaseDate": "2016-11-03",
            "publications": [
                {
                    "authorList": "A. Robertson, B. Robertson",
                    "doi": "",
                    "pubMedID": "12345678",
                    "status": {
                        "@id": "#f6d24638-a3a6-43d5-a635-0b15d547e131",
                        "annotationValue": "published",
                        "comments": [],
                        "termAccession": "",
                        "termSource": ""
                    },
                    "title": "Experiments with Elephants"
                }
            ],
            "studyDesignDescriptors": [
                {
                    "@id": "#d5241eb4-81ae-4835-84f9-017a4c252c66",
                    "annotationValue": "intervention design",
                    "comments": [],
                    "termAccession": "http://purl.obolibrary.org/obo/OBI_0000115",
                    "termSource": "OBI"
                }
            ],
            "submissionDate": "2016-11-03",
            "title": "My ISA Study",
            "unitCategories": []
        }
    ],
    "submissionDate": "2016-11-03",
    "title": "My Simple ISA Investigation"
}