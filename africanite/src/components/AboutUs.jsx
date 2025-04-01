import React from "react";
import { Container, Row, Col } from "react-bootstrap";
import { motion } from "framer-motion";
import "../styles/AboutUs.css";

const AboutUs = () => {
    return (
        <div className="about-us">
            {/* Hero Section */}
            <section className="about-hero">
                <Container>
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                    >
                        <h1>À Propos d'Africanite Services</h1>
                        <p>Votre Partenaire de Confiance en Solutions Numériques</p>
                    </motion.div>
                </Container>
            </section>

            {/* Mission Section */}
            <section className="mission">
                <Container>
                    <Row className="align-items-center">
                        <Col md={6}>
                            <motion.div
                                initial={{ opacity: 0, x: -50 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.8 }}
                            >
                                <h2>Notre Mission</h2>
                                <p>Chez Africanite Services, nous nous engageons à fournir des solutions technologiques innovantes qui permettent à nos clients de prospérer dans l'ère numérique. Notre expertise en développement web, applications mobiles et services informatiques nous permet d'offrir des solutions sur mesure qui répondent aux besoins uniques de chaque client.</p>
                            </motion.div>
                        </Col>
                        <Col md={6}>
                            <motion.div
                                initial={{ opacity: 0, x: 50 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.8 }}
                            >
                                <img 
                                    src="/path-to-your-image.jpg" 
                                    alt="Notre Mission" 
                                    className="mission-image" 
                                />
                            </motion.div>
                        </Col>
                    </Row>
                </Container>
            </section>

            {/* Values Section */}
            <section className="values">
                <Container>
                    <h2>Nos Valeurs</h2>
                    <Row>
                        {[
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
                        ].map((value, index) => (
                            <Col key={index} md={4}>
                                <motion.div 
                                    className="value-card"
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ duration: 0.5, delay: index * 0.2 }}
                                >
                                    <i className={`fas ${value.icon}`}></i>
                                    <h3>{value.title}</h3>
                                    <p>{value.description}</p>
                                </motion.div>
                            </Col>
                        ))}
                    </Row>
                </Container>
            </section>
        </div>
    );
};

export default AboutUs;