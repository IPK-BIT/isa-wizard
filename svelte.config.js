/** @type {import("@sveltejs/vite-plugin-svelte").SvelteConfig} */
export default {
	compilerOptions: {
		// Compile *.ce.svelte files as native custom elements; everything else stays a normal component.
		customElement: (options) => options.filename.endsWith('.ce.svelte')
	}
};
