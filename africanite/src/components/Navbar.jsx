import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Container, Navbar, Nav } from "react-bootstrap";
import { motion } from "framer-motion";
import logo from "../assets/logo-africanite.png"; // Ajustez le chemin vers votre logo
import "../styles/Navbar.css";

const NavbarComponent = () => {
    const location = useLocation(); // Obtenez la route actuelle
    const [expanded, setExpanded] = useState(false); // État pour contrôler le menu déroulant

    const handleNavClick = () => {
        setExpanded(false); // Fermez le menu déroulant lorsqu'un élément est cliqué
    };

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
                                onClick={handleNavClick} // Fermez le menu déroulant lors du clic
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
                            <Nav.Link
                                as={Link}
                                to="/hk-management-system"
                                className={`nav-link ${location.pathname === "/hk-management-system" ? "active" : ""}`}
                                onClick={handleNavClick}
                            >
                                HK Management
                            </Nav.Link>
                            <Nav.Link
                                as={Link}
                                to="/qrcode"
                                className={`nav-link ${location.pathname === "/qrcode" ? "active" : ""}`}
                                onClick={handleNavClick}
                            >
                                QR Code
                            </Nav.Link>
                            <Nav.Link
                                as={Link}
                                to="/about"
                                className={`nav-link ${location.pathname === "/about" ? "active" : ""}`}
                                onClick={handleNavClick} // Fermez le menu déroulant lors du clic
                            >
                                À Propos
                            </Nav.Link>
                            <Nav.Link
                                as={Link}
                                to="/contact"
                                className={`nav-link ${location.pathname === "/contact" ? "active" : ""}`}
                                onClick={handleNavClick} // Fermez le menu déroulant lors du clic
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