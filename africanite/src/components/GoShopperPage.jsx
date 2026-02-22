import React from "react";
import { Container, Row, Col } from "react-bootstrap";
import { motion } from "framer-motion";
import googlePlayLogo from "../assets/google play.png";
import "../styles/ApplicationPage.css";

const GoShopperPage = () => {
    const androidAppUrl = import.meta.env.VITE_GOSHOPPER_ANDROID_APP_URL || "#";
    const iosAppUrl = import.meta.env.VITE_GOSHOPPER_IOS_APP_URL || "#";

    return (
        <motion.div
            className="app-page"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
        >
            <Container>
                <section className="app-hero">
                    <h1>GoShopper</h1>
                    <p className="app-tagline">
                        Suivi des dépenses avec reconnaissance optique
                    </p>
                    <p>
                        GoShopper est une application intelligente qui scanne vos reçus
                        pour vous aider à gérer vos dépenses en toute simplicité.
                        Capturez, analysez et suivez vos achats automatiquement avec
                        la reconnaissance optique (OCR).
                    </p>
                </section>

                <section className="app-features">
                    <h2>Fonctionnalités principales</h2>
                    <Row>
                        {[
                            {
                                title: "Scan de reçus",
                                description:
                                    "Photographiez vos reçus et l'OCR en extrait automatiquement les détails.",
                            },
                            {
                                title: "Suivi des dépenses",
                                description:
                                    "Catégorisez automatiquement vos achats et visualisez vos tendances de dépenses.",
                            },
                            {
                                title: "Analyse intelligente",
                                description:
                                    "Obtenez des insights sur vos habitudes d'achat avec des graphiques détaillés.",
                            },
                            {
                                title: "Authentification sécurisée",
                                description:
                                    "Connectez-vous avec Google, Apple ou votre téléphone pour accès sécurisé.",
                            },
                            {
                                title: "Sauvegarde cloud",
                                description:
                                    "Vos données sont synchronisées et sauvegardées automatiquement en sécurité.",
                            },
                            {
                                title: "Mode sombre",
                                description:
                                    "Interface adaptative avec support du mode sombre pour un confort optimal.",
                            },
                        ].map((feature, index) => (
                            <Col key={index} md={6} className="mb-4">
                                <motion.div
                                    className="feature-card"
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

                <section className="app-downloads">
                    <h2>Télécharger GoShopper</h2>
                    <p>
                        Disponible sur iOS et Android pour un suivi de dépenses en toute circonstance.
                    </p>
                    <div className="download-buttons">
                        <a 
                            href={androidAppUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="store-logo-btn"
                            title="Google Play"
                        >
                            <img src={googlePlayLogo} alt="Google Play" className="store-logo" />
                        </a>
                        <a 
                            href={iosAppUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="store-logo-btn"
                            title="App Store"
                        >
                            🍎
                        </a>
                    </div>
                </section>

                <section className="app-info">
                    <h2>Avantages de GoShopper</h2>
                    <Row>
                        {[
                            {
                                icon: "📸",
                                title: "Capture instantanée",
                                description:
                                    "Snapotez simplement vos reçus lors du paiement pour un suivi instantané.",
                            },
                            {
                                icon: "🤖",
                                title: "IA & OCR avancée",
                                description:
                                    "Reconnaissance intelligente des produits, prix et vendeurs depuis vos photos.",
                            },
                            {
                                icon: "📊",
                                title: "Rapports détaillés",
                                description:
                                    "Visualisez vos dépenses par catégorie, magasin ou période avec des statistiques précises.",
                            },
                        ].map((item, index) => (
                            <Col key={index} md={4} className="mb-4">
                                <motion.div
                                    className="info-card"
                                    whileHover={{ scale: 1.05 }}
                                    transition={{ duration: 0.3 }}
                                >
                                    <div className="info-icon">{item.icon}</div>
                                    <h3>{item.title}</h3>
                                    <p>{item.description}</p>
                                </motion.div>
                            </Col>
                        ))}
                    </Row>
                </section>
            </Container>
        </motion.div>
    );
};

export default GoShopperPage;
