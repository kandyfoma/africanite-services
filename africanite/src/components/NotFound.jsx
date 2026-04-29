import React from "react";
import { Container, Button } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

const NotFound = () => {
    const navigate = useNavigate();

    return (
        <div
            style={{
                minHeight: "70vh",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: "linear-gradient(135deg, #f4f1de 0%, #eef3fb 100%)",
            }}
        >
            <Container className="text-center">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                >
                    <h1
                        style={{
                            fontSize: "8rem",
                            fontWeight: 800,
                            color: "#2C6E49",
                            lineHeight: 1,
                            marginBottom: "0.5rem",
                        }}
                    >
                        404
                    </h1>
                    <h2
                        style={{
                            color: "#283618",
                            marginBottom: "1rem",
                            fontSize: "1.8rem",
                        }}
                    >
                        Page Introuvable
                    </h2>
                    <p
                        style={{
                            color: "#666",
                            maxWidth: "500px",
                            margin: "0 auto 2rem",
                            fontSize: "1.1rem",
                        }}
                    >
                        Désolé, la page que vous recherchez n'existe pas ou a été déplacée.
                    </p>
                    <div style={{ display: "flex", gap: "1rem", justifyContent: "center", flexWrap: "wrap" }}>
                        <Button
                            variant="primary"
                            size="lg"
                            onClick={() => navigate("/")}
                            style={{
                                backgroundColor: "#2C6E49",
                                border: "none",
                                padding: "0.8rem 2rem",
                            }}
                        >
                            Retour à l'Accueil
                        </Button>
                        <Button
                            variant="outline-primary"
                            size="lg"
                            onClick={() => navigate("/contact")}
                            style={{
                                color: "#2C6E49",
                                borderColor: "#2C6E49",
                                padding: "0.8rem 2rem",
                            }}
                        >
                            Contactez-Nous
                        </Button>
                    </div>
                </motion.div>
            </Container>
        </div>
    );
};

export default NotFound;
