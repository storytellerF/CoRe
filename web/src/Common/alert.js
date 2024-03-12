import iziToast from "izitoast";

export function alertError(error) {
    if (error.message && error.message !== "abort") {
        iziToast.error({
            title: error.message,
            position: "center"
        })
    }
}