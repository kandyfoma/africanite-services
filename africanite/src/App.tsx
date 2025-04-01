import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./components/Home";
import AboutUs from "./components/AboutUs";
import ContactUs from "./components/ContactUs";
import Services from "./components/Services"; // Import the new Services component
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";

const App: React.FC = () => {
    return (
        <Router basename="/africanite-services">
            <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
                <Navbar />
                <main style={{ flex: "1" }}>
                    <Routes>
                        <Route path="/" element={<Home />} />
                        <Route path="/about" element={<AboutUs />} />
                        <Route path="/contact" element={<ContactUs />} />
                        <Route path="/services" element={<Services />} /> {/* New Route */}
                    </Routes>
                </main>
                <Footer />
            </div>
        </Router>
    );
};

export default App;