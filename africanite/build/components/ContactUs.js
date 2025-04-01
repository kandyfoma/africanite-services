import React, { useRef, useState } from "react";
import { Container, Row, Col, Form, Button } from "react-bootstrap";
import { motion } from "framer-motion";
import emailjs from "@emailjs/browser";
import "../styles/ContactUs.css";
const ContactUs = () => {
    const form = useRef(null);
    const [message, setMessage] = useState("");
    const sendEmail = (e) => {
        e.preventDefault();
        if (form.current) {
            emailjs
                .sendForm(process.env.REACT_APP_EMAILJS_SERVICE_ID, process.env.REACT_APP_EMAILJS_TEMPLATE_ID, form.current, process.env.REACT_APP_EMAILJS_PUBLIC_KEY)
                .then((result) => {
                var _a;
                setMessage("Message envoyé avec succès!");
                (_a = form.current) === null || _a === void 0 ? void 0 : _a.reset();
            }, (error) => {
                setMessage("Échec de l'envoi du message. Veuillez réessayer.");
            });
        }
    };
    return (React.createElement("div", { className: "contact-page" },
        React.createElement("section", { className: "contact-hero" },
            React.createElement(Container, null,
                React.createElement(motion.div, { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.8 }, className: "text-center" },
                    React.createElement("h1", null, "Contactez-Nous"),
                    React.createElement("p", null, "Parlons de votre projet et de la fa\u00E7on dont nous pouvons vous aider")))),
        React.createElement("section", { className: "contact-form-section" },
            React.createElement(Container, null,
                React.createElement(Row, { className: "justify-content-center" },
                    React.createElement(Col, { md: 6 },
                        React.createElement(motion.div, { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.8, delay: 0.2 } },
                            React.createElement("div", { className: "contact-info mb-4" },
                                React.createElement("div", { className: "info-item" },
                                    React.createElement("i", { className: "fas fa-envelope" }),
                                    React.createElement("p", null, "contact@africanite-services.com")),
                                React.createElement("div", { className: "info-item" },
                                    React.createElement("i", { className: "fas fa-phone" }),
                                    React.createElement("p", null, "+33 1 23 45 67 89")),
                                React.createElement("div", { className: "info-item" },
                                    React.createElement("i", { className: "fas fa-map-marker-alt" }),
                                    React.createElement("p", null, "Paris, France"))))),
                    React.createElement(Col, { md: 6 },
                        React.createElement(motion.div, { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.8, delay: 0.4 }, className: "contact-form-wrapper" },
                            React.createElement(Form, { ref: form, onSubmit: sendEmail, className: "contact-form" },
                                React.createElement(Form.Group, { className: "mb-3" },
                                    React.createElement(Form.Label, null, "Nom"),
                                    React.createElement(Form.Control, { type: "text", name: "user_name", required: true, placeholder: "Votre nom" })),
                                React.createElement(Form.Group, { className: "mb-3" },
                                    React.createElement(Form.Label, null, "Email"),
                                    React.createElement(Form.Control, { type: "email", name: "user_email", required: true, placeholder: "votre@email.com" })),
                                React.createElement(Form.Group, { className: "mb-3" },
                                    React.createElement(Form.Label, null, "Message"),
                                    React.createElement(Form.Control, { as: "textarea", name: "message", required: true, rows: 5, placeholder: "Votre message" })),
                                React.createElement(Button, { variant: "primary", type: "submit", className: "w-100" }, "Envoyer")),
                            message && (React.createElement(motion.div, { initial: { opacity: 0 }, animate: { opacity: 1 }, className: "form-message mt-3" }, message)))))))));
};
export default ContactUs;
