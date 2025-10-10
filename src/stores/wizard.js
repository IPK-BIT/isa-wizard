import { writable } from 'svelte/store';

export const wizard = writable({
    steps: 0,
    currentStep: 0
});

export const simpleGuiLevel = writable(
    {
        "type": 'Investigation',
        "jsonPath": '',
    }
);

export const simpleGuiBreadcrumb = writable([
])