/**
 * Public type declarations for the <isa-wizard> web component.
 * Hand-written: the actual entry point is a Svelte custom element, which `tsc`
 * cannot introspect, so this file (not a generated one) is copied to dist/widget.d.ts.
 */

export interface WizardConfig {
	general: {
		name: string;
		layoutMode: 'standalone' | 'plugin';
		initialView: 'init' | 'form' | 'wizard';
		showQuestionnaireProgressBar: boolean;
		showConsole: boolean;
	};
	rootTemplate: string;
	templates: Record<string, unknown>;
}

export interface WizardFinishData {
	/** The full ISA investigation document collected by the wizard. */
	investigation: Record<string, unknown>;
	timestamp: number;
}

export type FinishCallback = (data: WizardFinishData) => void | Promise<void>;
export type ErrorCallback = (error: Error) => void | Promise<void>;

export declare class ISAWizardElement extends HTMLElement {
	config?: WizardConfig;
	configUrl?: string;
	onFinish?: FinishCallback;
	onError?: ErrorCallback;
	/** Returns the current ISA investigation document and a timestamp. */
	getData(): WizardFinishData;
}

export default ISAWizardElement;

declare global {
	interface HTMLElementTagNameMap {
		'isa-wizard': ISAWizardElement;
	}
	interface HTMLElementEventMap {
		finish: CustomEvent<WizardFinishData>;
		error: CustomEvent<{ error: Error }>;
	}
}
