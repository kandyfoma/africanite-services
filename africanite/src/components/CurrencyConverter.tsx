import { useState, useEffect, useCallback } from "react";
import { Container } from "react-bootstrap";
import { ArrowDownUp } from "lucide-react";
import "../styles/CurrencyConverter.css";

interface CurrencyInfo {
    code: string;
    name: string;
    flag: string;
    symbol: string;
}

const CURRENCIES: CurrencyInfo[] = [
    { code: "USD", name: "Dollar américain", flag: "🇺🇸", symbol: "$" },
    { code: "EUR", name: "Euro", flag: "🇪🇺", symbol: "€" },
    { code: "CDF", name: "Franc congolais", flag: "🇨🇩", symbol: "FC" },
    { code: "XAF", name: "Franc CFA (CEMAC)", flag: "🇨🇲", symbol: "FCFA" },
    { code: "XOF", name: "Franc CFA (UEMOA)", flag: "🇸🇳", symbol: "CFA" },
    { code: "ZAR", name: "Rand sud-africain", flag: "🇿🇦", symbol: "R" },
    { code: "GBP", name: "Livre sterling", flag: "🇬🇧", symbol: "£" },
    { code: "NGN", name: "Naira nigérian", flag: "🇳🇬", symbol: "₦" },
    { code: "KES", name: "Shilling kényan", flag: "🇰🇪", symbol: "KSh" },
    { code: "GHS", name: "Cedi ghanéen", flag: "🇬🇭", symbol: "₵" },
    { code: "MAD", name: "Dirham marocain", flag: "🇲🇦", symbol: "د.م." },
    { code: "EGP", name: "Livre égyptienne", flag: "🇪🇬", symbol: "E£" },
    { code: "TZS", name: "Shilling tanzanien", flag: "🇹🇿", symbol: "TSh" },
    { code: "RWF", name: "Franc rwandais", flag: "🇷🇼", symbol: "FRw" },
    { code: "AOA", name: "Kwanza angolais", flag: "🇦🇴", symbol: "Kz" },
    { code: "ZMW", name: "Kwacha zambien", flag: "🇿🇲", symbol: "ZK" },
    { code: "CNY", name: "Yuan chinois", flag: "🇨🇳", symbol: "¥" },
    { code: "INR", name: "Roupie indienne", flag: "🇮🇳", symbol: "₹" },
    { code: "BRL", name: "Réal brésilien", flag: "🇧🇷", symbol: "R$" },
    { code: "AED", name: "Dirham émirati", flag: "🇦🇪", symbol: "د.إ" },
];

const POPULAR_CODES = ["USD", "EUR", "CDF", "XAF", "ZAR", "NGN"];

// Fallback rates (USD-based) — used when API unavailable
const FALLBACK_RATES: Record<string, number> = {
    USD: 1, EUR: 0.92, GBP: 0.79, CDF: 2800, XAF: 605, XOF: 605,
    ZAR: 18.2, NGN: 1550, KES: 154, GHS: 15.5, MAD: 10.1, EGP: 50.5,
    TZS: 2680, RWF: 1350, AOA: 920, ZMW: 27.5, CNY: 7.25, INR: 83.5,
    BRL: 5.1, AED: 3.67,
};

const API_URL = "https://api.exchangerate-api.com/v4/latest/USD";

export default function CurrencyConverter() {
    const [amount, setAmount] = useState("1");
    const [fromCurrency, setFromCurrency] = useState("USD");
    const [toCurrency, setToCurrency] = useState("CDF");
    const [rates, setRates] = useState<Record<string, number>>(FALLBACK_RATES);
    const [lastUpdate, setLastUpdate] = useState<string | null>(null);

    useEffect(() => {
        fetch(API_URL)
            .then((r) => r.json())
            .then((data) => {
                if (data?.rates) {
                    setRates(data.rates);
                    setLastUpdate(new Date().toLocaleString("fr-FR"));
                }
            })
            .catch(() => {
                setLastUpdate(null);
            });
    }, []);

    const convert = useCallback(
        (val: number, from: string, to: string) => {
            if (from === to) return val;
            const inUsd = val / (rates[from] || 1);
            return inUsd * (rates[to] || 1);
        },
        [rates]
    );

    const numericAmount = parseFloat(amount) || 0;
    const result = convert(numericAmount, fromCurrency, toCurrency);
    const unitRate = convert(1, fromCurrency, toCurrency);

    const swap = () => {
        setFromCurrency(toCurrency);
        setToCurrency(fromCurrency);
    };

    const getCurrency = (code: string) => CURRENCIES.find((c) => c.code === code);
    const formatResult = (n: number) =>
        n >= 1 ? n.toLocaleString("fr-FR", { maximumFractionDigits: 2 }) : n.toPrecision(4);

    return (
        <div className="currency-page">
            <Container>
                <h1 className="currency-page-title">Convertisseur de Devises</h1>
                <p className="currency-page-subtitle">
                    Taux de change en temps réel pour les devises africaines et internationales
                </p>

                <div className="currency-card">
                    {/* From */}
                    <div className="currency-input-group">
                        <label>Montant</label>
                        <input
                            type="number"
                            className="currency-amount-input"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            min="0"
                            step="any"
                        />
                    </div>
                    <div className="currency-input-group">
                        <label>De</label>
                        <select
                            className="currency-select"
                            value={fromCurrency}
                            onChange={(e) => setFromCurrency(e.target.value)}
                        >
                            {CURRENCIES.map((c) => (
                                <option key={c.code} value={c.code}>
                                    {c.flag} {c.code} — {c.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Swap */}
                    <button className="currency-swap-btn" onClick={swap} title="Inverser">
                        <ArrowDownUp size={20} />
                    </button>

                    {/* To */}
                    <div className="currency-input-group">
                        <label>Vers</label>
                        <select
                            className="currency-select"
                            value={toCurrency}
                            onChange={(e) => setToCurrency(e.target.value)}
                        >
                            {CURRENCIES.map((c) => (
                                <option key={c.code} value={c.code}>
                                    {c.flag} {c.code} — {c.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Result */}
                    <div className="currency-result-box">
                        <div className="currency-result-amount">
                            {getCurrency(toCurrency)?.symbol} {formatResult(result)}
                        </div>
                        <div className="currency-result-rate">
                            1 {fromCurrency} = {formatResult(unitRate)} {toCurrency}
                        </div>
                    </div>

                    {/* Popular */}
                    <label style={{ fontSize: "var(--font-size-xs)", fontWeight: 600, color: "var(--color-text-secondary)" }}>
                        Devises populaires
                    </label>
                    <div className="currency-popular-grid">
                        {POPULAR_CODES.map((code) => {
                            const c = getCurrency(code)!;
                            return (
                                <div
                                    key={code}
                                    className="currency-popular-card"
                                    onClick={() => setToCurrency(code)}
                                >
                                    <div className="currency-popular-flag">{c.flag}</div>
                                    <div className="currency-popular-code">{c.code}</div>
                                    <div className="currency-popular-name">{c.name}</div>
                                </div>
                            );
                        })}
                    </div>

                    {lastUpdate && (
                        <p className="currency-update-note">Dernière mise à jour : {lastUpdate}</p>
                    )}
                </div>
            </Container>
        </div>
    );
}
