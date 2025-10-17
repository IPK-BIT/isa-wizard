<script lang="ts">
  import ProtocolComponents from "./ProtocolComponents.svelte";
  import ProtocolParameters from "./ProtocolParameters.svelte";
  import String from "./String.svelte";
  import Textarea from "./Textarea.svelte";

  let { attr = "", componentConfig = {}, label = "Protocol", value: protocol = $bindable() } = $props();
</script>

<String label={"Name"} attr="DM-12" bind:value={protocol[0].name} />

<Textarea label={"Description"} attr="DM-67" bind:value={protocol[0].description} />

<String label={"URI"} attr="DM-66" bind:value={protocol[0].uri} />

<ProtocolParameters bind:value={protocol[0].parameters} attr="DM-68" />

<ProtocolComponents bind:value={protocol[0].components} attr="DM-69" />

<String label={"Version"} attr="" bind:value={protocol[0].version} />
