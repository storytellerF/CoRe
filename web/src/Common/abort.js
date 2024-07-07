/**
 * @typedef AbortableTask
 * @property {boolean} canceled
 * @property {AbortController} controller
 */

/**
 * 
 * @param {(task: AbortableTask) => void} fun 
 * @returns 
 */
function runWithLifecycle(fun) {
    const abortController = new AbortController()

    /**
     * @type {AbortableTask}
     */
    let state = {
        canceled: false,
        controller: abortController,
    };
    const cancel = () => {
        state.canceled = true;
        abortController.abort(new Error("abort"))
    };
    fun(state);
    return cancel;
}

export default runWithLifecycle;
