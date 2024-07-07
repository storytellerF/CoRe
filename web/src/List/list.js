import { Fragment, useContext, useEffect, useMemo, useState } from "react";
import Snippet from "../Detail/item";
import { Button, Container } from "reactstrap";
import "izitoast/dist/css/iziToast.css";
import { ConstantsContext } from "../Context/ConstantsContext";
import Pagination from "./pagination";
import { copyCodeBlock } from "../Common/code-parser";
import { useApi } from "../Common/api";
import { useNavigate } from "react-router-dom";
import { Loading, Error } from "../Common/api";
const globalClickListener = function (event) {
    const target = event.target;
    if (target.className.indexOf("copy-code-block") >= 0) {
        copyCodeBlock(target);
    }
};

function List({ marked, word }) {
    /**
     * @type {[ServerResponse, React.Dispatch<React.SetStateAction<ServerResponse>>]}
     */
    const [content, updateContent] = useState(null);
    const [refreshIndex, nextRefresh] = useState(undefined);
    /**
     * @type {[import("../Common/api").LoadState, React.Dispatch<React.SetStateAction<import("../Common/api").LoadState>>]}
     */
    const [loadState, updateLoadState] = useState(undefined);
    const constants = useContext(ConstantsContext);
    const [page, updatePage] = useState(1);
    const navigate = useNavigate()

    const count = constants.MAX_ITEMS;
    const url = useMemo(() => {
        return `/search?word=${word}&start=${(page - 1) * count}&count=${count}`
    }, [count, page, word])
    const api = useApi(url, updateLoadState, updateContent)
    useEffect(() => {
        return api()
    }, [api, refreshIndex])
    useEffect(() => {
        document.addEventListener("click", globalClickListener);
        return () => {
            document.removeEventListener("click", globalClickListener);
        };
    }, []);

    const notifyRefresh = () => {
        if (loadState instanceof Error && loadState.isNotAuth()) {
            navigate("/login")
        } else {
            console.log("notifyRefresh", refreshIndex);
            nextRefresh((refreshIndex || 0) + 1);
        }

    };
    const notifyPageChange = (page) => {
        updatePage(page);
    };
    let result;
    if (loadState === undefined) {
        result = (
            <div className="loading">
                <p>初始化中</p>
            </div>
        );
    } else if (loadState instanceof Error) {
        result = (
            <div className="loading">
                <p className="text-danger">{loadState.error}</p>
                <Button color="primary" onClick={notifyRefresh}>{loadState.isNotAuth() ? "login" : "refresh"}</Button>
            </div>
        );
    } else if (loadState instanceof Loading) {
        result = (
            <div className="loading">
                <p>loading</p>
            </div>
        );
    } else if (content.data.length === 0) {
        result = (
            <div className="loading">
                <p>empty</p>
                <Button color="primary" onClick={notifyRefresh}>
                    refresh
                </Button>
            </div>
        );
    } else {
        const list = content.data.map((element) => (
            <Snippet
                item={element}
                marked={marked}
                key={element.id}
                notifyRefresh={notifyRefresh}
            />
        ));
        result = (
            <Container>
                <p style={{ marginTop: "6px" }}>
                    <button
                        className="btn btn-primary"
                        type="button"
                        data-bs-toggle="collapse"
                        data-bs-target=".collapseExample"
                        aria-expanded="false"
                        aria-controls="collapse"
                    >
                        切换
                    </button>
                </p>
                <ul className="list-group">{list}</ul>

                <Pagination
                    currentPage={page}
                    totalPages={Math.ceil(content.total / count)}
                    onChangePage={notifyPageChange}
                />
            </Container>
        );
    }
    return <Fragment>{result}</Fragment>;
}
export default List;
