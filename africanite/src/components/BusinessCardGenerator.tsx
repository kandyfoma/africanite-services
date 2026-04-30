import { useState } from "react";
import { Container } from "react-bootstrap";
import { Download } from "lucide-react";
import "../styles/BusinessCardGenerator.css";

type CardStyle = "dark" | "light" | "gradient";

export default function BusinessCardGenerator() {
    const [fullName, setFullName] = useState("");
    const [title, setTitle] = useState("");
    const [company, setCompany] = useState("");
    const [email, setEmail] = useState("");
    const [phone, setPhone] = useState("");
    const [website, setWebsite] = useState("");
    const [address, setAddress] = useState("");
    const [accentColor, setAccentColor] = useState("#0071e3");
    const [style, setStyle] = useState<CardStyle>("dark");

    const downloadCard = (side: "front" | "back") => {
        const canvas = document.createElement("canvas");
        const W = 700;
        const H = 400;
        canvas.width = W;
        canvas.height = H;
        const ctx = canvas.getContext("2d")!;

        // Background
        if (style === "dark") {
            ctx.fillStyle = "#1d1d1f";
        } else if (style === "gradient") {
            const grad = ctx.createLinearGradient(0, 0, W, H);
            grad.addColorStop(0, "#667eea");
            grad.addColorStop(1, "#764ba2");
            ctx.fillStyle = grad;
        } else {
            ctx.fillStyle = "#ffffff";
        }
        ctx.fillRect(0, 0, W, H);

        const textColor = style === "light" ? "#1d1d1f" : "#ffffff";
        const subColor = style === "light" ? "#86868b" : "rgba(255,255,255,0.65)";

        if (side === "back") {
            ctx.font = "bold 36px -apple-system, sans-serif";
            ctx.fillStyle = textColor;
            ctx.textAlign = "center";
            ctx.fillText(company || fullName || "Votre Entreprise", W / 2, H / 2 + 12);
            // accent line
            ctx.fillStyle = accentColor;
            ctx.fillRect(0, H - 6, W, 6);
        } else {
            const pad = 50;
            let y = pad + 40;

            ctx.font = "bold 28px -apple-system, sans-serif";
            ctx.fillStyle = textColor;
            ctx.textAlign = "left";
            ctx.fillText(fullName || "Votre Nom", pad, y);
            y += 28;

            if (title) {
                ctx.font = "400 14px -apple-system, sans-serif";
                ctx.fillStyle = subColor;
                ctx.fillText(title, pad, y);
                y += 22;
            }

            if (company) {
                ctx.font = "600 15px -apple-system, sans-serif";
                ctx.fillStyle = textColor;
                ctx.fillText(company, pad, y);
                y += 28;
            }

            // divider
            ctx.fillStyle = accentColor;
            ctx.fillRect(pad, y, 40, 2);
            y += 18;

            ctx.font = "400 12px -apple-system, sans-serif";
            ctx.fillStyle = subColor;
            if (email) { ctx.fillText(email, pad, y); y += 18; }
            if (phone) { ctx.fillText(phone, pad, y); y += 18; }
            if (website) { ctx.fillText(website.replace(/^https?:\/\//, ""), pad, y); y += 18; }
            if (address) { ctx.fillText(address, pad, y); }

            // accent line
            ctx.fillStyle = accentColor;
            ctx.fillRect(0, H - 4, W, 4);

            // border for light style
            if (style === "light") {
                ctx.strokeStyle = "#e8e8ed";
                ctx.lineWidth = 1;
                ctx.strokeRect(0.5, 0.5, W - 1, H - 1);
            }
        }

        canvas.toBlob((blob) => {
            if (!blob) return;
            const href = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = href;
            const safeName = (fullName || "carte").replace(/[^a-zA-Z0-9]/g, "_");
            a.download = `carte-visite-${side}-${safeName}.png`;
            a.click();
            setTimeout(() => URL.revokeObjectURL(href), 1000);
        });
    };

    return (
        <div className="bcard-page">
            <Container>
                <h1 className="bcard-page-title">Générateur de Carte de Visite</h1>
                <p className="bcard-page-subtitle">
                    Créez une carte de visite digitale professionnelle
                </p>

                <div className="bcard-layout">
                    {/* Form */}
                    <div className="bcard-form-card">
                        <div className="bcard-section-title">Informations</div>
                        <div className="bcard-row">
                            <div className="bcard-input-group">
                                <label>Nom complet</label>
                                <input className="bcard-input" value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Kandy Foma" />
                            </div>
                            <div className="bcard-input-group">
                                <label>Titre / Poste</label>
                                <input className="bcard-input" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Développeur Full-Stack" />
                            </div>
                        </div>
                        <div className="bcard-input-group">
                            <label>Entreprise</label>
                            <input className="bcard-input" value={company} onChange={(e) => setCompany(e.target.value)} placeholder="Africanite Services" />
                        </div>
                        <div className="bcard-row">
                            <div className="bcard-input-group">
                                <label>Email</label>
                                <input className="bcard-input" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="kandy@africanite.com" />
                            </div>
                            <div className="bcard-input-group">
                                <label>Téléphone</label>
                                <input className="bcard-input" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+243 82 881 2498" />
                            </div>
                        </div>
                        <div className="bcard-row">
                            <div className="bcard-input-group">
                                <label>Site web</label>
                                <input className="bcard-input" value={website} onChange={(e) => setWebsite(e.target.value)} placeholder="https://africanite.com" />
                            </div>
                            <div className="bcard-input-group">
                                <label>Adresse</label>
                                <input className="bcard-input" value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Lubumbashi, RDC" />
                            </div>
                        </div>

                        <div className="bcard-section-title" style={{ marginTop: "var(--space-md)" }}>Apparence</div>
                        <label style={{ display: "block", fontSize: "var(--font-size-xs)", fontWeight: 600, color: "var(--color-text-secondary)", marginBottom: "var(--space-xs)" }}>
                            Style
                        </label>
                        <div className="bcard-style-group">
                            {([["dark", "Sombre"], ["light", "Clair"], ["gradient", "Dégradé"]] as const).map(([key, label]) => (
                                <button
                                    key={key}
                                    className={`bcard-style-btn ${style === key ? "active" : ""}`}
                                    onClick={() => setStyle(key)}
                                >
                                    {label}
                                </button>
                            ))}
                        </div>
                        <div className="bcard-input-group" style={{ maxWidth: "180px" }}>
                            <label>Couleur d'accent</label>
                            <input type="color" className="bcard-input" style={{ padding: "4px", height: "36px", cursor: "pointer" }} value={accentColor} onChange={(e) => setAccentColor(e.target.value)} />
                        </div>
                    </div>

                    {/* Preview */}
                    <div className="bcard-preview-wrapper">
                        {/* Front */}
                        <div className={`bcard-preview ${style}`}>
                            <div className="bcard-p-name">{fullName || "Votre Nom"}</div>
                            {title && <div className="bcard-p-title">{title}</div>}
                            {company && <div className="bcard-p-company">{company}</div>}
                            <div className="bcard-p-divider" style={{ background: accentColor }} />
                            <div className="bcard-p-contact">
                                {email && <div>{email}</div>}
                                {phone && <div>{phone}</div>}
                                {website && <div>{website.replace(/^https?:\/\//, "")}</div>}
                                {address && <div>{address}</div>}
                            </div>
                            <div className="bcard-p-accent-line" style={{ background: accentColor }} />
                        </div>

                        {/* Back */}
                        <div className={`bcard-back ${style}`}>
                            {company || fullName || "Votre Entreprise"}
                        </div>

                        <div style={{ display: "flex", gap: "var(--space-sm)" }}>
                            <button className="bcard-dl-btn" onClick={() => downloadCard("front")}>
                                <Download size={14} style={{ marginRight: "0.35rem", verticalAlign: "middle" }} />
                                Recto
                            </button>
                            <button className="bcard-dl-btn" onClick={() => downloadCard("back")}>
                                <Download size={14} style={{ marginRight: "0.35rem", verticalAlign: "middle" }} />
                                Verso
                            </button>
                        </div>
                    </div>
                </div>
            </Container>
        </div>
    );
}
