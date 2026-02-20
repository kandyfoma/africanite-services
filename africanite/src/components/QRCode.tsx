import React, { useState, useRef } from "react";
import { Container, Row, Col, Form, Button, Card, ButtonGroup } from "react-bootstrap";
import { motion } from "framer-motion";
import QRCode from "qrcode";
import { PaymentModal } from "./PaymentModal";
import "../styles/QRCode.css";

// Pricing
const QR_CODE_PRICE = 2.0; // $2 per QR code

const QRCodeGenerator: React.FC = () => {
    const [url, setUrl] = useState("");
    const [urlError, setUrlError] = useState<string>("");
    const [isUrlValid, setIsUrlValid] = useState(false);
    const [brandName, setBrandName] = useState("");
    const [tagline, setTagline] = useState("");
    const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string | null>(null);
    const [isGenerating, setIsGenerating] = useState(false);
    const [qrType, setQrType] = useState<"url" | "pdf">("url");
    const [pdfFile, setPdfFile] = useState<File | null>(null);
    const [pdfUrl, setPdfUrl] = useState<string>("");
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [isPaid, setIsPaid] = useState(false);
    const [isDragging, setIsDragging] = useState(false);
    const [pdfError, setPdfError] = useState<string>("");
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const validateURL = (urlString: string): { valid: boolean; error?: string } => {
        if (!urlString) {
            return { valid: false, error: "L'URL est requise" };
        }

        // Check if it's a valid URL format
        try {
            const urlObj = new URL(urlString);
            
            // Check protocol
            if (!['http:', 'https:'].includes(urlObj.protocol)) {
                return { valid: false, error: "L'URL doit commencer par http:// ou https://" };
            }

            // Check if domain exists
            if (!urlObj.hostname || urlObj.hostname.length < 3) {
                return { valid: false, error: "Nom de domaine invalide" };
            }

            // Check for spaces
            if (urlString.includes(' ')) {
                return { valid: false, error: "L'URL ne doit pas contenir d'espaces" };
            }

            return { valid: true };
        } catch (error) {
            return { valid: false, error: "Format d'URL invalide. Exemple: https://example.com" };
        }
    };

    const handleUrlChange = (value: string) => {
        setUrl(value);
        
        if (value.trim()) {
            const validation = validateURL(value.trim());
            setUrlError(validation.error || "");
            setIsUrlValid(validation.valid);
        } else {
            setUrlError("");
            setIsUrlValid(false);
        }
    };

    const validatePDF = (file: File): { valid: boolean; error?: string } => {
        // Check file type
        if (file.type !== "application/pdf") {
            return { valid: false, error: "Le fichier doit être au format PDF" };
        }

        // Check file size (max 10MB)
        const maxSize = 10 * 1024 * 1024; // 10MB
        if (file.size > maxSize) {
            return { valid: false, error: "Le fichier ne doit pas dépasser 10MB" };
        }

        // Check file name
        if (!file.name.toLowerCase().endsWith('.pdf')) {
            return { valid: false, error: "Extension de fichier invalide" };
        }

        return { valid: true };
    };

    const processPdfFile = (file: File) => {
        setPdfError("");
        const validation = validatePDF(file);
        
        if (!validation.valid) {
            setPdfError(validation.error || "Fichier invalide");
            setPdfFile(null);
            setPdfUrl("");
            return;
        }

        setPdfFile(file);
        const blobUrl = URL.createObjectURL(file);
        setPdfUrl(blobUrl);
    };

    const handlePdfUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            processPdfFile(file);
        }
    };

    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(true);
    };

    const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
    };

    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);

        const files = e.dataTransfer.files;
        if (files && files.length > 0) {
            processPdfFile(files[0]);
        }
    };

    const handleRemovePdf = () => {
        setPdfFile(null);
        setPdfUrl("");
        setPdfError("");
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    const handleSubmit = () => {
        const targetUrl = qrType === "pdf" ? pdfUrl : url;
        
        if (qrType === "url") {
            const validation = validateURL(url);
            if (!validation.valid) {
                setUrlError(validation.error || "URL invalide");
                return;
            }
        }
        
        if (!targetUrl) {
            alert(qrType === "pdf" ? "Veuillez télécharger un fichier PDF" : "Veuillez entrer une URL valide");
            return;
        }

        // Show payment modal
        setShowPaymentModal(true);
    };

    const handlePaymentSuccess = () => {
        setIsPaid(true);
        generateBrandedQRCode();
    };

    const generateBrandedQRCode = async () => {
        const targetUrl = qrType === "pdf" ? pdfUrl : url;
        
        if (!targetUrl) {
            alert(qrType === "pdf" ? "Veuillez télécharger un fichier PDF" : "Veuillez entrer une URL valide");
            return;
        }

        setIsGenerating(true);

        try {
            // Generate base QR code
            const qrCanvas = document.createElement("canvas");
            await QRCode.toCanvas(qrCanvas, targetUrl, {
                errorCorrectionLevel: "H",
                margin: 2,
                width: 450,
                color: {
                    dark: "#000000",
                    light: "#FFFFFF",
                },
            });

            // Create branded canvas
            const canvas = canvasRef.current;
            if (!canvas) return;

            const ctx = canvas.getContext("2d");
            if (!ctx) return;

            // Canvas dimensions
            canvas.width = 900;
            canvas.height = 1200;

            // Fill white background
            ctx.fillStyle = "#FFFFFF";
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            // Draw container border
            const padding = 40;
            const shadowOffset = 8;

            // Draw shadow
            ctx.fillStyle = "#E0E0E0";
            ctx.fillRect(
                padding + shadowOffset,
                padding + shadowOffset,
                canvas.width - 2 * padding,
                canvas.height - 2 * padding
            );

            // Draw container with site colors
            ctx.fillStyle = "#FFFFFF";
            ctx.fillRect(
                padding,
                padding,
                canvas.width - 2 * padding,
                canvas.height - 2 * padding
            );
            ctx.strokeStyle = "#2C6E49"; // Site primary color
            ctx.lineWidth = 4;
            ctx.strokeRect(
                padding,
                padding,
                canvas.width - 2 * padding,
                canvas.height - 2 * padding
            );

            // Draw brand name if provided
            if (brandName) {
                ctx.font = "bold 70px Arial";
                ctx.fillStyle = "#2C6E49"; // Site primary color
                ctx.textAlign = "center";
                ctx.fillText(brandName.toUpperCase(), canvas.width / 2, 150);
            }

            // Draw tagline if provided
            if (tagline) {
                ctx.font = "32px Arial";
                ctx.fillStyle = "#283618"; // Site text color
                ctx.textAlign = "center";
                ctx.fillText(tagline, canvas.width / 2, brandName ? 220 : 150);
            }

            // Draw QR code
            const qrY = brandName || tagline ? 300 : 150;
            ctx.drawImage(qrCanvas, (canvas.width - 450) / 2, qrY, 450, 450);

            // Draw instruction text
            ctx.font = "24px Arial";
            ctx.fillStyle = "#4C956C"; // Site secondary color
            ctx.textAlign = "center";
            ctx.fillText(
                "Scannez avec votre caméra",
                canvas.width / 2,
                qrY + 480
            );

            // Draw URL or PDF indicator
            if (qrType === "pdf" && pdfFile) {
                ctx.font = "18px Arial";
                ctx.fillStyle = "#DDA15E"; // Site accent color
                ctx.fillText(`📄 ${pdfFile.name}`, canvas.width / 2, qrY + 520);
            } else {
                ctx.font = "18px Arial";
                ctx.fillStyle = "#4C956C"; // Site secondary color
                const displayUrl = url.length > 60 ? url.substring(0, 57) + "..." : url;
                ctx.fillText(displayUrl, canvas.width / 2, qrY + 520);
            }

            // Convert to data URL
            const dataUrl = canvas.toDataURL("image/png");
            setQrCodeDataUrl(dataUrl);
        } catch (error) {
            console.error("Error generating QR code:", error);
            alert("Erreur lors de la génération du QR code");
        } finally {
            setIsGenerating(false);
        }
    };

    const downloadQRCode = () => {
        if (!qrCodeDataUrl) return;

        const link = document.createElement("a");
        link.download = `qrcode-${brandName || (qrType === "pdf" ? "pdf" : "url")}.png`;
        link.href = qrCodeDataUrl;
        link.click();
    };

    const resetForm = () => {
        setUrl("");
        setUrlError("");
        setIsUrlValid(false);
        setBrandName("");
        setTagline("");
        setQrCodeDataUrl(null);
        setPdfFile(null);
        setPdfUrl("");
        setPdfError("");
        setIsPaid(false);
    };

    return (
        <motion.div
            className="qrcode-page"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
        >
            <Container className="py-5">
                <h1 className="text-center mb-4">Générateur de QR Code</h1>
                <p className="text-center mb-2 text-muted">
                    Créez des QR codes personnalisés pour vos liens, applications ou documents
                </p>
                <p className="text-center mb-5">
                    <span className="price-badge">${QR_CODE_PRICE.toFixed(2)} par QR Code</span>
                </p>

                <Row className="justify-content-center">
                    <Col md={10} lg={8}>
                        <Card className="qrcode-form-card shadow">
                            <Card.Body className="p-4">
                                {/* Type Selection */}
                                <div className="text-center mb-4">
                                    <ButtonGroup>
                                        <Button
                                            variant={qrType === "url" ? "primary" : "outline-primary"}
                                            onClick={() => { setQrType("url"); resetForm(); }}
                                        >
                                            🔗 Lien / URL
                                        </Button>
                                        <Button
                                            variant={qrType === "pdf" ? "primary" : "outline-primary"}
                                            onClick={() => { setQrType("pdf"); resetForm(); }}
                                        >
                                            📄 Document PDF
                                        </Button>
                                    </ButtonGroup>
                                </div>

                                <Form>
                                    {qrType === "url" ? (
                                        <Form.Group className="mb-4">
                                            <Form.Label>
                                                URL ou Lien <span className="text-danger">*</span>
                                            </Form.Label>
                                            <Form.Control
                                                type="url"
                                                placeholder="https://example.com"
                                                value={url}
                                                onChange={(e) => handleUrlChange(e.target.value)}
                                                required
                                                isInvalid={!!urlError}
                                                isValid={isUrlValid && url.length > 0}
                                            />
                                            {urlError && (
                                                <Form.Control.Feedback type="invalid">
                                                    {urlError}
                                                </Form.Control.Feedback>
                                            )}
                                            {isUrlValid && url.length > 0 && (
                                                <Form.Control.Feedback type="valid">
                                                    ✓ URL valide
                                                </Form.Control.Feedback>
                                            )}
                                            <Form.Text className="text-muted">
                                                Entrez l'URL complète (Google Play, site web, etc.)
                                            </Form.Text>
                                        </Form.Group>
                                    ) : (
                                        <Form.Group className="mb-4">
                                            <Form.Label>
                                                Fichier PDF <span className="text-danger">*</span>
                                            </Form.Label>
                                            
                                            {/* Drag and Drop Zone */}
                                            <div
                                                className={`pdf-upload-zone ${isDragging ? "dragging" : ""} ${pdfFile ? "has-file" : ""} ${pdfError ? "has-error" : ""}`}
                                                onDragOver={handleDragOver}
                                                onDragLeave={handleDragLeave}
                                                onDrop={handleDrop}
                                                onClick={() => fileInputRef.current?.click()}
                                            >
                                                <input
                                                    ref={fileInputRef}
                                                    type="file"
                                                    accept=".pdf,application/pdf"
                                                    onChange={handlePdfUpload}
                                                    style={{ display: "none" }}
                                                />
                                                
                                                {!pdfFile ? (
                                                    <div className="upload-content">
                                                        <div className="upload-icon">
                                                            📄
                                                        </div>
                                                        <h5 className="upload-title">
                                                            {isDragging ? "Déposez votre fichier ici" : "Glissez-déposez votre PDF"}
                                                        </h5>
                                                        <p className="upload-text">
                                                            ou cliquez pour parcourir
                                                        </p>
                                                        <small className="text-muted">
                                                            PDF uniquement • Max 10MB
                                                        </small>
                                                    </div>
                                                ) : (
                                                    <div className="file-preview">
                                                        <div className="file-icon">📄</div>
                                                        <div className="file-details">
                                                            <p className="file-name">{pdfFile.name}</p>
                                                            <small className="file-size">
                                                                {(pdfFile.size / 1024 / 1024).toFixed(2)} MB
                                                            </small>
                                                        </div>
                                                        <Button
                                                            variant="outline-danger"
                                                            size="sm"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                handleRemovePdf();
                                                            }}
                                                            className="remove-btn"
                                                        >
                                                            ✕
                                                        </Button>
                                                    </div>
                                                )}
                                            </div>
                                            
                                            {pdfError && (
                                                <div className="mt-2 text-danger">
                                                    <small>⚠️ {pdfError}</small>
                                                </div>
                                            )}
                                            
                                            {pdfFile && !pdfError && (
                                                <div className="mt-2 text-success">
                                                    <small>✓ Fichier valide et prêt</small>
                                                </div>
                                            )}
                                        </Form.Group>
                                    )}

                                    <Form.Group className="mb-4">
                                        <Form.Label>Nom de la Marque (Optionnel)</Form.Label>
                                        <Form.Control
                                            type="text"
                                            placeholder="VOTRE MARQUE"
                                            value={brandName}
                                            onChange={(e) => setBrandName(e.target.value)}
                                            maxLength={20}
                                        />
                                    </Form.Group>

                                    <Form.Group className="mb-4">
                                        <Form.Label>Slogan (Optionnel)</Form.Label>
                                        <Form.Control
                                            type="text"
                                            placeholder="Votre message ici"
                                            value={tagline}
                                            onChange={(e) => setTagline(e.target.value)}
                                            maxLength={50}
                                        />
                                    </Form.Group>

                                    <div className="d-grid gap-2">
                                        <Button
                                            variant="primary"
                                            size="lg"
                                            onClick={handleSubmit}
                                            disabled={isGenerating || (qrType === "url" ? !url : !pdfFile)}
                                        >
                                            {isGenerating ? "Génération..." : `Continuer vers le paiement ($${QR_CODE_PRICE.toFixed(2)})`}
                                        </Button>
                                    </div>
                                </Form>
                            </Card.Body>
                        </Card>

                        {qrCodeDataUrl && (
                            <motion.div
                                className="qrcode-result mt-5"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5 }}
                            >
                                <Card className="shadow">
                                    <Card.Body className="text-center p-4">
                                        <h3 className="mb-4">Votre QR Code</h3>
                                        <img
                                            src={qrCodeDataUrl}
                                            alt="Generated QR Code"
                                            className="qrcode-preview mb-4"
                                        />
                                        <div className="d-flex gap-2 justify-content-center">
                                            <Button
                                                variant="success"
                                                onClick={downloadQRCode}
                                                size="lg"
                                            >
                                                📥 Télécharger
                                            </Button>
                                            <Button
                                                variant="outline-secondary"
                                                onClick={resetForm}
                                                size="lg"
                                            >
                                                🔄 Nouveau QR Code
                                            </Button>
                                        </div>
                                    </Card.Body>
                                </Card>
                            </motion.div>
                        )}

                        <canvas ref={canvasRef} style={{ display: "none" }} />
                    </Col>
                </Row>

                {/* Features Section */}
                <Row className="mt-5">
                    <Col md={4} className="text-center mb-4">
                        <div className="feature-icon mb-3">✨</div>
                        <h4>Personnalisé</h4>
                        <p className="text-muted">
                            Ajoutez votre nom de marque et slogan
                        </p>
                    </Col>
                    <Col md={4} className="text-center mb-4">
                        <div className="feature-icon mb-3">📱</div>
                        <h4>Scannable</h4>
                        <p className="text-muted">
                            Compatible avec tous les smartphones
                        </p>
                    </Col>
                    <Col md={4} className="text-center mb-4">
                        <div className="feature-icon mb-3">🖨️</div>
                        <h4>Haute Qualité</h4>
                        <p className="text-muted">
                            Prêt à imprimer en haute résolution
                        </p>
                    </Col>
                </Row>
            </Container>

            {/* Payment Modal */}
            <PaymentModal
                show={showPaymentModal}
                onHide={() => setShowPaymentModal(false)}
                amount={QR_CODE_PRICE}
                onPaymentSuccess={handlePaymentSuccess}
            />
        </motion.div>
    );
};

export default QRCodeGenerator;
