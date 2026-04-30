import { useState, useMemo } from "react";
import { Container } from "react-bootstrap";
import { Sparkles } from "lucide-react";
import { isAIConfigured, aiExplainLoan } from "../services/aiService";
import "../styles/LoanCalculator.css";
import "../styles/AIFeatures.css";

const CURRENCIES = [
    { code: "CDF", symbol: "FC", name: "Franc congolais" },
    { code: "USD", symbol: "$", name: "Dollar US" },
    { code: "EUR", symbol: "€", name: "Euro" },
    { code: "ZAR", symbol: "R", name: "Rand" },
    { code: "XAF", symbol: "FCFA", name: "Franc CFA" },
];

export default function LoanCalculator() {
    const [principal, setPrincipal] = useState(5000);
    const [rate, setRate] = useState(12);
    const [years, setYears] = useState(3);
    const [currency, setCurrency] = useState("USD");

    const sym = CURRENCIES.find((c) => c.code === currency)?.symbol ?? "$";

    const result = useMemo(() => {
        const monthlyRate = rate / 100 / 12;
        const months = years * 12;
        if (monthlyRate === 0) {
            const mp = principal / months;
            return { monthly: mp, totalPayment: principal, totalInterest: 0, months };
        }
        const monthly =
            (principal * monthlyRate * Math.pow(1 + monthlyRate, months)) /
            (Math.pow(1 + monthlyRate, months) - 1);
        const totalPayment = monthly * months;
        const totalInterest = totalPayment - principal;
        return { monthly, totalPayment, totalInterest, months };
    }, [principal, rate, years]);

    const fmt = (n: number) => n.toLocaleString("fr-FR", { maximumFractionDigits: 2 });
    const interestPct = result.totalPayment > 0 ? (result.totalInterest / result.totalPayment) * 100 : 0;

    const aiEnabled = isAIConfigured();
    const [aiExplanation, setAiExplanation] = useState<string | null>(null);
    const [aiLoading, setAiLoading] = useState(false);

    const handleAIExplain = async () => {
        setAiLoading(true);
        try {
            const text = await aiExplainLoan({
                principal,
                rate,
                years,
                monthly: result.monthly,
                totalInterest: result.totalInterest,
                currency: sym,
            });
            setAiExplanation(text);
        } catch (e: unknown) {
            alert(e instanceof Error ? e.message : "Erreur IA");
        }
        setAiLoading(false);
    };

    return (
        <div className="loan-page">
            <Container>
                <h1 className="loan-page-title">Calculateur de Prêt</h1>
                <p className="loan-page-subtitle">
                    Simulez vos mensualités et le coût total de votre emprunt
                </p>

                <div className="loan-grid">
                    {/* Left: Inputs */}
                    <div className="loan-card">
                        <div className="loan-card-title">Paramètres du prêt</div>

                        <div className="loan-input-group">
                            <label>Devise</label>
                            <select
                                className="loan-input"
                                value={currency}
                                onChange={(e) => setCurrency(e.target.value)}
                            >
                                {CURRENCIES.map((c) => (
                                    <option key={c.code} value={c.code}>
                                        {c.symbol} — {c.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="loan-input-group">
                            <label>Montant du prêt ({sym})</label>
                            <input
                                type="number"
                                className="loan-input"
                                value={principal}
                                onChange={(e) => setPrincipal(Math.max(0, Number(e.target.value)))}
                                min={0}
                            />
                            <input
                                type="range"
                                className="loan-slider"
                                min={100}
                                max={500000}
                                step={100}
                                value={principal}
                                onChange={(e) => setPrincipal(Number(e.target.value))}
                            />
                        </div>

                        <div className="loan-input-group">
                            <label>Taux d'intérêt annuel (%)</label>
                            <input
                                type="number"
                                className="loan-input"
                                value={rate}
                                onChange={(e) => setRate(Math.max(0, Number(e.target.value)))}
                                min={0}
                                max={100}
                                step={0.1}
                            />
                            <input
                                type="range"
                                className="loan-slider"
                                min={0}
                                max={50}
                                step={0.5}
                                value={rate}
                                onChange={(e) => setRate(Number(e.target.value))}
                            />
                        </div>

                        <div className="loan-input-group">
                            <label>Durée (années) : {years}</label>
                            <input
                                type="range"
                                className="loan-slider"
                                min={1}
                                max={30}
                                value={years}
                                onChange={(e) => setYears(Number(e.target.value))}
                            />
                        </div>
                    </div>

                    {/* Right: Results */}
                    <div className="loan-card">
                        <div className="loan-card-title">Résultats</div>

                        <div className="loan-result-box">
                            <div className="loan-result-label">Mensualité</div>
                            <div className="loan-result-value">
                                {sym} {fmt(result.monthly)}
                            </div>
                        </div>

                        <div className="loan-summary-grid">
                            <div className="loan-summary-item">
                                <div className="loan-result-label">Total remboursé</div>
                                <div className="loan-result-value">
                                    {sym} {fmt(result.totalPayment)}
                                </div>
                            </div>
                            <div className="loan-summary-item">
                                <div className="loan-result-label">Total intérêts</div>
                                <div className="loan-result-value" style={{ color: "var(--color-warning)" }}>
                                    {sym} {fmt(result.totalInterest)}
                                </div>
                            </div>
                            <div className="loan-summary-item">
                                <div className="loan-result-label">Nombre de mois</div>
                                <div className="loan-result-value">{result.months}</div>
                            </div>
                            <div className="loan-summary-item">
                                <div className="loan-result-label">Coût du crédit</div>
                                <div className="loan-result-value">{interestPct.toFixed(1)}%</div>
                            </div>
                        </div>

                        {/* Visual bar */}
                        <div className="loan-chart-bar">
                            <div
                                className="loan-chart-principal"
                                style={{ width: `${100 - interestPct}%` }}
                            />
                            <div
                                className="loan-chart-interest"
                                style={{ width: `${interestPct}%` }}
                            />
                        </div>
                        <div className="loan-chart-legend">
                            <span className="loan-chart-legend-item">
                                <span className="loan-chart-dot" style={{ background: "var(--color-accent)" }} />
                                Capital
                            </span>
                            <span className="loan-chart-legend-item">
                                <span className="loan-chart-dot" style={{ background: "var(--color-warning)" }} />
                                Intérêts
                            </span>
                        </div>

                        {/* AI Explanation */}
                        {aiEnabled && (
                            <div style={{ marginTop: "var(--space-lg)" }}>
                                <button className="ai-assist-btn" onClick={handleAIExplain} disabled={aiLoading} style={{ width: "100%", justifyContent: "center" }}>
                                    <Sparkles size={14} />
                                    {aiLoading ? "Analyse en cours…" : "Analyser avec IA"}
                                </button>
                                {aiExplanation && (
                                    <div className="ai-result-card" style={{ marginTop: "var(--space-sm)" }}>
                                        <span className="ai-result-label"><Sparkles size={12} /> Analyse IA</span>
                                        <div className="ai-result-text">{aiExplanation}</div>
                                        <button className="ai-result-dismiss" style={{ marginTop: "0.5rem" }} onClick={() => setAiExplanation(null)}>Fermer</button>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </Container>
        </div>
    );
}
