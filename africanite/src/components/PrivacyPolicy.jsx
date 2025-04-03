import React from "react";
import { Container } from "react-bootstrap";

const PrivacyPolicy = () => {
    return (
        <div className="privacy-policy">
            <Container>
                <h1>Politique de Confidentialité</h1>
                <p>
                    Chez Africanite Services, nous respectons votre vie privée et nous nous engageons
                    à protéger vos informations personnelles. Cette politique explique comment nous
                    collectons, utilisons et protégeons vos données.
                </p>
                <h2>1. Collecte des Informations</h2>
                <p>
                    Nous collectons des informations personnelles lorsque vous remplissez un formulaire
                    de contact, vous inscrivez à nos services ou interagissez avec notre site web.
                </p>
                <h2>2. Utilisation des Informations</h2>
                <p>
                    Les informations collectées sont utilisées pour fournir nos services, répondre à vos
                    demandes et améliorer votre expérience utilisateur.
                </p>
                <h2>3. Partage des Informations</h2>
                <p>
                    Nous ne partageons pas vos informations personnelles avec des tiers, sauf si cela est
                    nécessaire pour fournir nos services ou si la loi l'exige.
                </p>
                <h2>4. Sécurité</h2>
                <p>
                    Nous mettons en œuvre des mesures de sécurité pour protéger vos données contre tout
                    accès non autorisé.
                </p>
                <h2>5. Vos Droits</h2>
                <p>
                    Vous avez le droit d'accéder, de modifier ou de supprimer vos informations
                    personnelles. Contactez-nous pour toute demande relative à vos données.
                </p>
                <p>
                    Si vous avez des questions concernant cette politique de confidentialité, veuillez
                    nous contacter à <a href="mailto:info@africaniteservices.com">info@africaniteservices.com</a>.
                </p>
            </Container>
        </div>
    );
};

export default PrivacyPolicy;