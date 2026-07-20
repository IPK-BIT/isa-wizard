<script lang="ts">
	let {
		label = 'Sample',
		attr,
		explanation = '',
		value = $bindable(),
		showLabel = true,
		onRemove
	} = $props();
</script>

<pre>{JSON.stringify(value, null, 2)}</pre>
