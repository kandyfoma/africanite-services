import React from "react";
import { Container, Row, Col } from "react-bootstrap";
import { motion } from "framer-motion";
import "../styles/AboutUs.css";
const AboutUs = () => {
    return (React.createElement("div", { className: "about-us" },
        React.createElement("section", { className: "about-hero" },
            React.createElement(Container, null,
                React.createElement(motion.div, { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.8 } },
                    React.createElement("h1", null, "\u00C0 Propos d'Africanite Services"),
                    React.createElement("p", null, "Votre Partenaire de Confiance en Solutions Num\u00E9riques")))),
        React.createElement("section", { className: "mission" },
            React.createElement(Container, null,
                React.createElement(Row, { className: "align-items-center" },
                    React.createElement(Col, { md: 6 },
                        React.createElement(motion.div, { initial: { opacity: 0, x: -50 }, whileInView: { opacity: 1, x: 0 }, viewport: { once: true }, transition: { duration: 0.8 } },
                            React.createElement("h2", null, "Notre Mission"),
                            React.createElement("p", null, "Chez Africanite Services, nous nous engageons \u00E0 fournir des solutions technologiques innovantes qui permettent \u00E0 nos clients de prosp\u00E9rer dans l'\u00E8re num\u00E9rique. Notre expertise en d\u00E9veloppement web, applications mobiles et services informatiques nous permet d'offrir des solutions sur mesure qui r\u00E9pondent aux besoins uniques de chaque client."))),
                    React.createElement(Col, { md: 6 },
                        React.createElement(motion.div, { initial: { opacity: 0, x: 50 }, whileInView: { opacity: 1, x: 0 }, viewport: { once: true }, transition: { duration: 0.8 } },
                            React.createElement("img", { src: "/path-to-your-image.jpg", alt: "Notre Mission", className: "mission-image" })))))),
        React.createElement("section", { className: "values" },
            React.createElement(Container, null,
                React.createElement("h2", null, "Nos Valeurs"),
                React.createElement(Row, null, [
                    {
                        icon: "fa-heart",
                        title: "Passion",
                        description: "Passionnés par l'innovation et la technologie"
                    },
                    {
                        icon: "fa-shield-alt",
                        title: "Intégrité",
                        description: "Transparence et honnêteté dans toutes nos relations"
                    },
                    {
                        icon: "fa-star",
                        title: "Excellence",
                        description: "Engagement envers la qualité et la perfection"
                    }
                ].map((value, index) => (React.createElement(Col, { key: index, md: 4 },
                    React.createElement(motion.div, { className: "value-card", initial: { opacity: 0, y: 20 }, whileInView: { opacity: 1, y: 0 }, viewport: { once: true }, transition: { duration: 0.5, delay: index * 0.2 } },
                        React.createElement("i", { className: `fas ${value.icon}` }),
                        React.createElement("h3", null, value.title),
                        React.createElement("p", null, value.description))))))))));
};
export default AboutUs;
