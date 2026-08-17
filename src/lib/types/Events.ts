import type { WizardFinishData } from './Config';

/**
 * Event types and interfaces for the ISA Wizard widget
 */

export type FinishCallback = (data: WizardFinishData) => void | Promise<void>;
export type ErrorCallback = (error: Error) => void | Promise<void>;

export interface WizardEvents {
	finish: CustomEvent<WizardFinishData>;
	error: CustomEvent<{ error: Error }>;
	stepChanged: CustomEvent<{ stepIndex: number }>;
	loaded: CustomEvent<void>;
}
