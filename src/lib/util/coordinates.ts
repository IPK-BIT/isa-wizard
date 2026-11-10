/**
 * Parsing and normalisation of geographic coordinates.
 *
 * Latitude / longitude are decimal degrees (the ISO 6709 decimal form, without the CRS suffix),
 * altitude is a number followed by the unit abbreviation `m`.
 */

export type CoordinateKind = 'latitude' | 'longitude';

export type Parsed = { ok: true; value: string } | { ok: false; error: string };

const LIMITS: Record<CoordinateKind, number> = { latitude: 90, longitude: 180 };
const NUMBER = /^[+-]?(\d+([.,]\d*)?|[.,]\d+)$/;

/** Decimal comma and surrounding whitespace are accepted on input */
function toNumber(text: string): number {
	return Number(text.trim().replace(',', '.'));
}

/** Plain number string without a `+`, or trailing zeros (`+048.50` -> `48.5`) */
function format(n: number): string {
	return String(Math.round(n * 1e6) / 1e6 || 0);
}

/**
 * Normalises a latitude / longitude to canonical decimal degrees (`48.8584`, `-2.2945`).
 * Accepts a `+` sign, a decimal comma and a trailing hemisphere letter (`48.8584 N`, `2.2945 W`).
 */
export function parseDegrees(input: string, kind: CoordinateKind): Parsed {
	let text = String(input ?? '')
		.trim()
		.replace(/[°º]\s*$/, '');

	// Hemisphere letter instead of a sign
	let sign = 1;
	const hemisphere = text.match(/\s*([NSEWnsew])$/);
	if (hemisphere) {
		const letter = hemisphere[1].toUpperCase();
		const allowed = kind === 'latitude' ? 'NS' : 'EW';
		if (!allowed.includes(letter)) {
			return { ok: false, error: `Use ${allowed[0]} or ${allowed[1]} for a ${kind}.` };
		}
		if (letter === 'S' || letter === 'W') sign = -1;
		text = text.slice(0, hemisphere.index).trim();
	}

	if (!NUMBER.test(text)) return { ok: false, error: 'Enter decimal degrees, e.g. 48.8584.' };

	const n = toNumber(text) * sign;
	const limit = LIMITS[kind];
	if (n < -limit || n > limit) {
		return { ok: false, error: `A ${kind} must be between -${limit} and ${limit}.` };
	}
	return { ok: true, value: format(n) };
}

/** Normalises an altitude to `<number> m` (`120`, `120m`, `120 meters` -> `120 m`). */
export function parseAltitude(input: string): Parsed {
	const text = String(input ?? '')
		.trim()
		.replace(/\s*(m|meters?|metres?)$/i, '');
	if (!NUMBER.test(text)) return { ok: false, error: 'Enter a number in metres, e.g. 120 m.' };
	return { ok: true, value: `${format(toNumber(text))} m` };
}

/** True while the text could still become a number (`-`, `12.`), so it is not flagged mid-typing */
export function isNumberish(text: string): boolean {
	return /^[+-]?\d*[.,]?\d*$/.test(text.trim());
}

// degrees, optional minutes, optional seconds, optional hemisphere letter. The same expression
// covers plain decimals (`48.8584`) and DMS (`48°51'30"N`).
const PART =
	/([+-]?\d+(?:[.,]\d+)?)\s*[°º]?\s*(?:(\d+(?:[.,]\d+)?)\s*['′’]\s*)?(?:(\d+(?:[.,]\d+)?)\s*(?:["″”]|''|′′)\s*)?([NSEWnsew])?/g;

export type Pair = { ok: true; latitude: string; longitude: string } | { ok: false; error: string };

/**
 * Reads a pasted position into latitude / longitude. Accepts `48.8584, 2.2945`, `48.8584 N 2.2945 E`
 * and degrees-minutes-seconds like `48°51'30.2"N 2°17'40.2"E`. A latitude is expected first,
 * unless the hemisphere letters say otherwise.
 */
export function parsePair(input: string): Pair {
	const parts = [...String(input ?? '').matchAll(PART)];
	const fail = (error: string): Pair => ({ ok: false, error });
	if (parts.length !== 2) {
		return fail('Could not read two coordinates. Try "48.8584, 2.2945" or 48°51\'30"N 2°17\'40"E.');
	}

	const read = (m: RegExpMatchArray) => {
		const [, d, min, sec, hemi] = m;
		const deg = toNumber(d);
		const magnitude =
			Math.abs(deg) + (min ? toNumber(min) / 60 : 0) + (sec ? toNumber(sec) / 3600 : 0);
		const negative = d.trim().startsWith('-') || /[SW]/i.test(hemi ?? '');
		return { value: negative ? -magnitude : magnitude, hemi: hemi?.toUpperCase() };
	};

	let [first, second] = parts.map(read);
	// "2°17'40"E 48°51'30"N": longitude first
	if (/[EW]/.test(first.hemi ?? '') || /[NS]/.test(second.hemi ?? ''))
		[first, second] = [second, first];

	const latitude = parseDegrees(first.value.toFixed(6), 'latitude');
	const longitude = parseDegrees(second.value.toFixed(6), 'longitude');
	if (!latitude.ok) return fail(latitude.error);
	if (!longitude.ok) return fail(longitude.error);
	return { ok: true, latitude: latitude.value, longitude: longitude.value };
}
