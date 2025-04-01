import React from "react";
import { Container, Row, Col, Button } from "react-bootstrap";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import "../styles/Home.css";
const Home = () => {
    const navigate = useNavigate();
    return (React.createElement("div", { className: "home" },
        React.createElement("section", { className: "hero" },
            React.createElement(Container, null,
                React.createElement(motion.div, { className: "hero-content", initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.8 } },
                    React.createElement("h1", null, "Transformez Votre Vision Num\u00E9rique en R\u00E9alit\u00E9"),
                    React.createElement("p", null, "Votre partenaire de confiance en conseil informatique, d\u00E9veloppement web et innovation num\u00E9rique"),
                    React.createElement(Button, { variant: "primary", className: "cta-button", onClick: () => navigate("/contact") }, "Commencer")))),
        React.createElement("section", { className: "services" },
            React.createElement(Container, null,
                React.createElement("h2", null, "Nos Services"),
                React.createElement(Row, { className: "services-grid" }, [
                    {
                        icon: "fa-globe",
                        title: "Développement Web",
                        description: "Sites web et applications personnalisés construits avec les technologies de pointe"
                    },
                    {
                        icon: "fa-mobile-alt",
                        title: "Applications Mobiles",
                        description: "Applications mobiles natives et multiplateformes pour iOS et Android"
                    },
                    {
                        icon: "fa-laptop-code",
                        title: "Conseil Informatique",
                        description: "Orientation stratégique en technologie et solutions de transformation numérique"
                    },
                    {
                        icon: "fa-cogs",
                        title: "Services Informatiques",
                        description: "Support et maintenance informatique complets pour votre entreprise"
                    }
                ].map((service, index) => (React.createElement(Col, { key: index, md: 6, lg: 3 },
                    React.createElement(motion.div, { className: "service-card", whileHover: { scale: 1.05 }, initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.5, delay: index * 0.2 } },
                        React.createElement("i", { className: `fas ${service.icon}` }),
                        React.createElement("h3", null, service.title),
                        React.createElement("p", null, service.description)))))))),
        React.createElement("section", { className: "why-us" },
            React.createElement(Container, null,
                React.createElement("h2", null, "Pourquoi Choisir Africanite Services?"),
                React.createElement(Row, { className: "features-grid" },
                    React.createElement(Col, { md: 4 },
                        React.createElement(motion.div, { className: "feature", whileHover: { scale: 1.05 }, initial: { opacity: 0 }, whileInView: { opacity: 1 }, viewport: { once: true } },
                            React.createElement("i", { className: "fas fa-check-circle" }),
                            React.createElement("h3", null, "Expertise"),
                            React.createElement("p", null, "Des ann\u00E9es d'exp\u00E9rience dans la fourniture de solutions informatiques de qualit\u00E9"))),
                    React.createElement(Col, { md: 4 },
                        React.createElement(motion.div, { className: "feature", whileHover: { scale: 1.05 }, initial: { opacity: 0 }, whileInView: { opacity: 1 }, viewport: { once: true } },
                            React.createElement("i", { className: "fas fa-handshake" }),
                            React.createElement("h3", null, "Orient\u00E9 Client"),
                            React.createElement("p", null, "D\u00E9vou\u00E9 \u00E0 comprendre et r\u00E9pondre \u00E0 vos besoins sp\u00E9cifiques"))),
                    React.createElement(Col, { md: 4 },
                        React.createElement(motion.div, { className: "feature", whileHover: { scale: 1.05 }, initial: { opacity: 0 }, whileInView: { opacity: 1 }, viewport: { once: true } },
                            React.createElement("i", { className: "fas fa-rocket" }),
                            React.createElement("h3", null, "Innovation"),
                            React.createElement("p", null, "Utilisation des derni\u00E8res technologies pour des solutions optimales")))))),
        React.createElement("section", { className: "cta-section" },
            React.createElement(Container, null,
                React.createElement(motion.div, { initial: { opacity: 0, y: 20 }, whileInView: { opacity: 1, y: 0 }, viewport: { once: true } },
                    React.createElement("h2", null, "Pr\u00EAt \u00E0 Commencer Votre Voyage Num\u00E9rique?"),
                    React.createElement("p", null, "Discutons de la fa\u00E7on dont nous pouvons transformer votre entreprise"),
                    React.createElement(Button, { variant: "warning", size: "lg", className: "cta-button", onClick: () => navigate("/contact") }, "Contactez-Nous Aujourd'hui"))))));
};
export default Home;
