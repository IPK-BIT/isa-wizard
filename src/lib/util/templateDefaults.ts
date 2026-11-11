import { isaObj } from '$stores/isa';
import Schema from '$lib/schemas';
import type { StepConfig } from '$lib/types/Config';

type PathKey = string | number;

/** `studies[0].title` -> `['studies', 0, 'title']` */
function parsePath(path: string): PathKey[] {
	return [...path.matchAll(/([^.[\]]+)|\[(\d+)\]/g)].map((m) =>
		m[2] !== undefined ? Number(m[2]) : m[1]
	);
}

function setByPath(root: any, path: string, value: unknown) {
	const keys = parsePath(path);
	if (!keys.length) return;
	let target = root;
	keys.forEach((key, i) => {
		if (i === keys.length - 1) {
			target[key] = value;
		} else {
			target[key] ??= typeof keys[i + 1] === 'number' ? [] : {};
			target = target[key];
		}
	});
}

function getByPath(root: any, path: string) {
	return parsePath(path).reduce((obj, key) => obj?.[key], root);
}

/** The config may be a reactive proxy, which `structuredClone` cannot copy */
const clone = <T>(value: T): T => JSON.parse(JSON.stringify(value));

function join(isaLvl: string, relative: string) {
	return isaLvl ? `${isaLvl}.${relative}` : relative;
}

function setComment(root: any, path: string, name: string, value: unknown) {
	const list: any[] = Array.isArray(getByPath(root, path)) ? getByPath(root, path) : [];
	let comment = list.find((c) => c.name === name);
	if (!comment) {
		comment = Schema.getObjectFromSchema('comment');
		comment.name = name;
		list.push(comment);
	}
	comment.value = value;
	setByPath(root, path, list);
}

/**
 * Writes the `default` of every field and component of a template into the ISA document.
 * Meant to run once, when an entity is created from the template, so it never overwrites later
 * edits. `isaLvl` is the path of the entity (`''` for the investigation, `studies[0]`, ...).
 */
export function applyTemplateDefaults(template: { steps?: StepConfig[] } | undefined, isaLvl = '') {
	if (!template?.steps) return;
	isaObj.update((isa) => {
		for (const step of template.steps ?? []) {
			for (const field of step.fields ?? []) {
				if (field.default === undefined) continue;
				const path = join(isaLvl, field.isaMapping.jsonPath);
				const value = clone(field.default);
				if (field.isaMapping.commentNames) {
					for (const [key, name] of Object.entries(field.isaMapping.commentNames)) {
						const part = (value as Record<string, unknown>)?.[key];
						if (part !== undefined) setComment(isa, path, name, part);
					}
				} else if (field.isaMapping.commentName) {
					setComment(isa, path, field.isaMapping.commentName, value);
				} else {
					setByPath(isa, path, value);
				}
			}
			const component = step.component;
			if (component?.default !== undefined) {
				setByPath(isa, join(isaLvl, component.isaMapping.jsonPath), clone(component.default));
			}
		}
		return isa;
	});
}
