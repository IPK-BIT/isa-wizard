import { Xlsx } from "@fslab/fsspreadsheet";
import { ARC } from "@nfdi4plants/arctrl";
// import { ArcInvestigation_fromJsonString } from "@nfdi4plants/arctrl/ISA/ISA.Json/Investigation";
import DataFrame from "dataframe-js";


export function login(authentication, codeChallenge, isaObj) {
    localStorage.setItem('isaobj', JSON.stringify(isaObj))
    const params = {
        response_type: 'code',
        client_id: authentication.client_id,
        redirect_uri: window.location.href.split('#')[0],
        state: '123456',
        scope: 'api',
        code_challenge: codeChallenge,
        code_challenge_method: 'S256'
    }
    const urlParams = new URLSearchParams(params);
    const authUrl = `${authentication.base_url}/oauth/authorize?${urlParams.toString()}`;
    window.open(authUrl, '_blank', 'noopener,noreferrer');
    // window.location.href = authUrl;
}

export function generateCodeVerifier() {
    let codeVerifier = btoa(String.fromCharCode.apply(null, Array.from(globalThis.crypto.getRandomValues(new Uint8Array(32)))));
    codeVerifier = codeVerifier.replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
    return codeVerifier;
}

export async function generateCodeChallenge(codeVerifier) {
    const ascii = new TextEncoder().encode(codeVerifier);
    const hashBuffer = await globalThis.crypto.subtle.digest('SHA-256', ascii);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashBase64 = hashArray.map(b => String.fromCharCode(b)).join('');
    const hashBase64Url = btoa(hashBase64).replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
    return hashBase64Url;
}

export async function getUserInfo(config, access_token) {
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

export async function getUserNamespaces(config, access_token, user) {
    const response = await fetch(`${config.base_url}/api/v4/namespaces`, {
        method: 'GET',
        headers: {
            'Accept': 'application/json',
            'Authorization': `Bearer ${access_token}`,
            'Content-Type': 'application/json'
        }
    })
    let namespaces = await response.json();
    let userNamespace = namespaces.filter(namespace => namespace.kind === 'user');
    let groupNamespaces = namespaces.filter(namespace => namespace.kind === 'group');

    return [...userNamespace, ...groupNamespaces];
}

function sanitizeProjectName(input) {
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

export async function createProject(config, access_token, project) {
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
        throw new Error('Failed to create project');

    }
    return response.json();
}

export async function createCommitFromArc(config, access_token, project, isaObj) {

    const investigation = ArcInvestigation_fromJsonString(JSON.stringify(isaObj, null, 2));

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

    // @ts-ignore
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

    // @ts-ignore
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