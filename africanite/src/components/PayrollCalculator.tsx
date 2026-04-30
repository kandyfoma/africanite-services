import { useState, useMemo } from "react";
import { Container } from "react-bootstrap";
import "../styles/PayrollCalculator.css";

const CURRENCIES = [
    { code: "CDF", symbol: "FC", name: "Franc congolais" },
    { code: "USD", symbol: "$", name: "Dollar US" },
    { code: "EUR", symbol: "€", name: "Euro" },
    { code: "ZAR", symbol: "R", name: "Rand" },
    { code: "XAF", symbol: "FCFA", name: "Franc CFA" },
];

const TAX_PROFILES = [
    { id: "rdc", label: "RDC", incomeTax: 0.15, socialSecurity: 0.05, employerContrib: 0.095 },
    { id: "za", label: "Afrique du Sud", incomeTax: 0.18, socialSecurity: 0.01, employerContrib: 0.02 },
    { id: "custom", label: "Personnalisé", incomeTax: 0, socialSecurity: 0, employerContrib: 0 },
];

export default function PayrollCalculator() {
    const [grossSalary, setGrossSalary] = useState(2000);
    const [currency, setCurrency] = useState("USD");
    const [taxProfile, setTaxProfile] = useState("rdc");
    const [customTax, setCustomTax] = useState(15);
    const [customSocial, setCustomSocial] = useState(5);
    const [bonus, setBonus] = useState(0);
    const [deductions, setDeductions] = useState(0);
    const [hoursPerWeek, setHoursPerWeek] = useState(40);

    const sym = CURRENCIES.find((c) => c.code === currency)?.symbol ?? "$";
    const profile = TAX_PROFILES.find((p) => p.id === taxProfile)!;

    const result = useMemo(() => {
        const taxRate = taxProfile === "custom" ? customTax / 100 : profile.incomeTax;
        const socialRate = taxProfile === "custom" ? customSocial / 100 : profile.socialSecurity;

        const grossTotal = grossSalary + bonus;
        const incomeTax = grossTotal * taxRate;
        const socialSecurity = grossTotal * socialRate;
        const totalDeductions = incomeTax + socialSecurity + deductions;
        const netSalary = grossTotal - totalDeductions;
        const hourlyRate = hoursPerWeek > 0 ? grossSalary / (hoursPerWeek * 4.33) : 0;
        const annualGross = grossTotal * 12;
        const annualNet = netSalary * 12;

        return { grossTotal, incomeTax, socialSecurity, totalDeductions, netSalary, hourlyRate, annualGross, annualNet };
    }, [grossSalary, bonus, deductions, taxProfile, customTax, customSocial, profile, hoursPerWeek]);

    const fmt = (n: number) => n.toLocaleString("fr-FR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

    return (
        <div className="payroll-page">
            <Container>
                <h1 className="payroll-page-title">Calculateur de Paie</h1>
                <p className="payroll-page-subtitle">
                    Estimez votre salaire net et vos charges sociales
                </p>

                <div className="payroll-grid">
                    {/* Inputs */}
                    <div className="payroll-card">
                        <div className="payroll-card-title">Paramètres</div>

                        <div className="payroll-input-group">
                            <label>Pays / Profil fiscal</label>
                            <select className="payroll-input" value={taxProfile} onChange={(e) => setTaxProfile(e.target.value)}>
                                {TAX_PROFILES.map((p) => (
                                    <option key={p.id} value={p.id}>{p.label}</option>
                                ))}
                            </select>
                        </div>

                        {taxProfile === "custom" && (
                            <>
                                <div className="payroll-input-group">
                                    <label>Taux d'impôt sur le revenu : {customTax}%</label>
                                    <input type="range" className="payroll-slider" min={0} max={50} value={customTax} onChange={(e) => setCustomTax(Number(e.target.value))} />
                                </div>
                                <div className="payroll-input-group">
                                    <label>Cotisations sociales : {customSocial}%</label>
                                    <input type="range" className="payroll-slider" min={0} max={30} value={customSocial} onChange={(e) => setCustomSocial(Number(e.target.value))} />
                                </div>
                            </>
                        )}

                        <div className="payroll-input-group">
                            <label>Devise</label>
                            <select className="payroll-input" value={currency} onChange={(e) => setCurrency(e.target.value)}>
                                {CURRENCIES.map((c) => <option key={c.code} value={c.code}>{c.symbol} — {c.name}</option>)}
                            </select>
                        </div>

                        <div className="payroll-input-group">
                            <label>Salaire brut mensuel ({sym})</label>
                            <input type="number" className="payroll-input" value={grossSalary} onChange={(e) => setGrossSalary(Math.max(0, Number(e.target.value)))} min={0} />
                        </div>

                        <div className="payroll-input-group">
                            <label>Prime / Bonus ({sym})</label>
                            <input type="number" className="payroll-input" value={bonus} onChange={(e) => setBonus(Math.max(0, Number(e.target.value)))} min={0} />
                        </div>

                        <div className="payroll-input-group">
                            <label>Autres déductions ({sym})</label>
                            <input type="number" className="payroll-input" value={deductions} onChange={(e) => setDeductions(Math.max(0, Number(e.target.value)))} min={0} />
                        </div>

                        <div className="payroll-input-group">
                            <label>Heures par semaine : {hoursPerWeek}</label>
                            <input type="range" className="payroll-slider" min={10} max={60} value={hoursPerWeek} onChange={(e) => setHoursPerWeek(Number(e.target.value))} />
                        </div>
                    </div>

                    {/* Results */}
                    <div className="payroll-card">
                        <div className="payroll-card-title">Résultats</div>

                        <div className="payroll-result-box">
                            <div className="payroll-result-label">Salaire net mensuel</div>
                            <div className="payroll-result-value">{sym} {fmt(result.netSalary)}</div>
                        </div>

                        <div className="payroll-breakdown">
                            <div className="payroll-line">
                                <span className="payroll-line-label">Salaire brut</span>
                                <span className="payroll-line-value">{sym} {fmt(grossSalary)}</span>
                            </div>
                            {bonus > 0 && (
                                <div className="payroll-line">
                                    <span className="payroll-line-label">+ Prime / Bonus</span>
                                    <span className="payroll-line-value">{sym} {fmt(bonus)}</span>
                                </div>
                            )}
                            <div className="payroll-line deduction">
                                <span className="payroll-line-label">− Impôt sur le revenu</span>
                                <span className="payroll-line-value">−{sym} {fmt(result.incomeTax)}</span>
                            </div>
                            <div className="payroll-line deduction">
                                <span className="payroll-line-label">− Cotisations sociales</span>
                                <span className="payroll-line-value">−{sym} {fmt(result.socialSecurity)}</span>
                            </div>
                            {deductions > 0 && (
                                <div className="payroll-line deduction">
                                    <span className="payroll-line-label">− Autres déductions</span>
                                    <span className="payroll-line-value">−{sym} {fmt(deductions)}</span>
                                </div>
                            )}
                            <div className="payroll-line total">
                                <span className="payroll-line-label">= Net à payer</span>
                                <span className="payroll-line-value">{sym} {fmt(result.netSalary)}</span>
                            </div>
                        </div>

                        <div style={{ marginTop: "var(--space-lg)" }}>
                            <div className="payroll-line">
                                <span className="payroll-line-label">Taux horaire</span>
                                <span className="payroll-line-value">{sym} {fmt(result.hourlyRate)}/h</span>
                            </div>
                            <div className="payroll-line">
                                <span className="payroll-line-label">Salaire annuel brut</span>
                                <span className="payroll-line-value">{sym} {fmt(result.annualGross)}</span>
                            </div>
                            <div className="payroll-line">
                                <span className="payroll-line-label">Salaire annuel net</span>
                                <span className="payroll-line-value" style={{ color: "var(--color-success)" }}>{sym} {fmt(result.annualNet)}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </Container>
        </div>
    );
}
