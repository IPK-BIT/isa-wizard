import { mount, unmount } from 'svelte';
import ISAWizard from './ISAWizard.svelte';
import type { WizardConfig, WizardFinishData } from './lib/types/Config';
import type { FinishCallback } from './lib/types/Events';

/**
 * ISA Wizard Web Component
 * Can be used as: <isa-wizard config-url="config.json" onfinish="callback"></isa-wizard>
 */
class ISAWizardElement extends HTMLElement {
	private widgetShadowRoot: ShadowRoot | null = null;
	private component: any = null;
	private onFinishCallback: FinishCallback | undefined;

	constructor() {
		super();
	}

	connectedCallback() {
		// Create shadow DOM for style encapsulation
		this.widgetShadowRoot = this.attachShadow({ mode: 'open' });

		// Create a container div for the Svelte component
		const container = document.createElement('div');
		container.id = 'widget-container';
		this.widgetShadowRoot.appendChild(container);

		// Get config from attributes or properties
		const configUrl = this.getAttribute('config-url') || this.getAttribute('configUrl');
		const configAttr = this.getAttribute('config');
		let config: WizardConfig | undefined;

		try {
			if (configAttr) {
				config = JSON.parse(configAttr);
			}
		} catch (e) {
			console.error('Failed to parse config attribute:', e);
		}

		// Get onFinish callback from property or attribute
		this.onFinishCallback = (this as any).onFinish;

		// Mount Svelte component
		this.component = mount(ISAWizard, {
			target: container,
			props: {
				config,
				configUrl: configUrl || undefined,
				onFinish: async (data: WizardFinishData) => {
					this.dispatchEvent(
						new CustomEvent('finish', {
							detail: data,
							bubbles: true,
							composed: true
						})
					);

					if (this.onFinishCallback) {
						await this.onFinishCallback(data);
					}
				}
			}
		});
	}

	disconnectedCallback() {
		// Clean up component
		if (this.component) {
			unmount(this.component);
			this.component = null;
		}

		// Clear shadow DOM
		if (this.widgetShadowRoot) {
			this.widgetShadowRoot.innerHTML = '';
			this.widgetShadowRoot = null;
		}
	}

	/**
	 * Set or update the configuration
	 */
	setConfig(config: WizardConfig | string) {
		if (!this.component) return;

		if (typeof config === 'string') {
			// If it's a URL, update configUrl prop
			this.component.$set({ configUrl: config, config: undefined });
		} else {
			// If it's an object, update config prop
			this.component.$set({ config, configUrl: undefined });
		}
	}

	/**
	 * Get current responses
	 */
	getResponses() {
		// This would require exposing state from Svelte component
		// For now, this is handled via the finish event
		return null;
	}

	/**
	 * Observed attributes for attribute change detection
	 */
	static get observedAttributes() {
		return ['config-url', 'config', 'onfinish'];
	}

	/**
	 * Handle attribute changes
	 */
	attributeChangedCallback(name: string, oldValue: string | null, newValue: string | null) {
		if (oldValue === newValue) return;

		switch (name) {
			case 'config-url':
				this.setConfig(newValue || '');
				break;
			case 'config':
				try {
					if (newValue) {
						const config = JSON.parse(newValue);
						this.setConfig(config);
					}
				} catch (e) {
					console.error('Failed to parse config attribute:', e);
				}
				break;
		}
	}
}

/**
 * Register the custom element
 */
if (!customElements.get('isa-wizard')) {
	customElements.define('isa-wizard', ISAWizardElement);
}

/**
 * Export for both Web Component and programmatic usage
 */
export { ISAWizardElement };
export default ISAWizardElement;
