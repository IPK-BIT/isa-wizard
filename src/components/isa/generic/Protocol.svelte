<script lang="ts">

    let {
        attr = '',
        componentConfig = {},
        label = 'Protocol',
        value: protocol = $bindable(),
    } = $props();

    </script>

    <pre>{JSON.stringify(protocol)}</pre>