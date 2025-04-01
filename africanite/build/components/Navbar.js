import React from "react";
import { Link } from "react-router-dom";
import { Container, Navbar, Nav } from "react-bootstrap";
import { motion } from "framer-motion";
import logo from "../assets/logo-africanite.png"; // Adjust the path to your logo file
import "../styles/Navbar.css";
const NavbarComponent = () => {
    return (React.createElement(motion.div, { initial: { opacity: 0, y: -20 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.8 } },
        React.createElement(Navbar, { expand: "lg", className: "navbar", sticky: "top" },
            React.createElement(Container, null,
                React.createElement(Navbar.Brand, { as: Link, to: "/" },
                    React.createElement("img", { src: logo, alt: "Africanite Logo", className: "logo" })),
                React.createElement(Navbar.Toggle, { "aria-controls": "navbar-nav" }),
                React.createElement(Navbar.Collapse, { id: "navbar-nav" },
                    React.createElement(Nav, { className: "ms-auto" },
                        React.createElement(Nav.Link, { as: Link, to: "/", className: "nav-link" }, "Home"),
                        React.createElement(Nav.Link, { as: Link, to: "/about", className: "nav-link" }, "About Us"),
                        React.createElement(Nav.Link, { as: Link, to: "/contact", className: "nav-link" }, "Contact Us")))))));
};
export default NavbarComponent;
