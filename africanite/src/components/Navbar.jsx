import React from "react";
import { Link } from "react-router-dom";
import { Container, Navbar, Nav } from "react-bootstrap";
import { motion } from "framer-motion";
import logo from "../assets/logo-africanite.png"; // Adjust the path to your logo file
import "../styles/Navbar.css";

const NavbarComponent = () => {
    return (
        <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
        >
            <Navbar expand="lg" className="navbar" sticky="top">
                <Container>
                    <Navbar.Brand as={Link} to="/">
                        <img src={logo} alt="Africanite Logo" className="logo" />
                    </Navbar.Brand>
                    <Navbar.Toggle aria-controls="navbar-nav" />
                    <Navbar.Collapse id="navbar-nav">
                        <Nav className="ms-auto">
                            <Nav.Link as={Link} to="/" className="nav-link">
                                Home
                            </Nav.Link>
                            <Nav.Link as={Link} to="/about" className="nav-link">
                                About Us
                            </Nav.Link>
                            <Nav.Link as={Link} to="/contact" className="nav-link">
                                Contact Us
                            </Nav.Link>
                        </Nav>
                    </Navbar.Collapse>
                </Container>
            </Navbar>
        </motion.div>
    );
};

export default NavbarComponent;