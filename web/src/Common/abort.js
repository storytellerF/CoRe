function runWithLifecycle(fun) {
    const abortController = new AbortController()

    let obj = {
        canceled: false,
        abortController,
    };
    const cancel = () => {
        obj.canceled = true;
        abortController.abort(new Error("abort"))
    };
    fun(obj);
    return cancel;
}

export default runWithLifecycle;
