import React from "react";
import { Container } from "react-bootstrap";
import "../styles/Legal.css";

const TermsOfService = () => {
    return (
        <div className="legal-page">
            <div className="legal-hero">
                <Container>
                    <h1>Conditions d'Utilisation</h1>
                    <p>Dernière mise à jour : Avril 2026</p>
                </Container>
            </div>
            <Container className="legal-content">
                <section>
                    <h2>1. Acceptation des Conditions</h2>
                    <p>
                        En accédant au site web d'Africanite Services et en utilisant nos services,
                        vous acceptez d'être lié par les présentes conditions d'utilisation. Si vous
                        n'acceptez pas ces conditions, veuillez ne pas utiliser nos services.
                    </p>
                </section>

                <section>
                    <h2>2. Description des Services</h2>
                    <p>
                        Africanite Services propose des services de développement web, d'applications
                        mobiles, de solutions d'intelligence artificielle, de conseil en transformation
                        numérique, ainsi que des outils en ligne tels que le générateur de factures et
                        le générateur de codes QR.
                    </p>
                </section>

                <section>
                    <h2>3. Utilisation du Générateur de Factures</h2>
                    <p>
                        Le générateur de factures est fourni en tant qu'outil pratique. Vous êtes
                        responsable de l'exactitude des informations saisies dans vos factures.
                        Africanite Services ne peut être tenu responsable des erreurs dans les
                        documents générés.
                    </p>
                    <ul>
                        <li>Les factures générées sont stockées localement dans votre navigateur.</li>
                        <li>L'envoi de factures par email utilise des services tiers sécurisés.</li>
                        <li>Les données de facturation ne sont pas conservées sur nos serveurs.</li>
                    </ul>
                </section>

                <section>
                    <h2>4. Utilisation du Générateur de Codes QR</h2>
                    <p>
                        Le service de génération de codes QR est un service payant à 2$ par code QR.
                        Les paiements sont traités via des services de mobile money (M-Pesa, Orange
                        Money, Airtel Money, Africell Money). Les codes QR générés restent votre
                        propriété.
                    </p>
                </section>

                <section>
                    <h2>5. Paiements et Tarification</h2>
                    <p>
                        Les tarifs de nos services sont indiqués sur la page Services et peuvent être
                        modifiés sans préavis. Les paiements pour les services de développement sont
                        convenus par contrat individuel. Les paiements via mobile money sont traités
                        de manière sécurisée par nos partenaires de paiement.
                    </p>
                </section>

                <section>
                    <h2>6. Propriété Intellectuelle</h2>
                    <p>
                        Le contenu de ce site web, y compris les textes, images, logos et code source,
                        est la propriété d'Africanite Services et est protégé par les lois sur la
                        propriété intellectuelle. Toute reproduction non autorisée est interdite.
                    </p>
                    <p>
                        Les travaux réalisés dans le cadre de projets clients sont soumis aux termes
                        du contrat de service correspondant.
                    </p>
                </section>

                <section>
                    <h2>7. Limitation de Responsabilité</h2>
                    <p>
                        Africanite Services fournit ses services « en l'état ». Nous ne garantissons
                        pas que nos services seront ininterrompus ou exempts d'erreurs. Notre
                        responsabilité est limitée au montant payé pour le service concerné.
                    </p>
                </section>

                <section>
                    <h2>8. Protection des Données</h2>
                    <p>
                        Nous traitons vos données personnelles conformément à notre{" "}
                        <a href="/privacy-policy">Politique de Confidentialité</a>. En utilisant
                        nos services, vous consentez au traitement de vos données tel que décrit
                        dans cette politique.
                    </p>
                </section>

                <section>
                    <h2>9. Résiliation</h2>
                    <p>
                        Nous nous réservons le droit de suspendre ou de résilier l'accès à nos
                        services en cas de violation des présentes conditions d'utilisation, sans
                        préavis ni indemnité.
                    </p>
                </section>

                <section>
                    <h2>10. Droit Applicable</h2>
                    <p>
                        Les présentes conditions sont régies par les lois de la République
                        Démocratique du Congo. Tout litige sera soumis aux tribunaux compétents
                        de Lubumbashi.
                    </p>
                </section>

                <section className="legal-contact">
                    <h2>Contact</h2>
                    <p>
                        Pour toute question relative à ces conditions, contactez-nous à{" "}
                        <a href="mailto:info@africaniteservices.com">info@africaniteservices.com</a>{" "}
                        ou via WhatsApp au{" "}
                        <a href="https://wa.me/243851054526">+243 851 054 526</a>.
                    </p>
                </section>
            </Container>
        </div>
    );
};

export default TermsOfService;
