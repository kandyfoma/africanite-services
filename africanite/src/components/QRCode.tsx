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

/** Escape special chars for WIFI QR spec (semicolons, colons, backslashes, commas) */
function escapeWifiField(value: string): string {
    return value.replace(/\\/g, "\\\\").replace(/;/g, "\\;").replace(/:/g, "\\:").replace(/,/g, "\\,").replace(/"/g, '\\"');
}

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
            return `WIFI:T:${w.encryption};S:${escapeWifiField(w.ssid)};P:${escapeWifiField(w.password)};${hidden};`;
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

function validateURL(urlString: string): { valid: boolean; error?: string; normalized?: string } {
    if (!urlString) return { valid: false, error: "L'URL est requise" };
    let normalized = urlString.trim();
    // Auto-prefix if user forgot protocol
    if (!/^https?:\/\//i.test(normalized) && /^[a-zA-Z0-9]/.test(normalized)) {
        normalized = "https://" + normalized;
    }
    try {
        const urlObj = new URL(normalized);
        if (!["http:", "https:"].includes(urlObj.protocol))
            return { valid: false, error: "L'URL doit commencer par http:// ou https://" };
        if (!urlObj.hostname || !urlObj.hostname.includes("."))
            return { valid: false, error: "Nom de domaine invalide" };
        if (normalized.includes(" "))
            return { valid: false, error: "L'URL ne doit pas contenir d'espaces" };
        return { valid: true, normalized };
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

    // ── Phone sanitization ──
    const sanitizePhone = (value: string): string => {
        return value.replace(/[^\d\s\-+()]/g, "");
    };

    // ── Color contrast check ──
    const hasLowContrast = (): boolean => {
        const hexToLum = (hex: string): number => {
            const r = parseInt(hex.slice(1, 3), 16) / 255;
            const g = parseInt(hex.slice(3, 5), 16) / 255;
            const b = parseInt(hex.slice(5, 7), 16) / 255;
            const toLinear = (c: number) => c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
            return 0.2126 * toLinear(r) + 0.7152 * toLinear(g) + 0.0722 * toLinear(b);
        };
        if (qrColor.length !== 7 || bgColor.length !== 7) return false;
        const l1 = hexToLum(qrColor);
        const l2 = hexToLum(bgColor);
        const ratio = (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
        return ratio < 3;
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
        // Normalize URL if needed
        let finalUrl = url;
        if (qrType === "url") {
            const v = validateURL(url);
            if (!v.valid) { setUrlError(v.error || "URL invalide"); return; }
            if (v.normalized) {
                finalUrl = v.normalized;
                setUrl(finalUrl);
            }
        }

        const content = buildQRContent(qrType, { url: finalUrl, text, wifi, email, phone, sms });
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
            const headerH = (hasBrand ? 60 : 0) + (hasTagline ? 36 : 0) + (hasBrand || hasTagline ? 24 : 0);
            const qrSize = 420;
            const footerH = 64;
            const padding = 48;
            const innerPad = 40;

            canvas.width = 860;
            canvas.height = padding * 2 + innerPad * 2 + headerH + qrSize + footerH;

            // Solid white background
            ctx.fillStyle = "#FFFFFF";
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            // Clean container with subtle border
            const rx = padding, ry = padding;
            const rw = canvas.width - 2 * padding, rh = canvas.height - 2 * padding;
            ctx.strokeStyle = "#E8E8ED";
            ctx.lineWidth = 1.5;
            ctx.strokeRect(rx, ry, rw, rh);

            let yPos = padding + innerPad;
            const maxTextW = canvas.width - padding * 4;

            // Brand name
            if (hasBrand) {
                ctx.font = "600 48px -apple-system, 'SF Pro Display', 'Helvetica Neue', Arial, sans-serif";
                ctx.fillStyle = "#1D1D1F";
                ctx.textAlign = "center";
                let display = brandName;
                while (ctx.measureText(display).width > maxTextW && display.length > 3) {
                    display = display.slice(0, -1);
                }
                if (display.length < brandName.length) display += "…";
                ctx.fillText(display, canvas.width / 2, yPos + 40);
                yPos += 60;
            }

            // Tagline
            if (hasTagline) {
                ctx.font = "400 22px -apple-system, 'SF Pro Text', 'Helvetica Neue', Arial, sans-serif";
                ctx.fillStyle = "#86868B";
                ctx.textAlign = "center";
                let display = tagline;
                while (ctx.measureText(display).width > maxTextW && display.length > 3) {
                    display = display.slice(0, -1);
                }
                if (display.length < tagline.length) display += "…";
                ctx.fillText(display, canvas.width / 2, yPos + 22);
                yPos += 36;
            }

            if (hasBrand || hasTagline) yPos += 16;

            // QR code
            ctx.drawImage(qrCanvas, (canvas.width - qrSize) / 2, yPos, qrSize, qrSize);
            yPos += qrSize + 20;

            // Scan instruction
            ctx.font = "400 17px -apple-system, 'SF Pro Text', 'Helvetica Neue', Arial, sans-serif";
            ctx.fillStyle = "#86868B";
            ctx.textAlign = "center";
            ctx.fillText("Scannez avec votre caméra", canvas.width / 2, yPos);
            yPos += 22;

            // Content hint
            ctx.font = "400 13px -apple-system, 'SF Pro Text', 'Helvetica Neue', Arial, sans-serif";
            ctx.fillStyle = "#ACACB0";
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
        const fileName = `qrcode-${(brandName.trim() || qrType).replace(/[^a-zA-Z0-9_-]/g, "_")}`;

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
                // Delay revoke to let browser start the download
                setTimeout(() => URL.revokeObjectURL(href), 1000);
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
                                            onClick={() => { setQrType(t.id); setQrCodeDataUrl(null); setUrlError(""); }}
                                            aria-label={t.label}
                                            title={t.desc}
                                        >
                                            <span className="qr-type-icon">{t.icon}</span>
                                            <span className="qr-type-label">{t.label}</span>
                                        </button>
                                    ))}
                                </div>

                                <Form onSubmit={(e) => e.preventDefault()}>
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
                                            />
                                            {urlError && (
                                                <Form.Control.Feedback type="invalid">
                                                    {urlError}
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
                                                onChange={(e) => setPhone(sanitizePhone(e.target.value))}
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
                                                    onChange={(e) => setSms((s) => ({ ...s, number: sanitizePhone(e.target.value) }))}
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
                                        {hasLowContrast() && (
                                            <p className="qr-contrast-warning">
                                                Contraste trop faible — le QR code pourrait être difficile à scanner.
                                            </p>
                                        )}
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
                                className="qrcode-result mt-4"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5 }}
                            >
                                <Card className="qrcode-result-card">
                                    <Card.Body className="text-center p-4">
                                        <p className="qr-result-label">Votre QR Code</p>
                                        <div className="qr-preview-wrapper">
                                            <img
                                                src={qrCodeDataUrl}
                                                alt="QR Code généré"
                                                className="qrcode-preview"
                                            />
                                        </div>
                                        <div className="qr-actions">
                                            <Button
                                                className="qr-btn-download"
                                                onClick={() => downloadQRCode("png")}
                                            >
                                                Télécharger PNG
                                            </Button>
                                            <Button
                                                className="qr-btn-secondary"
                                                onClick={() => downloadQRCode("svg")}
                                            >
                                                Télécharger SVG
                                            </Button>
                                            <Button
                                                className="qr-btn-tertiary"
                                                onClick={resetForm}
                                            >
                                                Nouveau
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
                <div className="qr-features-grid mt-4">
                    {[
                        { icon: "✨", title: "Personnalisé", desc: "Marque, couleurs et slogan" },
                        { icon: "📱", title: "Scannable", desc: "Compatible tous smartphones" },
                        { icon: "🆓", title: "100% Gratuit", desc: "Sans limite, sans compte" },
                        { icon: "📶", title: "Multi-types", desc: "URL, WiFi, email, SMS..." },
                    ].map((f, i) => (
                        <div key={i} className="qr-feature-item">
                            <span className="qr-feature-icon">{f.icon}</span>
                            <h4>{f.title}</h4>
                            <p>{f.desc}</p>
                        </div>
                    ))}
                </div>
            </Container>
        </motion.div>
    );
};

export default QRCodeGenerator;
