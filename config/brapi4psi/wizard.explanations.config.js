window.explanations = [
    {
        "id": "DM-1",
        "miappeTerm": "Investigation",
        "definition": "Investigations are research programmes with defined aims. They can exist at various scales (for example, they could encompass a grant-funded programme of work, the various components comprising a peer-reviewed publication, or a single experiment).",
        "example": "",
        "format": "1 per MIAPPE submission",
        "cardinality": ""
    },
    {
        "id": "DM-2",
        "miappeTerm": "Investigation unique ID",
        "question": "What is the unique ID of your investigation?",
        "definition": "Identifier comprising the unique name of the institution/database hosting the submission of the investigation data, and the accession number of the investigation in that institution.",
        "example": "EBI:12345678",
        "format": "Unique identifier",
        "cardinality": "0-1"
    },
    {
        "id": "DM-3",
        "miappeTerm": "Investigation title",
        "question": "What is the title of your investigation?",
        "definition": "Title summarising the plant phenotyping project.",
        "example": "Adaptation of Maize to Temperate Climates: Mid-Density Genome-Wide Association Genetics and Diversity Patterns Reveal Key Genomic Regions, with a Major Contribution of the Vgt2 (ZCN8) Locus.",
        "format": "Free text (short)",
        "cardinality": "1"
    },
    {
        "id": "DM-4",
        "miappeTerm": "Investigation description",
        "question": "Please describe your investigation.",
        "definition": "A text summarising the plant phenotyping project in more detail.",
        "example": "The migration of maize from tropical to temperate climates was accompanied by a dramatic evolution in flowering time. To gain insight into the genetic architecture of this adaptive trait, we conducted a 50K SNP-based genome-wide association and diversity investigation on a panel of tropical and temperate American and European representatives.",
        "format": "Free text",
        "cardinality": "0-1"
    },
    {
        "id": "DM-5",
        "miappeTerm": "Submission date",
        "question": "When was the dataset submitted to a repository?",
        "definition": "Date of submission of the dataset presently being described to a host repository.",
        "example": "2012-12-17",
        "format": "Date/Time (ISO 8601, optional time zone)",
        "cardinality": "0-1"
    },
    {
        "id": "DM-6",
        "miappeTerm": "Public release date",
        "question": "What is the date of the first public release of the dataset?",
        "definition": "Date of first public release of the dataset presently being described.",
        "example": "2013-02-25",
        "format": "Date/Time (ISO 8601, optional time zone)",
        "cardinality": "0-1"
    },
    {
        "id": "DM-7",
        "miappeTerm": "License",
        "definition": "License for the reuse of the data associated with this investigation. The Creative Commons licenses cover most use cases and are recommended.",
        "example": "CC BY-SA 4.0, Unreported",
        "format": "Unique identifier",
        "cardinality": "0-1"
    },
    {
        "id": "DM-8",
        "miappeTerm": "MIAPPE version",
        "definition": "The version of MIAPPE used.",
        "example": "1.1",
        "format": "Version number",
        "cardinality": "1"
    },
    {
        "id": "DM-9",
        "miappeTerm": "Associated publication",
        "definition": "An identifier for a literature publication where the investigation is described. Use of DOIs is recommended.",
        "example": "doi:10.1371/journal.pone.0071377",
        "format": "DOI",
        "cardinality": "0+"
    },
    {
        "id": "DM-10",
        "miappeTerm": "Study",
        "definition": "A study (or experiment) comprises a series of assays (or measurements) of one or more types, undertaken to answer a particular biological question.",
        "example": "",
        "format": "1+ per investigation",
        "cardinality": ""
    },
    {
        "id": "DM-11",
        "miappeTerm": "Study unique ID",
        "definition": "Unique identifier comprising the name or identifier for the institution/database hosting the submission of the study data, and the identifier of the study in that institution.",
        "example": "\"EBI:12345678\nhttp://phenome-fppn.fr/maugio/2013/t2351\"",
        "format": "Unique identifier",
        "cardinality": "0-1"
    },
    {
        "id": "DM-12",
        "miappeTerm": "Study title",
        "definition": "Human-readable text summarising the study",
        "example": "2002 evaluation of flowering time for a panel of 375 maize lines at the experimental station of Maugio (France).",
        "format": "Free text (short)",
        "cardinality": "1"
    },
    {
        "id": "DM-13",
        "miappeTerm": "Study description",
        "definition": "Human-readable text describing the study",
        "example": "2002 evaluation of male and female flowering time for a panel of 375 maize lines representing the worldwide genetic diversity at the experimental station of Maugio, France.",
        "format": "Free text",
        "cardinality": "0-1"
    },
    {
        "id": "DM-14",
        "miappeTerm": "Start date of study",
        "definition": "Date and, if relevant, time when the experiment started",
        "example": "\"2002-04-04\n2006-09-27T10:23:21+00:00\"",
        "format": "Date/Time (ISO 8601, optional time zone)",
        "cardinality": "1"
    },
    {
        "id": "DM-15",
        "miappeTerm": "End date of study",
        "definition": "Date and, if relevant, time when the experiment ended",
        "example": "2002-11-27",
        "format": "Date/Time (ISO 8601, optional time zone)",
        "cardinality": "0-1"
    },
    {
        "id": "DM-16",
        "miappeTerm": "Contact institution",
        "definition": "Name and address of the institution responsible for the study.",
        "example": "IPK Gatersleben, Stadt Seeland, Germany",
        "format": "Free text (short)",
        "cardinality": "1"
    },
    {
        "id": "DM-17",
        "miappeTerm": "Geographic location (country)",
        "definition": "The country where the experiment took place, either as a full name or preferably as a 2-letter code.",
        "example": "FR",
        "format": "Country name or 2-letter code (ISO 3166)",
        "cardinality": "1"
    },
    {
        "id": "DM-18",
        "miappeTerm": "Experimental site name",
        "definition": "The name of the natural site, experimental field, greenhouse, phenotyping facility, etc. where the experiment took place.",
        "example": "Experimental field west, IPK Gatersleben, Germany",
        "format": "Free text (short)",
        "cardinality": "1"
    },
    {
        "id": "DM-19",
        "miappeTerm": "Geographic location (latitude)",
        "definition": "Latitude of the experimental site in degrees, in decimal format.",
        "example": "+43.619264",
        "format": "Degrees in the decimal format (ISO 6709)",
        "cardinality": "0-1 (1 if longitude is provided)"
    },
    {
        "id": "DM-20",
        "miappeTerm": "Geographic location (longitude)",
        "definition": "Longitude of the experimental site in degrees, in decimal format.",
        "example": "+3.967454",
        "format": "Degrees in the decimal format (ISO 6709)",
        "cardinality": "0-1 (1 if latitude is provided)"
    },
    {
        "id": "DM-21",
        "miappeTerm": "Geographic location (altitude)",
        "definition": "Altitude of the experimental site, provided in metres (m).",
        "example": "100 m",
        "format": "Numeric + unit abbreviation",
        "cardinality": "0-1"
    },
    {
        "id": "DM-67",
        "miappeTerm": "Growth Protocol Description",
        "definition": "Human-readable text describing how the plants growed up.",
        "example": "The plants were grown in a Lemna-Tec greenhouse under constant conditions.",
        "format": "",
        "cardinality": "0-1"
    }
]