import { gitlab_response } from "@/stores/gitlab-api";
import { Xlsx } from "@fslab/fsspreadsheet";

import { JsonController, ARC } from "@nfdi4plants/arctrl";
import DataFrame from "dataframe-js";
import type { Investigation } from "./schemas/types_isa";
import { popupCenter } from "@/utils/popup";

type Config = {
    base_url: string;
}


export type Namespace = {
    name: string;
    full_path: string;
    avatar_url: string;
    id: number;
    kind: "user" | "group";
}

export type ProjectBody = {
    name: string;
    namespace_id: number;
    initialize_with_readme: boolean;
    visibility: "private" | "public";
}

export type Authentication = {
    method: string;
    client_id: string;
    base_url: string;
    scope: string;
};

type AuthPayload = {
    access_token: string;
    token_type: string;
    refresh_token?: string;
    expires_in?: number;
    [key: string]: unknown;
};

type AuthEvent =
    | { type: "auth_success"; payload: AuthPayload }
    | { type: "auth_error"; payload: { error: string } };


export class ApiError extends Error {
    status: number;
    details?: unknown;

    constructor(message: string, status: number, details?: unknown) {
        super(message);
        this.name = "ApiError";
        this.status = status;
        this.details = details;
    }

    toString() {
        return `${this.name} (${this.status}): ${this.message}`;
    }
}


export async function login(authentication: Authentication, codeChallenge: string, isaObj: Investigation) {
    localStorage.setItem('isaobj', JSON.stringify(isaObj));
    const params = {
        response_type: 'code',
        client_id: authentication.client_id,
        redirect_uri: window.location.origin,
        state: crypto.randomUUID(),
        scope: 'api',
        code_challenge: codeChallenge,
        code_challenge_method: 'S256'
    }
    sessionStorage.setItem('oauth_state', params.state); // set state and check in init() to prevent CSRF attacks
    const urlParams = new URLSearchParams(params);
    const authUrl = `${authentication.base_url}/oauth/authorize?${urlParams.toString()}`;

    try {
        const popup = popupCenter({ url: authUrl, title: 'OAuth', w: 1000, h: 800 }) || window.open(authUrl, '_blank');
        if (!popup) {
            throw new Error("Could not open OAuth window!");
        }
        const authResult = await waitForAuth(popup);
        console.log("Auth erfolgreich:", authResult);
        sessionStorage.removeItem("oauth_state");
        gitlab_response.set(authResult);
    } catch (error) {
        console.error(error);
    }
}

async function waitForAuth(popup: Window): Promise<AuthPayload> {
    return new Promise((resolve, reject) => {
        // In case the user closes the popup
        const interval = setInterval(() => {
            if (popup.closed) {
                clearInterval(interval);
                reject(new Error("Popup wurde geschlossen"));
            }
        }, 500);

        // Wait for init() function to post message with auth success or error
        function handleMessage(event: MessageEvent<AuthEvent>) {
            if (event.origin !== window.location.origin) { return };
            if (event.data?.type === "auth_success") { resolve(event.data.payload); }
            else if (event.data?.type === "auth_error") { reject(event.data.payload); }

            clearInterval(interval);
            window.removeEventListener("message", handleMessage);
            popup?.close();
        }
        window.addEventListener("message", handleMessage);
    });
}

export function generateCodeVerifier() {
    let codeVerifier = btoa(String.fromCharCode.apply(null, Array.from(globalThis.crypto.getRandomValues(new Uint8Array(32)))));
    codeVerifier = codeVerifier.replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
    return codeVerifier;
}

export async function generateCodeChallenge(codeVerifier: string) {
    const ascii = new TextEncoder().encode(codeVerifier);
    const hashBuffer = await globalThis.crypto.subtle.digest('SHA-256', ascii);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashBase64 = hashArray.map(b => String.fromCharCode(b)).join('');
    const hashBase64Url = btoa(hashBase64).replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
    return hashBase64Url;
}

export async function getUserInfo(config: Config, access_token: string) {
    const response = await fetch(`${config.base_url}/api/v4/user`, {
        method: 'GET',
        headers: {
            'Accept': 'application/json',
            'Authorization': `Bearer ${access_token}`,
            'Content-Type': 'application/json'
        }
    })
    return response.json();
}

export async function getUserNamespaces(config: Config, access_token: string) {
    try {
        const response = await fetch(`${config.base_url}/api/v4/namespaces`, {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
                'Authorization': `Bearer ${access_token}`,
                'Content-Type': 'application/json'
            }
        });
        if (!response.ok) {
            throw new Error(`Failed to fetch namespaces ${response.status} ${response.statusText}`);
        }

        const namespaces: Namespace[] = await response.json();

        const userNamespace = namespaces.filter(namespace => namespace.kind === "user");
        const groupNamespaces = namespaces.filter(namespace => namespace.kind === 'group');

        return [...userNamespace, ...groupNamespaces];
    } catch (error) {
        console.error(error);
        return null;
    }

}

function sanitizeProjectName(input: string) {
    // Handle null or undefined input
    if (!input) return 'Project';

    // Convert to string and trim whitespace
    let name = String(input).trim();

    // Replace multiple spaces with single space
    name = name.replace(/\s+/g, ' ');

    // Remove leading/trailing special characters except spaces
    name = name.replace(/^[_\-.]+|[_\-.]+$/g, '');

    // Replace consecutive special characters with a single dash
    name = name.replace(/[_\-.]+/g, '-');

    // Remove any remaining special characters except allowed ones
    name = name.replace(/[^a-zA-Z0-9\s\-_]/g, '');

    // Ensure starts with letter or number
    name = name.replace(/^[^a-zA-Z0-9]/, '');

    // Remove trailing dash
    name = name.replace(/-$/, '');

    // Handle empty result
    if (!name) name = 'Project';

    return name;
}


export async function createProject(config: Config, access_token: string, project: ProjectBody) {

    project.name = sanitizeProjectName(project.name);
    const response = await fetch(`${config.base_url}/api/v4/projects`, {
        method: 'POST',
        headers: {
            'Accept': 'application/json',
            'Authorization': `Bearer ${access_token}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(project)
    })

    if (!response.ok) {
        const data = await response.json();
        const message = JSON.stringify(data?.message) ?? `HTTP ${response.status}`;
        throw new ApiError(message, response.status, data);
    }

    const data = await response.json();

    console.log(data);

    return data;

}

/**
 * @deprecated There should be a way to use the existing function from Export.svelte instead of rewriting the same logic
 * @param config 
 * @param access_token 
 * @param project 
 * @param isaObj 
 * @returns 
 */
export async function createCommitFromArc(config: Config, access_token: string, project: ProjectBody, isaObj: Investigation) {

    const investigation = JsonController.Investigation.fromISAJsonString(JSON.stringify(isaObj)) //  ArcInvestigation_fromJsonString(JSON.stringify(isaObj, null, 2));

    let arc = new ARC(investigation);
    arc.UpdateFileSystem();
    let contracts = arc.GetWriteContracts();

    let payload = {
        "branch": "main",
        "commit_message": "[ISA-Wizard] Initial commit.",
        "actions": []
    }

    for (const contract of contracts) {

        if (contract.Operation = "CREATE") {
            if (contract.DTO == undefined) {
            } else if (contract.DTOType == "ISA_Assay" || contract.DTOType == "ISA_Study" || contract.DTOType == "ISA_Investigation") {
                let xlsxBytes = await Xlsx.toBytes(contract.DTO);
                let base64String = btoa(String.fromCharCode.apply(null, xlsxBytes));
                payload.actions.push({
                    "action": "create",
                    "file_path": contract.Path,
                    "content": base64String,
                    "encoding": "base64",
                })
            } else if (contract.DTOType == "PlainText") {
                payload.actions.push({
                    "action": "create",
                    "file_path": contract.Path,
                    "content": contract.DTO,
                    "encoding": "text",
                })
            } else {
                console.log("Warning: The given contract is not a correct ARC write contract: ", contract)
            }
        }
    }

    for (let study of isaObj.studies) {
        for (let assay of study.assays) {
            for (let file of assay.dataFiles) {
                if (file.comments.length === 0) {
                    continue;
                }
                let df = new TextEncoder().encode(new DataFrame(JSON.parse(file.comments[0].value)).toCSV(true));
                payload.actions.push({
                    "action": "create",
                    "file_path": `assays/${study.title}/datasets/${file.name}`,
                    "content": btoa(String.fromCharCode.apply(null, df)),
                    "encoding": "base64",
                })
            }
        }
    }

    const response = await fetch(`${config.base_url}/api/v4/projects/${project.id}/repository/commits`, {
        method: 'POST',
        headers: {
            'Accept': 'application/json',
            'Authorization': `Bearer ${access_token}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
    });
    return response.json();
}