import React from "react";
import { Container, Row, Col } from "react-bootstrap";
import { motion } from "framer-motion";
import googlePlayLogo from "../assets/google play.png";
import "../styles/ApplicationPage.css";

const WennzePage = () => {
    const webAppUrl = import.meta.env.VITE_WENNZE_WEB_APP_URL || "#";
    const androidAppUrl = import.meta.env.VITE_WENNZE_ANDROID_APP_URL || "#";
    const iosAppUrl = import.meta.env.VITE_WENNZE_IOS_APP_URL || "#";

    return (
        <motion.div
            className="app-page"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
        >
            <Container>
                <section className="app-hero">
                    <h1>Wennze</h1>
                    <p className="app-tagline">
                        Marketplace E-commerce & Social pour la RD Congo
                    </p>
                    <p>
                        Wennze est une plateforme e-commerce complète combinant
                        les fonctionnalités d&apos;un marché traditionnel avec les
                        interactions sociales modernes. Achetez, vendez et connectez-vous
                        avec des utilisateurs locaux dans un environnement sécurisé.
                    </p>
                </section>

                <section className="app-features">
                    <h2>Fonctionnalités principales</h2>
                    <Row>
                        {[
                            {
                                title: "Marché de produits",
                                description:
                                    "Parcourez des milliers de produits d'occasion et neufs, catégorisés et localisés.",
                            },
                            {
                                title: "Système de messaging",
                                description:
                                    "Communiquez en temps réel avec les vendeurs et les acheteurs avec support des messages vocaux.",
                            },
                            {
                                title: "Portefeuille virtuel",
                                description:
                                    "Gérez vos fonds, effectuez des transactions en toute sécurité en Zaires (CDF).",
                            },
                            {
                                title: "Promotion de produits",
                                description:
                                    "Boostez vos annonces pour atteindre plus de visiteurs intéressés.",
                            },
                            {
                                title: "Support multi-devise",
                                description:
                                    "Transactions en USD et CDF adaptées au marché congolais.",
                            },
                            {
                                title: "Réseau social intégré",
                                description:
                                    "Connectez-vous, suivez les utilisateurs et découvrez les tendances du marché.",
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
                    <h2>Télécharger Wennze</h2>
                    <p>
                        Disponible sur mobile et web pour une expérience fluide sur tous vos appareils.
                    </p>
                    <div className="download-buttons">
                        <a 
                            href={webAppUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="store-logo-btn"
                            title="Accéder au Web"
                        >
                            🌐
                        </a>
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
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="60" height="60" fill="currentColor" stroke="currentColor" strokeWidth="0.5">
                                <path d="M17.5 1.5H6.5c-2.75 0-5 2.25-5 5v11c0 2.75 2.25 5 5 5h11c2.75 0 5-2.25 5-5v-11c0-2.75-2.25-5-5-5zm-5.5 18c-1.933 0-3.5-1.567-3.5-3.5S10.067 9 12 9s3.5 1.567 3.5 3.5-1.567 3.5-3.5 3.5z"/>
                            </svg>
                        </a>
                    </div>
                </section>

                <section className="app-info">
                    <h2>Pourquoi Wennze ?</h2>
                    <Row>
                        {[
                            {
                                icon: "🇨🇩",
                                title: "Localisation RD Congo",
                                description:
                                    "Conçu spécifiquement pour le marché congolais avec support du français et du franc congolais.",
                            },
                            {
                                icon: "🔒",
                                title: "Sécurité garantie",
                                description:
                                    "Transactions sécurisées et protection des utilisateurs avec système de notation et signalement.",
                            },
                            {
                                icon: "⚡",
                                title: "Performance mobile",
                                description:
                                    "Optimisé pour les connexions réseau variables avec cache local et synchronisation intelligente.",
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

export default WennzePage;
