import { useContext, useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom"
import "./edit.css"
import iziToast from "izitoast";
import clipboard from 'clipboard';
import storage from "store"
import { ConstantsContext } from "../Context/ConstantsContext";
import mermaid from "mermaid";
import handleTab from "./handle-tab";
import runWithLifecycle from "../Common/abort";
import "./marp.css"
import "./item.css"
import { copyCodeBlock, parseMarkdown } from "../Common/code-parser";

const marpMark = `---
marp: true
---`

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
    formData.append("id", id || "-1")
    return formData
}

function Editor({ marked }) {
    const constants = useContext(ConstantsContext)
    const location = useLocation()
    const navigate = useNavigate()
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
        return runWithLifecycle((state) => {
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
        return runWithLifecycle((state) => {
            if (!content) return
            if (content.startsWith(marpMark)) {
                let contentList = content.substring(marpMark.length + 1).split("---")
                let o = contentList.map((value) => {
                    if (state.canceled) return undefined
                    return `<section>${parseMarkdown(marked, value)}</section>` 
                }).join("\n")
                console.log(contentList, o)
                if (!state.canceled) updateRender(`<div class="marpit">${o}</div>`)
            } else {
                const temp = parseMarkdown(marked, content)
                if (!state.canceled) updateRender(temp)
            }
            
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
            //如果timer 已经执行，停止任务
            selectionCanceled = true
            //清除timer
            clearTimeout(timer)
        }
    }, [nextSelection])
    const handleSubmit = (event) => {
        event.preventDefault()
        let submitter = event.nativeEvent.submitter
        if (!submitter.className.indexOf("copy-code-block")) {
            copyCodeBlock(submitter)
            return
        }
        const formData = getFormData(title, content, id)
        if (!formData) return
        let postLink
        if (id) postLink = "/edit"
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
            if (id) {
                iziToast.show({
                    title: `success ${data}`,
                    color: "green",
                    position: "center",
                });
            } else if (data >= 0) {
                navigate(`/edit?id=${data}`)
                iziToast.show({
                    title: `success ${data}`,
                    color: "green",
                    position: "center",
                });
            } else {
                iziToast.show({
                    title: data,
                    color: "red",
                    position: "center",
                });
            }
            
        }).catch((error) => {
            console.log("error", error)
            iziToast.show({
                title: error.message,
                color: "red",
                position: "center"
            })
        })
    }
    useEffect(() => {
        if (!title || !content) return
        storage.set("draft", {
            title,
            content
        })
    }, [title, content])
    const recoverDraft = () => {
        const value = storage.get("draft") || {}
        if (!value.title && !value.content) {
            iziToast.show({
                title: "no draft",
                color: "yellow",
                position: "center"
            })
        }
        updateTitle(value.title || "")
        updateContent(value.content || "")
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
