import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./components/Home";
import AboutUs from "./components/AboutUs";
import ContactUs from "./components/ContactUs";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
const App = () => {
    return (React.createElement(Router, null,
        React.createElement("div", { style: { display: "flex", flexDirection: "column", minHeight: "100vh" } },
            React.createElement(Navbar, null),
            React.createElement("main", { style: { flex: "1" } },
                React.createElement(Routes, null,
                    React.createElement(Route, { path: "/", element: React.createElement(Home, null) }),
                    React.createElement(Route, { path: "/about", element: React.createElement(AboutUs, null) }),
                    React.createElement(Route, { path: "/contact", element: React.createElement(ContactUs, null) }))),
            React.createElement(Footer, null))));
};
export default App;
