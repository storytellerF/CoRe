import localforage from "localforage";
import Constants from "../Context/constants";
import { useCallback } from "react";
import runWithLifecycle from "./abort";

export async function apiRequest(abortController, path, other) {
    const value = await localforage.getItem("core-key");
    return await fetch(`${Constants.API_BASE_URL}${path}`, {
        headers: { "core-key": value },
        signal: abortController.signal,
        ...other,
    });
}

export async function logout() {
    await localforage.removeItem("core-key")
}


export class LoadState {
}

export class Loading extends LoadState {
    constructor() {
        super()
        this.type = "loading"
    }
}

export class Loaded extends LoadState {
    constructor() {
        super()
        this.type = "loaded"
    }
}

export class Error extends LoadState {
    constructor(message) {
        super()
        this.error = message;
        this.type = "error"
    }

    isNotAuth() {
        return this.error === erorr401
    }
}

/**
 * @typedef CodeSnippet
 * @property {string} content
 * @property {number} id
 * @property {number} lastModified
 * @property {string} title
 * @property {string} uuidString
 */

/**
 * @typedef ServerResponse
 * @property {Array<CodeSnippet>} data
 * @property {number} start
 * @property {number} total
 */

export const erorr401 = "401 Unauthorized"

/**
 * 
 * @param {string} url 
 * @param {(state: LoadState) => void} updateState 
 * @param {(conent: any) => void} updateContent 
 */
export function useApi(url, updateState, updateContent) {
    return useCallback(() => runWithLifecycle(function (state) {
        updateState(new Loading());

        apiRequest(state.controller, url)
            .then((response) => {
                if (response.status === 401)
                    return Promise.reject(new Error(erorr401));

                else
                    return response.json();
            })
            .then((data) => {
                if (state.canceled) return;
                console.log("data", data);
                updateContent(data);
                updateState(new Loaded());
            })
            .catch((err) => {
                console.error(err, typeof err);
                updateState(new Error(err.error));
            });

    }), [url, updateState, updateContent])

}
