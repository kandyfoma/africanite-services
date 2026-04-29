import React from "react";
import { Container, Row, Col } from "react-bootstrap";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Globe, Smartphone, Monitor, Settings, CheckCircle, Handshake, Rocket, ArrowRight } from "lucide-react";
import "../styles/Home.css";

const Home = () => {
    const navigate = useNavigate();

    const fadeUp = {
        hidden: { opacity: 0, y: 30 },
        visible: (i = 0) => ({
            opacity: 1,
            y: 0,
            transition: { duration: 0.6, delay: i * 0.1, ease: [0.25, 0.1, 0.25, 1] },
        }),
    };

    return (
        <div className="home-apple">
            {/* Hero */}
            <section className="hero-apple">
                <Container>
                    <motion.div
                        className="hero-content"
                        initial="hidden"
                        animate="visible"
                        variants={fadeUp}
                    >
                        <h1>Propulsez votre entreprise<br />vers le futur numérique.</h1>
                        <p className="hero-subtitle">
                            Des solutions technologiques innovantes qui transforment votre vision en succès.
                            De l'intelligence artificielle au développement web.
                        </p>
                        <div className="hero-actions">
                            <button className="btn-primary-apple" onClick={() => navigate("/services")}>
                                Découvrir nos solutions
                                <ArrowRight size={16} />
                            </button>
                            <button className="btn-secondary-apple" onClick={() => navigate("/contact")}>
                                Nous contacter
                            </button>
                        </div>
                    </motion.div>
                </Container>
            </section>

            {/* Services */}
            <section className="section-apple">
                <Container>
                    <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}>
                        <h2 className="section-heading">Nos Services</h2>
                        <p className="section-subheading">
                            Des solutions complètes pour chaque étape de votre transformation digitale.
                        </p>
                    </motion.div>
                    <Row className="g-4 mt-2">
                        {[
                            { icon: Globe, title: "Développement Web", desc: "Sites web et applications personnalisés construits avec les technologies de pointe" },
                            { icon: Smartphone, title: "Applications Mobiles", desc: "Applications mobiles natives et multiplateformes pour iOS et Android" },
                            { icon: Monitor, title: "Conseil Informatique", desc: "Orientation stratégique en technologie et solutions de transformation numérique" },
                            { icon: Settings, title: "Services Informatiques", desc: "Support et maintenance informatique complets pour votre entreprise" },
                        ].map((service, i) => (
                            <Col key={i} md={6} lg={3}>
                                <motion.div className="card-apple" custom={i} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}>
                                    <div className="card-icon">
                                        <service.icon size={28} strokeWidth={1.5} />
                                    </div>
                                    <h3>{service.title}</h3>
                                    <p>{service.desc}</p>
                                </motion.div>
                            </Col>
                        ))}
                    </Row>
                </Container>
            </section>

            {/* Why Us */}
            <section className="section-apple section-alt">
                <Container>
                    <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}>
                        <h2 className="section-heading">Pourquoi Africanite Services?</h2>
                    </motion.div>
                    <Row className="g-4 mt-2">
                        {[
                            { icon: CheckCircle, title: "Expertise", desc: "Des années d'expérience dans la fourniture de solutions informatiques de qualité" },
                            { icon: Handshake, title: "Orienté Client", desc: "Dévoué à comprendre et répondre à vos besoins spécifiques" },
                            { icon: Rocket, title: "Innovation", desc: "Utilisation des dernières technologies pour des solutions optimales" },
                        ].map((feature, i) => (
                            <Col key={i} md={4}>
                                <motion.div className="card-apple card-centered" custom={i} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}>
                                    <div className="card-icon">
                                        <feature.icon size={28} strokeWidth={1.5} />
                                    </div>
                                    <h3>{feature.title}</h3>
                                    <p>{feature.desc}</p>
                                </motion.div>
                            </Col>
                        ))}
                    </Row>
                </Container>
            </section>

            {/* CTA */}
            <section className="cta-apple">
                <Container>
                    <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}>
                        <h2>Prêt à commencer votre<br />voyage numérique?</h2>
                        <p>Discutons de la façon dont nous pouvons transformer votre entreprise</p>
                        <button className="btn-primary-apple btn-lg" onClick={() => navigate("/contact")}>
                            Contactez-nous aujourd'hui
                            <ArrowRight size={18} />
                        </button>
                    </motion.div>
                </Container>
            </section>
        </div>
    );
};

export default Home;