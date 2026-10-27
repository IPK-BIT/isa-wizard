/**
 * Types mirroring the schemas in docs/metabuddy/openapi.json.
 * `scope` is a JSON-path-like string (e.g. `studies[0].protocols`), not the lowercase entity
 * name the spec's IsaScope pattern describes.
 */

export type IsaJson = object;

export interface OntologyTerm {
	term?: string;
	uri?: string;
	source?: string;
}

export interface ValidationIssue {
	field?: string;
	severity?: 'error' | 'warning' | 'suggestion';
	message?: string;
	suggestion?: string;
}

export interface ExplainRequest {
	field: string;
	scope: string;
	userQuestion?: string;
	isaJson?: IsaJson;
}

export interface ExplainResponse {
	explanation?: string;
	examples?: string[];
	ontologyTerms?: OntologyTerm[];
}

export interface ValidateRequest {
	isaJson: IsaJson;
	scope: string;
}

export interface ValidateResponse {
	valid?: boolean;
	issues?: ValidationIssue[];
}

export interface ConvertResponse {
	isaJson?: IsaJson;
	/** Field path -> confidence score (0.0-1.0). */
	confidence?: Record<string, number>;
	/** Field paths that could not be inferred and need manual input. */
	warnings?: string[];
}

export interface ErrorResponse {
	error?: string;
	detail?: string;
}

export type MetabuddyErrorKind = 'network' | 'timeout' | 'auth' | 'invalid' | 'server';
