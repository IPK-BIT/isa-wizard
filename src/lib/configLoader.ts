import { fieldTypes } from './config/mapping';
import type { WizardConfig } from './types/Config';

/**
 * Configuration loader for the ISA Wizard
 * Supports loading from URLs and inline JSON objects
 */

export class ConfigLoader {
	/**
	 * Load configuration from a URL or inline object
	 * @param source - URL string or WizardConfig object
	 * @returns Promise<WizardConfig>
	 */
	static async load(source: string | WizardConfig): Promise<WizardConfig> {
		try {
			// If source is already a config object, validate and return it
			if (typeof source === 'object' && source !== null) {
				this.validate(source);
				return source as WizardConfig;
			}

			// If source is a string, treat it as a URL
			if (typeof source === 'string') {
				const response = await fetch(source);
				if (!response.ok) {
					throw new Error(
						`Failed to load config from ${source}: ${response.status} ${response.statusText}`
					);
				}
				const config = await response.json();
				this.validate(config);
				return config as WizardConfig;
			}

			throw new Error('Invalid configuration source');
		} catch (error) {
			if (error instanceof Error) {
				throw new Error(`Config loading failed: ${error.message}`);
			}
			throw error;
		}
	}

	/**
	 * Validate configuration schema
	 * @param config - Configuration to validate
	 * @throws Error if validation fails
	 */
	private static validate(config: any): void {
		if (!config || typeof config !== 'object') {
			throw new Error('Configuration must be an object');
		}

		if (!config.general.name || typeof config.general.name !== 'string') {
			throw new Error('Configuration must have a name (string)');
		}

		if (!Array.isArray(config.steps)) {
			throw new Error('Configuration must have steps (array)');
		}

		if (config.steps.length === 0) {
			throw new Error('Configuration must have at least one step');
		}

		config.steps.forEach((step: any, index: number) => {
			if (!step.title || typeof step.title !== 'string') {
				throw new Error(`Step ${index} must have a title (string)`);
			}

			if (step.fields) {
				step.fields.forEach((field: any, fieldIndex: number) => {
					if (!field.label || typeof field.label !== 'string') {
						throw new Error(`Step ${index}, field ${fieldIndex} must have a label (string)`);
					}

					if (!field.type || !Object.keys(fieldTypes).includes(field.type)) {
						throw new Error(`Step ${index}, field ${fieldIndex} has invalid type: ${field.type}`);
					}
				});
			}
		});
	}
}
