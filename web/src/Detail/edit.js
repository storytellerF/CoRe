import { useContext, useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom"
import "./edit.css"
import iziToast from "izitoast";
import storage from "store"
import { ConstantsContext } from "../Context/ConstantsContext";
import mermaid from "mermaid";
import handleTab from "./handle-tab";
import abort from "../Common/abort";

function getFormData(title, content, id) {
    if (content.length === 0) {
        iziToast.show({
            color: "red",
            title: "content is empty",
            position: "center"
        })
        return
    }
    if (title.length === 0) {
        iziToast.show({
            color: "red",
            title: "title is empty",
            position: "center"
        })
        return
    }
    const formData = new FormData()
    formData.append("title", title)
    formData.append("codeContent", content)
    if (id != null)
        formData.append("id", id)
    return formData
}

function Editor({ marked }) {
    const constants = useContext(ConstantsContext)
    const location = useLocation()
    const queryParams = new URLSearchParams(location.search);
    const id = queryParams.get("id")
    const [title, updateTitle] = useState("")
    const [content, updateContent] = useState("")
    const [rendered, updateRender] = useState("")
    const [nextSelection, updateNextSelection] = useState(null)
    const contentRef = useRef(null)

    const handleChangeTitle = (event) => {
        updateTitle(event.target.value);
    };
    const handleChangeContent = (event) => {
        updateContent(event.target.value)
    }
    const handleInputDown = (e) => {
        const input = e.target
        if (e.key === 'Tab') {
            e.preventDefault();
            const inputShift = e.shiftKey
            const start = input.selectionStart;
            const end = input.selectionEnd;
            const tempValue = input.value
            let result = handleTab(start, end, tempValue, inputShift)
            console.log(result)
            if (result !== undefined) {
                updateContent(result.value)
                updateNextSelection({
                    start: result.start,
                    end: result.end
                })
            }
        }
    }

    useEffect(() => {
        return abort((state) => {
            if (id !== null) {
                fetch(constants.API_BASE_URL + "/get?id=" + id).then((response) => response.json()).then((data) => {

                    if (state.canceled) return
                    if (process.env.NODE_ENV === 'development') {
                        // 在开发状态下执行的代码
                        console.log(data)
                    }
                    updateTitle(data.title)
                    updateContent(data.codeContent)
                }).catch((error) => console.log(error))
            } else {
                updateTitle("")
                updateContent("")
            }
        })
    }, [id, constants.API_BASE_URL])
    useEffect(() => {
        return abort((state) => {
            const temp = marked.parse(content)
            if (!state.canceled) updateRender(temp)
        })
    }, [content, marked])
    useEffect(() => {
        const timer = setTimeout(() => {
            mermaid.run()
        }, 200);
        return () => {
            clearTimeout(timer)
        }
    }, [rendered])
    useEffect(() => {
        let selectionCanceled = false
        let timer
        if (nextSelection != null) {
            timer = setTimeout(() => {
                if (selectionCanceled) return
                contentRef.current.selectionStart = nextSelection.start
                contentRef.current.selectionEnd = nextSelection.end
            }, 100);
        }

        return () => {
            selectionCanceled = true
            clearTimeout(timer)
        }
    }, [nextSelection])
    const handleSubmit = (event) => {
        event.preventDefault()
        const formData = getFormData(title, content, id)
        if (formData == undefined) return
        let postLink
        if (id != null) postLink = "/edit"
        else postLink = "/add"
        fetch(constants.API_BASE_URL + postLink, {
            method: "post",
            body: formData
        }).then((response) => {
            console.log(response)
            if (response.status === 200) {
                return response.text()
            } else {
                return Promise.reject(response.status + " " + response.statusText)
            }
        }).then((data) => {
            iziToast.show({
                title: data,
                color: "green",
                position: "center",
            });
        }).catch((error) => {
            console.log(error)
            iziToast.show({
                title: error,
                color: "red",
                position: "center"
            })
        })
    }
    useEffect(() => {
        if (title == "" || content == "") return
        storage.set("draft", {
            title,
            content
        })
    }, [title, content])
    const recoverDraft = () => {
        const value = storage.get("draft") || {}
        updateTitle(value.title)
        updateContent(value.content)
    }
    return (
        <div className="container" style={{ marginTop: "20px" }}>
            <form id="save-core" onSubmit={handleSubmit}>
                <input type="submit" className="btn btn-primary" />
                <input type="button" className="btn" id="read-draft" value="恢复" onClick={recoverDraft} />
                <div className="mb-3">
                    <label htmlFor="core-title" className="form-label">标题</label>
                    <input type="text" name="title" value={title} onChange={handleChangeTitle} className="form-control" id="core-title"
                        placeholder="" />
                </div>
                <div className="row" id="input-group">
                    <div className="col-md-6">
                        <label htmlFor="core-content" className="form-label">内容</label>
                        <textarea name="codeContent" className="form-control" value={content} onChange={handleChangeContent} onKeyDown={handleInputDown} ref={contentRef} id="core-content"
                            rows="3" style={{ fontSize: "20px" }}></textarea>
                    </div>
                    <div className="col-md-6">
                        <label className="form-label">Preview</label>
                        <div id="preview" dangerouslySetInnerHTML={{ __html: rendered }}></div>
                    </div>
                </div>

            </form>
        </div>
    )
}

export default Editor