import React, { useRef, useState } from "react";
import { Container, Row, Col, Form, Button } from "react-bootstrap";
import { motion } from "framer-motion";
import emailjs from "@emailjs/browser";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faEnvelope,
    faPhone,
    faMapMarkerAlt,
    faPaperPlane,
    faUser,
    faComment
} from '@fortawesome/free-solid-svg-icons';
import "../styles/ContactUs.css";

const ContactUs = () => {
    const form = useRef();
    const [message, setMessage] = useState("");
    const [messageType, setMessageType] = useState("");
    const [errors, setErrors] = useState({});

    const validateForm = (formData) => {
        const newErrors = {};
        if (!formData.get("user_name")) newErrors.user_name = "Le nom est requis.";
        if (!formData.get("user_email")) {
            newErrors.user_email = "L'email est requis.";
        } else if (!/\S+@\S+\.\S+/.test(formData.get("user_email"))) {
            newErrors.user_email = "L'email n'est pas valide.";
        }
        if (!formData.get("message")) newErrors.message = "Le message est requis.";
        return newErrors;
    };

    const sendEmail = (e) => {
        e.preventDefault();
        setMessage("");
        setMessageType("");
        setErrors({});

        const formData = new FormData(form.current);
        const validationErrors = validateForm(formData);

        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors);
            return;
        }

        emailjs
            .sendForm(
                process.env.REACT_APP_EMAILJS_SERVICE_ID,
                process.env.REACT_APP_EMAILJS_TEMPLATE_ID,
                form.current,
                process.env.REACT_APP_EMAILJS_PUBLIC_KEY
            )
            .then(
                (result) => {
                    setMessage("Message envoyé avec succès!");
                    setMessageType("success");
                    form.current.reset();
                },
                (error) => {
                    setMessage("Une erreur s'est produite. Veuillez réessayer.");
                    setMessageType("error");
                }
            );
    };

    return (
        <div className="contact-page">
            {/* Hero Section */}
            <motion.section
                className="contact-hero"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.8 }}
            >
                <Container>
                    <h1>Contactez-Nous</h1>
                    <p>Nous sommes là pour répondre à vos questions et vous accompagner dans vos projets.</p>
                </Container>
            </motion.section>

            {/* Contact Form Section */}
            <section className="contact-form-section">
                <Container>
                    <h2 className="text-center mb-4">Envoyez-nous un message</h2>
                    <Row className="justify-content-center">
                        {/* Contact Info */}
                        <Col md={6}>
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.8, delay: 0.2 }}
                            >
                                <div className="contact-info mb-4">
                                    <div className="info-item">
                                        <FontAwesomeIcon icon={faEnvelope} className="info-icon" />
                                        <p>contact@africaniteservices.com</p>
                                    </div>
                                    <div className="info-item">
                                        <FontAwesomeIcon icon={faPhone} className="info-icon" />
                                        <p>+33 1 23 45 67 89</p>
                                    </div>
                                    <div className="info-item">
                                        <FontAwesomeIcon icon={faMapMarkerAlt} className="info-icon" />
                                        <p>Paris, France</p>
                                    </div>
                                </div>
                            </motion.div>
                        </Col>

                        {/* Contact Form */}
                        <Col md={6}>
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.8, delay: 0.4 }}
                                className="contact-form-wrapper"
                            >
                                <Form ref={form} onSubmit={sendEmail} className="contact-form">
                                    <Form.Group className="mb-3">
                                        <Form.Label>
                                            <FontAwesomeIcon icon={faUser} className="me-2" />
                                            Nom
                                        </Form.Label>
                                        <Form.Control
                                            type="text"
                                            name="user_name"
                                            placeholder="Votre nom"
                                            isInvalid={!!errors.user_name}
                                        />
                                        <Form.Control.Feedback type="invalid">
                                            {errors.user_name}
                                        </Form.Control.Feedback>
                                    </Form.Group>

                                    <Form.Group className="mb-3">
                                        <Form.Label>
                                            <FontAwesomeIcon icon={faEnvelope} className="me-2" />
                                            Email
                                        </Form.Label>
                                        <Form.Control
                                            type="email"
                                            name="user_email"
                                            placeholder="votre@email.com"
                                            isInvalid={!!errors.user_email}
                                        />
                                        <Form.Control.Feedback type="invalid">
                                            {errors.user_email}
                                        </Form.Control.Feedback>
                                    </Form.Group>

                                    <Form.Group className="mb-3">
                                        <Form.Label>
                                            <FontAwesomeIcon icon={faComment} className="me-2" />
                                            Message
                                        </Form.Label>
                                        <Form.Control
                                            as="textarea"
                                            name="message"
                                            rows={4}
                                            placeholder="Votre message..."
                                            isInvalid={!!errors.message}
                                        />
                                        <Form.Control.Feedback type="invalid">
                                            {errors.message}
                                        </Form.Control.Feedback>
                                    </Form.Group>

                                    <Button variant="primary" type="submit" className="w-100">
                                        <FontAwesomeIcon icon={faPaperPlane} className="me-2" />
                                        Envoyer
                                    </Button>
                                </Form>
                                {message && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className={`form-message ${messageType}`}
                                    >
                                        {message}
                                    </motion.div>
                                )}
                            </motion.div>
                        </Col>
                    </Row>
                </Container>
            </section>
        </div>
    );
};

export default ContactUs;