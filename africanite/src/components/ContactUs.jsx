import React from "react";
import { Container } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faPhone,
    faWhatsapp,
    faEnvelope,
    faMapMarkerAlt,
} from "@fortawesome/free-solid-svg-icons";
import "../styles/ContactUs.css";

const ContactUs = () => {
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
            </Container>
        </div>
    );
};

export default ContactUs;