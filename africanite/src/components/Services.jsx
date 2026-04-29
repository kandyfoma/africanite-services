import React from "react";
import { Container, Row, Col } from "react-bootstrap";
import { motion } from "framer-motion";
import { Globe, AppWindow, Smartphone, Brain, MessageSquare, HeadphonesIcon, Wrench, Search, TrendingUp, ArrowRight, Clock, DollarSign } from "lucide-react";
import "../styles/Services.css";

const fadeUp = {
    hidden: { opacity: 0, y: 24 },
    visible: (i = 0) => ({
        opacity: 1,
        y: 0,
        transition: { duration: 0.5, delay: i * 0.08, ease: [0.25, 0.1, 0.25, 1] },
    }),
};

const Services = () => {
    const primaryServices = [
        { icon: Globe, title: "Développement de Sites Web", description: "Nous créons des sites web modernes, réactifs et optimisés pour les moteurs de recherche.", duration: "1 à 4 semaines", cost: "À partir de 300$" },
        { icon: AppWindow, title: "Développement d'Applications Web", description: "Applications web interactives et performantes, adaptées aux besoins de votre entreprise.", duration: "4 à 8 semaines", cost: "À partir de 2,500$" },
        { icon: Smartphone, title: "Développement d'Applications Mobiles", description: "Applications mobiles natives et multiplateformes pour iOS et Android.", duration: "6 à 12 semaines", cost: "À partir de 4,000$" },
        { icon: Brain, title: "Applications IA", description: "Applications intelligentes utilisant l'IA pour automatiser vos processus et améliorer la prise de décision.", duration: "8 à 16 semaines", cost: "À partir de 5,000$" },
        { icon: MessageSquare, title: "Chatbot IA", description: "Chatbots intelligents sur mesure pour améliorer votre service client et automatiser les interactions.", duration: "4 à 8 semaines", cost: "À partir de 2,000$" },
        { icon: HeadphonesIcon, title: "Support IA", description: "Solutions de support alimentées par l'IA pour une assistance 24/7 à vos clients.", duration: "3 à 6 semaines", cost: "À partir de 1,500$" },
    ];

    const additionalServices = [
        { icon: Wrench, title: "Maintenance et Support", description: "Services de maintenance et de support pour garantir la performance de vos systèmes." },
        { icon: Search, title: "Optimisation SEO", description: "Améliorez la visibilité de votre site web sur les moteurs de recherche." },
        { icon: TrendingUp, title: "Conseil en Transformation Numérique", description: "Adoptez les dernières technologies pour transformer votre entreprise." },
    ];

    return (
        <motion.div className="services-page-apple" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
            <Container>
                <div className="services-header">
                    <motion.h1 initial="hidden" animate="visible" variants={fadeUp}>Nos Services</motion.h1>
                    <motion.p initial="hidden" animate="visible" variants={fadeUp} custom={1}>
                        Des solutions technologiques de bout en bout pour propulser votre entreprise.
                    </motion.p>
                </div>

                <Row className="g-4">
                    {primaryServices.map((service, i) => (
                        <Col key={i} md={6} lg={4}>
                            <motion.div className="service-card-apple" custom={i} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}>
                                <div className="service-icon">
                                    <service.icon size={24} strokeWidth={1.5} />
                                </div>
                                <h3>{service.title}</h3>
                                <p>{service.description}</p>
                                <div className="service-meta">
                                    <span><Clock size={14} strokeWidth={1.5} /> {service.duration}</span>
                                    <span><DollarSign size={14} strokeWidth={1.5} /> {service.cost}</span>
                                </div>
                            </motion.div>
                        </Col>
                    ))}
                </Row>

                <div className="services-divider" />

                <motion.h2 className="section-heading" initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}>
                    Autres Services
                </motion.h2>
                <Row className="g-4">
                    {additionalServices.map((service, i) => (
                        <Col key={i} md={4}>
                            <motion.div className="service-card-apple service-card-compact" custom={i} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}>
                                <div className="service-icon">
                                    <service.icon size={24} strokeWidth={1.5} />
                                </div>
                                <h3>{service.title}</h3>
                                <p>{service.description}</p>
                            </motion.div>
                        </Col>
                    ))}
                </Row>
            </Container>
        </motion.div>
    );
};

export default Services;