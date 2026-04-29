import React from "react";
import { Container } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

const NotFound = () => {
    const navigate = useNavigate();

    return (
        <div style={{
            minHeight: "70vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "var(--color-bg)",
        }}>
            <Container className="text-center">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
                >
                    <h1 style={{
                        fontSize: "8rem",
                        fontWeight: 700,
                        color: "var(--color-text)",
                        lineHeight: 1,
                        letterSpacing: "-0.04em",
                        marginBottom: "0.5rem",
                    }}>
                        404
                    </h1>
                    <h2 style={{
                        color: "var(--color-text)",
                        marginBottom: "1rem",
                        fontSize: "1.5rem",
                        fontWeight: 600,
                    }}>
                        Page Introuvable
                    </h2>
                    <p style={{
                        color: "var(--color-text-secondary)",
                        maxWidth: "420px",
                        margin: "0 auto 2rem",
                        fontSize: "var(--font-size-base)",
                        lineHeight: 1.5,
                    }}>
                        Désolé, la page que vous recherchez n'existe pas ou a été déplacée.
                    </p>
                    <div style={{ display: "flex", gap: "0.75rem", justifyContent: "center", flexWrap: "wrap" }}>
                        <button
                            onClick={() => navigate("/")}
                            className="btn-primary-apple"
                            style={{
                                background: "var(--color-accent)",
                                color: "#fff",
                                border: "none",
                                padding: "0.7rem 1.75rem",
                                borderRadius: "980px",
                                fontSize: "var(--font-size-sm)",
                                cursor: "pointer",
                            }}
                        >
                            Retour à l'Accueil
                        </button>
                        <button
                            onClick={() => navigate("/contact")}
                            style={{
                                background: "transparent",
                                color: "var(--color-accent)",
                                border: "none",
                                padding: "0.7rem 1.75rem",
                                borderRadius: "980px",
                                fontSize: "var(--font-size-sm)",
                                cursor: "pointer",
                            }}
                        >
                            Contactez-Nous
                        </button>
                    </div>
                </motion.div>
            </Container>
        </div>
    );
};

export default NotFound;
