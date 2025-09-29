import { type Config, AppState } from "@/lib/types";

/*
    Manages the application state.
*/

export { AppState };

let appstate = $state(AppState.Init);

export function getAppState() {
    return appstate;
}

export function updateAppState(newState: AppState) {
    appstate = newState;
}

/*
    Manages the application configuration.
*/

let config: Config = {};

let setConfig = (_config: Config) => {
    config = _config;
    appstate = config.general?.initialView ? config.general.initialView : AppState.Init;
}

export {config, setConfig}

/*
    Manages the questionnaire state.
*/

export const questionnaireState = $state({
    steps: 0,
    currentStep: 0
})

export function setQuestionnaireSteps(steps: number) {
    questionnaireState.steps = steps;
}

export function setQuestionnaireCurrentStep(step: number) {
    questionnaireState.currentStep = step;
}