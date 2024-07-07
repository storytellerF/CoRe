import { Fragment, useContext, useEffect, useState } from "react";
import Snippet from "../Detail/item";
import { Button, Container } from "reactstrap";
import "izitoast/dist/css/iziToast.css";
import { ConstantsContext } from "../Context/ConstantsContext";
import Pagination from "./pagination";
import { copyCodeBlock } from "../Common/code-parser";
import { apiRequest } from "../Common/api";
import runWithLifecycle from "../Common/abort";
import { useNavigate } from "react-router-dom";

const globalClickListener = function (event) {
    const target = event.target;
    if (target.className.indexOf("copy-code-block") >= 0) {
        copyCodeBlock(target);
    }
};

function List({ marked, word }) {
    const [state, updateState] = useState(null);
    const [refreshIndex, nextRefresh] = useState(undefined);
    const [loadingState, updateLoadingState] = useState(null);
    const constants = useContext(ConstantsContext);
    const [page, updatePage] = useState(1);
    const navigate = useNavigate()

    const count = constants.MAX_ITEMS;
    const erorr401 = "401 Unauthorized"
    useEffect(() => {
        updateLoadingState({
            loading: true,
            error: null,
        });
        const cancelHandler = runWithLifecycle(function (state) {
            apiRequest(state.controller, `/search?word=${word}&start=${(page - 1) * count}&count=${count}`)
                .then((response) => {
                    if (response.status === 401)
                        return Promise.reject(new Error(erorr401));
                    else
                        return response.json();
                })
                .then((data) => {
                    if (state.canceled) return;
                    console.log("data", data);
                    updateState(data);
                    updateLoadingState({
                        loading: false,
                        error: null,
                    });
                })
                .catch((error) => {
                    console.error(error);
                    updateLoadingState({
                        loading: false,
                        error: error.message,
                    });
                });

            document.addEventListener("click", globalClickListener);
        })

        return () => {
            cancelHandler()
            document.removeEventListener("click", globalClickListener);
        };
    }, [refreshIndex, page, constants.API_BASE_URL, count, word]);

    const notifyRefresh = () => {
        if (loadingState.error === erorr401) {
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
    if (loadingState == null) {
        result = (
            <div className="loading">
                <p>初始化中</p>
            </div>
        );
    } else if (loadingState.error != null) {
        result = (
            <div className="loading">
                <p className="text-danger">{loadingState.error}</p>
                <Button color="primary" onClick={notifyRefresh}>{loadingState.error === erorr401 ? "login" : "refresh"}</Button>
            </div>
        );
    } else if (loadingState.loading || !state || !state.data) {
        result = (
            <div className="loading">
                <p>loading</p>
            </div>
        );
    } else if (state.data.length === 0) {
        result = (
            <div className="loading">
                <p>empty</p>
                <Button color="primary" onClick={notifyRefresh}>
                    refresh
                </Button>
            </div>
        );
    } else {
        const list = state.data.map((element) => (
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
                    totalPages={Math.ceil(state.total / count)}
                    onChangePage={notifyPageChange}
                />
            </Container>
        );
    }
    return <Fragment>{result}</Fragment>;
}
export default List;
