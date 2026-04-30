import { useState } from "react";
import { Container } from "react-bootstrap";
import { Copy, Check, Code, Sparkles } from "lucide-react";
import { isAIConfigured, aiSuggestTitle } from "../services/aiService";
import "../styles/EmailSignature.css";
import "../styles/AIFeatures.css";

type Template = "modern" | "classic" | "minimal";

function buildSignatureHtml(
    data: {
        fullName: string;
        title: string;
        company: string;
        email: string;
        phone: string;
        website: string;
        linkedin: string;
        accentColor: string;
    },
    template: Template
): string {
    const { fullName, title, company, email, phone, website, linkedin, accentColor } = data;
    const fontStack = "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif";

    if (template === "minimal") {
        return `<table cellpadding="0" cellspacing="0" style="font-family:${fontStack};font-size:13px;color:#1d1d1f;">
<tr><td style="padding-bottom:4px;font-weight:700;font-size:14px;">${fullName}</td></tr>
${title ? `<tr><td style="color:#86868b;">${title}${company ? ` · ${company}` : ""}</td></tr>` : ""}
<tr><td style="padding-top:6px;">
${email ? `<a href="mailto:${email}" style="color:${accentColor};text-decoration:none;">${email}</a>` : ""}
${phone ? ` · ${phone}` : ""}
${website ? ` · <a href="${website}" style="color:${accentColor};text-decoration:none;">${website.replace(/^https?:\/\//, "")}</a>` : ""}
</td></tr>
</table>`;
    }

    if (template === "classic") {
        return `<table cellpadding="0" cellspacing="0" style="font-family:${fontStack};font-size:13px;color:#1d1d1f;">
<tr><td style="border-left:3px solid ${accentColor};padding-left:12px;">
<div style="font-weight:700;font-size:15px;margin-bottom:2px;">${fullName}</div>
${title ? `<div style="color:#86868b;margin-bottom:2px;">${title}</div>` : ""}
${company ? `<div style="font-weight:600;margin-bottom:8px;">${company}</div>` : ""}
${email ? `<div><a href="mailto:${email}" style="color:${accentColor};text-decoration:none;">${email}</a></div>` : ""}
${phone ? `<div style="color:#86868b;">${phone}</div>` : ""}
${website ? `<div><a href="${website}" style="color:${accentColor};text-decoration:none;">${website.replace(/^https?:\/\//, "")}</a></div>` : ""}
${linkedin ? `<div style="margin-top:4px;"><a href="${linkedin}" style="color:${accentColor};text-decoration:none;">LinkedIn</a></div>` : ""}
</td></tr>
</table>`;
    }

    // modern (default)
    return `<table cellpadding="0" cellspacing="0" style="font-family:${fontStack};font-size:13px;color:#1d1d1f;">
<tr>
<td style="padding-right:16px;border-right:2px solid ${accentColor};">
  <div style="font-weight:700;font-size:16px;">${fullName}</div>
  ${title ? `<div style="color:${accentColor};font-weight:500;margin-top:2px;">${title}</div>` : ""}
  ${company ? `<div style="color:#86868b;margin-top:1px;">${company}</div>` : ""}
</td>
<td style="padding-left:16px;">
  ${email ? `<div><a href="mailto:${email}" style="color:#1d1d1f;text-decoration:none;">✉ ${email}</a></div>` : ""}
  ${phone ? `<div style="margin-top:3px;">📱 ${phone}</div>` : ""}
  ${website ? `<div style="margin-top:3px;"><a href="${website}" style="color:${accentColor};text-decoration:none;">🌐 ${website.replace(/^https?:\/\//, "")}</a></div>` : ""}
  ${linkedin ? `<div style="margin-top:3px;"><a href="${linkedin}" style="color:${accentColor};text-decoration:none;">🔗 LinkedIn</a></div>` : ""}
</td>
</tr>
</table>`;
}

export default function EmailSignatureGenerator() {
    const [fullName, setFullName] = useState("");
    const [title, setTitle] = useState("");
    const [company, setCompany] = useState("");
    const [email, setEmail] = useState("");
    const [phone, setPhone] = useState("");
    const [website, setWebsite] = useState("");
    const [linkedin, setLinkedin] = useState("");
    const [accentColor, setAccentColor] = useState("#0071e3");
    const [template, setTemplate] = useState<Template>("modern");
    const [copied, setCopied] = useState(false);
    const [aiLoading, setAiLoading] = useState(false);
    const [aiSuggestions, setAiSuggestions] = useState<string[] | null>(null);
    const aiEnabled = isAIConfigured();

    const handleAISuggestTitle = async () => {
        setAiLoading(true);
        try {
            const result = await aiSuggestTitle(fullName, company, title);
            setAiSuggestions(result.split(" | ").map((s) => s.trim()).filter(Boolean));
        } catch (e: unknown) {
            alert(e instanceof Error ? e.message : "Erreur IA");
        }
        setAiLoading(false);
    };

    const data = { fullName, title, company, email, phone, website, linkedin, accentColor };
    const html = buildSignatureHtml(data, template);

    const copyHtml = () => {
        navigator.clipboard.writeText(html).then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        });
    };

    const copyRich = () => {
        const blob = new Blob([html], { type: "text/html" });
        navigator.clipboard.write([new ClipboardItem({ "text/html": blob })]).then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        });
    };

    return (
        <div className="signature-page">
            <Container>
                <h1 className="signature-page-title">Générateur de Signature Email</h1>
                <p className="signature-page-subtitle">
                    Créez une signature email professionnelle en quelques clics
                </p>

                <div className="signature-grid">
                    {/* Form */}
                    <div className="signature-card">
                        <div className="signature-card-title">Vos informations</div>

                        <div className="signature-input-group">
                            <label>Nom complet</label>
                            <input className="signature-input" value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Kandy Foma" />
                        </div>
                        <div className="signature-row">
                            <div className="signature-input-group">
                                <label>Titre / Poste</label>
                                <input className="signature-input" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Développeur Full-Stack" />
                                {aiEnabled && (
                                    <div className="ai-assist-inline">
                                        <button className="ai-assist-btn sm outline" onClick={handleAISuggestTitle} disabled={aiLoading || !fullName}>
                                            <Sparkles size={11} />
                                            {aiLoading ? "…" : "Suggérer un titre"}
                                        </button>
                                    </div>
                                )}
                                {aiSuggestions && (
                                    <div className="ai-result-card">
                                        <span className="ai-result-label"><Sparkles size={12} /> Suggestions</span>
                                        <div style={{ display: "flex", flexWrap: "wrap", gap: "0.35rem", marginTop: "0.35rem" }}>
                                            {aiSuggestions.map((s, i) => (
                                                <button key={i} className="ai-result-apply" onClick={() => { setTitle(s); setAiSuggestions(null); }}>{s}</button>
                                            ))}
                                        </div>
                                        <button className="ai-result-dismiss" style={{ marginTop: "0.5rem" }} onClick={() => setAiSuggestions(null)}>Fermer</button>
                                    </div>
                                )}
                            </div>
                            <div className="signature-input-group">
                                <label>Entreprise</label>
                                <input className="signature-input" value={company} onChange={(e) => setCompany(e.target.value)} placeholder="Africanite" />
                            </div>
                        </div>
                        <div className="signature-row">
                            <div className="signature-input-group">
                                <label>Email</label>
                                <input className="signature-input" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="kandy@africanite.com" />
                            </div>
                            <div className="signature-input-group">
                                <label>Téléphone</label>
                                <input className="signature-input" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+243 82 881 2498" />
                            </div>
                        </div>
                        <div className="signature-row">
                            <div className="signature-input-group">
                                <label>Site web</label>
                                <input className="signature-input" value={website} onChange={(e) => setWebsite(e.target.value)} placeholder="https://africanite.com" />
                            </div>
                            <div className="signature-input-group">
                                <label>LinkedIn</label>
                                <input className="signature-input" value={linkedin} onChange={(e) => setLinkedin(e.target.value)} placeholder="https://linkedin.com/in/kandy" />
                            </div>
                        </div>

                        <div className="signature-color-row">
                            <label style={{ fontSize: "var(--font-size-xs)", fontWeight: 600, color: "var(--color-text-secondary)", marginBottom: 0 }}>
                                Couleur d'accent
                            </label>
                            <input type="color" className="signature-color-input" value={accentColor} onChange={(e) => setAccentColor(e.target.value)} />
                        </div>

                        <label style={{ display: "block", fontSize: "var(--font-size-xs)", fontWeight: 600, color: "var(--color-text-secondary)", marginBottom: "var(--space-xs)" }}>
                            Style
                        </label>
                        <div className="signature-template-group">
                            {(["modern", "classic", "minimal"] as const).map((t) => (
                                <button
                                    key={t}
                                    className={`signature-template-btn ${template === t ? "active" : ""}`}
                                    onClick={() => setTemplate(t)}
                                >
                                    {t === "modern" ? "Moderne" : t === "classic" ? "Classique" : "Minimal"}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Preview */}
                    <div className="signature-card">
                        <div className="signature-card-title">Aperçu</div>
                        <div
                            className="signature-preview-box"
                            dangerouslySetInnerHTML={{ __html: fullName ? html : '<p style="color:#acacb0;font-size:13px;">Remplissez vos informations pour voir l\'aperçu…</p>' }}
                        />

                        <div className="signature-actions">
                            <button className="signature-action-btn primary" onClick={copyRich}>
                                {copied ? <Check size={14} style={{ marginRight: "0.35rem", verticalAlign: "middle" }} /> : <Copy size={14} style={{ marginRight: "0.35rem", verticalAlign: "middle" }} />}
                                Copier la signature
                            </button>
                            <button className="signature-action-btn" onClick={copyHtml}>
                                <Code size={14} style={{ marginRight: "0.35rem", verticalAlign: "middle" }} />
                                Copier HTML
                            </button>
                        </div>
                        {copied && <div className="signature-copied-toast">Copié !</div>}
                    </div>
                </div>
            </Container>
        </div>
    );
}
