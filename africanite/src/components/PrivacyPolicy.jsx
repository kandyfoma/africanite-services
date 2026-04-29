import React from "react";
import { Container } from "react-bootstrap";
import "../styles/Legal.css";

const PrivacyPolicy = () => {
    return (
        <div className="legal-page">
            <div className="legal-hero">
                <Container>
                    <h1>Politique de Confidentialité</h1>
                    <p>Dernière mise à jour : Avril 2026</p>
                </Container>
            </div>
            <Container className="legal-content">
                <section>
                    <p>
                        Chez Africanite Services, nous respectons votre vie privée et nous nous engageons
                        à protéger vos informations personnelles. Cette politique explique comment nous
                        collectons, utilisons et protégeons vos données lorsque vous utilisez notre site
                        web et nos services.
                    </p>
                </section>

                <section>
                    <h2>1. Collecte des Informations</h2>
                    <p>
                        Nous collectons des informations personnelles dans les cas suivants :
                    </p>
                    <ul>
                        <li>
                            <strong>Formulaire de contact :</strong> Votre nom, adresse email, et le
                            contenu de votre message lorsque vous nous contactez via le formulaire.
                        </li>
                        <li>
                            <strong>Générateur de factures :</strong> Les informations saisies (noms,
                            adresses, coordonnées bancaires) sont stockées uniquement dans votre
                            navigateur (localStorage) et ne sont jamais envoyées à nos serveurs.
                        </li>
                        <li>
                            <strong>Envoi de factures par email :</strong> Lorsque vous utilisez la
                            fonction d'envoi par email, votre nom, email de l'expéditeur et du
                            destinataire sont traités via Firebase Cloud Functions.
                        </li>
                        <li>
                            <strong>Générateur de codes QR :</strong> Les données de paiement (numéro
                            de téléphone mobile money) sont traitées via notre partenaire de paiement
                            sécurisé.
                        </li>
                        <li>
                            <strong>Navigation :</strong> Des données techniques (type de navigateur,
                            adresse IP) peuvent être collectées automatiquement.
                        </li>
                    </ul>
                </section>

                <section>
                    <h2>2. Utilisation des Informations</h2>
                    <p>Les informations collectées sont utilisées pour :</p>
                    <ul>
                        <li>Répondre à vos demandes de contact et fournir nos services</li>
                        <li>Traiter les paiements via mobile money (M-Pesa, Orange Money, Airtel Money, Africell Money)</li>
                        <li>Envoyer des factures par email selon vos instructions</li>
                        <li>Améliorer l'expérience utilisateur de notre site web</li>
                    </ul>
                </section>

                <section>
                    <h2>3. Stockage Local des Données</h2>
                    <p>
                        Le générateur de factures utilise le stockage local de votre navigateur
                        (localStorage) pour sauvegarder vos brouillons, coordonnées bancaires et
                        numéros de factures. Ces données restent sur votre appareil et ne sont
                        jamais transmises à nos serveurs.
                    </p>
                </section>

                <section>
                    <h2>4. Services Tiers</h2>
                    <p>Nous utilisons les services tiers suivants :</p>
                    <ul>
                        <li><strong>Firebase (Google) :</strong> Pour l'envoi d'emails et la planification de factures</li>
                        <li><strong>Partenaire de paiement mobile money :</strong> Pour le traitement sécurisé des paiements</li>
                    </ul>
                    <p>
                        Ces services ont leurs propres politiques de confidentialité et nous vous
                        encourageons à les consulter.
                    </p>
                </section>

                <section>
                    <h2>5. Partage des Informations</h2>
                    <p>
                        Nous ne vendons, n'échangeons ni ne transférons vos informations personnelles
                        à des tiers, sauf dans les cas suivants :
                    </p>
                    <ul>
                        <li>Pour traiter un paiement via nos partenaires de mobile money</li>
                        <li>Pour envoyer un email via Firebase Cloud Functions</li>
                        <li>Si la loi l'exige</li>
                    </ul>
                </section>

                <section>
                    <h2>6. Sécurité</h2>
                    <p>
                        Nous mettons en œuvre des mesures de sécurité pour protéger vos données,
                        notamment le chiffrement des communications (HTTPS), la validation des
                        données côté serveur et la protection contre les accès non autorisés.
                    </p>
                </section>

                <section>
                    <h2>7. Vos Droits</h2>
                    <p>Vous avez le droit de :</p>
                    <ul>
                        <li>Accéder aux informations personnelles que nous détenons à votre sujet</li>
                        <li>Demander la modification ou la suppression de vos données</li>
                        <li>Effacer les données locales de votre navigateur à tout moment</li>
                        <li>Retirer votre consentement au traitement de vos données</li>
                    </ul>
                </section>

                <section className="legal-contact">
                    <h2>Contact</h2>
                    <p>
                        Pour toute question concernant cette politique de confidentialité, contactez-nous
                        à <a href="mailto:info@africaniteservices.com">info@africaniteservices.com</a> ou
                        via WhatsApp au <a href="https://wa.me/243851054526">+243 851 054 526</a>.
                    </p>
                </section>
            </Container>
        </div>
    );
};

export default PrivacyPolicy;