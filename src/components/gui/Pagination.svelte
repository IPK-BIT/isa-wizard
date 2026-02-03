<script lang="ts">
  let { currentPage = $bindable(), pageSize = $bindable(), totalCount } = $props();
</script>

<div class="pagination">
  <button class="btn" onclick={() => (currentPage = Math.max(0, currentPage - 1))} disabled={currentPage === 0}> Previous </button>
  <span>Page {currentPage + 1} of {Math.ceil(totalCount / pageSize)}</span>
  <button class="btn" onclick={() => (currentPage = Math.min(Math.ceil(totalCount / pageSize) - 1, currentPage + 1))} disabled={currentPage >= Math.ceil(totalCount / pageSize) - 1}> Next </button>
</div>

<style>
  .pagination {
    display: flex;
    justify-content: center;
    align-items: center;
    margin: 20px 0;
  }

  .pagination button {
    padding: 8px 12px;
    margin: 0 5px;
    cursor: pointer;
  }

  .pagination button:disabled {
    background-color: #ccc;
    cursor: not-allowed;
  }
  .pagination span {
    margin: 0 10px;
  }
</style>
