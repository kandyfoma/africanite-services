import React from "react";
import { Container } from "react-bootstrap";
import { Link } from "react-router-dom";
import "../styles/Footer.css";

const Footer = () => {
    const currentYear = new Date().getFullYear();
    return (
        <footer className="footer-apple">
            <Container>
                <div className="footer-top">
                    <div className="footer-col">
                        <h4>Services</h4>
                        <ul>
                            <li><Link to="/services">Développement Web</Link></li>
                            <li><Link to="/services">Applications Mobiles</Link></li>
                            <li><Link to="/services">Conseil Informatique</Link></li>
                        </ul>
                    </div>
                    <div className="footer-col">
                        <h4>Applications</h4>
                        <ul>
                            <li><Link to="/hk-management-system">HK Management</Link></li>
                            <li><Link to="/wennze">Wennze</Link></li>
                            <li><Link to="/goshopper">GoShopper</Link></li>
                        </ul>
                    </div>
                    <div className="footer-col">
                        <h4>Outils</h4>
                        <ul>
                            <li><Link to="/qrcode">Générateur QR</Link></li>
                            <li><Link to="/invoice">Factures</Link></li>
                            <li><Link to="/receipt">Reçus</Link></li>
                            <li><Link to="/cv">Générateur CV</Link></li>
                            <li><Link to="/email-signature">Signature Email</Link></li>
                            <li><Link to="/business-card">Carte de Visite</Link></li>
                            <li><Link to="/currency">Devises</Link></li>
                            <li><Link to="/loan">Prêt</Link></li>
                            <li><Link to="/payroll">Paie</Link></li>
                            <li><Link to="/password">Mot de Passe</Link></li>
                            <li><Link to="/compress">Compresseur Image</Link></li>
                            <li><Link to="/pdf">Éditeur PDF</Link></li>
                        </ul>
                    </div>
                    <div className="footer-col">
                        <h4>Entreprise</h4>
                        <ul>
                            <li><Link to="/about">À Propos</Link></li>
                            <li><Link to="/contact">Contact</Link></li>
                        </ul>
                    </div>
                </div>
                <div className="footer-bottom">
                    <p>© {currentYear} Africanite Services. Tous droits réservés.</p>
                    <div className="footer-legal">
                        <Link to="/privacy-policy">Confidentialité</Link>
                        <Link to="/terms-of-service">Conditions</Link>
                    </div>
                </div>
            </Container>
        </footer>
    );
};

export default Footer;