window.steps = [
    // {
    //     title: 'Welcome to the MIAPPE Wizard.',
    //     text: [
    //         'With this Wizard it is super easy to annotate measurements of your phenotyping experiment with MIAPPE-compliant metadata according to FAIR principles.',
    //         'Click on the Next button to start the metadata annotation of the results data of your experiments.'
    //     ]
    // },
    {
        title: 'Please provide the basic information of your Plant Phenotyping Trial and when you submitted and published the Dataset.',
        explanation: 'Within this step you can provide the basic information of your Plant Phenotyping Trial and when you submitted and published the Dataset.',
        fields: [
            {
                label: 'Trial Title',
                type: 'text',
                isaMapping: {
                    jsonPath: 'title'
                },
                explanation: 'DM-3'
            },
            {
                label: 'Trial Description',
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
        explanation: 'Within this step you can provide the Authors of your Dataset and define their Contribution.',
        component: 'People',
        jsonPath: 'people',
        componentConfig: {
            showComments: false,
            label: 'Authors'
        }
    },
    // {
    //     title: 'Here you can provide publications related to your experiment.',
    //     level: 'Investigation',
    //     component: 'Publications',
    //     jsonPath: 'publications'
    // },
    {
        hooks: [
            {
                type: 'addStudy'
            }
        ],
        title: 'Please provide the Title and Location of your Study',
        explanation: 'Within this step you can provide the Title and Location of your Study. The Location is the Experimental Site where the plants were grown up.',
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
                type: 'addProtocol',
                parameters: {
                    protocolName: 'Stratification',
                    protocolVersion: 'MIAPPE v1.1',
                    protocolType: null,
                    // protocolDescription: 'How the plants were grown up.',
                    protocolParameters: []
                }
            }
        ],
        title: 'Please provide a brief summary of the Stratification Conditions.',
        explanation: 'Within this step you can provide a brief summary of the Stratification Conditions. This is the first step in the plant growth process.',
        fields: [
            {
                label: 'Stratification description',
                type: 'textarea',
                isaMapping: {
                    jsonPath: 'studies[0].protocols[0].description'
                },
                explanation: 'DM-67'
            },
            {
                label: 'Protocol URI',
                type: 'text',
                isaMapping: {
                    jsonPath: 'studies[0].protocols[0].uri'
                },
                explanation: 'DM-66'
            },
            {
                label: 'Protocol Parameters',
                type: 'parameters',
                isaMapping: {
                    jsonPath: 'studies[0].protocols[0].parameters'
                },
                explanation: 'DM-68'
            },
            {
                label: 'Protocol Components',
                type: 'components',
                isaMapping: {
                    jsonPath: 'studies[0].protocols[0].components'
                },
                explanation: 'DM-69'
            }
        ]
    },    
    {
        hooks: [
            {
                type: 'addProtocol',
                parameters: {
                    protocolName: 'Germination',
                    protocolVersion: 'MIAPPE v1.1',
                    protocolType: null,
                    // protocolDescription: 'How the plants were grown up.',
                    protocolParameters: []
                }
            }
        ],
        title: 'Please provide a brief summary of the Germination Conditions.',
        explanation: 'Within this step you can provide a brief summary of the Germination Conditions. This is the second step in the plant growth process.',
        fields: [
            {
                label: 'Germination description',
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
        hooks: [
            {
                type: 'addProtocol',
                parameters: {
                    protocolName: 'Growth',
                    protocolVersion: 'MIAPPE v1.1',
                    protocolType: {
                        "@id": "",
                        "annotationValue": "plant growth protocol",
                        "termSource": "DPBO",
                        "termAccession": "DPBO:1000164",
                        "comments": []
                      },
                    // protocolDescription: 'How the plants were grown up.',
                    protocolParameters: [ 
                        {
                            "@id": "",
                            "annotationValue": "Light intensity",
                            "termSource": "MIAPPE",
                            "termAccession": "MIAPPE:0101",
                            "comments": []
                        }, {
                            "@id": "",
                            "annotationValue": "temperature day",
                            "termSource": "DPBO",
                            "termAccession": "DPBO:0000007",
                            "comments": []
                        },{
                            "@id": "",
                            "annotationValue": "temperature night",
                            "termSource": "DPBO",
                            "termAccession": "DPBO:0000008",
                            "comments": []
                        }
                    ]
                }
            }
        ],
        title: 'Please provide a brief summary of the Growth Conditions.',
        explanation: 'Within this step you can provide a brief summary of the Growth Conditions. This is the third step in the plant growth process.',
        fields: [
            {
                label: 'Growth description',
                type: 'textarea',
                isaMapping: {
                    jsonPath: 'studies[0].protocols[2].description'
                },
                explanation: 'DM-67'
            },
            {
                label: 'Protocol URI',
                type: 'text',
                isaMapping: {
                    jsonPath: 'studies[0].protocols[2].uri'
                },
                explanation: 'DM-66'
            },
            {
                label: 'Protocol Parameters',
                type: 'parameters',
                isaMapping: {
                    jsonPath: 'studies[0].protocols[2].parameters'
                },
                explanation: 'DM-68'
            },
            {
                label: 'Protocol Components',
                type: 'components',
                isaMapping: {
                    jsonPath: 'studies[0].protocols[2].components'
                },
                explanation: 'DM-69'
            }
        ]
    },
    {
        title: 'Please upload the Material used in your Study.',
        explanation: 'Within this step you can upload the Material used in your Study. This is the fourth step in the plant growth process.',
        component: 'StudyProcesses',
        level: 'Study',
        jsonPath: 'studies[0]',
        componentConfig: {

        }
    }
];