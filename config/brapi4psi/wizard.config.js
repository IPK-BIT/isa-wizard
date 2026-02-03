window.config = {

    general: {
        name: 'MIAPPE Wizard',
        layoutMode: 'standalone', // standalone | plugin
        initialView: 'init', // init, wizard, form
        showQuestionnaireProgressBar: true,
        showConsole: true,
    },

    export: [
        {
            type: 'arc',
            label: 'ARC',
            description: 'Export to ARC format.',
        },
        {
            type: 'gitlab',
            label: 'PLANTDataHUB',
            description: 'Export to PLANTDataHUB.',
            config: {
                authentication: {
                    method: 'code',
                    client_id: '200490ccbc9bd9e9f65eb50dfc8aa68ca3ea2c6c5eee7f51874ea0f07d4b4ced',
                    base_url: 'https://git.nfdi4plants.org',
                    scope: 'api'
                }
            }
        },
        {
            type: 'isa-json',
            label: 'ISA-JSON',
            description: 'Export to ISA-JSON.',
        },
        {
            type: 'isa-tab',
            label: 'ISA-Tab',
            description: 'Export to ISA-Tab.',
        }
    ],

    prefill: [
        {
            type: 'person',
            isaMapping: {
                entity: 'investigation'
            },
            values: {
                lastName : 'Mustermann',
                firstName : 'Max',
                midInitials : '',
                email : 'mustermann@ipk-gatersleben.de',
                phone : '1234',
                fax : '7890',
                address : 'Corrensstraße 3, 06646 Seeland',
                affiliation : 'IPK Gatersleben'
            }
        },
        {
            type: 'comment',
            isaMapping: {
                entity: 'investigation',
                attribute: 'comments'
            },
            values: {
                name: 'MIAPPE version',
                value: '1.1'
            }
        },
        /*{
            type: 'value',
            isaMapping: {
                entity: 'investigation',
                attribute: 'title'
            },
            value: 'Prefilled investigation title'
        },
        { //remove later
            type: 'value',
            isaMapping: {
                entity: 'investigation',
                attribute: 'identifier',
                studyIndex: 0
            },
            value: 'Prefilled investigation id'
        }*/
    ],

    "checklist": {
        "checklistName": "MIAPPE",
        "checklistVersion": "1.1",
        "studyFactors": [
            { "label":"Seasonal environment", "explanation":"A plant treatment (EO:0001001) involving an exposure to a given conditions of regional seasons." },
            { "label":"Air treatment regime", "explanation":"The treatment involving an exposure to wind/air with varying degree of temperature, which may depend on the study type or the regional environment." },
            { "label":"Soil temperature regime", "explanation":"A physical plant treatment (EO:0007316) involving an exposure to varying degree of temperature, which may depend on regional environment." },
            { "label":"Soil treatment regime", "explanation":"The treatment (EO:0007049) involving growing plants and exposing them to soil growth media with varying contents" },
            { "label":"Antibiotic regime", "explanation":"A chemical treatment (EO:0007189) involving the use of antibiotic for selection purposes." },
            { "label":"Chemical administration", "explanation":"An abiotic plant treatment (EO:0007191) involving the application of chemical(s)." },
            { "label":"Biotic treatment", "explanation":"A plant treatment (EO:0001001) involving the application of a biotic or biological factor such as a microbe, insect, animal, or plant or a combination thereof" },
            { "label":"Fertilizer regime", "explanation":"A plant nutrient treatment (EO:0007241) involving the use of a fertilizer, a combination of plant nutrients." },
            { "label":"Fungicide regime", "explanation":"A treatment (EO:0007167) involving the application of a fungicide; a chemical entity or mixture of chemical entities." },
            { "label":"Gaseous regime", "explanation":"A physical plant treatment (EO:0007316) involving the application of a gas or a combination of gasses." },
            { "label":"Gravity", "explanation":"The treatment involving use of gravity factor to study various types of responses in presence, absence or modified levels of gravity." },
            { "label":"Plant hormone regime", "explanation":"A chemical treatment (EO:0007189) involving the use of growth hormones to study various types of responses on their extrinsic and/or intrinsic application." },
            { "label":"Herbicide regime", "explanation":"A treatment (EO:0007167) involving the application of a herbicide; a chemical entity or mixture of chemical entities." },
            { "label":"Mechanical treatment", "explanation":"A treatment involving the application of a mechanical force" },
            { "label":"Chemical regime", "explanation":"A chemical treatment (EO:0007189) involving the application of inorganic chemicals, nutriment, organic chemicals, etc. as supplement to study various types of responses" },
            { "label":"Humidity regimen", "explanation":"A treatment involving an exposure to varying degree of humidity, which may depend on regional environment." },
            { "label":"Radiation (light, UV-B, X-ray) regime", "explanation":"A physical plant treatment (EO:0007316) involving an exposure with a radiation type, intensity or quantity. EMR is classified according to the frequency of its wave. The electromagnetic spectrum, in order of increasing frequency and decreasing wavelength, consists of radio waves, microwaves, infrared radiation, visible light, ultraviolet radiation, X-rays and gamma rays. (from Wikipedia)." },
            { "label":"Rainfall regime", "explanation":"Treatment involving an exposure to a given amount of rainfall." },
            { "label":"Salt regime", "explanation":"This treatment may be used to simulate the growth conditions of sea coast regions and saline/sodic soils. A chemical treatment (EO:0007189) involving use of salts as supplement to liquid and soil growth media to study various types of responses on their application." },
            { "label":"Watering regime", "explanation":"Treatment involving an exposure to watering frequencies." },
            { "label":"Water temperature regime", "explanation":"Treatment involving an exposure to water with varying degree of temperature, which may depend on regional environment." },
            { "label":"Standing water regime", "explanation":"The treatment involving an exposure to standing water during a plant's life span. This also results in anaerobic soil conditions for either long or short periods." },
            { "label":"Pesticide regime", "explanation":"A chemical treatment (EO:0007189) involving the application of a pesticide; a chemical entity or mixture of chemical entities." },
            { "label":"pH regime", "explanation":"The treatment involving exposure of plants to varying levels of pH of the growth media." }
        ],

        "defaultProtocols": [
            {
                "id": "growth",
                "name": "Growth",
                "parameters": [
                    { "label":"Growth facility", "explanation":"Type of growth facility in which the study was carried out" },
                    { "label":"Air temperature", "explanation":"List of hourly air temperature throughout the experiment." },
                    { "label":"Organ temperature", "explanation":"List of hourly organ temperatures throughout the experiment" },
                    { "label":"Change over the course of experiment", "explanation":"Difference between the maximum air temperature recorded and the minimum." },
                    { "label":"Photon flux density (PPFD) measured at plant or canopy level", "explanation":"List of hourly Photosynthetic photon flux density (PPFD) throughout the experiment." },
                    { "label":"Average length of the light period", "explanation":"Average length of the light period in h." },
                    { "label":"Light intensity", "explanation":"Intensity of total light" },
                    { "label":"Range in peak light intensity", "explanation":"Range in peak light intensity for the whole experiment." },
                    { "label":"Fraction of outside light intercepted by growth facility components and surrounding structures", "explanation":"Fraction of outside light intercepted by growth facility components and surrounding structures." },
                    { "label":"Type of lamps used", "explanation":"Nature of the light source for controlled environments. XEO: 00137" },
                    { "label":"R/FR ratio", "explanation":"Red light to far red light ratio. XEO:00036" },
                    { "label":"Daily UV-A radiation", "explanation":"Intensity of UVA radiation (320-400 nm); XEO:00037" },
                    { "label":"Daily UV-B radiation", "explanation":"Intensity of UVB radiation (290-320 nm); XEO:00038" },
                    { "label":"Total daily irradiance", "explanation":"Intensity of total light (XEO:00034) averaged over the experiment." },
                    { "label":"Atmospheric CO2 concentration", "explanation":"Denotes whether the atmospheric CO2 concentrations were controlled during the experiment." },
                    { "label":"Average CO2 during the light and dark periods", "explanation":"Concentration of CO2 in the air during the light and dark periods (XEO:00023)" },
                    { "label":"Vapour pressure deficit", "explanation":"Vector of hourly VPD throughout the experiment .The Vapour Pressure Deficit in the air defines the difference between the maximal amount of water in the air minus the actual amount during the light period in kPa (XEO:00021)" },
                    { "label":"Average relative humidity during the light period", "explanation":"The relative humidity describes the amount of water vapor in the air, generally expressed as the percentage of the maximum water vapor during the light period (XEO:00020)" },
                    { "label":"Average VPDair during the dark period.", "explanation":"The Vapour Pressure Deficit in the air defines the difference between the maximal amount of water in the air minus the actual amount during the light period in kPa (XEO:00021)" },
                    { "label":"Average relative humidity during the dark period", "explanation":"The relative humidity describes the amount of water vapor in the air, generally expressed as the percentage of the maximum water vapor during the dark period (XEO:00020)" },
                    { "label":"Rooting conditions", "explanation":"" },
                    { "label":"Rooting medium", "explanation":"An abiotic plant treatment (EO:0007191) involving the use of a solid or liquid substrate for growing plants or tissue-cultured plant samples." },
                    { "label":"Container type", "explanation":"Type of container used to grow/treat the plants.XEO:00040" },
                    { "label":"Container volume", "explanation":"Volume that is available to the roots. XEO:00113" },
                    { "label":"Container height", "explanation":"Height of the container." },
                    { "label":"Number of plants per containers", "explanation":"Number of plants per container. XEO:00112" },
                    { "label":"Plot size", "explanation":"Description of experimental sites." },
                    { "label":"Sowing density", "explanation":"Sowing density." },
                    { "label":"Rooting medium replenishment", "explanation":"Frequency and volume of replenishment or addition of the rooting medium." },
                    { "label":"pH", "explanation":"Value of soil pH, separated by a colon, the depth (cm) from where soil sample was taken. Multiple values are separated by semicolon. " },
                    { "label":"Porosity", "explanation":"A permeability quality inhering in a bearer by virtue of the bearer's disposition to admit the passage of gas or liquid through pores or interstices. PATO:0000973" },
                    { "label":"Medium temperature", "explanation":"Temperature of the replenishment medium. " },
                    { "label":"Soil penetration strength", "explanation":"Soil penetration strength as measured by the standard penetration test (SPT; ISO 22476-3), the cone penetrometer test (CPT), in-situ vane shear tests, and shear wave velocity measurements." },
                    { "label":"Water retention capacity", "explanation":"Potential energy of water per unit mass of water in the soil.XEO:00126" },
                    { "label":"Organic matter content", "explanation":"Proportion of organic matter in the soil. XEO:00117" },
                    { "label":"Nutrients", "explanation":"" },
                    { "label":"Medium composition", "explanation":"Concentration of the nutrients" },
                    { "label":"Extractable N content per unit ground volume before fertiliser added", "explanation":"Extractable N content per unit ground area before fertiliser added" },
                    { "label":"Type and amount of fertiliser added per container/m2", "explanation":"The current practice in field /greenhouse management for fertilization" },
                    { "label":"Concentration of [nutrient] before start of the experiment", "explanation":"Concentration of a nutrient at the start of an experiment." },
                    { "label":"Extractable N content per unit ground area at the end of the experiment", "explanation":"Extractable N content per unit ground area at the end of the experiment" },
                    { "label":"Volume and timing of water added per container", "explanation":"A defined volume of water supplied to each pot." },
                    { "label":"Matrix potential", "explanation":"Range in water potential for soil." },
                    { "label":"Watering regimen", "explanation":"The treatment involving an exposure to watering frequencies." },
                    { "label":"Composition of nutrient solutions used for irrigation", "explanation":"For all nutrients, including micronutrients, the ontology term with concentration." },
                    { "label":"Electrical conductivity", "explanation":"A conductivity quality inhering in a bearer by virtue of the bearer's ability to convey electricity." }
                ]
            },
            {
                "id": "phenotyping",
                "name": "Phenotyping",
                "parameters": [
                    { "label": "Phenotyping method", "explanation": "The method that was used for phenotyping e.g. human bonitur" },
                    { "label": "Phenotyping facility", "explanation": "Facility used for automatic plant phenotyping e.g. LemnaTec" },
                ]
            }
        ]
    }
}