import { Fragment, useContext, useEffect, useState } from "react"
import Snippet from "../Detail/item"
import { Container } from "reactstrap"
import ClipboardJS from "clipboard"
import iziToast from 'izitoast';
import "izitoast/dist/css/iziToast.css"
import { ConstantsContext } from "../Context/ConstantsContext";
import Pagination from "./pagination";
import useAbortableEffect from "../Hooks/AbortableEffect";

function List({marked, word}) {
    const [state, updateState] = useState(null)
    const [refreshIndex, nextRefresh] = useState(undefined)
    const [loadingState, updateLoadingState] = useState(null)
    const constants = useContext(ConstantsContext)
    const [page, updatePage] = useState(1)
    const count = constants.MAX_ITEMS
    useAbortableEffect((signal)=> {
        updateLoadingState('loading')
        const response = fetch(`${constants.API_BASE_URL}/search?word=${word}&start=${(page - 1) * count}&count=${count}`, {
            signal
        })
        response.then((response) => response.json()).then((data) => {
            updateState(data)
            updateLoadingState(null)
        }).catch((error) => {
            console.error(error)
            updateLoadingState(error.message)
        })
        const globalClickListener = function(event) {
            const target = event.target
            if (target.className.indexOf("copy-code-block") >= 0) {
                ClipboardJS.copy(target.nextSibling.firstChild.innerText)
                iziToast.show({
                    title: 'copied',
                    color: 'green',
                    position: 'center'
                })
            }
        }
        document.addEventListener('click', globalClickListener)
        return () => {
            document.removeEventListener('click', globalClickListener)
        }
    }, [refreshIndex, page])
    
    const notifyRefresh = () => {
        console.log('notifyRefresh', refreshIndex)
        nextRefresh((refreshIndex || 0) + 1)
    }
    const notifyPageChange = (page) => {
        updatePage(page)
    }
    let result
    if (state == null && loadingState == null) {
        result = <div className="loading">
            <p>初始化中</p>
        </div> 
    } else if (loadingState != null) {
        result = <div className="loading">
            <p>{loadingState}</p>
        </div> 
    } else if (state.data.length == 0) {
        result = <div className="loading">
            <p>empty</p>
        </div>
    } else {
        const list = state.data.map(element =>
            <Snippet item={element} marked={marked} key={element.id} notifyRefresh={notifyRefresh}/>
        );
        result = <Container>
            <p style={{ marginTop: "6px" }}>
                <button className="btn btn-primary" type="button" data-bs-toggle="collapse" data-bs-target=".collapseExample"
                    aria-expanded="false" aria-controls="collapse">切换</button>
            </p>
            <ul className="list-group">{list}</ul>

            <Pagination currentPage={page} totalPages={Math.ceil(state.total / count)} onChangePage={notifyPageChange}/>
        </Container>
    }
    return (
        <Fragment>
            {result}
        </Fragment>
    )
}
export default List