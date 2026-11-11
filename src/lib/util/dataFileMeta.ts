import Schema from '$lib/schemas';

const TYPE_BY_EXT: Record<string, string> = {};
const register = (type: string, exts: string[]) => exts.forEach((e) => (TYPE_BY_EXT[e] = type));
register('Image File', ['jpg', 'jpeg', 'png', 'tif', 'tiff', 'gif', 'bmp', 'webp', 'svg', 'heic', 'cr2', 'nef', 'dng']);
register('Derived Data File', ['csv', 'tsv', 'txt', 'xls', 'xlsx', 'json', 'xml', 'rdata', 'rds', 'parquet']);
register('Raw Data File', ['fastq', 'fq', 'bam', 'cram', 'sam', 'fast5', 'pod5', 'raw', 'cel', 'idat', 'gz', 'zip']);
register('Raw Spectral Data File', ['mzml', 'mzxml', 'd', 'wiff']);
register('Array Data File', ['cel', 'idat']);

/** Guess the ISA data file type from the extension; '' when unknown. */
export function guessDataFileType(fileName: string): string {
	const base = fileName.split('/').pop() ?? fileName;
	const ext = base.includes('.') ? base.split('.').pop()!.toLowerCase() : '';
	return TYPE_BY_EXT[ext] ?? '';
}

function comment(name: string, value: string) {
	const c = Schema.getObjectFromSchema('comment')!;
	c.name = name;
	c.value = value;
	return c;
}

/** Builds an ISA data object from a browser File (relative path as name for folder picks). */
export function dataFromFile(file: File) {
	const data = Schema.getObjectFromSchema('data')!;
	data.name = (file as File & { webkitRelativePath?: string }).webkitRelativePath || file.name;
	data.type = guessDataFileType(file.name);
	data.comments = [
		comment('File Size (bytes)', String(file.size)),
		...(file.type ? [comment('MIME Type', file.type)] : []),
		...(file.lastModified ? [comment('Last Modified', new Date(file.lastModified).toISOString())] : [])
	];
	return data;
}
