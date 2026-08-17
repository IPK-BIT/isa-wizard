import { defineConfig } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';
import path from 'path';

// https://vite.dev/config/
export default defineConfig({
	plugins: [svelte()],
	resolve: {
		alias: {
			"$components": path.resolve(__dirname, './src/components')
		}
	},
	build: {
		lib: {
			entry: path.resolve(__dirname, 'src/web-component.ts'),
			name: 'ISAWizard',
			formats: ['es', 'umd'],
			cssFileName: 'style',
			fileName: (format) => {
				if (format === 'es') {
					return 'widget.mjs';
				} else if (format === 'umd') {
					return 'widget.umd.js';
				}
				return 'widget.js';
			}
		},
		cssCodeSplit: false,
		minify: 'terser'
	}
});
