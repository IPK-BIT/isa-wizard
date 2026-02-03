<script lang="ts">
  import { wizardStore } from "@/stores/WizardStore.svelte";
</script>

<nav aria-label="breadcrumb">
  <ol class="breadcrumb">
    {#each wizardStore.simpleGuiBreadcrumb as crumb, idx}
      {#if idx === wizardStore.simpleGuiBreadcrumb.length - 1}
        <li class="breadcrumb-item active">
          <button class="breadcrumb-item active">{crumb.name}</button>
        </li>
      {:else}
        <li class="breadcrumb-item">
          <button
            class="breadcrumb-item inactive"
            onclick={() => {
              wizardStore.simpleGuiBreadcrumb = wizardStore.simpleGuiBreadcrumb.slice(0, idx + 1);
              crumb.fn();
            }}>{crumb.name}</button
          >
        </li>
      {/if}
    {/each}
  </ol>
</nav>

<style>
  .breadcrumb {
    display: flex;
    flex-wrap: wrap;
    padding: 0.75rem 0.5rem;
    margin-bottom: 1rem;
    list-style: none;
    background-color: #f8f9fa;
    border-radius: 0.375rem;
  }

  .breadcrumb-item {
    margin-right: 0.25rem;
    background-color: transparent;
    border: none;
    color: hsl(145, 83%, 28%);
    cursor: pointer;
    font-size: medium;
  }

  .breadcrumb-item.active {
    color: #848484;
    cursor: default;
  }

  .breadcrumb-item::before {
    content: ">";
    margin-right: 0.1rem;
    color: #848484;
  }
  .breadcrumb-item:first-child::before {
    content: "";
  }

  .inactive:hover {
    text-decoration: underline;
  }
</style>
