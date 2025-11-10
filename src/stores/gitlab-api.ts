import { get, readable, writable } from "svelte/store";
import { isaObj } from "./isa";
import { getAppState } from "@/lib/appstate.svelte";

export const CLIENT_ID = readable("200490ccbc9bd9e9f65eb50dfc8aa68ca3ea2c6c5eee7f51874ea0f07d4b4ced");
export const base_url = "https://git.nfdi4plants.org";

export const gitlab_response = writable({ access_token: "" });

export async function init() {
  console.log("init gitlab-api");

  const urlParams = new URLSearchParams(window.location.search);
  const code = urlParams.get("code");
  if (code) {
    let code_verifier = localStorage.getItem("code_verifier");
    let params = {
      grant_type: "authorization_code",
      client_id: get(CLIENT_ID),
      code: code,
      redirect_uri: window.location.href,
      code_verifier: code_verifier,
    };
    const response = await fetch(`${base_url}/oauth/token`, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams(params),
    });
    const data = await response.json();
    gitlab_response.set(data);
    window.history.replaceState({}, document.title, window.location.pathname);
    isaObj.set(JSON.parse(localStorage.getItem("isaobj")));
    localStorage.removeItem("isaobj");
    appstate.set(appstate.GUI);
  }
}
