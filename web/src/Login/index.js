import { Button, Input } from "reactstrap";
import "./login.css"
import constants from "../Context/constants";
import { useState } from "react";
import iziToast from "izitoast";
import objectToForm from "../Common/form-data";
import localforage from "localforage";

function Login() {

    const [password, updatePassword] = useState("")
    const handleSubmit = async (event) => {
        event.preventDefault();
        try {
            let result = await fetch(constants.LOGIN_URL + "/login", {
                method: "POST",
                body: objectToForm({
                    password
                })
            })
            await localforage.setItem("core-key", result.text())
            iziToast.success({
                title: "login success",
                position: "center"
            })
        } catch (error) {
            iziToast.error({
                title: error.message,
                position: "center"
            })
        }
        
    }

    const handlePasswordChange = function(event) {
        updatePassword(event.target.value)
    }

    return <div className="login-container">
        <div>
            <form onSubmit={handleSubmit}>
                <Input name="password" value={password} onChange={handlePasswordChange}/>

                <Button color="primary" type="submit" id="submit">
                    登录
                </Button>
            </form>
        </div>
    </div>
}

export default Login;