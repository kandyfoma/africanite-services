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
                            <li><Link to="/invoice">Générateur de Factures</Link></li>
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