// https://isa-specs.readthedocs.io/en/latest/isajson.html#schemas

// ISA Model Types (simplified, generated from JSON Schemas)
// Note: Follow ISA content rules at the end of the ISA-JSON specification.
// Comments MUST have a name, Dates should use ISO8601 format ("YYYY-MM-DD")

// ---------- Basic Types ----------
export type Comment = {
  "@id"?: string;
  name: string; // MUST be present according to ISA rules
  value?: string;
};

export type OntologyAnnotation = {
  "@id"?: string;
  annotationValue?: string | number;
  termSource?: string; // SHOULD correspond to ontologySourceReference
  termAccession?: string;
  comments?: Comment[];
};

export type OntologySourceReference = {
  description?: string;
  file?: string;
  name?: string; // MUST contain Term Source Name
  version?: string;
  comments?: Comment[];
};

// ---------- Core Entity Types ----------
export type Publication = {
  pubMedID?: string;
  doi?: string;
  authorList?: string;
  title?: string;
  status?: OntologyAnnotation;
  comments?: Comment[];
};

export type Person = {
  "@id"?: string;
  lastName?: string;
  firstName?: string;
  midInitials?: string;
  email?: string;
  phone?: string;
  fax?: string;
  address?: string;
  affiliation?: string;
  roles?: OntologyAnnotation[];
  comments?: Comment[];
};

export type Factor = {
  "@id"?: string;
  factorName?: string;
  factorType?: OntologyAnnotation;
  comments?: Comment[];
};

export type FactorValue = {
  "@id"?: string;
  category?: Factor;
  value?: OntologyAnnotation | string | number;
  unit?: OntologyAnnotation;
};

export type MaterialAttribute = {
  "@id"?: string;
  characteristicType?: OntologyAnnotation;
};

export type MaterialAttributeValue = {
  "@id"?: string;
  category?: MaterialAttribute;
  value?: OntologyAnnotation | string | number;
  unit?: OntologyAnnotation;
};

export type Material = {
  "@id"?: string;
  name?: string;
  type?: "Extract Name" | "Labeled Extract Name";
  characteristics?: MaterialAttributeValue[];
  derivesFrom?: Material[];
};

export type Source = {
  "@id"?: string;
  name?: string;
  characteristics?: MaterialAttributeValue[];
};

export type Sample = {
  "@id"?: string;
  name?: string;
  characteristics?: MaterialAttributeValue[];
  factorValues?: FactorValue[];
  derivesFrom?: Source[];
};

export type DataFile = {
  "@id"?: string;
  name?: string;
  type?: "Raw Data File" | "Derived Data File" | "Image File";
  comments?: Comment[];
};

// ---------- Protocol and Process ----------
export type ProtocolParameter = {
  "@id"?: string;
  parameterName?: OntologyAnnotation;
  comments: Comment[];
};

export type ProtocolComponent = {
  componentName?: string;
  componentType?: OntologyAnnotation;
};

export type Protocol = {
  "@id"?: string;
  name?: string; // SHOULD have a name
  protocolType?: OntologyAnnotation;
  description?: string;
  uri?: string;
  version?: string;
  parameters?: ProtocolParameter[];
  components?: ProtocolComponent[];
  comments?: Comment[];
};

export type ProcessParameterValue = {
  category?: ProtocolParameter;
  value?: OntologyAnnotation | string | number;
  unit?: OntologyAnnotation;
};

export type Process = {
  "@id"?: string;
  name?: string;
  executesProtocol?: Protocol;
  parameterValues?: ProcessParameterValue[];
  performer?: string;
  date?: string; // ISO8601 date
  previousProcess?: Process;
  nextProcess?: Process;
  inputs?: (Source | Sample | DataFile | Material)[];
  outputs?: (Sample | DataFile | Material)[];
  comments?: Comment[];
};

// ---------- Study and Assay ----------
export type Assay = {
  "@id"?: string;
  filename?: string; // SHOULD be present
  measurementType?: OntologyAnnotation;
  technologyType?: { ontologyAnnotation?: OntologyAnnotation };
  technologyPlatform?: string;
  dataFiles?: DataFile[];
  materials?: {
    samples?: Sample[];
    otherMaterials?: Material[];
  };
  characteristicCategories?: MaterialAttribute[];
  unitCategories?: OntologyAnnotation[];
  processSequence?: Process[];
  comments?: Comment[];
};

export type Study = {
  "@id"?: string;
  filename?: string; // SHOULD be present
  identifier?: string;
  title?: string;
  description?: string;
  submissionDate?: string; // ISO8601 date
  publicReleaseDate?: string; // ISO8601 date
  publications?: Publication[];
  people?: Person[];
  studyDesignDescriptors?: OntologyAnnotation[];
  protocols?: Protocol[];
  materials?: {
    sources?: Source[];
    samples?: Sample[];
    otherMaterials?: Material[];
  };
  processSequence?: Process[];
  assays?: Assay[];
  factors?: Factor[];
  characteristicCategories?: MaterialAttribute[];
  unitCategories?: OntologyAnnotation[];
  comments?: Comment[];
};

// ---------- Root Investigation ----------
export type Investigation = {
  "@id"?: string;
  filename?: string;
  identifier?: string;
  title?: string;
  description?: string;
  submissionDate?: string; // ISO8601
  publicReleaseDate?: string; // ISO8601
  ontologySourceReferences?: OntologySourceReference[];
  publications?: Publication[];
  people?: Person[];
  studies?: Study[];
  comments?: Comment[];
};

// ---------- ISA Rules Summary ----------
// - Comments MUST have a name.
// - Dates SHOULD be in ISO8601 format (YYYY-MM-DD).
// - Protocols, Parameters, and Factors SHOULD have names.
// - Ontology Source References MUST contain a Term Source Name.
// - All references (e.g., termSource) SHOULD link to declared OntologySourceReferences.
// - Files SHOULD include filename where specified.
