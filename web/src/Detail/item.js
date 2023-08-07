import { useContext, useEffect, useState } from 'react';
import './item.css'
import 'bootstrap/dist/css/bootstrap.css';
import { Button, Collapse } from 'reactstrap';
import clipboard from 'clipboard';
import iziToast from 'izitoast';
import "izitoast/dist/css/iziToast.css"
import 'highlight.js/styles/default.css';
import { Link } from 'react-router-dom';
import { ConstantsContext } from '../Context/ConstantsContext';


function Snippet({ item, marked, notifyRefresh }) {
    const constants = useContext(ConstantsContext)
    const herf = '/delete?id=' + item.id
    const editHref = '/edit?id=' + item.id

    const [collapsed, setCollapsed] = useState(true);
    const [rendered, updateRender] = useState(null)

    const toggleCode = () => setCollapsed(!collapsed);

    const copyAll = () => {
        clipboard.copy(item.codeContent)
        iziToast.show({
            title: "copied",
            color: "green",
            position: "center",
        });
    }

    /**
     * @return 返回包裹着codeBlockElement 的新div 容器，并添加一个button 按钮用于复制代码
     */
    function preCodeWrapper() {
        const newContainer = document.createElement("div")
        newContainer.style.position = "relative"
        newContainer.className = "pre-wrapper"

        const copySpan = document.createElement("button")
        copySpan.className = "copy-code-block btn btn-secondary btn-sm"
        copySpan.innerText = "copy"
        newContainer.append(copySpan)
        return newContainer
    }

    useEffect(() => {
        const code = marked.parse(item.codeContent)

        const parser = new DOMParser();

        // 解析 HTML 字符串为 DOM 文档对象
        const doc = parser.parseFromString(code, 'text/html');

        // 获取转换后的 DOM 元素
        const domElement = doc.documentElement.ownerDocument.body;
        const codeBlockElements = domElement.getElementsByTagName("pre")
        for (const codeBlockElement of codeBlockElements) {
            const newContainer = preCodeWrapper()
            domElement.insertBefore(newContainer, codeBlockElement)
            newContainer.append(codeBlockElement)
        }

        updateRender(domElement.innerHTML)
    }, [item.codeContent, marked])
    const handleDelete = () => {
        fetch(constants.API_BASE_URL + herf).then((response) => {
            if (response.status === 200) {
                return response.text()
            } else {
                return Promise.reject(new Error(response.status + ' ' + response.statusText));
            }
        }).then((data) => {
            iziToast.show({
                title: data || "success",
                color: "green",
                position: "center"
            })
            notifyRefresh()
        }).catch((error) => {
            console.error(error);
            iziToast.show({
                title: error,
                color: "red",
                position: "center"
            })
        })
    }
    return (
        <li className='list-group-item'>
            <div className="snippet-action">
                <p style={{ fontWeight: "bold", wordBreak: "break-word" }}>{item.title}</p>

                <Link to={editHref}>修改</Link>
                {' '}
                <Button className={collapsed ? '' : 'active'} size='sm' outline onClick={toggleCode}>切换</Button>
                {' '}
                <Button size='sm' onClick={copyAll}>复制</Button>
                {' '}
                <Button size='sm' onClick={handleDelete}>删除</Button>
            </div>

            <Collapse isOpen={!collapsed}>
                <div className="code" dangerouslySetInnerHTML={{ __html: rendered }}></div>
            </Collapse>
        </li>

    )
}

export default Snippet