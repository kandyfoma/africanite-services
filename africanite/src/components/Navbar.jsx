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
        "/currency",
        "/password",
        "/loan",
        "/compress",
        "/receipt",
        "/email-signature",
        "/cv",
        "/business-card",
        "/payroll",
        "/pdf",
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
                            <NavDropdown.Item
                                as={Link}
                                to="/receipt"
                                onClick={handleNavClick}
                                active={location.pathname === "/receipt"}
                            >
                                Générateur de Reçu
                            </NavDropdown.Item>
                            <NavDropdown.Item
                                as={Link}
                                to="/cv"
                                onClick={handleNavClick}
                                active={location.pathname === "/cv"}
                            >
                                Générateur de CV
                            </NavDropdown.Item>
                            <NavDropdown.Item
                                as={Link}
                                to="/email-signature"
                                onClick={handleNavClick}
                                active={location.pathname === "/email-signature"}
                            >
                                Signature Email
                            </NavDropdown.Item>
                            <NavDropdown.Item
                                as={Link}
                                to="/business-card"
                                onClick={handleNavClick}
                                active={location.pathname === "/business-card"}
                            >
                                Carte de Visite
                            </NavDropdown.Item>
                            <NavDropdown.Divider />
                            <NavDropdown.Item
                                as={Link}
                                to="/currency"
                                onClick={handleNavClick}
                                active={location.pathname === "/currency"}
                            >
                                Convertisseur de Devises
                            </NavDropdown.Item>
                            <NavDropdown.Item
                                as={Link}
                                to="/loan"
                                onClick={handleNavClick}
                                active={location.pathname === "/loan"}
                            >
                                Calculateur de Prêt
                            </NavDropdown.Item>
                            <NavDropdown.Item
                                as={Link}
                                to="/payroll"
                                onClick={handleNavClick}
                                active={location.pathname === "/payroll"}
                            >
                                Calculateur de Paie
                            </NavDropdown.Item>
                            <NavDropdown.Divider />
                            <NavDropdown.Item
                                as={Link}
                                to="/password"
                                onClick={handleNavClick}
                                active={location.pathname === "/password"}
                            >
                                Générateur de Mot de Passe
                            </NavDropdown.Item>
                            <NavDropdown.Item
                                as={Link}
                                to="/compress"
                                onClick={handleNavClick}
                                active={location.pathname === "/compress"}
                            >
                                Compresseur d'Image
                            </NavDropdown.Item>
                            <NavDropdown.Item
                                as={Link}
                                to="/pdf"
                                onClick={handleNavClick}
                                active={location.pathname === "/pdf"}
                            >
                                Éditeur de PDF
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