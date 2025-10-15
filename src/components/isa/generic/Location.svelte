<script>
    import { isaObj } from "@/stores/isa";
    import { getContext } from "svelte";

    let { label = "", isaLevel = null, attr, value: location = $bindable() } = $props();

    if (!isaLevel) {
        isaLevel = getContext("isaLevel");
    }

    async function geocode() {
        // For development purposes, switch to self-hosted version of nominatim
        let response = await fetch(`https://brapi4psi.ipk-gatersleben.de/search?q=${location}&format=jsonv2`);
        let data = await response.json();
        if (data.length > 0) {
            //TODO: Placement of the coordinates in the ISA object is hardcoded
            $isaObj["studies"][0]["comments"].find((c) => c.name === "Study Longitude").value = data[0].lon;
            $isaObj["studies"][0]["comments"].find((c) => c.name === "Study Latitude").value = data[0].lat;
            $isaObj = $isaObj;
        }
    }
</script>

<div class="grid padding">
    <p class="padding">{label}</p>

    <div class="padding input-container">
        <input data-isaLevel={isaLevel} data-attr={attr} type="text" bind:value={location} />
        {#if location}
            <button aria-label="geocode button" class="btn" title="Geocode" onclick={geocode}>
                <svg
                    fill="#fff"
                    height="20px"
                    width="20px"
                    version="1.1"
                    id="Capa_1"
                    xmlns="http://www.w3.org/2000/svg"
                    xmlns:xlink="http://www.w3.org/1999/xlink"
                    viewBox="0 0 425.515 425.515"
                    xml:space="preserve"
                >
                    <g>
                        <path
                            d="M238.315,121.938c-10.834-10.834-25.238-16.8-40.56-16.8s-29.726,5.966-40.559,16.8
                            c-10.834,10.834-16.801,25.238-16.801,40.559s5.967,29.726,16.801,40.559c10.833,10.834,25.238,16.8,40.559,16.8
                            c12.791,0,24.934-4.172,34.903-11.849l25.088,25.088c1.465,1.465,3.384,2.197,5.304,2.197c1.919,0,3.839-0.732,5.304-2.197
                            c2.929-2.929,2.929-7.677,0-10.606l-25.089-25.089c7.677-9.969,11.849-22.112,11.849-34.903
                            C255.115,147.176,249.149,132.772,238.315,121.938z M167.803,192.45c-8.001-8.001-12.407-18.638-12.407-29.953
                            c0-11.314,4.406-21.952,12.407-29.953c8-8.001,18.638-12.407,29.953-12.407c11.315,0,21.952,4.406,29.952,12.407
                            c8.001,8,12.407,18.638,12.407,29.952c0,11.315-4.406,21.952-12.407,29.953c-8,8.001-18.637,12.407-29.952,12.407
                            C186.441,204.857,175.804,200.451,167.803,192.45z"
                        />
                        <path
                            d="M298.883,112.326c0,1.945,0.797,3.94,2.2,5.3c2.813,2.897,7.787,2.897,10.6,0c2.901-2.82,2.901-7.779,0-10.6
                            c-2.814-2.899-7.785-2.899-10.6,0C299.68,108.387,298.883,110.381,298.883,112.326z"
                        />
                        <path
                            d="M324.577,129.027c-1.648-3.8-6.066-5.545-9.865-3.896c-3.8,1.648-5.545,6.065-3.896,9.865
                            c8.432,19.44,10.88,40.782,7.081,61.72c-3.887,21.417-14.109,40.906-29.563,56.359c-20.176,20.176-47.001,31.287-75.534,31.287
                            s-55.358-11.111-75.534-31.287s-31.287-47.001-31.287-75.534s11.111-55.358,31.287-75.534
                            c19.862-19.862,46.266-30.971,74.347-31.281c28.029-0.314,54.634,10.165,74.892,29.494c2.998,2.86,7.746,2.747,10.604-0.249
                            c2.86-2.997,2.748-7.744-0.248-10.604c-23.105-22.046-53.446-33.991-85.413-33.641C179.421,56.081,149.31,68.75,126.659,91.4
                            c-23.009,23.009-35.681,53.601-35.681,86.141s12.671,63.132,35.681,86.14c23.009,23.009,53.601,35.681,86.14,35.681
                            s63.131-12.672,86.141-35.681c17.622-17.622,29.28-39.853,33.715-64.287C336.986,175.53,334.192,151.197,324.577,129.027z"
                        />
                        <path
                            d="M338.341,52.001L338.341,52.001C304.807,18.467,260.223,0,212.8,0S120.792,18.468,87.259,52.001
                            c-33.533,33.533-52.001,78.117-52.001,125.54s18.468,92.007,52.001,125.54l120.237,120.237c1.406,1.406,3.314,2.197,5.303,2.197
                            c1.989,0,3.897-0.79,5.303-2.197l120.238-120.237C407.563,233.858,407.563,121.224,338.341,52.001z M327.733,292.475
                            L212.799,407.409L97.866,292.475c-30.7-30.7-47.607-71.518-47.607-114.934S67.166,93.307,97.866,62.607
                            C129.553,30.92,171.176,15.076,212.8,15.076c41.623,0,83.247,15.844,114.934,47.531C391.107,125.982,391.107,229.1,327.733,292.475
                            z"
                        />
                    </g>
                </svg>
            </button>
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

    .input-container {
        display: flex;
        gap: 4px;
        justify-content: center;
        align-items: center;
    }

    .input-container input {
        flex-grow: 1;
    }

    .input-container button {
        padding: 6px;
    }
</style>
