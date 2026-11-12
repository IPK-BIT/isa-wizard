import type { ISAInvestigationSchema } from './isa.generated';

/**
 * Configuration schema for the ISA Wizard widget
 */

export interface FieldConfig {
	label: string;
	type: string;
	isaMapping: {
		jsonPath: string;
		/** The field is stored in the comment of this name inside the `jsonPath` array */
		commentName?: string;
		/**
		 * For composed fields that edit several comments together (e.g. `coordinates`):
		 * the comment name of each part, keyed by the part's name.
		 */
		commentNames?: Record<string, string>;
	};
	explanation: string;
	metabuddy?: boolean;
	/**
	 * Predefined value, written once when the entity is created from the template. Plain ISA JSON,
	 * for fields with `commentNames` an object keyed by the part's name.
	 */
	default?: unknown;
	/** The field is read-only */
	locked?: boolean;
}

export interface ComponentConfig {
	type: string;
	isaMapping: { jsonPath: string };
	label?: string;
	explanation?: string;
	/** Opt-in per component. `convert` shows a file import under it (needs `features.convert`). */
	metabuddy?: { convert?: boolean };
	/** Predefined ISA JSON (usually an array), written once when the entity is created. */
	default?: unknown;
	/** The predefined items (the first `default.length` ones) cannot be removed. */
	locked?: boolean;
	/**
	 * For the `entities` component: the column headers of the downloadable CSV template, per
	 * entity list. Without an entry, the list offers no template download.
	 */
	templateHeaders?: EntityTemplateHeaders;
	/** For the `entities` component: overrides the heading of each entity list. */
	entityLabels?: Partial<Record<keyof EntityTemplateHeaders, string>>;
}

export interface EntityTemplateHeaders {
	sources?: string[];
	materials?: string[];
	samples?: string[];
}

export interface StepConfig {
	title: string;
	texts?: string[];
	fields?: FieldConfig[];
	component?: ComponentConfig;
	jsonPath?: string;
	componentConfig?: Record<string, any>;
}

export interface GeneralConfig {
	name: string;
	layoutMode: 'standalone' | 'plugin';
	initialView: 'init' | 'form' | 'wizard';
	showQuestionnaireProgressBar: boolean;
	showConsole: boolean;
}

export interface TemplateConfig {
	[key: string]: {
		steps: StepConfig[];
		children?: {
			template: string;
			repeatable: boolean;
			isaMapping: { jsonPath: string };
		};
	};
}

export interface MetabuddyConfig {
	baseUrl: string;
	apiKey?: string;
	timeoutMs?: number; // default 60000
	confidenceThreshold?: number; // default 0.7
	maxFileSizeMb?: number; // per uploaded file, default 10
	features: { explain?: boolean; ask?: boolean; convert?: boolean; validate?: boolean };
}

export interface DatahubConfig {
	/** Base URL of the GitLab instance, e.g. `https://git.nfdi4plants.org` */
	url: string;
	/** Client ID of the GitLab OAuth application (non-confidential, PKCE) */
	clientId: string;
	/** OAuth scopes, default `api` (needed to create projects) */
	scope?: string;
	/**
	 * Redirect URI registered in the GitLab OAuth application. Defaults to the host page's URL
	 * without query and hash.
	 */
	redirectUri?: string;
}

export interface WizardConfig {
	general: GeneralConfig;
	integrations: {
		metabuddy?: MetabuddyConfig;
		datahub?: DatahubConfig;
	};
	// steps: StepConfig[];
	rootTemplate: string;
	templates: TemplateConfig;
}

export interface WizardFinishData {
	investigation: ISAInvestigationSchema;
	timestamp: number;
}
