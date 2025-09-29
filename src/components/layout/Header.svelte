<script lang="ts">
    import { AppState, updateAppState, config } from "../../lib/appstate.svelte";
</script>

<header>
    <button class="logo" onclick={()=>updateAppState(AppState.Init)}>
        {#if config?.general?.name}
            <h1>{config?.general?.name || 'ISA Wizard'}</h1>
            <span></span>
            <img class="poweredby" src="/src/assets/powered-by-isa-wizard.png" alt="Powered by ISA Wizard"/>
        {:else}
            <img src="/src/assets/logo.png" alt="ISA Wizard"/>
            <h1>ISA Wizard</h1>
        {/if}
    </button>
</header>

<style>
    header {
        grid-area: 1 / 1 / 1 / 4;
        background: white;
        border-bottom: 2px solid rgb(150,150,150);
        box-shadow: 0px 5px 5px rgba(0,0,0,0.2);
    }

    button.logo {
        all: unset;
        cursor: pointer;
        display: flex;
        align-items: center;
        gap: 1rem;
        margin-left: 1rem;
    }

    button.logo img {
        width: 40px;
    }

    button.logo img.poweredby {
        width: 6rem;
    }

    button.logo h1 {
        font-size: 1.5rem;
        font-weight: 500;
        color: black;
    }

    button span {
        height: 2rem; 
        width: 2px; 
        background: #ccc; 
        display: inline-block; 
        margin: 0 0.5rem;
    }
</style>