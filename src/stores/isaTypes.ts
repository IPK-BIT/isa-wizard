// https://isa-specs.readthedocs.io/en/latest/isajson.html#schemas

export type Investigation = {
  title?: string;
  identifier?: string;
  description?: string;
  submissionDate?: Date;
  publicReleaseDate?: Date;
  studies?: any;
  people?: any;
  publications?: Publication[];
  comments?: any[];
};

export type Study = {};

export type Assay = {};

export type Comment = {
  /** URI identifier of the comment */
  "@id"?: string;
  /** Name/key of the comment */
  name: string;
  /** Value/text of the comment */
  value: string;
};

export type Data = {};

export type Factor = {};

export type FactorValue = {};

export type MaterialAttribute = {};

export type MaterialAttribueValue = {};

export type MaterialSchema = {};

export type OntologyAnnotation = {};

export type OntologySourceReference = {};

export type Person = {};

export type ProcessParameterValue = {};

export type Process = {};

export type ProtocolParameter = {};

export type Protocol = {};

export type Publication = {
  title?: string;
  name?: string;
  description?: string;
  authorList?: string;
  doi?: string;
  pubMedID?: string;
};

export type Sample = {};

export type Source = {};
