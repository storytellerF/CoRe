import ClipboardJS from "clipboard";
import iziToast from "izitoast";

/**
 * @return 返回包裹着codeBlockElement 的新div 容器，并添加一个button 按钮用于复制代码
 */
function preCodeWrapper() {
    const newContainer = document.createElement("div");
    newContainer.style.position = "relative";
    newContainer.className = "pre-wrapper";

    const copySpan = document.createElement("button");
    copySpan.className = "copy-code-block btn btn-secondary btn-sm";
    copySpan.innerText = "copy";
    newContainer.append(copySpan);
    return newContainer;
}

export let parseMarkdown = function (marked, content) {
    const code = marked.parse(content);

    const parser = new DOMParser();

    // 解析 HTML 字符串为 DOM 文档对象
    const doc = parser.parseFromString(code, "text/html");

    // 获取转换后的 DOM 元素
    const domElement = doc.documentElement.ownerDocument.body;
    const codeBlockElements = domElement.getElementsByTagName("pre");
    //把所有的pre 标签都使用pre-wrapper 包裹
    for (const codeBlockElement of codeBlockElements) {
        const newContainer = preCodeWrapper();
        domElement.insertBefore(newContainer, codeBlockElement);
        newContainer.append(codeBlockElement);
    }

    return domElement.innerHTML;
};

export function copyCodeBlock(target) {
    ClipboardJS.copy(target.nextSibling.firstChild.innerText);
    iziToast.show({
        title: "copied",
        color: "green",
        position: "center",
    });
}
