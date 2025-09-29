<script lang="ts">
  import Schema from "@/lib/schemas";
  import String from "./String.svelte";
  import { onMount } from "svelte";

  let { value = $bindable() } = $props();

  function _getParameter(parameterName: string) {
    let parameter = Schema.getObjectFromSchema("protocol_parameter");
    parameter.parameterName = Schema.getObjectFromSchema("ontology_annotation");
    parameter.parameterName.annotationValue = parameterName;

    let commentForValue = Schema.getObjectFromSchema("comment");
    commentForValue.name = "value";
    commentForValue.value = "";
    parameter.comments = [commentForValue];
    return parameter;
  }

  console.log(_getParameter("Temperature"));


</script>


<String label={"Protocol Parameters"} attr="parameters" />
