<script lang="ts">
	import { updateAppstate } from '../../lib/appstate.svelte';
	import { isaObj } from '../../stores/isa';

	function startQuestionnaire() {
		updateAppstate({ mode: 'wizard' });
	}

	function loadIsaJson() {
		const input = document.createElement('input');
		input.type = 'file';
		input.accept = '.json,application/json';

		input.onchange = (event: Event) => {
			const target = event.currentTarget as HTMLInputElement;
			const file = target.files?.[0];

			if (!file) {
				return;
			}

			const reader = new FileReader();
			reader.onload = () => {
				try {
					const parsed = JSON.parse(reader.result as string);
					isaObj.set(parsed);
					updateAppstate({ mode: 'gui' });
				} catch (error) {
					console.error('Failed to parse ISA JSON', error);
				}
			};
			reader.readAsText(file);
		};

		input.click();
	}
</script>

<section class="flex h-[90vh] w-full items-center justify-center">
	<div class="card w-96 bg-base-100 shadow-sm">
		<figure class="p-8 pb-0">
			<img src="/favicon.png" alt="Shoes" />
		</figure>
		<div class="card-body space-y-2">
			<h2 class="mx-auto text-4xl font-bold">ISA Wizard</h2>
			<div class="flex flex-col space-y-1">
				<button class="btn btn-primary" onclick={startQuestionnaire}>Start Questionnaire</button>
				<button class="btn btn-primary" onclick={loadIsaJson}>Load ISA JSON</button>
			</div>
		</div>
	</div>
</section>
