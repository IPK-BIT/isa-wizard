// Local mock of the Metabuddy API (docs/metabuddy/openapi.json). No dependencies.
// Usage: pnpm mock:metabuddy
// Testing aids: append ?mock=400|401|500 to force an error, ?delay=3000 to add latency (ms),
// ?mock=empty for an /explain answer without examples and ontologyTerms, or a /convert answer
// without anything at the scoped path. ?mock=overwrite lets /convert replace existing values.
// ?mock=413|422 force those errors.
import http from 'node:http';

const PORT = Number(process.env.PORT ?? 4010);

const CORS = {
	'Access-Control-Allow-Origin': '*',
	'Access-Control-Allow-Methods': 'POST, OPTIONS',
	'Access-Control-Allow-Headers': 'X-API-Key, Content-Type'
};

function send(res, status, body) {
	res.writeHead(status, { ...CORS, 'Content-Type': 'application/json' });
	res.end(body === undefined ? undefined : JSON.stringify(body));
}

function readBody(req) {
	return new Promise((resolve, reject) => {
		const chunks = [];
		req.on('data', (c) => chunks.push(c));
		req.on('end', () => resolve(Buffer.concat(chunks)));
		req.on('error', reject);
	});
}

// Minimal multipart parsing: returns the text value of a named non-file field.
function multipartField(body, name) {
	const m = body
		.toString('latin1')
		.match(new RegExp(`name="${name}"\\r\\n\\r\\n([\\s\\S]*?)\\r\\n--`));
	return m ? Buffer.from(m[1], 'latin1').toString('utf8') : undefined;
}

// Original names of all file parts, in order.
function multipartFileNames(body) {
	return [...body.toString('latin1').matchAll(/name="files"; filename="([^"]*)"/g)].map((m) =>
		Buffer.from(m[1], 'latin1').toString('utf8')
	);
}

function getAtPath(root, path) {
	let node = root;
	for (const key of path.match(/[^.[\]]+/g) ?? []) {
		if (node == null || typeof node !== 'object') return undefined;
		node = node[key];
	}
	return node;
}

const handlers = {
	'/explain': (body, _raw, url) => ({
		explanation: body.userQuestion
			? `Mock answer to "${body.userQuestion}" (scope: ${body.scope}).`
			: `Mock explanation of "${body.field}" (scope: ${body.scope}).`,
		...(url.searchParams.get('mock') === 'empty'
			? { examples: [], ontologyTerms: [] }
			: {
					examples: ['drought stress design (EFO:0001272)', 'factorial design (EFO:0001426)'],
					ontologyTerms: [
						{
							term: 'drought stress design',
							uri: 'http://www.ebi.ac.uk/efo/EFO_0001272',
							source: 'EFO'
						}
					]
				})
	}),

	'/validate': () => ({
		valid: false,
		issues: [
			{
				field: 'studies[0].studyDesignDescriptors',
				severity: 'error',
				message: 'studyDesignDescriptors must contain at least one entry.',
				suggestion: "Add a descriptor such as 'drought stress design' (EFO:0001272)."
			},
			{
				field: 'studies[0].description',
				severity: 'warning',
				message: 'The study description is very short.',
				suggestion: 'Describe the experimental setup, organism and conditions in a few sentences.'
			},
			{
				field: 'studies[0].publications',
				severity: 'suggestion',
				message: 'No publications are linked to this study.'
			}
		]
	}),

	'/convert': (_body, raw, url) => {
		const scope = multipartField(raw, 'scope') ?? '';
		const files = multipartFileNames(raw);
		const prompt = multipartField(raw, 'prompt');
		const mode = url.searchParams.get('mock');
		let isaJson = {};
		try {
			isaJson = JSON.parse(multipartField(raw, 'existingIsa') ?? '{}');
		} catch {
			// ignore, start from an empty document
		}
		// The level name 'investigation' (and an empty scope) address the whole document
		const atRoot = !scope || scope === 'investigation';
		const target = atRoot ? isaJson : getAtPath(isaJson, scope);
		const prefix = atRoot ? '' : `${scope}.`;
		const source = `${files.join(', ')}${prompt ? ` (prompt: ${prompt})` : ''}`;

		if (mode === 'empty') {
			// Same document, but nothing at the scoped path
			if (atRoot) return { confidence: {}, warnings: [] };
			const keys = scope.match(/[^.[\]]+/g);
			const parent = getAtPath(isaJson, keys.slice(0, -1).join('.'));
			if (parent && typeof parent === 'object') delete parent[keys.at(-1)];
			return { isaJson, confidence: {}, warnings: [] };
		}
		if (Array.isArray(target)) {
			target.push({ title: `Imported from ${source}` });
		} else if (target && typeof target === 'object') {
			if (mode === 'overwrite') {
				target.title = `Imported title from ${source}`;
				target.description = 'Imported description (mock)';
			} else {
				target.title ||= `Imported title from ${source}`;
				target.description ||= 'Imported description (mock)';
			}
		}
		// For an array scope the new item is the one that was just appended
		const itemPrefix = Array.isArray(target) ? `${scope}[${target.length - 1}].` : prefix;
		return {
			isaJson,
			confidence: { [`${itemPrefix}title`]: 0.95, [`${itemPrefix}description`]: 0.55 },
			warnings: [`${itemPrefix}people`, 'studies[9].title']
		};
	}
};

const server = http.createServer(async (req, res) => {
	const url = new URL(req.url, `http://${req.headers.host}`);

	if (req.method === 'OPTIONS') {
		res.writeHead(204, CORS);
		return res.end();
	}

	const handler = handlers[url.pathname];
	if (req.method !== 'POST' || !handler) return send(res, 404, { error: 'not_found' });

	if (!req.headers['x-api-key']) return send(res, 401);

	const delay = Number(url.searchParams.get('delay') ?? 0);
	if (delay > 0) await new Promise((r) => setTimeout(r, delay));

	const forced = url.searchParams.get('mock');
	if (forced === '400') {
		return send(res, 400, { error: 'invalid_request', detail: "The 'scope' field is required." });
	}
	if (forced === '401') return send(res, 401);
	if (forced === '413')
		return send(res, 413, { error: 'payload_too_large', detail: 'File too big.' });
	if (forced === '422') {
		return send(res, 422, { error: 'unprocessable', detail: 'No ISA content could be extracted.' });
	}
	if (forced === '500') return send(res, 500, { error: 'internal_error', detail: 'Mock failure.' });

	const raw = await readBody(req);
	let body = {};
	if ((req.headers['content-type'] ?? '').includes('application/json')) {
		try {
			body = JSON.parse(raw.toString('utf8'));
		} catch {
			return send(res, 400, { error: 'invalid_request', detail: 'Body is not valid JSON.' });
		}
	}
	if (url.pathname === '/convert') {
		if (!multipartField(raw, 'scope') || !multipartFileNames(raw).length) {
			return send(res, 400, {
				error: 'invalid_request',
				detail: "The 'scope' and 'files' fields are required."
			});
		}
	}
	send(res, 200, handler(body, raw, url));
});

server.listen(PORT, () => console.log(`Metabuddy mock listening on http://localhost:${PORT}`));
