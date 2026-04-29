import React, { useState } from "react";
import { Container, Row, Col, Form, Button } from "react-bootstrap";
import { Phone, Mail, MapPin, Send, MessageCircle } from "lucide-react";
import { motion } from "framer-motion";
import "../styles/ContactUs.css";

const fadeUp = {
    hidden: { opacity: 0, y: 24 },
    visible: (i = 0) => ({
        opacity: 1, y: 0,
        transition: { duration: 0.5, delay: i * 0.08, ease: [0.25, 0.1, 0.25, 1] },
    }),
};

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
        { icon: MessageCircle, text: "WhatsApp", link: "https://wa.me/243851054526", label: "Contactez-nous sur WhatsApp", primary: true },
        { icon: Phone, text: "+243 851 054 526", link: "tel:+243851054526", label: "Appelez-nous" },
        { icon: Mail, text: "info@africaniteservices.com", link: "mailto:info@africaniteservices.com", label: "Envoyez-nous un email" },
        { icon: MapPin, text: "18 Av. Usoke, C/Kampemba, Lubumbashi, RD Congo", link: "https://maps.google.com/?q=18+Av.+Usoke,+Kampemba,+Lubumbashi,+DRC", label: "Voir sur la carte", external: true },
    ];

    return (
        <div className="contact-apple">
            <div className="contact-hero-apple">
                <Container>
                    <motion.div initial="hidden" animate="visible" variants={fadeUp}>
                        <h1>Contactez-Nous</h1>
                        <p>Nous sommes là pour vous aider. Contactez-nous via WhatsApp pour une réponse rapide.</p>
                    </motion.div>
                </Container>
            </div>

            <Container>
                <div className="contact-grid">
                    {contactInfo.map((info, i) => (
                        <motion.a
                            key={i}
                            href={info.link}
                            className={`contact-card${info.primary ? " contact-card-primary" : ""}`}
                            target={info.external ? "_blank" : "_self"}
                            rel={info.external ? "noopener noreferrer" : ""}
                            custom={i}
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: true }}
                            variants={fadeUp}
                        >
                            <div className="contact-card-icon">
                                <info.icon size={22} strokeWidth={1.5} />
                            </div>
                            <div>
                                <h3>{info.label}</h3>
                                <p>{info.text}</p>
                            </div>
                        </motion.a>
                    ))}
                </div>

                <Row className="mt-5">
                    <Col lg={7} className="mx-auto">
                        <motion.div className="contact-form-apple" initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}>
                            <h2>Envoyez-nous un message</h2>
                            <Form onSubmit={handleSubmit}>
                                <Row className="g-3">
                                    <Col md={6}>
                                        <Form.Group>
                                            <Form.Label>Nom complet</Form.Label>
                                            <Form.Control type="text" name="name" value={formData.name} onChange={handleChange} placeholder="Votre nom" required />
                                        </Form.Group>
                                    </Col>
                                    <Col md={6}>
                                        <Form.Group>
                                            <Form.Label>Email</Form.Label>
                                            <Form.Control type="email" name="email" value={formData.email} onChange={handleChange} placeholder="votre@email.com" required />
                                        </Form.Group>
                                    </Col>
                                </Row>
                                <Form.Group className="mt-3">
                                    <Form.Label>Sujet</Form.Label>
                                    <Form.Control type="text" name="subject" value={formData.subject} onChange={handleChange} placeholder="Sujet de votre message" />
                                </Form.Group>
                                <Form.Group className="mt-3">
                                    <Form.Label>Message</Form.Label>
                                    <Form.Control as="textarea" rows={5} name="message" value={formData.message} onChange={handleChange} placeholder="Décrivez votre projet..." required />
                                </Form.Group>
                                <div className="mt-4">
                                    <Button type="submit" disabled={sending} className="btn-submit-apple">
                                        <Send size={16} strokeWidth={1.5} />
                                        {sending ? "Envoi..." : "Envoyer"}
                                    </Button>
                                </div>
                                {formStatus && (
                                    <div className={`form-message ${formStatus.type} mt-3`}>
                                        {formStatus.message}
                                    </div>
                                )}
                            </Form>
                        </motion.div>
                    </Col>
                </Row>
            </Container>
        </div>
    );
};

export default ContactUs;