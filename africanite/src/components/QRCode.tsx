import React, { useState, useRef, useCallback } from "react";
import { Container, Row, Col, Form, Button, Card } from "react-bootstrap";
import { motion } from "framer-motion";
import QRCode from "qrcode";
import "../styles/QRCode.css";

// ─────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────
type QRContentType = "url" | "text" | "wifi" | "email" | "phone" | "sms";

interface WifiData {
    ssid: string;
    password: string;
    encryption: "WPA" | "WEP" | "nopass";
    hidden: boolean;
}

interface EmailData {
    address: string;
    subject: string;
    body: string;
}

interface SmsData {
    number: string;
    message: string;
}

const QR_TYPES: { id: QRContentType; label: string; icon: string; desc: string }[] = [
    { id: "url",   label: "URL / Lien",  icon: "🔗", desc: "Site web, app, PDF en ligne" },
    { id: "text",  label: "Texte",       icon: "📝", desc: "Message ou note libre" },
    { id: "wifi",  label: "WiFi",        icon: "📶", desc: "Connexion WiFi automatique" },
    { id: "email", label: "Email",       icon: "📧", desc: "Ouvrir un email pré-rempli" },
    { id: "phone", label: "Téléphone",   icon: "📞", desc: "Appeler un numéro" },
    { id: "sms",   label: "SMS",         icon: "💬", desc: "Envoyer un SMS pré-rempli" },
];

// ─────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────

/** Build the raw string that gets encoded into the QR code */
function buildQRContent(
    type: QRContentType,
    data: {
        url?: string;
        text?: string;
        wifi?: WifiData;
        email?: EmailData;
        phone?: string;
        sms?: SmsData;
    },
): string {
    switch (type) {
        case "url":
            return data.url || "";
        case "text":
            return data.text || "";
        case "wifi": {
            const w = data.wifi;
            if (!w) return "";
            const hidden = w.hidden ? "H:true;" : "";
            return `WIFI:T:${w.encryption};S:${w.ssid};P:${w.password};${hidden};`;
        }
        case "email": {
            const e = data.email;
            if (!e) return "";
            const params = new URLSearchParams();
            if (e.subject) params.set("subject", e.subject);
            if (e.body) params.set("body", e.body);
            const qs = params.toString();
            return `mailto:${e.address}${qs ? "?" + qs : ""}`;
        }
        case "phone":
            return `tel:${data.phone || ""}`;
        case "sms": {
            const s = data.sms;
            if (!s) return "";
            return s.message
                ? `smsto:${s.number}:${s.message}`
                : `smsto:${s.number}`;
        }
    }
}

function validateURL(urlString: string): { valid: boolean; error?: string } {
    if (!urlString) return { valid: false, error: "L'URL est requise" };
    try {
        const urlObj = new URL(urlString);
        if (!["http:", "https:"].includes(urlObj.protocol))
            return { valid: false, error: "L'URL doit commencer par http:// ou https://" };
        if (!urlObj.hostname || urlObj.hostname.length < 3)
            return { valid: false, error: "Nom de domaine invalide" };
        if (urlString.includes(" "))
            return { valid: false, error: "L'URL ne doit pas contenir d'espaces" };
        return { valid: true };
    } catch {
        return { valid: false, error: "Format d'URL invalide. Exemple: https://example.com" };
    }
}

function validateEmail(addr: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(addr);
}

// ─────────────────────────────────────────────
// COMPONENT
// ─────────────────────────────────────────────
const QRCodeGenerator: React.FC = () => {
    // Content type
    const [qrType, setQrType] = useState<QRContentType>("url");

    // Content data
    const [url, setUrl] = useState("");
    const [urlError, setUrlError] = useState("");
    const [isUrlValid, setIsUrlValid] = useState(false);
    const [text, setText] = useState("");
    const [wifi, setWifi] = useState<WifiData>({ ssid: "", password: "", encryption: "WPA", hidden: false });
    const [email, setEmail] = useState<EmailData>({ address: "", subject: "", body: "" });
    const [phone, setPhone] = useState("");
    const [sms, setSms] = useState<SmsData>({ number: "", message: "" });

    // Branding
    const [brandName, setBrandName] = useState("");
    const [tagline, setTagline] = useState("");

    // Colors
    const [qrColor, setQrColor] = useState("#000000");
    const [bgColor, setBgColor] = useState("#FFFFFF");

    // Output
    const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string | null>(null);
    const [isGenerating, setIsGenerating] = useState(false);
    const canvasRef = useRef<HTMLCanvasElement>(null);

    // ── URL validation ──
    const handleUrlChange = (value: string) => {
        setUrl(value);
        if (value.trim()) {
            const v = validateURL(value.trim());
            setUrlError(v.error || "");
            setIsUrlValid(v.valid);
        } else {
            setUrlError("");
            setIsUrlValid(false);
        }
    };

    // ── Form validity ──
    const isFormValid = useCallback((): boolean => {
        switch (qrType) {
            case "url":   return isUrlValid;
            case "text":  return text.trim().length > 0;
            case "wifi":  return wifi.ssid.trim().length > 0;
            case "email": return validateEmail(email.address);
            case "phone": return phone.replace(/[\s\-+()]/g, "").length >= 6;
            case "sms":   return sms.number.replace(/[\s\-+()]/g, "").length >= 6;
        }
    }, [qrType, isUrlValid, text, wifi.ssid, email.address, phone, sms.number]);

    // ── Generate branded QR ──
    const handleGenerate = async () => {
        if (qrType === "url") {
            const v = validateURL(url);
            if (!v.valid) { setUrlError(v.error || "URL invalide"); return; }
        }

        const content = buildQRContent(qrType, { url, text, wifi, email, phone, sms });
        if (!content) {
            alert("Veuillez remplir les champs requis");
            return;
        }

        setIsGenerating(true);
        try {
            // Generate base QR code
            const qrCanvas = document.createElement("canvas");
            await QRCode.toCanvas(qrCanvas, content, {
                errorCorrectionLevel: "H",
                margin: 2,
                width: 450,
                color: { dark: qrColor, light: bgColor },
            });

            const canvas = canvasRef.current;
            if (!canvas) return;
            const ctx = canvas.getContext("2d");
            if (!ctx) return;

            // Dynamic canvas height based on content
            const hasBrand = !!brandName.trim();
            const hasTagline = !!tagline.trim();
            const headerH = (hasBrand ? 80 : 0) + (hasTagline ? 50 : 0) + (hasBrand || hasTagline ? 30 : 0);
            const qrSize = 450;
            const footerH = 80;
            const padding = 40;
            const innerPad = 30;

            canvas.width = 900;
            canvas.height = padding * 2 + innerPad * 2 + headerH + qrSize + footerH;

            // White background
            ctx.fillStyle = "#FFFFFF";
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            // Container shadow + border
            const shadowOff = 6;
            ctx.fillStyle = "#E0E0E0";
            ctx.fillRect(padding + shadowOff, padding + shadowOff, canvas.width - 2 * padding, canvas.height - 2 * padding);
            ctx.fillStyle = "#FFFFFF";
            ctx.fillRect(padding, padding, canvas.width - 2 * padding, canvas.height - 2 * padding);
            ctx.strokeStyle = "#2C6E49";
            ctx.lineWidth = 4;
            ctx.strokeRect(padding, padding, canvas.width - 2 * padding, canvas.height - 2 * padding);

            let yPos = padding + innerPad;
            const maxTextW = canvas.width - padding * 4;

            // Brand name (with overflow guard)
            if (hasBrand) {
                ctx.font = "bold 60px Arial";
                ctx.fillStyle = "#2C6E49";
                ctx.textAlign = "center";
                let display = brandName.toUpperCase();
                while (ctx.measureText(display).width > maxTextW && display.length > 3) {
                    display = display.slice(0, -1);
                }
                if (display.length < brandName.length) display += "…";
                ctx.fillText(display, canvas.width / 2, yPos + 50);
                yPos += 80;
            }

            // Tagline (with overflow guard)
            if (hasTagline) {
                ctx.font = "28px Arial";
                ctx.fillStyle = "#283618";
                ctx.textAlign = "center";
                let display = tagline;
                while (ctx.measureText(display).width > maxTextW && display.length > 3) {
                    display = display.slice(0, -1);
                }
                if (display.length < tagline.length) display += "…";
                ctx.fillText(display, canvas.width / 2, yPos + 28);
                yPos += 50;
            }

            if (hasBrand || hasTagline) yPos += 20;

            // QR code
            ctx.drawImage(qrCanvas, (canvas.width - qrSize) / 2, yPos, qrSize, qrSize);
            yPos += qrSize + 25;

            // Scan instruction
            ctx.font = "22px Arial";
            ctx.fillStyle = "#4C956C";
            ctx.textAlign = "center";
            ctx.fillText("Scannez avec votre caméra", canvas.width / 2, yPos);
            yPos += 28;

            // Content hint (type-specific)
            ctx.font = "16px Arial";
            ctx.fillStyle = "#DDA15E";
            let hint = "";
            switch (qrType) {
                case "url":   hint = url.length > 55 ? url.substring(0, 52) + "..." : url; break;
                case "wifi":  hint = `WiFi: ${wifi.ssid}`; break;
                case "email": hint = `Email: ${email.address}`; break;
                case "phone": hint = `Tel: ${phone}`; break;
                case "sms":   hint = `SMS: ${sms.number}`; break;
                case "text":  hint = text.length > 50 ? text.substring(0, 47) + "..." : text; break;
            }
            ctx.fillText(hint, canvas.width / 2, yPos);

            setQrCodeDataUrl(canvas.toDataURL("image/png"));
        } catch (error) {
            console.error("Error generating QR code:", error);
            alert("Erreur lors de la génération du QR code. Vérifiez votre contenu.");
        } finally {
            setIsGenerating(false);
        }
    };

    // ── Download PNG or SVG ──
    const downloadQRCode = (format: "png" | "svg" = "png") => {
        const fileName = `qrcode-${brandName.trim() || qrType}`;

        if (format === "svg") {
            const content = buildQRContent(qrType, { url, text, wifi, email, phone, sms });
            if (!content) return;
            QRCode.toString(content, {
                type: "svg",
                errorCorrectionLevel: "H",
                margin: 2,
                width: 450,
                color: { dark: qrColor, light: bgColor },
            }).then((svgString) => {
                const blob = new Blob([svgString], { type: "image/svg+xml" });
                const href = URL.createObjectURL(blob);
                const link = document.createElement("a");
                link.download = `${fileName}.svg`;
                link.href = href;
                link.click();
                URL.revokeObjectURL(href);
            });
            return;
        }

        if (!qrCodeDataUrl) return;
        const link = document.createElement("a");
        link.download = `${fileName}.png`;
        link.href = qrCodeDataUrl;
        link.click();
    };

    // ── Reset ──
    const resetForm = () => {
        setUrl(""); setUrlError(""); setIsUrlValid(false);
        setText("");
        setWifi({ ssid: "", password: "", encryption: "WPA", hidden: false });
        setEmail({ address: "", subject: "", body: "" });
        setPhone("");
        setSms({ number: "", message: "" });
        setBrandName(""); setTagline("");
        setQrCodeDataUrl(null);
        setQrColor("#000000"); setBgColor("#FFFFFF");
    };

    // ─────────────────────────────────────────────
    // RENDER
    // ─────────────────────────────────────────────
    return (
        <motion.div
            className="qrcode-page"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
        >
            <Container className="py-5">
                <h1 className="text-center mb-2">Générateur de QR Code</h1>
                <p className="text-center mb-2 text-muted">
                    Créez des QR codes personnalisés pour vos liens, WiFi, contacts et plus
                </p>
                <p className="text-center mb-5">
                    <span className="free-badge">100% Gratuit · Sans Limite</span>
                </p>

                <Row className="justify-content-center">
                    <Col md={10} lg={8}>
                        <Card className="qrcode-form-card shadow">
                            <Card.Body className="p-4">
                                {/* ── Type Selection Grid ── */}
                                <div className="qr-type-grid mb-4">
                                    {QR_TYPES.map((t) => (
                                        <button
                                            key={t.id}
                                            className={`qr-type-card ${qrType === t.id ? "active" : ""}`}
                                            onClick={() => { setQrType(t.id); setQrCodeDataUrl(null); }}
                                            aria-label={t.label}
                                            title={t.desc}
                                        >
                                            <span className="qr-type-icon">{t.icon}</span>
                                            <span className="qr-type-label">{t.label}</span>
                                        </button>
                                    ))}
                                </div>

                                <Form>
                                    {/* ── URL ── */}
                                    {qrType === "url" && (
                                        <Form.Group className="mb-4">
                                            <Form.Label>
                                                URL ou Lien <span className="text-danger">*</span>
                                            </Form.Label>
                                            <Form.Control
                                                type="url"
                                                placeholder="https://example.com"
                                                value={url}
                                                onChange={(e) => handleUrlChange(e.target.value)}
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
                                                Site web, Google Play, lien vers un PDF hébergé, etc.
                                            </Form.Text>
                                        </Form.Group>
                                    )}

                                    {/* ── Text ── */}
                                    {qrType === "text" && (
                                        <Form.Group className="mb-4">
                                            <Form.Label>
                                                Texte <span className="text-danger">*</span>
                                            </Form.Label>
                                            <Form.Control
                                                as="textarea"
                                                rows={3}
                                                placeholder="Votre message, note, ou information..."
                                                value={text}
                                                onChange={(e) => setText(e.target.value)}
                                                maxLength={500}
                                            />
                                            <Form.Text className="text-muted">
                                                {text.length}/500 caractères
                                            </Form.Text>
                                        </Form.Group>
                                    )}

                                    {/* ── WiFi ── */}
                                    {qrType === "wifi" && (
                                        <>
                                            <Form.Group className="mb-3">
                                                <Form.Label>
                                                    Nom du Réseau (SSID) <span className="text-danger">*</span>
                                                </Form.Label>
                                                <Form.Control
                                                    type="text"
                                                    placeholder="Mon WiFi"
                                                    value={wifi.ssid}
                                                    onChange={(e) => setWifi((w) => ({ ...w, ssid: e.target.value }))}
                                                />
                                            </Form.Group>
                                            <Form.Group className="mb-3">
                                                <Form.Label>Mot de Passe</Form.Label>
                                                <Form.Control
                                                    type="text"
                                                    placeholder="Mot de passe WiFi"
                                                    value={wifi.password}
                                                    onChange={(e) => setWifi((w) => ({ ...w, password: e.target.value }))}
                                                />
                                            </Form.Group>
                                            <Row className="mb-4">
                                                <Col>
                                                    <Form.Group>
                                                        <Form.Label>Sécurité</Form.Label>
                                                        <Form.Select
                                                            value={wifi.encryption}
                                                            onChange={(e) => setWifi((w) => ({ ...w, encryption: e.target.value as WifiData["encryption"] }))}
                                                        >
                                                            <option value="WPA">WPA / WPA2</option>
                                                            <option value="WEP">WEP</option>
                                                            <option value="nopass">Aucune</option>
                                                        </Form.Select>
                                                    </Form.Group>
                                                </Col>
                                                <Col className="d-flex align-items-end pb-2">
                                                    <Form.Check
                                                        type="checkbox"
                                                        label="Réseau masqué"
                                                        checked={wifi.hidden}
                                                        onChange={(e) => setWifi((w) => ({ ...w, hidden: e.target.checked }))}
                                                    />
                                                </Col>
                                            </Row>
                                        </>
                                    )}

                                    {/* ── Email ── */}
                                    {qrType === "email" && (
                                        <>
                                            <Form.Group className="mb-3">
                                                <Form.Label>
                                                    Adresse Email <span className="text-danger">*</span>
                                                </Form.Label>
                                                <Form.Control
                                                    type="email"
                                                    placeholder="contact@example.com"
                                                    value={email.address}
                                                    onChange={(e) => setEmail((em) => ({ ...em, address: e.target.value }))}
                                                    isValid={validateEmail(email.address) && email.address.length > 0}
                                                    isInvalid={email.address.length > 3 && !validateEmail(email.address)}
                                                />
                                            </Form.Group>
                                            <Form.Group className="mb-3">
                                                <Form.Label>Objet (Optionnel)</Form.Label>
                                                <Form.Control
                                                    type="text"
                                                    placeholder="Objet de l'email"
                                                    value={email.subject}
                                                    onChange={(e) => setEmail((em) => ({ ...em, subject: e.target.value }))}
                                                />
                                            </Form.Group>
                                            <Form.Group className="mb-4">
                                                <Form.Label>Corps du Message (Optionnel)</Form.Label>
                                                <Form.Control
                                                    as="textarea"
                                                    rows={2}
                                                    placeholder="Message pré-rempli..."
                                                    value={email.body}
                                                    onChange={(e) => setEmail((em) => ({ ...em, body: e.target.value }))}
                                                />
                                            </Form.Group>
                                        </>
                                    )}

                                    {/* ── Phone ── */}
                                    {qrType === "phone" && (
                                        <Form.Group className="mb-4">
                                            <Form.Label>
                                                Numéro de Téléphone <span className="text-danger">*</span>
                                            </Form.Label>
                                            <Form.Control
                                                type="tel"
                                                placeholder="+243 82 881 2498"
                                                value={phone}
                                                onChange={(e) => setPhone(e.target.value)}
                                            />
                                            <Form.Text className="text-muted">
                                                Inclure l'indicatif pays (ex: +243)
                                            </Form.Text>
                                        </Form.Group>
                                    )}

                                    {/* ── SMS ── */}
                                    {qrType === "sms" && (
                                        <>
                                            <Form.Group className="mb-3">
                                                <Form.Label>
                                                    Numéro de Téléphone <span className="text-danger">*</span>
                                                </Form.Label>
                                                <Form.Control
                                                    type="tel"
                                                    placeholder="+243 82 881 2498"
                                                    value={sms.number}
                                                    onChange={(e) => setSms((s) => ({ ...s, number: e.target.value }))}
                                                />
                                            </Form.Group>
                                            <Form.Group className="mb-4">
                                                <Form.Label>Message (Optionnel)</Form.Label>
                                                <Form.Control
                                                    as="textarea"
                                                    rows={2}
                                                    placeholder="Message pré-rempli..."
                                                    value={sms.message}
                                                    onChange={(e) => setSms((s) => ({ ...s, message: e.target.value }))}
                                                    maxLength={160}
                                                />
                                                <Form.Text className="text-muted">
                                                    {sms.message.length}/160 caractères
                                                </Form.Text>
                                            </Form.Group>
                                        </>
                                    )}

                                    {/* ── Branding & Colors ── */}
                                    <div className="qr-branding-section mb-4">
                                        <h6 className="qr-section-label">
                                            ✨ Personnalisation (Optionnel)
                                        </h6>
                                        <Row>
                                            <Col md={6}>
                                                <Form.Group className="mb-3">
                                                    <Form.Label>Nom de la Marque</Form.Label>
                                                    <Form.Control
                                                        type="text"
                                                        placeholder="VOTRE MARQUE"
                                                        value={brandName}
                                                        onChange={(e) => setBrandName(e.target.value)}
                                                        maxLength={25}
                                                    />
                                                </Form.Group>
                                            </Col>
                                            <Col md={6}>
                                                <Form.Group className="mb-3">
                                                    <Form.Label>Slogan</Form.Label>
                                                    <Form.Control
                                                        type="text"
                                                        placeholder="Votre message ici"
                                                        value={tagline}
                                                        onChange={(e) => setTagline(e.target.value)}
                                                        maxLength={50}
                                                    />
                                                </Form.Group>
                                            </Col>
                                        </Row>
                                        <Row>
                                            <Col xs={6}>
                                                <Form.Group className="mb-3">
                                                    <Form.Label>Couleur du QR</Form.Label>
                                                    <div className="d-flex align-items-center gap-2">
                                                        <Form.Control
                                                            type="color"
                                                            value={qrColor}
                                                            onChange={(e) => setQrColor(e.target.value)}
                                                            className="qr-color-input"
                                                            title="Couleur du QR code"
                                                        />
                                                        <Form.Control
                                                            type="text"
                                                            value={qrColor}
                                                            onChange={(e) => {
                                                                if (/^#[0-9A-Fa-f]{0,6}$/.test(e.target.value)) setQrColor(e.target.value);
                                                            }}
                                                            className="qr-color-text"
                                                        />
                                                    </div>
                                                </Form.Group>
                                            </Col>
                                            <Col xs={6}>
                                                <Form.Group className="mb-3">
                                                    <Form.Label>Couleur de Fond</Form.Label>
                                                    <div className="d-flex align-items-center gap-2">
                                                        <Form.Control
                                                            type="color"
                                                            value={bgColor}
                                                            onChange={(e) => setBgColor(e.target.value)}
                                                            className="qr-color-input"
                                                            title="Couleur de fond"
                                                        />
                                                        <Form.Control
                                                            type="text"
                                                            value={bgColor}
                                                            onChange={(e) => {
                                                                if (/^#[0-9A-Fa-f]{0,6}$/.test(e.target.value)) setBgColor(e.target.value);
                                                            }}
                                                            className="qr-color-text"
                                                        />
                                                    </div>
                                                </Form.Group>
                                            </Col>
                                        </Row>
                                    </div>

                                    {/* ── Generate Button ── */}
                                    <div className="d-grid">
                                        <Button
                                            variant="primary"
                                            size="lg"
                                            onClick={handleGenerate}
                                            disabled={isGenerating || !isFormValid()}
                                        >
                                            {isGenerating ? "Génération..." : "Générer le QR Code"}
                                        </Button>
                                    </div>
                                </Form>
                            </Card.Body>
                        </Card>

                        {/* ── Result ── */}
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
                                            alt="QR Code généré"
                                            className="qrcode-preview mb-4"
                                        />
                                        <div className="d-flex gap-2 justify-content-center flex-wrap">
                                            <Button
                                                variant="success"
                                                onClick={() => downloadQRCode("png")}
                                                size="lg"
                                            >
                                                📥 Télécharger PNG
                                            </Button>
                                            <Button
                                                variant="outline-success"
                                                onClick={() => downloadQRCode("svg")}
                                                size="lg"
                                            >
                                                📐 Télécharger SVG
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

                {/* ── Features Section ── */}
                <Row className="mt-5">
                    <Col md={3} sm={6} className="text-center mb-4">
                        <div className="feature-icon mb-3" role="img" aria-label="Personnalisé">✨</div>
                        <h4>Personnalisé</h4>
                        <p className="text-muted">Marque, couleurs et slogan</p>
                    </Col>
                    <Col md={3} sm={6} className="text-center mb-4">
                        <div className="feature-icon mb-3" role="img" aria-label="Scannable">📱</div>
                        <h4>Scannable</h4>
                        <p className="text-muted">Compatible tous smartphones</p>
                    </Col>
                    <Col md={3} sm={6} className="text-center mb-4">
                        <div className="feature-icon mb-3" role="img" aria-label="Gratuit">🆓</div>
                        <h4>100% Gratuit</h4>
                        <p className="text-muted">Sans limite, sans compte</p>
                    </Col>
                    <Col md={3} sm={6} className="text-center mb-4">
                        <div className="feature-icon mb-3" role="img" aria-label="Multi-types">📶</div>
                        <h4>Multi-types</h4>
                        <p className="text-muted">URL, WiFi, email, SMS...</p>
                    </Col>
                </Row>
            </Container>
        </motion.div>
    );
};

export default QRCodeGenerator;
