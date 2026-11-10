<script lang="ts">
	import { onDestroy, tick } from 'svelte';
	import type * as Leaflet from 'leaflet';
	import Latitude from '$components/isa/singleton/Latitude.svelte';
	import Longitude from '$components/isa/singleton/Longitude.svelte';
	import Altitude from '$components/isa/singleton/Altitude.svelte';
	import { parseDegrees, parsePair } from '$lib/util/coordinates';

	/**
	 * `value` is `{ latitude, longitude, altitude }`, each one a string. The widget does not know
	 * where they are stored (see `commentNames` in the field's `isaMapping`).
	 */
	let {
		label = 'Coordinates',
		attr,
		explanation = '',
		value = $bindable(),
		showLabel = true
	} = $props();

	const displayLabel = $derived(label || attr);

	// Each part is written back as a whole object, so that the store sees a new value
	const get = (key: 'latitude' | 'longitude' | 'altitude') => (): string => value?.[key] ?? '';
	const set = (key: 'latitude' | 'longitude' | 'altitude') => (v: string) => {
		value = { ...value, [key]: v };
	};

	/** Position of the inputs, `undefined` while latitude or longitude is empty or invalid */
	const position = $derived.by(() => {
		const lat = parseDegrees(value?.latitude ?? '', 'latitude');
		const lon = parseDegrees(value?.longitude ?? '', 'longitude');
		return lat.ok && lon.ok
			? ([Number(lat.value), Number(lon.value)] as [number, number])
			: undefined;
	});

	/* Paste */

	let pasted = $state('');
	let pasteError = $state('');

	function applyPaste() {
		if (pasted.trim() === '') {
			pasteError = '';
			return;
		}
		const pair = parsePair(pasted);
		if (!pair.ok) {
			pasteError = pair.error;
			return;
		}
		value = { ...value, latitude: pair.latitude, longitude: pair.longitude };
		pasted = '';
		pasteError = '';
	}

	function handlePasteKeydown(e: KeyboardEvent) {
		if (e.key === 'Enter') {
			e.preventDefault();
			applyPaste();
		}
	}

	/* Map. Leaflet and its CSS are only loaded once the map is opened. */

	let mapOpen = $state(false);
	let mapLoading = $state(false);
	let mapError = $state('');
	let mapEl: HTMLDivElement | undefined = $state();
	let map: Leaflet.Map | undefined;
	let marker: Leaflet.CircleMarker | undefined;
	let L: typeof Leaflet | undefined;

	// Global styles do not reach into the shadow root of the widget, so the Leaflet CSS is added
	// to whatever root the map lives in
	async function injectLeafletCss(root: Node) {
		const target = root instanceof ShadowRoot ? root : document.head;
		if (target.querySelector('style[data-leaflet]')) return;
		const css = (await import('leaflet/dist/leaflet.css?inline')).default;
		const style = document.createElement('style');
		style.dataset.leaflet = '';
		style.textContent = css;
		target.appendChild(style);
	}

	async function openMap() {
		mapOpen = true;
		mapLoading = true;
		mapError = '';
		try {
			await tick();
			if (!mapEl) return;
			await injectLeafletCss(mapEl.getRootNode());
			const mod: any = await import('leaflet');
			L = (mod.default ?? mod) as typeof Leaflet;
			// Closed again while loading
			if (!mapOpen || !mapEl) return;

			map = L.map(mapEl, { worldCopyJump: true }).setView(position ?? [20, 0], position ? 10 : 2);
			L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
				maxZoom: 19,
				attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
			}).addTo(map);

			map.on('click', (e: Leaflet.LeafletMouseEvent) => {
				const { lat, lng } = e.latlng.wrap();
				value = { ...value, latitude: String(round(lat)), longitude: String(round(lng)) };
			});
			map.invalidateSize();
		} catch (err) {
			mapError = 'The map could not be loaded.';
			console.error(err);
		} finally {
			mapLoading = false;
		}
	}

	function closeMap() {
		mapOpen = false;
		map?.remove();
		map = undefined;
		marker = undefined;
	}

	function round(n: number) {
		return Math.round(n * 1e6) / 1e6;
	}

	// Inputs -> map: keep the marker on the typed position
	$effect(() => {
		if (!map || !L) return;
		if (!position) {
			marker?.remove();
			marker = undefined;
			return;
		}
		if (marker) {
			marker.setLatLng(position);
		} else {
			marker = L.circleMarker(position, { radius: 8, weight: 2, fillOpacity: 0.6 }).addTo(map);
		}
		if (!map.getBounds().contains(position)) map.panTo(position);
	});

	onDestroy(() => map?.remove());
</script>

<section>
	<fieldset class="fieldset">
		{#if showLabel}
			<legend class="fieldset-legend">{displayLabel}</legend>
		{/if}

		<div class="grid gap-x-4 sm:grid-cols-3">
			<Latitude attr="latitude" label="Latitude" bind:value={get('latitude'), set('latitude')} />
			<Longitude
				attr="longitude"
				label="Longitude"
				bind:value={get('longitude'), set('longitude')}
			/>
			<Altitude attr="altitude" label="Altitude" bind:value={get('altitude'), set('altitude')} />
		</div>

		<div class="flex w-full items-center space-x-2">
			<input
				type="text"
				class="input w-full {pasteError ? 'input-error' : ''}"
				placeholder={'Paste a position, e.g. 48.8584, 2.2945 or 48°51\'30"N 2°17\'40"E'}
				aria-label="Paste coordinates"
				bind:value={pasted}
				onpaste={() => setTimeout(applyPaste)}
				onchange={applyPaste}
				onkeydown={handlePasteKeydown}
			/>
			<button
				type="button"
				class="btn btn-outline btn-sm"
				aria-expanded={mapOpen}
				onclick={() => (mapOpen ? closeMap() : openMap())}
			>
				{mapOpen ? 'Hide map' : 'Pick on map'}
			</button>
		</div>
		{#if pasteError}
			<p class="label text-error">{pasteError}</p>
		{/if}

		{#if mapOpen}
			<div class="relative">
				<!-- isolation: the map panes use z-indexes up to 1000 and must not cover dropdowns -->
				<div
					bind:this={mapEl}
					class="h-72 w-full rounded-xl border"
					style="isolation: isolate; border-color: color-mix(in oklab, var(--color-base-content) 20%, #0000);"
				></div>
				{#if mapLoading}
					<span class="loading absolute top-2 left-2 loading-sm loading-spinner"></span>
				{/if}
			</div>
			{#if mapError}
				<p class="label text-error">{mapError}</p>
			{:else}
				<p class="label">Click the map to set latitude and longitude.</p>
			{/if}
		{/if}

		<p class="label">{explanation}</p>
	</fieldset>
</section>
