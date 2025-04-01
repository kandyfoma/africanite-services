import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./components/Home";
import AboutUs from "./components/AboutUs";
import ContactUs from "./components/ContactUs";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";

const App: React.FC = () => {
    return (
        // Add the basename to handle GitHub Pages subdirectory
        <Router basename="/africanite-services">
            <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
                {/* Navbar */}
                <Navbar />
                {/* Main Content */}
                <main style={{ flex: "1" }}>
                    <Routes>
                        <Route path="/" element={<Home />} />
                        <Route path="/about" element={<AboutUs />} />
                        <Route path="/contact" element={<ContactUs />} />
                    </Routes>
                </main>
                {/* Footer */}
                <Footer />
            </div>
        </Router>
    );
};

export default App;