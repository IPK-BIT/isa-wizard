<script lang="ts">
    let { label = "", value = $bindable(), componentConfig } = $props();
</script>

<div class="grid padding">
    <div class="padding label">{label}</div>

    <div class="padding">
        {#if componentConfig && componentConfig.options && componentConfig.options.length > 0}
            <select class="select" bind:value>
                <option value="" disabled>--- Select Platform ---</option>
                {#each componentConfig.options as option}
                    <option value={option}>{option}</option>
                {/each}
            </select>
        {:else}
            <input type="text" bind:value />
        {/if}
    </div>
</div>

<style>
    .grid {
        display: grid;
        grid-template-columns: 20% 80%;
    }

    .padding {
        padding: 8px;
    }

    .label {
        display: flex;
        align-items: center;
    }

    .select {
        padding: 8px;
        min-width: 250px;
    }
</style>
