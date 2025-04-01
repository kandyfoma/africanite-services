import React from "react";
import { Container, Row, Col } from "react-bootstrap";
import { motion } from "framer-motion";
import "../styles/Services.css";

const Services = () => {
    const primaryServices = [
        {
            title: "Développement de Sites Web",
            description:
                "Nous créons des sites web modernes, réactifs et optimisés pour les moteurs de recherche. Idéal pour les entreprises souhaitant une présence en ligne professionnelle.",
            duration: "1 à 4 semaines",
            cost: "À partir de 300$",
        },
        {
            title: "Développement d'Applications Web",
            description:
                "Nous développons des applications web interactives et performantes, adaptées aux besoins spécifiques de votre entreprise.",
            duration: "4 à 8 semaines",
            cost: "À partir de 2,500$",
        },
        {
            title: "Développement d'Applications Mobiles",
            description:
                "Nous concevons des applications mobiles natives et multiplateformes pour iOS et Android, offrant une expérience utilisateur exceptionnelle.",
            duration: "6 à 12 semaines",
            cost: "À partir de 4,000$",
        },
    ];

    const additionalServices = [
        {
            title: "Maintenance et Support",
            description:
                "Nous offrons des services de maintenance et de support pour garantir que vos systèmes restent opérationnels et performants.",
        },
        {
            title: "Optimisation SEO",
            description:
                "Améliorez la visibilité de votre site web sur les moteurs de recherche grâce à nos services d'optimisation SEO.",
        },
        {
            title: "Conseil en Transformation Numérique",
            description:
                "Nous vous aidons à adopter les dernières technologies pour transformer votre entreprise et rester compétitif.",
        },
    ];

    return (
        <motion.div
            className="services-page"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
        >
            <Container>
                <h1 className="text-center mb-5">Nos Services</h1>
                <Row>
                    {primaryServices.map((service, index) => (
                        <Col key={index} md={4} className="mb-4">
                            <motion.div
                                className="service-card"
                                whileHover={{ scale: 1.05 }}
                                transition={{ duration: 0.3 }}
                            >
                                <h3>{service.title}</h3>
                                <p>{service.description}</p>
                                <p>
                                    <strong>Durée estimée :</strong> {service.duration}
                                </p>
                                <p>
                                    <strong>Coût estimé :</strong> {service.cost}
                                </p>
                            </motion.div>
                        </Col>
                    ))}
                </Row>

                {/* Additional Services Section */}
                <h2 className="text-center mt-5 mb-4">Autres Services</h2>
                <Row>
                    {additionalServices.map((service, index) => (
                        <Col key={index} md={4} className="mb-4">
                            <motion.div
                                className="service-card"
                                whileHover={{ scale: 1.05 }}
                                transition={{ duration: 0.3 }}
                            >
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