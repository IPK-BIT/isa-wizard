/**
 * Parses an isaLvl path string to extract hierarchy information.
 *
 * Examples:
 * - 'investigation' → { level: 'investigation' }
 * - 'studies[0]' → { level: 'study', studyIndex: 0 }
 * - 'studies[0].assays[1]' → { level: 'assay', studyIndex: 0, assayIndex: 1 }
 */
export function parseIsaLvl(isaLvl: string) {
	const result: {
		level: 'investigation' | 'study' | 'assay';
		studyIndex?: number;
		assayIndex?: number;
	} = {
		level: 'investigation'
	};

	if (!isaLvl || isaLvl === 'investigation') {
		return result;
	}

	// Match studies[N]
	const studyMatch = isaLvl.match(/studies\[(\d+)\]/);
	if (studyMatch) {
		result.studyIndex = parseInt(studyMatch[1], 10);
		result.level = 'study';
	}

	// Match assays[N] (only valid if we're in a study)
	const assayMatch = isaLvl.match(/assays\[(\d+)\]/);
	if (assayMatch) {
		result.assayIndex = parseInt(assayMatch[1], 10);
		result.level = 'assay';
	}

	return result;
}

/**
 * Constructs an isaLvl path string for a study.
 * Example: constructStudyPath(0) → 'studies[0]'
 */
export function constructStudyPath(studyIndex: number): string {
	return `studies[${studyIndex}]`;
}

/**
 * Constructs an isaLvl path string for an assay within a study.
 * Example: constructAssayPath(0, 1) → 'studies[0].assays[1]'
 */
export function constructAssayPath(studyIndex: number, assayIndex: number): string {
	return `studies[${studyIndex}].assays[${assayIndex}]`;
}
