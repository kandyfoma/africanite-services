import React from "react";
import { Container, Row, Col } from "react-bootstrap";
import { motion } from "framer-motion";
import "../styles/Footer.css";
const Footer = () => {
    return (React.createElement("footer", { className: "footer" },
        React.createElement(Container, null,
            React.createElement(motion.div, { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.8 } },
                React.createElement(Row, { className: "footer-top" },
                    React.createElement(Col, { md: 6, className: "text-center text-md-start" },
                        React.createElement("h3", null, "Africanite Services"),
                        React.createElement("p", null, "Votre partenaire de confiance pour des solutions num\u00E9riques innovantes.")),
                    React.createElement(Col, { md: 6, className: "text-center text-md-end" },
                        React.createElement("ul", { className: "social-links" },
                            React.createElement("li", null,
                                React.createElement("a", { href: "https://facebook.com", target: "_blank", rel: "noopener noreferrer" },
                                    React.createElement("i", { className: "fab fa-facebook-f" }))),
                            React.createElement("li", null,
                                React.createElement("a", { href: "https://twitter.com", target: "_blank", rel: "noopener noreferrer" },
                                    React.createElement("i", { className: "fab fa-twitter" }))),
                            React.createElement("li", null,
                                React.createElement("a", { href: "https://linkedin.com", target: "_blank", rel: "noopener noreferrer" },
                                    React.createElement("i", { className: "fab fa-linkedin-in" }))),
                            React.createElement("li", null,
                                React.createElement("a", { href: "https://instagram.com", target: "_blank", rel: "noopener noreferrer" },
                                    React.createElement("i", { className: "fab fa-instagram" })))))),
                React.createElement("hr", null),
                React.createElement(Row, { className: "footer-bottom" },
                    React.createElement(Col, { md: 6, className: "text-center text-md-start" },
                        React.createElement("p", null, "\u00A9 2025 Africanite Services. Tous droits r\u00E9serv\u00E9s.")),
                    React.createElement(Col, { md: 6, className: "text-center text-md-end" },
                        React.createElement("ul", { className: "footer-links" },
                            React.createElement("li", null,
                                React.createElement("a", { href: "/privacy-policy" }, "Politique de Confidentialit\u00E9")),
                            React.createElement("li", null,
                                React.createElement("a", { href: "/terms-of-service" }, "Conditions d'Utilisation")),
                            React.createElement("li", null,
                                React.createElement("a", { href: "/contact" }, "Contactez-Nous")))))))));
};
export default Footer;
