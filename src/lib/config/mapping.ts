import People from '../../components/isa/collection/People.svelte';
import Publications from '../../components/isa/collection/Publications.svelte';
import Date from '../../components/isa/singleton/Date.svelte';
import License from '../../components/isa/singleton/License.svelte';
import OntologyAnnotation from '../../components/isa/singleton/OntologyAnnotation.svelte';
import String from '../../components/isa/singleton/String.svelte';
import Textarea from '../../components/isa/singleton/Textarea.svelte';

export const fieldTypes = {
	date: Date,
	license: License,
	ontologyAnnotation: OntologyAnnotation,
	text: String,
	textarea: Textarea
};

export const componentTypes = {
	publications: Publications,
	people: People
};
