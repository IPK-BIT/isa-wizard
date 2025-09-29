export enum AppState {
    Init = "init",
    Form = "form",
    Wizard = "wizard",
    Review = "review",
}

export type Config = {
    general?: {
        layoutMode?: 'standalone' | 'plugin',
        initialView?: AppState,
        name?: string
    },
    steps?: any[],
    prefill?: any[]
}

export type Hook = {
    type: string,
    state: {
        mapping: string,
        count?: number
    }
}