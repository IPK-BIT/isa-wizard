import type { ISAInvestigationSchema } from './isa.generated';

/**
 * Configuration schema for the ISA Wizard widget
 */

export interface FieldConfig {
	label: string;
	type: string;
	isaMapping: { jsonPath: string };
	explanation: string;
	metabuddy?: boolean;
}

export interface ComponentConfig {
	type: string;
	isaMapping: { jsonPath: string };
	label?: string;
	explanation?: string;
	/** Opt-in per component. `convert` shows a file import under it (needs `features.convert`). */
	metabuddy?: { convert?: boolean };
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

export interface WizardConfig {
	general: GeneralConfig;
	integrations: {
		metabuddy?: MetabuddyConfig;
	};
	// steps: StepConfig[];
	rootTemplate: string;
	templates: TemplateConfig;
}

export interface WizardFinishData {
	investigation: ISAInvestigationSchema;
	timestamp: number;
}
