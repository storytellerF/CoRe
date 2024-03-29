import "bootstrap/dist/css/bootstrap.css";
import { useState } from "react";
import {
    Nav,
    NavItem,
    NavLink,
    Navbar,
    NavbarBrand,
    NavbarToggler,
    Collapse,
    InputGroup,
    Button,
    Input,
    Form,
} from "reactstrap";
import { NavLink as RouterLink, useLocation, useNavigate } from "react-router-dom";
import { logout } from "../Common/api";
function TopNav() {
    const [collapsed, setCollapsed] = useState(true);

    const toggleNavbar = () => setCollapsed(!collapsed);

    let pages = [
        {
            herf: "/index",
            text: "首页",
        },
        {
            herf: "/add",
            text: "添加",
        },
        {
            herf: "/all",
            text: "全部",
        },
        {
            herf: "/login",
            text: "登录"
        }
    ];
    let pageLinks = pages.map((element) => (
        <NavItem key={element.herf}>
            <RouterLink
                className={({ isActive, isPending }) =>
                    isPending
                        ? "pending nav-link"
                        : isActive
                          ? "active nav-link"
                          : "nav-link"
                }
                to={element.herf}
            >
                {element.text}
            </RouterLink>
        </NavItem>
    ));
    const location = useLocation();
    const navigate = useNavigate()
    const queryParams = new URLSearchParams(location.search);
    const word = queryParams.get("word");
    const [inputValue, setInputValue] = useState(word || "");

    const handleInputChange = (event) => {
        setInputValue(event.target.value);
    };

    const handleLogout = () => {
        logout()
        if (location.pathname !== "/") {
            navigate("/")
        }
    }

    return (
        <Navbar color="light" light expand="md">
            <NavbarBrand href="/">CoRe</NavbarBrand>
            <NavbarToggler onClick={toggleNavbar} />
            <Collapse isOpen={!collapsed} navbar>
                <Nav className="me-auto" navbar>
                    {pageLinks}

                    <Button onClick={handleLogout} outline>注销</Button>
                    <NavItem>
                        <NavLink href="https://github.com/storytellerF/CoRe">
                            GitHub
                        </NavLink>
                    </NavItem>
                </Nav>
                <Form className="d-flex" method="get" action="/search">
                    <InputGroup>
                        <Input
                            placeholder="Search something"
                            name="word"
                            value={inputValue}
                            onChange={handleInputChange}
                        />
                        <Button color="secondary">Search</Button>
                    </InputGroup>
                </Form>
            </Collapse>
        </Navbar>
    );
}

export default TopNav;
