import React from "react";
import { Container, Row, Col, Button } from "react-bootstrap";
import { motion } from "framer-motion";
import googlePlayLogo from "../assets/google play.png";
import windowsLogo from "../assets/windows-button.png";
import "../styles/HKManagementSystem.css";

const HKManagementSystem = () => {
    const webAppUrl = import.meta.env.VITE_HK_WEB_APP_URL || "#";
    const androidAppUrl = import.meta.env.VITE_HK_ANDROID_APP_URL || "#";

    return (
        <motion.div
            className="hk-management-page"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
        >
            <Container>
                <section className="hk-hero">
                    <h1>HK Management System</h1>
                    <p>
                        HK Management System est une plateforme santé tout-en-un
                        qui relie les opérations de l&apos;hôpital, de la pharmacie
                        et de la médecine du travail dans un seul écosystème.
                    </p>
                    <p>
                        La solution fonctionne avec activation par licence,
                        authentification par téléphone, contrôle d&apos;accès par rôle
                        et parcours métier adaptés selon les modules autorisés.
                    </p>
                </section>

                <section className="hk-features">
                    <h2>Modules principaux</h2>
                    <Row>
                        {[
                            {
                                title: "Module Hôpital",
                                description:
                                    "Gestion complète du parcours patient: enregistrement, triage, constantes vitales, consultation, prescriptions et facturation.",
                            },
                            {
                                title: "Module Pharmacie",
                                description:
                                    "Point de vente (POS), inventaire, prescriptions, ventes et suivi des produits pour sécuriser la dispensation.",
                            },
                            {
                                title: "Module Médecine du Travail",
                                description:
                                    "Suivi des entreprises, travailleurs, examens médicaux périodiques, incidents et certificats d&apos;aptitude.",
                            },
                            {
                                title: "Sécurité & Gouvernance",
                                description:
                                    "Navigation dynamique par rôle, permissions granulaires, organisation multi-sites et traçabilité des opérations.",
                            },
                        ].map((feature, index) => (
                            <Col key={index} md={6} className="mb-4">
                                <motion.div
                                    className="hk-feature-card"
                                    whileHover={{ scale: 1.03 }}
                                    transition={{ duration: 0.3 }}
                                >
                                    <h3>{feature.title}</h3>
                                    <p>{feature.description}</p>
                                </motion.div>
                            </Col>
                        ))}
                    </Row>
                </section>

                <section className="hk-features">
                    <h2>Pourquoi choisir HK Management System ?</h2>
                    <Row>
                        {[
                            {
                                title: "Workflows connectés",
                                description:
                                    "Les données circulent entre les équipes médicales, la pharmacie et les services administratifs pour une meilleure continuité de service.",
                            },
                            {
                                title: "Approche offline-first",
                                description:
                                    "L&apos;application mobile optimise l&apos;expérience terrain avec cache local et synchronisation adaptée aux environnements à connectivité variable.",
                            },
                            {
                                title: "Pilotage en temps réel",
                                description:
                                    "Tableaux de bord, indicateurs métiers et reporting facilitent la prise de décision opérationnelle.",
                            },
                            {
                                title: "Déploiement évolutif",
                                description:
                                    "Architecture modulaire permettant d&apos;activer uniquement les fonctionnalités nécessaires selon votre organisation.",
                            },
                        ].map((feature, index) => (
                            <Col key={index} md={6} className="mb-4">
                                <motion.div
                                    className="hk-feature-card"
                                    whileHover={{ scale: 1.03 }}
                                    transition={{ duration: 0.3 }}
                                >
                                    <h3>{feature.title}</h3>
                                    <p>{feature.description}</p>
                                </motion.div>
                            </Col>
                        ))}
                    </Row>
                </section>

                <section className="hk-downloads">
                    <h2>Téléchargement de l&apos;application</h2>
                    <p>
                        Choisissez la version qui correspond à votre usage.
                    </p>
                    <div className="hk-download-buttons">
                        <Button
                            variant="primary"
                            className="hk-download-btn hk-logo-only"
                            as="a"
                            href={webAppUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            aria-label="Ouvrir la Web App"
                            title="Ouvrir la Web App"
                        >
                            <img src={windowsLogo} alt="Windows" className="hk-store-logo" />
                        </Button>
                        <Button
                            variant="warning"
                            className="hk-download-btn hk-logo-only"
                            as="a"
                            href={androidAppUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            aria-label="Télécharger l'App Android"
                            title="Télécharger l'App Android"
                        >
                            <img src={googlePlayLogo} alt="Google Play" className="hk-store-logo" />
                        </Button>
                    </div>
                    <p className="hk-download-note">
                        Configurez VITE_HK_WEB_APP_URL et VITE_HK_ANDROID_APP_URL
                        pour pointer vers vos liens de publication.
                    </p>
                </section>
            </Container>
        </motion.div>
    );
};

export default HKManagementSystem;