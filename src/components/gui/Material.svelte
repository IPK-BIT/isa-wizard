<script lang="ts">
  import Pagination from "./Pagination.svelte";
  import Breadcrumb from "./Breadcrumb.svelte";
  import type { Material } from "@/lib/schemas/types_isa";

  let { value: materials }: { value: Material[] } = $props();

  let pageSize = $state(10); // Default page size, can be adjusted as needed
  let currentPage = $state(0); // Current page index, starts from 0
</script>

<h3>Materials</h3>
<Breadcrumb />

<table id="materials">
  <thead>
    <tr>
      <th><strong>Material Name</strong></th>
      {#each materials[0].characteristics as characteristic}
        <th
          ><strong
            >{characteristic?.category?.characteristicType?.annotationValue ?? "-"} ({characteristic?.category?.characteristicType?.termAccession ??
              "-"})</strong
          ></th
        >
      {/each}
    </tr>
  </thead>
  {#each materials as material, idx}
    {#if idx >= currentPage * pageSize && idx < (currentPage + 1) * pageSize}
      <tbody>
        <tr>
          <td>{material?.name ?? "-"}</td>
          {#each material.characteristics as characteristic}
            <td>{characteristic?.value ?? "-"}</td>
          {/each}
        </tr>
      </tbody>
    {/if}
  {/each}
</table>

<Pagination bind:currentPage bind:pageSize totalCount={materials.length} />

<style>
  table#materials {
    border-collapse: collapse;
    overflow: auto;
    display: block;
  }

  table#materials > tbody > tr > td {
    padding: 5px 40px 5px 5px;
    border-top: 1px solid rgb(200, 200, 200);
  }

  table#materials tr th {
    padding: 5px 40px 5px 5px;
    font-weight: 500;
    text-align: left;
  }
</style>
