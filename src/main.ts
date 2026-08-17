import { mount } from 'svelte';
import './app.css';
import App from './App.svelte';
import './web-component'; // registers <isa-wizard>, used by the demo in index.html

const app = mount(App, {
	target: document.getElementById('app')!
});

export default app;
