import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./components/Home";
import AboutUs from "./components/AboutUs";
import ContactUs from "./components/ContactUs";
import Services from "./components/Services";
import QRCode from "./components/QRCode";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import PrivacyPolicy from "./components/PrivacyPolicy";

const App: React.FC = () => {
    const isGitHubPages = window.location.hostname.endsWith('github.io');
    const basename = isGitHubPages ? '/africanite-services' : '/';
    
    return (
        <Router basename={basename}>
            <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
                <Navbar />
                <main style={{ flex: "1" }}>
                    <Routes>
                        <Route path="/" element={<Home />} />
                        <Route path="/about" element={<AboutUs />} />
                        <Route path="/contact" element={<ContactUs />} />
                        <Route path="/privacy-policy" element={<PrivacyPolicy />} />
                        <Route path="/services" element={<Services />} />
                        <Route path="/qrcode" element={<QRCode />} />
                    </Routes>
                </main>
                <Footer />
            </div>
        </Router>
    );
};

export default App;