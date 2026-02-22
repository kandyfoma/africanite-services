import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Container, Navbar, Nav, NavDropdown } from "react-bootstrap";
import { motion } from "framer-motion";
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
        "/qrcode"
    ].includes(location.pathname);

    return (
        <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
        >
            <Navbar
                expand="lg"
                className="navbar"
                sticky="top"
                expanded={expanded} // Contrôlez l'état du menu déroulant
                onToggle={(isExpanded) => setExpanded(isExpanded)} // Mettez à jour l'état lors du basculement
            >
                <Container>
                    <Navbar.Brand as={Link} to="/">
                        <img src={logo} alt="Logo Africanite" className="logo" />
                    </Navbar.Brand>
                    <Navbar.Toggle aria-controls="navbar-nav" />
                    <Navbar.Collapse id="navbar-nav">
                        <Nav className="ms-auto">
                            <Nav.Link
                                as={Link}
                                to="/"
                                className={`nav-link ${location.pathname === "/" ? "active" : ""}`}
                                onClick={handleNavClick}
                            >
                                Accueil
                            </Nav.Link>
                            <Nav.Link
                                as={Link}
                                to="/services"
                                className={`nav-link ${location.pathname === "/services" ? "active" : ""}`}
                                onClick={handleNavClick}
                            >
                                Nos Services
                            </Nav.Link>
                            <NavDropdown
                                title="Nos Applications"
                                id="applications-dropdown"
                                className={`nav-dropdown ${isApplicationActive ? "active" : ""}`}
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
                                <NavDropdown.Item
                                    as={Link}
                                    to="/qrcode"
                                    onClick={handleNavClick}
                                    active={location.pathname === "/qrcode"}
                                >
                                    QR Code Generator
                                </NavDropdown.Item>
                            </NavDropdown>
                            <Nav.Link
                                as={Link}
                                to="/about"
                                className={`nav-link ${location.pathname === "/about" ? "active" : ""}`}
                                onClick={handleNavClick}
                            >
                                À Propos
                            </Nav.Link>
                            <Nav.Link
                                as={Link}
                                to="/contact"
                                className={`nav-link ${location.pathname === "/contact" ? "active" : ""}`}
                                onClick={handleNavClick}
                            >
                                Contact
                            </Nav.Link>
                        </Nav>
                    </Navbar.Collapse>
                </Container>
            </Navbar>
        </motion.div>
    );
};

export default NavbarComponent;