function abort(fun) {
    let obj = {
        canceled: false,
    }
    const cancel = () => {
        obj.canceled = true
    }
    fun(obj)
    return cancel
}

export default abort