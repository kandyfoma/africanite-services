import React, { useState } from "react";
import { Container, Row, Col, Form, Button } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faPhone,
    faEnvelope,
    faMapMarkerAlt,
    faPaperPlane,
} from "@fortawesome/free-solid-svg-icons";
import { faWhatsapp } from "@fortawesome/free-brands-svg-icons";
import "../styles/ContactUs.css";

const ContactUs = () => {
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        subject: "",
        message: "",
    });
    const [formStatus, setFormStatus] = useState(null);
    const [sending, setSending] = useState(false);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSending(true);
        setFormStatus(null);

        try {
            const mailtoLink = `mailto:info@africaniteservices.com?subject=${encodeURIComponent(
                formData.subject || "Nouveau message depuis le site web"
            )}&body=${encodeURIComponent(
                `Nom: ${formData.name}\nEmail: ${formData.email}\n\n${formData.message}`
            )}`;
            window.location.href = mailtoLink;
            setFormStatus({ type: "success", message: "Votre client email va s'ouvrir. Merci de nous avoir contactés !" });
            setFormData({ name: "", email: "", subject: "", message: "" });
        } catch {
            setFormStatus({ type: "error", message: "Une erreur est survenue. Veuillez réessayer ou nous contacter via WhatsApp." });
        } finally {
            setSending(false);
        }
    };

    const contactInfo = [
        {
            icon: faWhatsapp,
            text: "WhatsApp",
            link: "https://wa.me/243851054526",
            label: "Contactez-nous sur WhatsApp",
            primary: true,
        },
        {
            icon: faPhone,
            text: "+243 851 054 526",
            link: "tel:+243851054526",
            label: "Appelez-nous",
        },
        {
            icon: faEnvelope,
            text: "info@africaniteservices.com",
            link: "mailto:info@africaniteservices.com",
            label: "Envoyez-nous un email",
        },
        {
            icon: faMapMarkerAlt,
            text: "18 Av. Usoke, C/Kampemba, Haut Katanga, Lubumbashi, RD Congo",
            link: "https://maps.google.com/?q=18+Av.+Usoke,+Kampemba,+Lubumbashi,+DRC",
            label: "Voir sur la carte",
        },
    ];

    return (
        <div className="contact-page">
            <div className="contact-hero">
                <Container>
                    <h1>Contactez-Nous</h1>
                    <p>
                        Nous sommes là pour vous aider. Contactez-nous via WhatsApp
                        pour une réponse rapide.
                    </p>
                </Container>
            </div>
            <Container>
                <div className="contact-info">
                    {contactInfo.map((info, index) => (
                        <a
                            key={index}
                            href={info.link}
                            className={`info-item ${info.primary ? "primary" : ""
                                }`}
                            target={
                                info.icon === faMapMarkerAlt ? "_blank" : "_self"
                            }
                            rel={
                                info.icon === faMapMarkerAlt
                                    ? "noopener noreferrer"
                                    : ""
                            }
                        >
                            <FontAwesomeIcon icon={info.icon} className="info-icon" />
                            <div className="info-content">
                                <h3>{info.label}</h3>
                                <p>{info.text}</p>
                            </div>
                        </a>
                    ))}
                </div>

                {/* Contact Form */}
                <Row className="mt-5">
                    <Col lg={8} className="mx-auto">
                        <div className="contact-form-wrapper">
                            <h2 className="text-center mb-4">Envoyez-nous un message</h2>
                            <Form onSubmit={handleSubmit}>
                                <Row>
                                    <Col md={6}>
                                        <Form.Group className="mb-3">
                                            <Form.Label>Nom complet *</Form.Label>
                                            <Form.Control
                                                type="text"
                                                name="name"
                                                value={formData.name}
                                                onChange={handleChange}
                                                placeholder="Votre nom"
                                                required
                                            />
                                        </Form.Group>
                                    </Col>
                                    <Col md={6}>
                                        <Form.Group className="mb-3">
                                            <Form.Label>Email *</Form.Label>
                                            <Form.Control
                                                type="email"
                                                name="email"
                                                value={formData.email}
                                                onChange={handleChange}
                                                placeholder="votre@email.com"
                                                required
                                            />
                                        </Form.Group>
                                    </Col>
                                </Row>
                                <Form.Group className="mb-3">
                                    <Form.Label>Sujet</Form.Label>
                                    <Form.Control
                                        type="text"
                                        name="subject"
                                        value={formData.subject}
                                        onChange={handleChange}
                                        placeholder="Sujet de votre message"
                                    />
                                </Form.Group>
                                <Form.Group className="mb-3">
                                    <Form.Label>Message *</Form.Label>
                                    <Form.Control
                                        as="textarea"
                                        rows={5}
                                        name="message"
                                        value={formData.message}
                                        onChange={handleChange}
                                        placeholder="Décrivez votre projet ou votre demande..."
                                        required
                                    />
                                </Form.Group>
                                <div className="text-center">
                                    <Button
                                        type="submit"
                                        variant="primary"
                                        size="lg"
                                        disabled={sending}
                                        className="px-5"
                                    >
                                        <FontAwesomeIcon icon={faPaperPlane} className="me-2" />
                                        {sending ? "Envoi en cours..." : "Envoyer le Message"}
                                    </Button>
                                </div>
                                {formStatus && (
                                    <div className={`form-message ${formStatus.type} mt-3`}>
                                        {formStatus.message}
                                    </div>
                                )}
                            </Form>
                        </div>
                    </Col>
                </Row>
            </Container>
        </div>
    );
};

export default ContactUs;