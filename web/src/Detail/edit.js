import { useContext, useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom"
import "./edit.css"
import iziToast from "izitoast";
import storage from "store"
import { ConstantsContext } from "../Context/ConstantsContext";
import mermaid from "mermaid";
function resolveCurrentLine(lines, cursorPosition) {

    let currentLineNumber = 0
    let currentLineEnd = 0
    for (; currentLineNumber < lines.length; currentLineNumber++) {
        currentLineEnd += lines[currentLineNumber].length + 1
        if (currentLineEnd > cursorPosition) {
            break
        }
    }
    const currentLineLength = lines[currentLineNumber].length
    const currentLineStart = currentLineEnd - currentLineLength - 1

    return {
        currentLineNumber,
        "currentLineContent": lines[currentLineNumber],
        currentLineLength,
        currentLineStart,
        currentLineEnd,
    }
}

function shiftTabSingleLine(content, start) {
    const lines = content.split("\n")

    const lineGroup = resolveCurrentLine(lines, start)
    const currentContent = lineGroup.currentLineContent;

    var { newLine, spaceCount } = shiftTab(currentContent);

    lines[lineGroup.currentLineNumber] = newLine
    let result = {
        value: lines.join("\n"),
        start: start - spaceCount,
        end: start - spaceCount
    };

    return result;
}

function shiftTab(currentContent) {
    let spaceCount = 0;
    const hasTab = currentContent.startsWith("\t");
    if (hasTab) {
        spaceCount = 1;
    } else {
        for (let i = 0; i < currentContent.length && i < 4; i++) {
            if (currentContent[i] === ' ') spaceCount++;
            else break;
        }
    }
    const newLine = currentContent.substring(spaceCount);
    return { newLine, spaceCount };
}

function shiftTabMultiLine(content, start, end) {
    const lines = content.split("\n")

    const startGroup = resolveCurrentLine(lines, start)
    const endGroup = resolveCurrentLine(lines, end)
    console.log(startGroup)
    console.log(endGroup)
    let startOffset
    let endOffset = 0
    if (startGroup.currentLineNumber !== endGroup.currentLineNumber) {
        for (let i = startGroup.currentLineNumber; i <= endGroup.currentLineNumber; i++) {
            var { newLine, spaceCount } = shiftTab(lines[i])
            lines[i] = newLine
            if (i == startGroup.currentLineNumber) {
                startOffset = spaceCount
            }
            endOffset += spaceCount
        }
    }
    return {
        value: lines.join("\n"),
        start: start - startOffset,
        end: end - endOffset
    }
}

function handleTab(start, end, tempValue, inputShift) {
    let result
    if (start === end) {
        if (!inputShift) {
            const before = tempValue.substring(0, start)
            const after = tempValue.substring(end)

            result = {
                value: before + "\t" + after,
                start: start + 1,
                end: start + 1
            }
        } else if (start === end) {
            result = shiftTabSingleLine(tempValue, start)
        }
    } else {
        if (inputShift)
            result = shiftTabMultiLine(tempValue, start, end)
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
        let canceled = false
        if (id !== null) {
            fetch(constants.API_BASE_URL + "/get?id=" + id).then((response) => response.json()).then((data) => {

                if (canceled) return
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
        return () => {
            canceled = false
        }
    }, [id, constants.API_BASE_URL])
    useEffect(() => {
        let renderCanceled = false
        const temp = marked.parse(content)
        if (!renderCanceled) updateRender(temp)
        return () => {
            renderCanceled = true
        }
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