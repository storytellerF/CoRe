import { Outlet } from "react-router-dom";
import TopNav from "../Nav";
import { Fragment } from "react";

function Root() {
    return (
        <Fragment>
            <TopNav />
            <Outlet />
        </Fragment>
    )
}

export default Root