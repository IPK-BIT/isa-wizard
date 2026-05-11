/**
 * Configuration schema for the ISA Wizard widget
 */

export interface FieldConfig {
	label: string;
	type: string;
	isaMapping: { jsonPath: string };
	explanation: string;
}

export interface StepConfig {
	title: string;
	texts?: string[];
	fields?: FieldConfig[];
	component?: string;
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

export interface WizardConfig {
	general: GeneralConfig;
	steps: StepConfig[];
	submitButtonLabel?: string;
	cancelButtonLabel?: string;
}

export interface FormResponse {
	[key: string]: string | number | boolean | null;
}

export interface WizardFinishData {
	responses: FormResponse;
	timestamp: number;
}
