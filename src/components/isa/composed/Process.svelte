<script lang="ts">
	import { getAppstate } from '../../../lib/appstate.svelte';
	import { isaObj } from '../../../stores/isa';
	import type {
		ISAProcessParameterValueSchema,
		ISASourceSchema
	} from '../../../lib/types/isa.generated';
	import Select from '../singleton/Select.svelte';
	import String from '../singleton/String.svelte';
	import Schema from '../../../lib/schemas';
	import ParameterValues from '../collection/ParameterValues.svelte';
	import Modal from '../../layout/Modal.svelte';

	let {
		label = 'Process',
		attr,
		explanation = '',
		value: process = $bindable(),
		showLabel = true,
		onRemove
	} = $props();

	// crop isaLvl to remove assays part if present (e.g. studies[1].assays[0] -> studies[1])
	const rawIsaLvl = getAppstate().isaLvl;
	const isaLvl = typeof rawIsaLvl === 'string' && rawIsaLvl.includes('.assays')
		? rawIsaLvl.slice(0, rawIsaLvl.indexOf('.assays'))
		: rawIsaLvl;

	const materials = isaObj.keyed(getAppstate().isaLvl + '.materials');
	const dataFiles = isaObj.keyed(getAppstate().isaLvl + '.dataFiles');

	const protocols = isaObj.keyed(isaLvl + '.protocols');
	const protocolOptions = $derived.by(() => {
		const protoList = $protocols;
		return Array.isArray(protoList) ? protoList.map((p) => ({ label: p.name, value: p })) : [];
	});

	let selectedInputs = $state<ISASourceSchema[]>([]);
	let selectedOutputs = $state<ISASourceSchema[]>([]);
	const availableSources = $derived.by((): ISASourceSchema[] =>
		Array.isArray($materials.sources) ? $materials.sources : []
	);
	const availableMaterials = $derived.by((): ISASourceSchema[] =>
		Array.isArray($materials.otherMaterials) ? $materials.otherMaterials : []
	);
	const availableSamples = $derived.by((): ISASourceSchema[] =>
		Array.isArray($materials.samples) ? $materials.samples : []
	);

	function openInputsModal() {
		selectedInputs = []
	}

	function openOutputsModal() {
		selectedOutputs = []
	}

	function approveInputsModal() {
		const existingInputs = Array.isArray(process.inputs) ? process.inputs : [];
		const nextInputs = [
			...existingInputs,
			...selectedInputs
		];
		process.inputs = nextInputs;
	}

	function approveOutputsModal() {
		const existingOutputs = Array.isArray(process.outputs) ? process.outputs : [];
		const nextOutputs = [
			...existingOutputs,
			...selectedOutputs
		];
		process.outputs = nextOutputs;
	}

	function updateParameters() {
		const protocolParameters = process.executesProtocol?.parameters;
		if (!Array.isArray(protocolParameters)) {
			process.parameterValues = [];
			return;
		}

		const existingValues: ISAProcessParameterValueSchema[] = Array.isArray(process.parameterValues)
			? process.parameterValues
			: [];
		process.parameterValues = protocolParameters.map((parameter) => {
			const parameterName =
				parameter.parameterName?.termAccession ?? parameter.parameterName?.annotationValue;
			const existingValue = existingValues.find((entry: ISAProcessParameterValueSchema) => {
				const entryName =
					entry.category?.parameterName?.termAccession ??
					entry.category?.parameterName?.annotationValue;
				return entryName === parameterName;
			});

			let emptyParameterValue = Schema.getObjectFromSchema('process_parameter_value');
			emptyParameterValue!.category = parameter;

			return emptyParameterValue;
		});
	}
</script>

<div class="space-y-4 rounded-lg border border-neutral bg-base-200 p-4">
	<String
		label="Name"
		attr="name"
		explanation="The name of the Process"
		bind:value={process.name}
		showLabel={true}
	/>

	<!--FIXME: select appears undefined if ISA Wizard is reloaded with prepopulated ISA JSON-->
	<Select
		label="Protocol"
		attr="executesProtocol"
		explanation="The name of the executed Protocol"
		options={protocolOptions}
		bind:value={process.executesProtocol}
		onChange={updateParameters}
		showLabel={true}
	/>

	<ParameterValues
		label="Parameter Values"
		attr="parameterValues"
		explanation="Values of the Protocol Parameters"
		bind:value={process.parameterValues}
		showLabel={true}
	/>

	<fieldset class="fieldset">
		<legend class="fieldset-legend">Materials</legend>
	<div
		class="border rounded-lg bg-base-100 {process.inputs.length === process.outputs.length ? 'border-base-300' : 'border-error'}"
	>
		<table class="table">
			<thead>
				<tr>
					<th>
						<Modal label="Input" onopen={openInputsModal} onapprove={approveInputsModal}>
							<div class="font-normal">
								<p>Select inputs of this process.</p>
								<table>
									<tbody>
										{#each availableSources as source}
											<tr>
												<td><input type="checkbox" bind:group={selectedInputs} value={source} /></td
												>
												<td>{source.name}</td>
												<td><div class="badge badge-primary">Source</div></td>
											</tr>
										{/each}
										{#each availableMaterials as material}
											<tr>
												<td><input type="checkbox" bind:group={selectedInputs} value={material} /></td
												>
												<td>{material.name}</td>
												<td><div class="badge badge-secondary">Material</div></td>
											</tr>
										{/each}
										{#each availableSamples as sample}
											<tr>
												<td><input type="checkbox" bind:group={selectedInputs} value={sample} /></td
												>
												<td>{sample.name}</td>
												<td><div class="badge badge-accent">Sample</div></td>
											</tr>
										{/each}
										{#each $dataFiles as data}
											<tr>
												<td><input type="checkbox" bind:group={selectedInputs} value={data} /></td
												>
												<td>{data.name}</td>
												<td><div class="badge badge-info">Data</div></td>
											</tr>
										{/each}
									</tbody>
								</table>
							</div>
						</Modal>
					</th>
					<th>
						<Modal label="Output" onopen={openOutputsModal} onapprove={approveOutputsModal}>
							<div class="font-normal">
								<p>Select outputs of this process.</p>
								<table>
									<tbody>
										{#each availableMaterials as material}
											<tr>
												<td><input type="checkbox" bind:group={selectedOutputs} value={material} /></td
												>
												<td>{material.name}</td>
												<td><div class="badge badge-secondary">Material</div></td>
											</tr>
										{/each}
										{#each availableSamples as sample}
											<tr>
												<td><input type="checkbox" bind:group={selectedOutputs} value={sample} /></td
												>
												<td>{sample.name}</td>
												<td><div class="badge badge-accent">Sample</div></td>
											</tr>
										{/each}
										{#each $dataFiles as data}
											<tr>
												<td><input type="checkbox" bind:group={selectedOutputs} value={data} /></td
												>
												<td>{data.name}</td>
												<td><div class="badge badge-info">Data</div></td>
											</tr>
										{/each}
									</tbody>
								</table>
							</div>
						</Modal>
					</th>
				</tr>
			</thead>
			<tbody>
				{#each Array(Math.max(process.inputs.length, process.outputs.length)) as _, i}
					<tr>
						<td>{process.inputs.length > i ? process.inputs[i].name : 'Missing Input'}</td>
						<td>{process.outputs.length > i ? process.outputs[i].name : 'Missing Output'}</td>
					</tr>
				{/each}
			</tbody>
		</table>
	</div>
	</fieldset>
</div>