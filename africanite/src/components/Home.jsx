import React from "react";
import { Container, Row, Col, Button } from "react-bootstrap";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import "../styles/Home.css";

const Home = () => {
    const navigate = useNavigate();

    return (
        <div className="home">
            {/* Hero Section */}
            <section className="hero">
                <Container>
                    <motion.div 
                        className="hero-content"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                    >
                        <h1>Transformez Votre Vision Numérique en Réalité</h1>
                        <p>Votre partenaire de confiance en conseil informatique, développement web et innovation numérique</p>
                        <Button 
                            variant="primary" 
                            className="cta-button"
                            onClick={() => navigate("/contact")}
                        >
                            Commencer
                        </Button>
                    </motion.div>
                </Container>
            </section>

            {/* Services Section */}
            <section className="services">
                <Container>
                    <h2>Nos Services</h2>
                    <Row className="services-grid">
                        {[
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
                        ].map((service, index) => (
                            <Col key={index} md={6} lg={3}>
                                <motion.div 
                                    className="service-card"
                                    whileHover={{ scale: 1.05 }}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.5, delay: index * 0.2 }}
                                >
                                    <i className={`fas ${service.icon}`}></i>
                                    <h3>{service.title}</h3>
                                    <p>{service.description}</p>
                                </motion.div>
                            </Col>
                        ))}
                    </Row>
                </Container>
            </section>

            {/* Why Choose Us Section */}
            <section className="why-us">
                <Container>
                    <h2>Pourquoi Choisir Africanite Services?</h2>
                    <Row className="features-grid">
                        <Col md={4}>
                            <motion.div 
                                className="feature"
                                whileHover={{ scale: 1.05 }}
                                initial={{ opacity: 0 }}
                                whileInView={{ opacity: 1 }}
                                viewport={{ once: true }}
                            >
                                <i className="fas fa-check-circle"></i>
                                <h3>Expertise</h3>
                                <p>Des années d'expérience dans la fourniture de solutions informatiques de qualité</p>
                            </motion.div>
                        </Col>
                        <Col md={4}>
                            <motion.div 
                                className="feature"
                                whileHover={{ scale: 1.05 }}
                                initial={{ opacity: 0 }}
                                whileInView={{ opacity: 1 }}
                                viewport={{ once: true }}
                            >
                                <i className="fas fa-handshake"></i>
                                <h3>Orienté Client</h3>
                                <p>Dévoué à comprendre et répondre à vos besoins spécifiques</p>
                            </motion.div>
                        </Col>
                        <Col md={4}>
                            <motion.div 
                                className="feature"
                                whileHover={{ scale: 1.05 }}
                                initial={{ opacity: 0 }}
                                whileInView={{ opacity: 1 }}
                                viewport={{ once: true }}
                            >
                                <i className="fas fa-rocket"></i>
                                <h3>Innovation</h3>
                                <p>Utilisation des dernières technologies pour des solutions optimales</p>
                            </motion.div>
                        </Col>
                    </Row>
                </Container>
            </section>

            {/* Call to Action Section */}
            <section className="cta-section">
                <Container>
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                    >
                        <h2>Prêt à Commencer Votre Voyage Numérique?</h2>
                        <p>Discutons de la façon dont nous pouvons transformer votre entreprise</p>
                        <Button 
                            variant="warning" 
                            size="lg" 
                            className="cta-button"
                            onClick={() => navigate("/contact")}
                        >
                            Contactez-Nous Aujourd'hui
                        </Button>
                    </motion.div>
                </Container>
            </section>
        </div>
    );
};

export default Home;