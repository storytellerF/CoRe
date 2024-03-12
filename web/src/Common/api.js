import localforage from "localforage";
import Constants from "../Context/constants";

export function apiRequest(abortController, path, other) {
    return localforage.getItem("core-key").then(function (value) {
        return fetch(`${Constants.API_BASE_URL}${path}`, {
            headers: { "core-key": value },
            signal: abortController.signal,
            ...other,
        });
    });
}
