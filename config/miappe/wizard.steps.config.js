window.steps = [
    {
        title: 'Welcome to the MIAPPE Wizard.',
        text: [
            'With this Wizard it is super easy to annotate measurements of your phenotyping experiment with MIAPPE-compliant metadata according to FAIR principles.',
            'Click on the Next button to start the metadata annotation of the results data of your experiments.'
        ]
    },
    {
        title: 'Please provide the basic information of your Plant Phenotyping Project and when you submitted and published the Dataset.',
        fields: [
            {
                label: 'Project Title',
                type: 'text',
                isaMapping: {
                    jsonPath: 'title'
                },
                explanation: 'DM-3'
            },
            {
                label: 'Project Description',
                type: 'textarea',
                isaMapping: {
                    jsonPath: 'description'
                },
                explanation: 'DM-4'
            },
            {
                label: 'License',
                type: 'license',
                isaMapping: {
                    jsonPath: 'comments',
                    commentName: 'License'
                },
                explanation: 'DM-7'
            },
            {
                label: 'Submission Date',
                type: 'date',
                isaMapping: {
                    jsonPath: 'submissionDate'
                },
                explanation: 'DM-5'
            },
            {
                label: 'Public Release Date',
                type: 'date',
                isaMapping: {
                    jsonPath: 'publicReleaseDate'
                },
                explanation: 'DM-6'
            }
        ]
    },
    {
        title: 'Please provide the Authors of your Dataset and define their Contribution.',
        component: 'people',
        jsonPath: 'people',
        componentConfig: {
            showComments: false,
            label: 'Authors'
        }
    },
    {
        title: 'Here you can provide publications related to your experiment.',
        level: 'Investigation',
        component: 'Publications',
        jsonPath: 'publications'
    },
    {
        hooks: [
            {
                type: 'study',
                state: {
                    mapping: 'studies',
                    count: 1
                }
            }
        ],
        title: 'Please provide the Title and Location of your Study',
        fields: [
            {
                label: 'Study Title',
                type: 'text',
                isaMapping: {
                    jsonPath: 'studies[0].title'
                },
                explanation: 'DM-12'
            },
            {
                label: 'Location',
                type: 'location',
                isaMapping: {
                    jsonPath: 'studies[0].comments',
                    commentName: 'Study Experimental Site'
                },
                explanation: 'DM-18'
            },
            {
                label: 'Location Latitude',
                type: 'text',
                isaMapping: {
                    jsonPath: 'studies[0].comments',
                    commentName: 'Study Latitude'
                },
                explanation: 'DM-19'
            },
            {
                label: 'Location Longitude',
                type: 'text',
                isaMapping: {
                    jsonPath: 'studies[0].comments',
                    commentName: 'Study Longitude'
                },
                explanation: 'DM-20'
            },
            {
                label: 'ROR ID of your Institution',
                type: 'ror',
                isaMapping: {
                    jsonPath: 'studies[0].comments',
                    commentName: 'Study Contact Institution ROR'
                }
            },
            {
                label: 'Institution Contact Address',
                type: 'text',
                isaMapping: {
                    jsonPath: 'studies[0].comments',
                    commentName: 'Study Contact Institution'
                },
                explanation: 'DM-16'
            },
            {
                label: 'Country',
                type: 'text',
                isaMapping: {
                    jsonPath: 'studies[0].comments',
                    commentName: 'Study Country'
                },
                explanation: 'DM-17'
            }
        ]
    },
    {
        hooks: [
            {
                type: 'protocol',
                state: {
                    mapping: 'studies[0].protocols',
                    count: 1
                },
                parameters: {
                    name: 'Growth',
                    version: 'MIAPPE v1.1',
                    protocolType: {
                        "@id": "",
                        "annotationValue": "plant growth protocol",
                        "termSource": "DPBO",
                        "termAccession": "DPBO:1000164",
                        "comments": []
                    },
                    // protocolDescription: 'How the plants were grown up.',
                    parameters: [

                        // {
                        //     parameterName: {
                        //         "@id": "",
                        //         "annotationValue": "Light intensity",
                        //         "termSource": "MIAPPE",
                        //         "termAccession": "MIAPPE:0101",
                        //         "comments": []
                        //     }, comments: [
                        //         {
                        //             "@id": "",
                        //             "name": "value",
                        //             "value": ""
                        //         },
                        //         {
                        //             "@id": "",
                        //             "name": "deletable",
                        //             "value": "false"
                        //         }, {
                        //             "@id": "",
                        //             "name": "unit",
                        //             "value": ""
                        //         }
                        //     ]
                        // }
                        
                        // , {
                        //     "@id": "",
                        //     "annotationValue": "temperature day",
                        //     "termSource": "DPBO",
                        //     "termAccession": "DPBO:0000007",
                        //     "comments": []
                        // },{
                        //     "@id": "",
                        //     "annotationValue": "temperature night",
                        //     "termSource": "DPBO",
                        //     "termAccession": "DPBO:0000008",
                        //     "comments": []
                        // }
                    ]
                }
            }
        ],
        title: 'Please provide a brief summary of the Growth Conditions.',
        component: "protocol",
        jsonPath: 'studies[0].protocols',
        componentConfig: {
            showComments: false,
            label: 'Protocols'
        }
        // fields: [
        //     {
        //         label: 'Growth description',
        //         type: 'textarea',
        //         isaMapping: {
        //             jsonPath: 'studies[0].protocols[0].description'
        //         },
        //         explanation: 'DM-67'
        //     },
        //     {
        //         label: 'Protocol URI',
        //         type: 'text',
        //         isaMapping: {
        //             jsonPath: 'studies[0].protocols[0].uri'
        //         },
        //         explanation: 'DM-66'
        //     },
        //     {
        //         label: 'Protocol Parameters',
        //         type: 'parameters',
        //         isaMapping: {
        //             jsonPath: 'studies[0].protocols[0].parameters'
        //         },
        //         explanation: 'DM-68'
        //     },
        //     {
        //         label: 'Protocol Components',
        //         type: 'components',
        //         isaMapping: {
        //             jsonPath: 'studies[0].protocols[0].components'
        //         },
        //         explanation: 'DM-69'
        //     }
        // ]
    },
    {
        title: 'Please upload the Material used in your Study.',
        component: 'StudyProcesses',
        level: 'Study',
        jsonPath: 'studies[0]',
        componentConfig: {

        }
    },
    {
        hooks: [
            {
                type: 'assay',
                state: {
                    mapping: 'studies[0].assays',
                    count: 1
                },
                parameters: {

                }
            }
        ],
        title: 'Please provide the information on the experiments of your Study.',
        fields: [
            {
                label: 'Experiment Title',
                type: 'text',
                isaMapping: {
                    jsonPath: 'studies[0].assays[0].comments',
                    commentName: 'Title'
                }
            },
            {
                label: 'Measurement Type',
                type: 'ontology_annotation',
                isaMapping: {
                    jsonPath: 'studies[0].assays[0].measurementType'
                },
            },
            {
                label: 'Technology Type',
                type: 'ontology_annotation',
                isaMapping: {
                    jsonPath: 'studies[0].assays[0].technologyType'
                },
            },
            {
                label: 'Technology Platform',
                type: 'text-select',
                isaMapping: {
                    jsonPath: 'studies[0].assays[0].technologyPlatform'
                },
                componentConfig: {
                    options: ['Lemna-Tec', 'PhenoSphere', 'Field', 'Greenhouse']
                }
            }
        ]
    },
    {
        hooks: [
            {
                type: 'protocol',
                state: {
                    mapping: 'studies[0].protocols',
                    count: 2
                },
                parameters: {
                    name: 'Imaging',
                    version: 'MIAPPE v1.1',
                    // protocolType: {
                    //     "@id": "",
                    //     "annotationValue": "phenotyping",
                    //     "termSource": "DPBO",
                    //     "termAccession": "DPBO:1000224",
                    //     "comments": []
                    //   },
                    // protocolParameters: ['Phenotyping method']
                }
            }
        ],
        title: 'Please select all Parameters corresponding to your phenotyping.',
        fields: [
            {
                label: 'Phenotyping description',
                type: 'textarea',
                isaMapping: {
                    jsonPath: 'studies[0].protocols[1].description'
                },
                explanation: 'DM-67'
            },
            {
                label: 'Protocol URI',
                type: 'text',
                isaMapping: {
                    jsonPath: 'studies[0].protocols[1].uri'
                },
                explanation: 'DM-66'
            },
            {
                label: 'Protocol Parameters',
                type: 'parameters',
                isaMapping: {
                    jsonPath: 'studies[0].protocols[1].parameters'
                },
                explanation: 'DM-68'
            },
            {
                label: 'Protocol Components',
                type: 'components',
                isaMapping: {
                    jsonPath: 'studies[0].protocols[1].components'
                },
                explanation: 'DM-69'
            }
        ]
    },

    {
        title: 'Please upload the results of your Study.',
        component: 'AssayProcesses',
        level: 'Assay',
        jsonPath: 'studies[0].assays[0]',
        componentConfig: {
            brapiBaseURL: "https://test-server.brapi.org/brapi/v2/"
        }
    }
];