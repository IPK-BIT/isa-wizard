<script lang="ts">
  import ProtocolParameters from "./ProtocolParameters.svelte";
  import String from "./String.svelte";
  import Textarea from "./Textarea.svelte";

  let { attr = "", componentConfig = {}, label = "Protocol", value: protocol = $bindable() } = $props();

</script>

<String label={"Name"} attr="name" bind:value={protocol[0].name} />

<Textarea label={"Description"} attr="description" bind:value={protocol[0].description} />

<String label={"URI"} attr="uri" bind:value={protocol[0].uri} />

<ProtocolParameters bind:value={protocol[0].parameters} />

<String label={"Version"} attr="" bind:value={protocol[0].version} />






