import { useState, useRef } from "react";
import { Container } from "react-bootstrap";
import { Plus, X, Download, Sparkles } from "lucide-react";
import { isAIConfigured, aiAutoFillReceipt } from "../services/aiService";
import "../styles/ReceiptGenerator.css";
import "../styles/AIFeatures.css";

interface LineItem {
    id: number;
    description: string;
    qty: number;
    price: number;
}

const CURRENCIES = [
    { code: "CDF", symbol: "FC" },
    { code: "USD", symbol: "$" },
    { code: "EUR", symbol: "€" },
    { code: "ZAR", symbol: "R" },
    { code: "XAF", symbol: "FCFA" },
];

let nextId = 1;

export default function ReceiptGenerator() {
    const [businessName, setBusinessName] = useState("");
    const [businessAddress, setBusinessAddress] = useState("");
    const [businessPhone, setBusinessPhone] = useState("");
    const [customerName, setCustomerName] = useState("");
    const [receiptNumber, setReceiptNumber] = useState(
        `REC-${String(Date.now()).slice(-6)}`
    );
    const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
    const [currency, setCurrency] = useState("USD");
    const [items, setItems] = useState<LineItem[]>([
        { id: nextId++, description: "", qty: 1, price: 0 },
    ]);
    const [note, setNote] = useState("");
    const [paymentMethod, setPaymentMethod] = useState("Espèces");
    const [aiPrompt, setAiPrompt] = useState("");
    const [aiLoading, setAiLoading] = useState(false);
    const previewRef = useRef<HTMLDivElement>(null);
    const aiEnabled = isAIConfigured();

    const handleAIAutoFill = async () => {
        if (!aiPrompt.trim()) return;
        setAiLoading(true);
        try {
            const result = await aiAutoFillReceipt(aiPrompt);
            if (result.items?.length) {
                setItems(result.items.map((i) => ({ id: nextId++, ...i })));
            }
            if (result.businessName) setBusinessName(result.businessName);
            if (result.customerName) setCustomerName(result.customerName);
            setAiPrompt("");
        } catch (e: unknown) {
            alert(e instanceof Error ? e.message : "Erreur IA");
        }
        setAiLoading(false);
    };

    const sym = CURRENCIES.find((c) => c.code === currency)?.symbol ?? "$";

    const addItem = () => setItems((prev) => [...prev, { id: nextId++, description: "", qty: 1, price: 0 }]);
    const removeItem = (id: number) => setItems((prev) => prev.filter((i) => i.id !== id));
    const updateItem = (id: number, field: keyof LineItem, value: string | number) =>
        setItems((prev) => prev.map((i) => (i.id === id ? { ...i, [field]: value } : i)));

    const subtotal = items.reduce((s, i) => s + i.qty * i.price, 0);
    const fmt = (n: number) => n.toLocaleString("fr-FR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

    const downloadAsText = () => {
        const lines: string[] = [];
        lines.push("=".repeat(40));
        if (businessName) lines.push(businessName.toUpperCase());
        if (businessAddress) lines.push(businessAddress);
        if (businessPhone) lines.push(businessPhone);
        lines.push("=".repeat(40));
        lines.push(`Reçu #: ${receiptNumber}`);
        lines.push(`Date: ${date}`);
        if (customerName) lines.push(`Client: ${customerName}`);
        lines.push("-".repeat(40));
        items.forEach((i) => {
            if (!i.description) return;
            lines.push(`${i.description}`);
            lines.push(`  ${i.qty} x ${sym}${fmt(i.price)} = ${sym}${fmt(i.qty * i.price)}`);
        });
        lines.push("-".repeat(40));
        lines.push(`TOTAL: ${sym}${fmt(subtotal)}`);
        lines.push(`Paiement: ${paymentMethod}`);
        if (note) { lines.push(""); lines.push(`Note: ${note}`); }
        lines.push("=".repeat(40));
        lines.push("Merci pour votre achat !");

        const blob = new Blob([lines.join("\n")], { type: "text/plain" });
        const href = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = href;
        a.download = `recu-${receiptNumber}.txt`;
        a.click();
        setTimeout(() => URL.revokeObjectURL(href), 1000);
    };

    const downloadAsCanvas = () => {
        const canvas = document.createElement("canvas");
        const w = 400;
        const lineH = 22;
        const pad = 30;
        const contentLines: { text: string; bold?: boolean; center?: boolean; small?: boolean }[] = [];

        if (businessName) contentLines.push({ text: businessName.toUpperCase(), bold: true, center: true });
        if (businessAddress) contentLines.push({ text: businessAddress, center: true, small: true });
        if (businessPhone) contentLines.push({ text: businessPhone, center: true, small: true });
        contentLines.push({ text: "" });
        contentLines.push({ text: `Reçu #: ${receiptNumber}`, small: true });
        contentLines.push({ text: `Date: ${date}`, small: true });
        if (customerName) contentLines.push({ text: `Client: ${customerName}`, small: true });
        contentLines.push({ text: "─".repeat(50), small: true });

        items.forEach((i) => {
            if (!i.description) return;
            contentLines.push({ text: i.description });
            contentLines.push({ text: `  ${i.qty} × ${sym}${fmt(i.price)} = ${sym}${fmt(i.qty * i.price)}`, small: true });
        });

        contentLines.push({ text: "─".repeat(50), small: true });
        contentLines.push({ text: `TOTAL: ${sym}${fmt(subtotal)}`, bold: true });
        contentLines.push({ text: `Paiement: ${paymentMethod}`, small: true });
        if (note) { contentLines.push({ text: "" }); contentLines.push({ text: note, small: true }); }
        contentLines.push({ text: "" });
        contentLines.push({ text: "Merci pour votre achat !", center: true, small: true });

        const h = pad * 2 + contentLines.length * lineH + 20;
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext("2d")!;

        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, w, h);

        let y = pad;
        contentLines.forEach((line) => {
            const size = line.small ? 12 : 14;
            ctx.font = `${line.bold ? "bold " : ""}${size}px -apple-system, 'Helvetica Neue', sans-serif`;
            ctx.fillStyle = line.small ? "#86868b" : "#1d1d1f";
            const x = line.center ? w / 2 : pad;
            ctx.textAlign = line.center ? "center" : "left";
            ctx.fillText(line.text, x, y);
            y += lineH;
        });

        canvas.toBlob((blob) => {
            if (!blob) return;
            const href = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = href;
            a.download = `recu-${receiptNumber}.png`;
            a.click();
            setTimeout(() => URL.revokeObjectURL(href), 1000);
        });
    };

    return (
        <div className="receipt-page">
            <Container>
                <h1 className="receipt-page-title">Générateur de Reçu</h1>
                <p className="receipt-page-subtitle">
                    Créez des reçus simples et professionnels pour vos transactions
                </p>

                <div className="receipt-grid">
                    {/* Form */}
                    <div className="receipt-form-card">
                        {aiEnabled && (
                            <div className="ai-prompt-bar">
                                <input
                                    className="ai-prompt-input"
                                    value={aiPrompt}
                                    onChange={(e) => setAiPrompt(e.target.value)}
                                    onKeyDown={(e) => { if (e.key === "Enter") handleAIAutoFill(); }}
                                    placeholder="Ex: 3 sacs de ciment à 15$ et 2 pots de peinture à 25$"
                                />
                                <button className="ai-assist-btn" onClick={handleAIAutoFill} disabled={aiLoading || !aiPrompt.trim()}>
                                    <Sparkles size={14} />
                                    {aiLoading ? "Génération…" : "Remplir"}
                                </button>
                            </div>
                        )}
                        <div className="receipt-form-title">Informations</div>

                        <div className="receipt-input-group">
                            <label>Nom de l'entreprise</label>
                            <input className="receipt-input" value={businessName} onChange={(e) => setBusinessName(e.target.value)} placeholder="Ma Boutique" />
                        </div>
                        <div className="receipt-row">
                            <div className="receipt-input-group">
                                <label>Adresse</label>
                                <input className="receipt-input" value={businessAddress} onChange={(e) => setBusinessAddress(e.target.value)} placeholder="Av. Lumumba, Lubumbashi" />
                            </div>
                            <div className="receipt-input-group">
                                <label>Téléphone</label>
                                <input className="receipt-input" value={businessPhone} onChange={(e) => setBusinessPhone(e.target.value)} placeholder="+243 82 881 2498" />
                            </div>
                        </div>
                        <div className="receipt-row">
                            <div className="receipt-input-group">
                                <label>Nom du client</label>
                                <input className="receipt-input" value={customerName} onChange={(e) => setCustomerName(e.target.value)} placeholder="Jean Mukendi" />
                            </div>
                            <div className="receipt-input-group">
                                <label>N° de reçu</label>
                                <input className="receipt-input" value={receiptNumber} onChange={(e) => setReceiptNumber(e.target.value)} />
                            </div>
                        </div>
                        <div className="receipt-row">
                            <div className="receipt-input-group">
                                <label>Date</label>
                                <input className="receipt-input" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
                            </div>
                            <div className="receipt-input-group">
                                <label>Devise</label>
                                <select className="receipt-input" value={currency} onChange={(e) => setCurrency(e.target.value)}>
                                    {CURRENCIES.map((c) => <option key={c.code} value={c.code}>{c.symbol} — {c.code}</option>)}
                                </select>
                            </div>
                        </div>
                        <div className="receipt-input-group">
                            <label>Mode de paiement</label>
                            <select className="receipt-input" value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)}>
                                <option>Espèces</option>
                                <option>Mobile Money</option>
                                <option>Carte bancaire</option>
                                <option>Virement</option>
                                <option>Autre</option>
                            </select>
                        </div>

                        {/* Items */}
                        <div className="receipt-form-title" style={{ marginTop: "var(--space-lg)" }}>Articles</div>
                        <div className="receipt-items-header">
                            <span>Description</span>
                            <span>Qté</span>
                            <span>Prix ({sym})</span>
                            <span />
                        </div>
                        {items.map((item) => (
                            <div className="receipt-item-row" key={item.id}>
                                <input className="receipt-item-input" placeholder="Article" value={item.description} onChange={(e) => updateItem(item.id, "description", e.target.value)} />
                                <input className="receipt-item-input" type="number" min={1} value={item.qty} onChange={(e) => updateItem(item.id, "qty", Math.max(1, Number(e.target.value)))} />
                                <input className="receipt-item-input" type="number" min={0} step={0.01} value={item.price} onChange={(e) => updateItem(item.id, "price", Number(e.target.value))} />
                                <button className="receipt-remove-btn" onClick={() => removeItem(item.id)} disabled={items.length === 1}>
                                    <X size={16} />
                                </button>
                            </div>
                        ))}
                        <button className="receipt-add-btn" onClick={addItem}>
                            <Plus size={14} style={{ marginRight: "0.25rem", verticalAlign: "middle" }} />
                            Ajouter un article
                        </button>

                        <div className="receipt-input-group">
                            <label>Note (optionnel)</label>
                            <textarea className="receipt-note-input" value={note} onChange={(e) => setNote(e.target.value)} placeholder="Merci pour votre fidélité !" />
                        </div>
                    </div>

                    {/* Preview */}
                    <div className="receipt-preview-card">
                        <div className="receipt-preview-paper" ref={previewRef}>
                            <div className="receipt-preview-header">
                                {businessName && <div className="receipt-preview-biz">{businessName}</div>}
                                {businessAddress && <div className="receipt-preview-meta">{businessAddress}</div>}
                                {businessPhone && <div className="receipt-preview-meta">{businessPhone}</div>}
                            </div>
                            <hr className="receipt-preview-divider" />
                            <div className="receipt-preview-meta">Reçu #{receiptNumber}</div>
                            <div className="receipt-preview-meta">Date: {date}</div>
                            {customerName && <div className="receipt-preview-meta">Client: {customerName}</div>}
                            <hr className="receipt-preview-divider" />
                            {items.map((i) =>
                                i.description ? (
                                    <div key={i.id}>
                                        <div className="receipt-preview-line">
                                            <span>{i.description}</span>
                                        </div>
                                        <div className="receipt-preview-line" style={{ color: "var(--color-text-secondary)" }}>
                                            <span>{i.qty} × {sym}{fmt(i.price)}</span>
                                            <span>{sym}{fmt(i.qty * i.price)}</span>
                                        </div>
                                    </div>
                                ) : null
                            )}
                            <hr className="receipt-preview-divider" />
                            <div className="receipt-preview-line receipt-preview-total">
                                <span>TOTAL</span>
                                <span>{sym}{fmt(subtotal)}</span>
                            </div>
                            <div className="receipt-preview-meta" style={{ marginTop: "var(--space-xs)" }}>
                                Paiement: {paymentMethod}
                            </div>
                            {note && <div className="receipt-preview-note">{note}</div>}
                            <div className="receipt-preview-footer">Merci pour votre achat !</div>
                        </div>
                        <div className="receipt-preview-actions">
                            <button className="receipt-dl-btn" onClick={downloadAsText}>
                                <Download size={14} style={{ marginRight: "0.35rem", verticalAlign: "middle" }} />
                                TXT
                            </button>
                            <button className="receipt-dl-btn primary" onClick={downloadAsCanvas}>
                                <Download size={14} style={{ marginRight: "0.35rem", verticalAlign: "middle" }} />
                                PNG
                            </button>
                        </div>
                    </div>
                </div>
            </Container>
        </div>
    );
}
