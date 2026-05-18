let appstate = $state({
	currentStepIndex: 0,
	template: '',
	mode: 'wizard',
	isaLvl: '',
	guiType: 'investigation'
});

export function getAppstate() {
	return appstate;
}

export function updateAppstate(updates: Partial<typeof appstate>) {
	appstate = { ...appstate, ...updates };
}
