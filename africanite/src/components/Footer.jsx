import React from "react";
import { Container, Row, Col } from "react-bootstrap";
import { motion } from "framer-motion";
import "../styles/Footer.css";

const Footer = () => {
    return (
        <footer className="footer">
            <Container>
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                >
                    <Row className="footer-top">
                        <Col md={6} className="text-center text-md-start">
                            <h3>Africanite Services</h3>
                            <p>
                                Votre partenaire de confiance pour des solutions numériques
                                innovantes.
                            </p>
                        </Col>
                        <Col md={6} className="text-center text-md-end">
                            <ul className="social-links">
                                <li>
                                    <a
                                        href="https://facebook.com"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                    >
                                        <i className="fab fa-facebook-f"></i>
                                    </a>
                                </li>
                                <li>
                                    <a
                                        href="https://twitter.com"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                    >
                                        <i className="fab fa-twitter"></i>
                                    </a>
                                </li>
                                <li>
                                    <a
                                        href="https://linkedin.com"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                    >
                                        <i className="fab fa-linkedin-in"></i>
                                    </a>
                                </li>
                                <li>
                                    <a
                                        href="https://instagram.com"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                    >
                                        <i className="fab fa-instagram"></i>
                                    </a>
                                </li>
                            </ul>
                        </Col>
                    </Row>
                    <hr />
                    <Row className="footer-bottom">
                        <Col md={6} className="text-center text-md-start">
                            <p>&copy; 2025 Africanite Services. Tous droits réservés.</p>
                        </Col>
                        <Col md={6} className="text-center text-md-end">
                            <ul className="footer-links">
                                <li>
                                    <a href="/privacy-policy">Politique de Confidentialité</a>
                                </li>
                                <li>
                                    <a href="/terms-of-service">Conditions d'Utilisation</a>
                                </li>
                                <li>
                                    <a href="/contact">Contactez-Nous</a>
                                </li>
                            </ul>
                        </Col>
                    </Row>
                </motion.div>
            </Container>
        </footer>
    );
};

export default Footer;