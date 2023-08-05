import { useContext, useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom"
import "./edit.css"
import iziToast from "izitoast";
import storage from "store"
import { ConstantsContext } from "../Context/ConstantsContext";

function shiftTabOneLine(content, start) {

    const lines = content.split("\n")
    let currentLine = 0
    let sum = 0
    for (; currentLine < lines.length; currentLine++) {
        sum += lines[currentLine].length + 1
        if (sum > start) {
            break
        }
    }
    const currentContent = lines[currentLine]
    const hasTab = currentContent.startsWith("\t")
    let spaceCount = 0

    for (let i = 0; i < currentContent.length && i < 4; i++) {
        if (currentContent[i] === ' ') spaceCount++
        else break
    }

    const currentLineStart = sum - lines[currentLine].length - 1
    const above = content.substring(0, currentLineStart)
    const rest = content.substring(currentLineStart)
    let result
    if (hasTab) {
        result = {
            value: above + rest.substring(1),
            start,
            end: start
        }
    } else if (spaceCount > 0) {
        result = {
            value: above + rest.substring(spaceCount),
            start,
            end: start
        }
    }
    return result
}

function handleTab(start, end, tempValue, inputShift) {
    let result
    if (!inputShift) {
        const before = tempValue.substring(0, start)
        const after = tempValue.substring(end)

        result = {
            value: before + "\t" + after,
            start: start + 1,
            end: start + 1
        }
    } else if (start === end) {
        result = shiftTabOneLine(tempValue, start)
    }
    return result
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
            if (result != undefined) {
                updateContent(result.value)
                updateNextSelection({
                    start: result.start,
                    end: result.end
                })
            }

        }
    }

    let canceled
    useEffect(() => {
        canceled = false
        if (id != null) {
            fetch(constants.API_BASE_URL + "/get?id=" + id).then((response) => response.json()).then((data) => {
                if (process.env.NODE_ENV === 'development') {
                    // 在开发状态下执行的代码
                    console.log(data)
                } else {
                    // 在生产状态下执行的代码
                }
                if (canceled) return
                updateTitle(data.title)
                updateContent(data.codeContent)
            }).catch((error) => console.log(error))
        }
        return () => {
            canceled = false
        }
    }, [id])
    let renderCanceled
    useEffect(() => {
        renderCanceled = false
        const temp = marked.parse(content)
        if (!renderCanceled) updateRender(temp)
        return () => {
            renderCanceled = true
        }
    }, [content])
    let selectionCanceled
    useEffect(() => {
        selectionCanceled = false
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
        if (content.length == 0) {
            iziToast.show({
                color: "red",
                title: "content is empty",
                position: "center"
            })
            return
        }
        if (title.length == 0) {
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
        let postLink
        if (id != null) postLink = "/edit"
        else postLink = "/add"
        fetch(constants.API_BASE_URL+ postLink, {
            method: "post",
            body: formData
        }).then((response) => {
            console.log(response)
            if (response.status == 200) {
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