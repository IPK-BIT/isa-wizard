import { get, readable, writable } from "svelte/store";

export const CLIENT_ID = readable("200490ccbc9bd9e9f65eb50dfc8aa68ca3ea2c6c5eee7f51874ea0f07d4b4ced");
export const base_url = "https://git.nfdi4plants.org";
export const gitlab_response = writable({ access_token: "" });


/**
 * Called when OAuth redirects back to origin.
 * Extract parameters from url, handle the authorization and send back a success or error message
 * with postMessage() to the parent window (GUI Export)
 */
export async function init() {
  console.log("init gitlab-api");

  const urlParams = new URLSearchParams(window.location.search);
  const code = urlParams.get("code");
  const error = urlParams.get("error");
  const errorDescription = urlParams.get("error_description");
  const returnedState = urlParams.get("state");
  const expectedState = sessionStorage.getItem("oauth_state");
  try {
    if (code) {
      if (!returnedState || returnedState !== expectedState) {
        window.opener?.postMessage(
          { type: "auth_error", payload: "Invalid OAuth State!" }, window.location.origin
        );
        window.close();
        throw new Error("OAuth state mismatch");
      }

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

      window.opener?.postMessage(
        { type: "auth_success", payload: data },
        window.location.origin
      );
    } else if (error) {
      const errMsg = `Authorization failed: ${error}${errorDescription ? ", " + errorDescription : ""}`
      window.opener?.postMessage(
        { type: "auth_error", payload: errMsg },
        window.location.origin
      );
    }
  } catch (err) {
    console.error(err); // network, fetch error etc.
  } finally {
    if (code || error) {
      localStorage.removeItem("code_verifier");
    }
  }
}
