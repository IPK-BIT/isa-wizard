<script lang="ts">
    import { getUserNamespaces, createProject, createCommitFromArc, type Namespace, ApiError } from "@/lib/gitlab";
    import { gitlab_response } from "@/stores/gitlab-api";
    import { isaObj } from "@/stores/isa";
    import { onMount } from "svelte";

    let { auth_config } = $props();

    let namespaces: Namespace[] = $state([]);
    let namespaceId: string = $state("");

    onMount(async () => {
        namespaces = (await getUserNamespaces(auth_config, $gitlab_response.access_token)) ?? [];
        console.log(namespaces);
        if (namespaces.length > 0) {
            namespaceId = String(namespaces[0].id);
        }
    });

    async function tryExport() {
        let body = {
            name: $isaObj.title ?? `MISSING_TITLE_${Date.now()}`,
            namespace_id: Number(namespaceId),
            initialize_with_readme: false,
            visibility: "private" as const,
        };
        try {
            const project = await createProject(auth_config, $gitlab_response.access_token, body);
            let commit = await createCommitFromArc(auth_config, $gitlab_response.access_token, project, $isaObj);
            alert(commit.message);
        } catch (error: any) {
            if (error instanceof ApiError) {
                console.error(`API-Error ${error.status}: ${error.message}`, error.details);
                alert(error.toString());
            } else {
                console.error(error);
            }
        }
    }
</script>

<div class="container">
    <span>Namespace</span>
    <select bind:value={namespaceId}>
        <option value="" disabled selected>--- Select name ---</option>
        {#each namespaces as namespace}
            <option value={String(namespace.id)}>{namespace.name}</option>
        {/each}
    </select>
    <button class="btn btn-huge" onclick={() => tryExport()}>Export</button>
</div>

<style>
    .btn-huge {
        padding: 1rem 2rem;
        width: 10rem;
    }

    .container {
        gap: 1rem;
        display: flex;
        align-items: center;
    }

    .container > select {
        padding: 6px 4px;
        min-width: 200px;
    }
</style>
