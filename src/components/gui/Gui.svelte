<script>
    import Investigation from "./Investigation.svelte";
    import Exports from "../export/Exports.svelte";
    import Wrapper from "./Wrapper.svelte";

    import { simpleGuiBreadcrumb, simpleGuiLevel } from "@/stores/wizard";
    import Study from "./Study.svelte";
    import { isaObj } from "@/stores/isa";
    import Material from "./Material.svelte";
    import Sample from "./Sample.svelte";
    import Protocol from "./Protocol.svelte";
    import Process from "./Process.svelte";

    const component = {
        "Investigation": Investigation,
        "Study": Study,
        "Protocol": Protocol,
        "Material": Material,
        "Sample": Sample,
        "Process": Process
    }

    $simpleGuiBreadcrumb = [
        { name: $isaObj.title?$isaObj.title:'Untitled Investigation', fn: () => $simpleGuiLevel = { type: 'Investigation', jsonPath: '' } }
    ];

    $simpleGuiLevel = {
        type: 'Investigation',
        jsonPath: ''
    };

</script>

<Wrapper
    component={component[$simpleGuiLevel.type]}
    jsonPath={$simpleGuiLevel.jsonPath}
/>

<Exports/>