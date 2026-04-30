import React, { Suspense, lazy } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import ScrollToTop from "./components/ScrollToTop";

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
const CurrencyConverter = lazy(() => import("./components/CurrencyConverter"));
const PasswordGenerator = lazy(() => import("./components/PasswordGenerator"));
const LoanCalculator = lazy(() => import("./components/LoanCalculator"));
const ImageCompressor = lazy(() => import("./components/ImageCompressor"));
const ReceiptGenerator = lazy(() => import("./components/ReceiptGenerator"));
const EmailSignatureGenerator = lazy(() => import("./components/EmailSignatureGenerator"));
const CVGenerator = lazy(() => import("./components/CVGenerator"));
const BusinessCardGenerator = lazy(() => import("./components/BusinessCardGenerator"));
const PayrollCalculator = lazy(() => import("./components/PayrollCalculator"));
const PDFEditor = lazy(() => import("./components/PDFEditor"));
const PrivacyPolicy = lazy(() => import("./components/PrivacyPolicy"));
const TermsOfService = lazy(() => import("./components/TermsOfService"));
const NotFound = lazy(() => import("./components/NotFound"));

const LoadingFallback = () => (
    <div style={{
        minHeight: "60vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#fbfbfd",
    }}>
        <div style={{
            width: "24px",
            height: "24px",
            border: "2.5px solid #e8e8ed",
            borderTop: "2.5px solid #1d1d1f",
            borderRadius: "50%",
            animation: "spin 0.7s linear infinite",
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
                <ScrollToTop />
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
                            <Route path="/currency" element={<CurrencyConverter />} />
                            <Route path="/password" element={<PasswordGenerator />} />
                            <Route path="/loan" element={<LoanCalculator />} />
                            <Route path="/compress" element={<ImageCompressor />} />
                            <Route path="/receipt" element={<ReceiptGenerator />} />
                            <Route path="/email-signature" element={<EmailSignatureGenerator />} />
                            <Route path="/cv" element={<CVGenerator />} />
                            <Route path="/business-card" element={<BusinessCardGenerator />} />
                            <Route path="/payroll" element={<PayrollCalculator />} />
                            <Route path="/pdf" element={<PDFEditor />} />
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