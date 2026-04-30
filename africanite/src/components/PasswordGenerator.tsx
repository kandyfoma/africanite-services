import { useState, useCallback, useEffect } from "react";
import { Container } from "react-bootstrap";
import { Copy, RefreshCw, Check } from "lucide-react";
import "../styles/PasswordGenerator.css";

const CHARSETS = {
    uppercase: "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
    lowercase: "abcdefghijklmnopqrstuvwxyz",
    numbers: "0123456789",
    symbols: "!@#$%^&*()_+-=[]{}|;:,.<>?",
};

function generatePassword(
    length: number,
    options: { uppercase: boolean; lowercase: boolean; numbers: boolean; symbols: boolean }
): string {
    let chars = "";
    if (options.uppercase) chars += CHARSETS.uppercase;
    if (options.lowercase) chars += CHARSETS.lowercase;
    if (options.numbers) chars += CHARSETS.numbers;
    if (options.symbols) chars += CHARSETS.symbols;
    if (!chars) chars = CHARSETS.lowercase;

    const array = new Uint32Array(length);
    crypto.getRandomValues(array);
    return Array.from(array, (n) => chars[n % chars.length]).join("");
}

function getStrength(password: string): { score: number; label: string; color: string } {
    let score = 0;
    if (password.length >= 8) score++;
    if (password.length >= 12) score++;
    if (password.length >= 16) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[a-z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;

    if (score <= 2) return { score: 20, label: "Très faible", color: "var(--color-error)" };
    if (score <= 3) return { score: 40, label: "Faible", color: "#ff9f0a" };
    if (score <= 4) return { score: 60, label: "Moyen", color: "#f0c040" };
    if (score <= 5) return { score: 80, label: "Fort", color: "#30d158" };
    return { score: 100, label: "Très fort", color: "var(--color-success)" };
}

export default function PasswordGenerator() {
    const [length, setLength] = useState(16);
    const [options, setOptions] = useState({
        uppercase: true,
        lowercase: true,
        numbers: true,
        symbols: true,
    });
    const [password, setPassword] = useState("");
    const [copied, setCopied] = useState(false);
    const [history, setHistory] = useState<string[]>([]);

    const generate = useCallback(() => {
        const pw = generatePassword(length, options);
        setPassword(pw);
        setHistory((h) => [pw, ...h].slice(0, 5));
        setCopied(false);
    }, [length, options]);

    useEffect(() => {
        generate();
    }, [generate]);

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text).then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        });
    };

    const strength = getStrength(password);

    const toggleOption = (key: keyof typeof options) => {
        const next = { ...options, [key]: !options[key] };
        const anyActive = Object.values(next).some(Boolean);
        if (!anyActive) return;
        setOptions(next);
    };

    return (
        <div className="password-page">
            <Container>
                <h1 className="password-page-title">Générateur de Mot de Passe</h1>
                <p className="password-page-subtitle">
                    Créez des mots de passe sécurisés et uniques instantanément
                </p>

                <div className="password-card">
                    {/* Display */}
                    <div className="password-display">
                        <span className="password-text">{password}</span>
                        <button
                            className="password-copy-btn"
                            onClick={() => copyToClipboard(password)}
                            title="Copier"
                        >
                            {copied ? <Check size={18} /> : <Copy size={18} />}
                        </button>
                        <button className="password-refresh-btn" onClick={generate} title="Régénérer">
                            <RefreshCw size={18} />
                        </button>
                    </div>

                    {/* Strength */}
                    <div className="password-strength-bar">
                        <div
                            className="password-strength-fill"
                            style={{ width: `${strength.score}%`, background: strength.color }}
                        />
                    </div>
                    <div className="password-strength-label" style={{ color: strength.color }}>
                        {strength.label}
                    </div>

                    {/* Length */}
                    <div className="password-option">
                        <span className="password-option-label">Longueur : {length}</span>
                    </div>
                    <input
                        type="range"
                        className="password-length-slider"
                        min={4}
                        max={64}
                        value={length}
                        onChange={(e) => setLength(Number(e.target.value))}
                    />

                    {/* Toggles */}
                    {([
                        ["uppercase", "Majuscules (A-Z)"],
                        ["lowercase", "Minuscules (a-z)"],
                        ["numbers", "Chiffres (0-9)"],
                        ["symbols", "Symboles (!@#$%)"],
                    ] as const).map(([key, label]) => (
                        <div className="password-option" key={key}>
                            <span className="password-option-label">{label}</span>
                            <button
                                className={`password-toggle ${options[key] ? "active" : ""}`}
                                onClick={() => toggleOption(key)}
                                aria-label={`Toggle ${label}`}
                            />
                        </div>
                    ))}

                    {/* History */}
                    {history.length > 1 && (
                        <div className="password-history">
                            <div className="password-history-title">Historique récent</div>
                            {history.slice(1).map((pw, i) => (
                                <div
                                    key={i}
                                    className="password-history-item"
                                    onClick={() => copyToClipboard(pw)}
                                    title="Cliquer pour copier"
                                >
                                    {pw.slice(0, 30)}{pw.length > 30 ? "…" : ""}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </Container>
        </div>
    );
}
