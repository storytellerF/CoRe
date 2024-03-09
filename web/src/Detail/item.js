import { useContext, useEffect, useState } from "react";
import "./item.css";
import "bootstrap/dist/css/bootstrap.css";
import { Button, Collapse } from "reactstrap";
import clipboard from "clipboard";
import iziToast from "izitoast";
import "izitoast/dist/css/iziToast.css";
import "highlight.js/styles/default.css";
import { Link } from "react-router-dom";
import { ConstantsContext } from "../Context/ConstantsContext";
import { parseMarkdown } from "../Common/code-parser";

function Snippet({ item, marked, notifyRefresh }) {
    const constants = useContext(ConstantsContext);
    const deleteHerf = "/delete?id=" + item.id;
    const editHref = "/edit?id=" + item.id;

    const [collapsed, setCollapsed] = useState(true);
    const [rendered, updateRender] = useState(null);

    const toggleCode = () => setCollapsed(!collapsed);

    const copyAll = () => {
        clipboard.copy(item.codeContent);
        iziToast.show({
            title: "copied",
            color: "green",
            position: "center",
        });
    };

    useEffect(() => {
        updateRender(parseMarkdown(marked, item.codeContent));
    }, [item.codeContent, marked]);
    const handleDelete = () => {
        fetch(constants.API_BASE_URL + deleteHerf, {
            method: "POST",
        })
            .then((response) => {
                if (response.status === 200) {
                    return response.text();
                } else {
                    return Promise.reject(
                        new Error(response.status + " " + response.statusText),
                    );
                }
            })
            .then((data) => {
                iziToast.show({
                    title: data || "success",
                    color: "green",
                    position: "center",
                });
                notifyRefresh();
            })
            .catch((error) => {
                console.error(error);
                iziToast.show({
                    title: error,
                    color: "red",
                    position: "center",
                });
            });
    };
    return (
        <li className="list-group-item">
            <div className="snippet-action">
                <p style={{ fontWeight: "bold", wordBreak: "break-word" }}>
                    {item.title}
                </p>
                <Link to={editHref}>修改</Link>{" "}
                <Button
                    className={collapsed ? "" : "active"}
                    size="sm"
                    outline
                    onClick={toggleCode}
                >
                    切换
                </Button>{" "}
                <Button size="sm" onClick={copyAll}>
                    复制
                </Button>{" "}
                <Button size="sm" onClick={handleDelete}>
                    删除
                </Button>
            </div>

            <Collapse isOpen={!collapsed}>
                <div
                    className="code"
                    dangerouslySetInnerHTML={{ __html: rendered }}
                ></div>
            </Collapse>
        </li>
    );
}

export default Snippet;
