import React from "react";
import { Container, Row, Col } from "react-bootstrap";
import { motion } from "framer-motion";
import { Heart, Shield, Star, ArrowRight } from "lucide-react";
import "../styles/AboutUs.css";
import wennzeLogo from "../assets/wennze.png";

const fadeUp = {
    hidden: { opacity: 0, y: 24 },
    visible: (i = 0) => ({
        opacity: 1, y: 0,
        transition: { duration: 0.5, delay: i * 0.1, ease: [0.25, 0.1, 0.25, 1] },
    }),
};

const AboutUs = () => {
    return (
        <div className="about-apple">
            {/* Hero */}
            <section className="about-hero-apple">
                <Container>
                    <motion.div initial="hidden" animate="visible" variants={fadeUp}>
                        <h1>À Propos d'Africanite Services</h1>
                        <p>Votre partenaire de confiance en solutions numériques</p>
                    </motion.div>
                </Container>
            </section>

            {/* Mission */}
            <section className="about-section">
                <Container>
                    <Row className="justify-content-center">
                        <Col lg={8}>
                            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}>
                                <h2 className="section-heading">Notre Mission</h2>
                                <p className="mission-text">
                                    Chez Africanite Services, nous nous engageons à fournir des solutions
                                    technologiques innovantes qui permettent à nos clients de prospérer dans
                                    l'ère numérique. Notre expertise en développement web, applications mobiles
                                    et services informatiques nous permet d'offrir des solutions sur mesure qui
                                    répondent aux besoins uniques de chaque client.
                                </p>
                            </motion.div>
                        </Col>
                    </Row>
                </Container>
            </section>

            {/* Values */}
            <section className="about-section about-section-alt">
                <Container>
                    <motion.h2 className="section-heading" initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}>
                        Nos Valeurs
                    </motion.h2>
                    <Row className="g-4 mt-2">
                        {[
                            { icon: Heart, title: "Passion", desc: "Passionnés par l'innovation et la technologie" },
                            { icon: Shield, title: "Intégrité", desc: "Transparence et honnêteté dans toutes nos relations" },
                            { icon: Star, title: "Excellence", desc: "Engagement envers la qualité et la perfection" },
                        ].map((value, i) => (
                            <Col key={i} md={4}>
                                <motion.div className="value-card-apple" custom={i} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}>
                                    <div className="value-icon">
                                        <value.icon size={24} strokeWidth={1.5} />
                                    </div>
                                    <h3>{value.title}</h3>
                                    <p>{value.desc}</p>
                                </motion.div>
                            </Col>
                        ))}
                    </Row>
                </Container>
            </section>

            {/* Wennze Showcase */}
            <section className="about-section">
                <Container>
                    <Row className="align-items-center g-5">
                        <Col md={7}>
                            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}>
                                <h2 className="section-heading" style={{ textAlign: 'left' }}>Découvrez Wennze</h2>
                                <p className="wennze-lead">
                                    <strong>Wennze</strong> est votre nouvelle marketplace révolutionnaire,
                                    où l'achat et la vente deviennent une expérience exceptionnelle.
                                </p>
                                <ul className="wennze-features">
                                    <li>Marketplace intuitive pour tous vos besoins</li>
                                    <li>Achetez et vendez en toute simplicité</li>
                                    <li>Transactions rapides et sécurisées</li>
                                    <li>Parfait pour entrepreneurs et particuliers</li>
                                </ul>
                                <a href="https://wennze.com/" target="_blank" rel="noopener noreferrer" className="link-apple">
                                    Découvrez Wennze <ArrowRight size={16} />
                                </a>
                            </motion.div>
                        </Col>
                        <Col md={5}>
                            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={2} className="wennze-image-wrap">
                                <img src={wennzeLogo} alt="Wennze" className="wennze-img" />
                            </motion.div>
                        </Col>
                    </Row>
                </Container>
            </section>
        </div>
    );
};

export default AboutUs;