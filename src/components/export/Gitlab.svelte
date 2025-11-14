<script lang="ts">
    import {
        getUserNamespaces,
        createProject,
        createCommitFromArc,
        type Namespace,
        ApiError,
        getExistingProjects,
        sanitizeProjectName,
    } from "@/lib/gitlab";
    import { gitlab_response } from "@/stores/gitlab-api";
    import { isaObj } from "@/stores/isa";
    import { arcReadyISA } from "@/utils/arcExport";
    import { onMount } from "svelte";

    type LogEntry = {
        message: string;
        success?: "SUCCESS" | "FAIL";
        urlToRepo?: string;
    };

    let logger = $state<LogEntry[]>([]);

    let { auth_config } = $props();

    let namespaces: Namespace[] = $state([]);
    let namespaceId: string = $state("");
    let isExporting = $state(false);

    onMount(async () => {
        namespaces = (await getUserNamespaces(auth_config, $gitlab_response.access_token)) ?? [];
        if (namespaces.length > 0) {
            namespaceId = String(namespaces[0].id);
        }
    });

    /**
     * Export ISA Obj to Arc Format and create a new Gitlab project when the user is logged in
     * First sanitize the project name and
     */
    async function tryExport() {
        try {
            logger = []; // Reset first old log state
            isExporting = true; // for ui state
            logger.push({ message: "Started Exporting ISA..." });
            const cleanISA = arcReadyISA($isaObj);
            const projectName = sanitizeProjectName(cleanISA.title ?? "");
            if (projectName !== $isaObj.title) {
                logger.push({ message: `Project name ${$isaObj.title} was sanitized to ${projectName}` });
                $isaObj.title = projectName;
            }
            cleanISA.title = projectName;
            logger.push({ message: `Checking for existing projects...` });
            const projects = await getExistingProjects(auth_config, $gitlab_response.access_token);

            if (
                projects.find((p) => {
                    return p.name === projectName;
                })
            ) {
                throw new Error(`Project name ${projectName} already exists`);
            }

            let body = {
                name: projectName,
                namespace_id: Number(namespaceId),
                initialize_with_readme: false,
                visibility: "private" as const,
            };

            const project = await createProject(auth_config, $gitlab_response.access_token, body);
            logger.push({ message: "Project was created..." });
            let commit = await createCommitFromArc(auth_config, $gitlab_response.access_token, project, cleanISA);
            logger.push({ message: "Project was commited: " + commit.message, urlToRepo: project.http_url_to_repo, success: "SUCCESS" });
        } catch (error: any) {
            if (error instanceof ApiError) {
                console.error(`API-Error ${error.status}: ${error.message}`, error.details);
                logger.push({ message: "API Error: " + error.message, success: "FAIL" });
            } else {
                console.error(error);
                logger.push({ message: "Error: " + error.message, success: "FAIL" });
            }
        } finally {
            isExporting = false;
        }
    }
</script>

<div class="container grid">
    <div class="export-container">
        <span>Namespace</span>
        <select bind:value={namespaceId}>
            <option value="" disabled selected>--- Select name ---</option>
            {#each namespaces as namespace}
                <option value={String(namespace.id)}>{namespace.name}</option>
            {/each}
        </select>

        <button class="btn btn-huge" class:disabled={isExporting} onclick={() => tryExport()}>Export</button>
    </div>
    {#if logger.length > 0}
        <div class="log-container">
            <ul>
                {#each logger as log}
                    {#if log.success === "SUCCESS"}
                        <li style="color: green;">{log.message}</li>
                        <a target="_blank" href={log.urlToRepo}>{log.urlToRepo}</a>
                    {:else if log.success === "FAIL"}
                        <li style="color: red;">{log.message}</li>
                    {:else}
                        <li>{log.message}</li>
                    {/if}
                {/each}
            </ul>
        </div>
    {/if}
</div>

<style>
    .btn-huge {
        padding: 1rem 2rem;
        width: 10rem;
    }

    .container {
        flex-grow: 1;
        gap: 1em;
        display: flex;
        align-items: end;
        width: 100%;
        min-width: 100%;
    }

    .grid {
        display: flex;
        flex-direction: column;
    }

    .log-container {
        display: flex;
        justify-content: start;
        width: 100%;
        min-width: 500px;
        max-width: 500px;
    }

    .export-container {
        width: 100%;
        display: flex;
        justify-content: end;
        align-items: center;
        gap: 8px;
    }

    .container > div > select {
        padding: 6px 4px;
        min-width: 200px;
    }

    .disabled {
        background-color: #ccc;
    }
</style>
