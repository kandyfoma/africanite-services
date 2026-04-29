import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Container, Navbar, Nav, NavDropdown } from "react-bootstrap";
import logo from "../assets/logo-africanite.png";
import "../styles/Navbar.css";

const NavbarComponent = () => {
    const location = useLocation();
    const [expanded, setExpanded] = useState(false);

    const handleNavClick = () => {
        setExpanded(false);
    };

    const isApplicationActive = [
        "/hk-management-system",
        "/wennze",
        "/goshopper",
    ].includes(location.pathname);

    const isOutilsActive = [
        "/qrcode",
        "/invoice",
    ].includes(location.pathname);

    return (
        <Navbar
            expand="lg"
            className="navbar-apple"
            sticky="top"
            expanded={expanded}
            onToggle={(isExpanded) => setExpanded(isExpanded)}
        >
            <Container>
                <Navbar.Brand as={Link} to="/">
                    <img src={logo} alt="Africanite" className="logo" />
                </Navbar.Brand>
                <Navbar.Toggle aria-controls="navbar-nav" />
                <Navbar.Collapse id="navbar-nav">
                    <Nav className="ms-auto">
                        <Nav.Link
                            as={Link}
                            to="/"
                            className={location.pathname === "/" ? "active" : ""}
                            onClick={handleNavClick}
                        >
                            Accueil
                        </Nav.Link>
                        <Nav.Link
                            as={Link}
                            to="/services"
                            className={location.pathname === "/services" ? "active" : ""}
                            onClick={handleNavClick}
                        >
                            Services
                        </Nav.Link>
                        <NavDropdown
                            title="Applications"
                            id="applications-dropdown"
                            className={isApplicationActive ? "active" : ""}
                        >
                            <NavDropdown.Item
                                as={Link}
                                to="/hk-management-system"
                                onClick={handleNavClick}
                                active={location.pathname === "/hk-management-system"}
                            >
                                HK Management System
                            </NavDropdown.Item>
                            <NavDropdown.Item
                                as={Link}
                                to="/wennze"
                                onClick={handleNavClick}
                                active={location.pathname === "/wennze"}
                            >
                                Wennze
                            </NavDropdown.Item>
                            <NavDropdown.Item
                                as={Link}
                                to="/goshopper"
                                onClick={handleNavClick}
                                active={location.pathname === "/goshopper"}
                            >
                                GoShopper
                            </NavDropdown.Item>
                        </NavDropdown>
                        <NavDropdown
                            title="Outils"
                            id="outils-dropdown"
                            className={isOutilsActive ? "active" : ""}
                        >
                            <NavDropdown.Item
                                as={Link}
                                to="/qrcode"
                                onClick={handleNavClick}
                                active={location.pathname === "/qrcode"}
                            >
                                Générateur QR
                            </NavDropdown.Item>
                            <NavDropdown.Item
                                as={Link}
                                to="/invoice"
                                onClick={handleNavClick}
                                active={location.pathname === "/invoice"}
                            >
                                Générateur de Factures
                            </NavDropdown.Item>
                        </NavDropdown>
                        <Nav.Link
                            as={Link}
                            to="/about"
                            className={location.pathname === "/about" ? "active" : ""}
                            onClick={handleNavClick}
                        >
                            À Propos
                        </Nav.Link>
                        <Nav.Link
                            as={Link}
                            to="/contact"
                            className={location.pathname === "/contact" ? "active" : ""}
                            onClick={handleNavClick}
                        >
                            Contact
                        </Nav.Link>
                    </Nav>
                </Navbar.Collapse>
            </Container>
        </Navbar>
    );
};

export default NavbarComponent;