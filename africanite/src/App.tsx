import React, { Suspense, lazy } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";

// Lazy load all page components
const Home = lazy(() => import("./components/Home"));
const AboutUs = lazy(() => import("./components/AboutUs"));
const ContactUs = lazy(() => import("./components/ContactUs"));
const Services = lazy(() => import("./components/Services"));
const QRCode = lazy(() => import("./components/QRCode"));
const HKManagementSystem = lazy(() => import("./components/HKManagementSystem"));
const WennzePage = lazy(() => import("./components/WennzePage"));
const GoShopperPage = lazy(() => import("./components/GoShopperPage"));
const InvoiceGenerator = lazy(() => import("./components/InvoiceGenerator"));
const PrivacyPolicy = lazy(() => import("./components/PrivacyPolicy"));
const TermsOfService = lazy(() => import("./components/TermsOfService"));
const NotFound = lazy(() => import("./components/NotFound"));

const LoadingFallback = () => (
    <div style={{
        minHeight: "60vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
    }}>
        <div style={{
            width: "40px",
            height: "40px",
            border: "4px solid #f4f1de",
            borderTop: "4px solid #2C6E49",
            borderRadius: "50%",
            animation: "spin 0.8s linear infinite",
        }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
);

const App: React.FC = () => {
    const isGitHubPages = window.location.hostname.endsWith('github.io');
    const basename = isGitHubPages ? '/africanite-services' : '/';
    
    return (
        <Router basename={basename}>
            <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
                <Navbar />
                <main style={{ flex: "1" }}>
                    <Suspense fallback={<LoadingFallback />}>
                        <Routes>
                            <Route path="/" element={<Home />} />
                            <Route path="/about" element={<AboutUs />} />
                            <Route path="/contact" element={<ContactUs />} />
                            <Route path="/privacy-policy" element={<PrivacyPolicy />} />
                            <Route path="/terms-of-service" element={<TermsOfService />} />
                            <Route path="/services" element={<Services />} />
                            <Route path="/hk-management-system" element={<HKManagementSystem />} />
                            <Route path="/wennze" element={<WennzePage />} />
                            <Route path="/goshopper" element={<GoShopperPage />} />
                            <Route path="/qrcode" element={<QRCode />} />
                            <Route path="/invoice" element={<InvoiceGenerator />} />
                            <Route path="*" element={<NotFound />} />
                        </Routes>
                    </Suspense>
                </main>
                <Footer />
            </div>
        </Router>
    );
};

export default App;