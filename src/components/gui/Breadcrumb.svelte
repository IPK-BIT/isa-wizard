<script>
    import { isaObj } from "@/stores/isa";
    import { simpleGuiBreadcrumb, simpleGuiLevel } from "@/stores/wizard";
</script>

<nav aria-label="breadcrumb">
    <ol class="breadcrumb">
    <!-- svelte-ignore a11y-click-events-have-key-events -->
    <!-- svelte-ignore a11y-no-static-element-interactions -->
    <!-- svelte-ignore a11y-missing-attribute -->
    {#each $simpleGuiBreadcrumb as crumb, idx}
    {#if idx===$simpleGuiBreadcrumb.length-1}
        <li class="breadcrumb-item active"><a>{crumb.name}</a></li>
    {:else}
        <li class="breadcrumb-item">
        <a on:click={() => { $simpleGuiBreadcrumb = $simpleGuiBreadcrumb.slice(0, idx + 1); crumb.fn(); }}> {crumb.name}
        </a>
        </li>
    {/if}
    {/each}
    </ol>
</nav>

<style>
    .breadcrumb {
        display: flex;
        flex-wrap: wrap;
        padding: 0.75rem 1rem;
        margin-bottom: 1rem;
        list-style: none;
        background-color: #f8f9fa;
        border-radius: 0.375rem;
    }

    .breadcrumb-item {
        margin-right: 0.5rem;
        color: hsl(145, 83%, 28%)
    }

    .breadcrumb-item.active {
        color: #848484;
    }

    .breadcrumb-item::before {
        content: ">";
        margin-right: 0.5rem;
        color: #848484;
    }
    .breadcrumb-item:first-child::before {
        content: "";
    }
</style>

