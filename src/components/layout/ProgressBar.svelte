<script lang="ts">
	let { currentStep, totalSteps } = $props();
</script>

<div class="card mb-4 bg-base-100 p-4 shadow-md">
	<p class="m-0 mb-1.25">Your progress:</p>
	<div class="relative h-6.25 bg-neutral/10">
		<div class="h-full bg-success" style:width={(currentStep / totalSteps) * 100 + '%'}></div>
		<div class="absolute inset-0 flex items-center justify-center text-sm">
			{Math.floor((currentStep / totalSteps) * 100)}%
		</div>
	</div>
</div>
