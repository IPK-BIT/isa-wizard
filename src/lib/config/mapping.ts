import OntologyAnnotations from '../../components/isa/collection/OntologyAnnotations.svelte';
import People from '../../components/isa/collection/People.svelte';
import Protocols from '../../components/isa/collection/Protocols.svelte';
import Publications from '../../components/isa/collection/Publications.svelte';
import Entities from '../../components/isa/composed/Entities.svelte';
import Date from '../../components/isa/singleton/Date.svelte';
import License from '../../components/isa/singleton/License.svelte';
import OntologyAnnotation from '../../components/isa/singleton/OntologyAnnotation.svelte';
import String from '../../components/isa/singleton/String.svelte';
import Textarea from '../../components/isa/singleton/Textarea.svelte';
import ProcessSequence from '../../components/isa/collection/ProcessSequence.svelte';
import DataFiles from '../../components/isa/collection/DataFiles.svelte';

export const fieldTypes = {
	date: Date,
	license: License,
	ontologyAnnotation: OntologyAnnotation,
	text: String,
	textarea: Textarea
};

export const componentTypes = {
	publications: Publications,
	people: People,
	'ontology-annotations': OntologyAnnotations,
	protocols: Protocols,
	entities: Entities,
	processes: ProcessSequence,
	data: DataFiles,
};
