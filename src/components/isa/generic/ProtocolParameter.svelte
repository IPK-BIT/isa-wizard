<script lang="ts">

  let { value: protocolParameter = $bindable(), remove, index } = $props();

</script>

<div class="container">
  <div>
    <p><strong>Name:</strong> {protocolParameter.parameterName.annotationValue}</p>
  </div>
  <div>
    <label
      >Value:
      <input type="text" bind:value={protocolParameter.comments[0].value} />
    </label>
  </div>
  <div>
    <p>Add unit here...</p>
  </div>
  <div>
    <button type="button" class="btn btn-warning" onclick={() => remove(index)}>Remove</button>
  </div>
</div>

<style>
  .container {
    display: grid;
    grid-template-columns: 1fr auto 1fr auto;
  }
  .container > div {
    min-width: 100%;
    display: flex;
    align-items: center;
    background-color: #f1f1f1;
    border: 1px solid black;
    padding: 5px;
    text-align: center;
  }

  button {
    width: 100px;
    height: 50px;
  }
</style>
