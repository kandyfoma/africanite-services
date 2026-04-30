import { useState, useEffect } from "react";
import { X, Sparkles, Zap } from "lucide-react";
import {
    loadAIConfig,
    saveAIConfig,
    clearAIConfig,
    PROVIDERS,
    type ProviderKey,
    type AIConfig,
} from "../services/aiService";
import "../styles/AIFeatures.css";

interface Props {
    show: boolean;
    onClose: () => void;
}

export default function AISettingsModal({ show, onClose }: Props) {
    const [provider, setProvider] = useState<ProviderKey>("gemini");
    const [apiKey, setApiKey] = useState("");
    const [baseUrl, setBaseUrl] = useState(PROVIDERS.gemini.baseUrl);
    const [model, setModel] = useState(PROVIDERS.gemini.model);
    const [saved, setSaved] = useState(false);

    useEffect(() => {
        const config = loadAIConfig();
        if (config) {
            setApiKey(config.apiKey);
            setBaseUrl(config.baseUrl);
            setModel(config.model);
            setProvider((config.provider as ProviderKey) || "gemini");
        }
    }, [show]);

    const selectProvider = (key: ProviderKey) => {
        setProvider(key);
        setBaseUrl(PROVIDERS[key].baseUrl);
        setModel(PROVIDERS[key].model);
    };

    const handleSave = () => {
        const config: AIConfig = { apiKey, baseUrl, model, provider };
        saveAIConfig(config);
        setSaved(true);
        setTimeout(() => { setSaved(false); onClose(); }, 1000);
    };

    const handleClear = () => {
        clearAIConfig();
        setApiKey("");
        setBaseUrl(PROVIDERS.gemini.baseUrl);
        setModel(PROVIDERS.gemini.model);
        setProvider("gemini");
    };

    if (!show) return null;

    const isConfigured = !!loadAIConfig()?.apiKey;

    return (
        <div className="ai-settings-overlay" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
            <div className="ai-settings-modal">
                <button className="ai-settings-close" onClick={onClose}>
                    <X size={18} />
                </button>

                <div className="ai-settings-title">
                    <Sparkles size={22} color="#764ba2" />
                    Paramètres IA
                </div>
                <div className="ai-settings-subtitle">
                    Connectez un fournisseur d'IA pour activer les fonctionnalités intelligentes dans tous vos outils.
                    Votre clé API est stockée localement sur votre appareil.
                </div>

                {/* Provider selection */}
                <label style={{ fontSize: "var(--font-size-xs)", fontWeight: 600, color: "var(--color-text-secondary)", marginBottom: "var(--space-xs)", display: "block" }}>
                    Fournisseur
                </label>
                <div className="ai-provider-grid">
                    {(Object.keys(PROVIDERS) as ProviderKey[]).map((key) => (
                        <button
                            key={key}
                            className={`ai-provider-btn ${provider === key ? "active" : ""}`}
                            onClick={() => selectProvider(key)}
                        >
                            {PROVIDERS[key].label}
                        </button>
                    ))}
                </div>

                {/* API Key */}
                <div className="ai-settings-group">
                    <label>Clé API {provider === "ollama" && "(optionnel pour Ollama)"}</label>
                    <input
                        className="ai-settings-input"
                        type="password"
                        value={apiKey}
                        onChange={(e) => setApiKey(e.target.value)}
                        placeholder={provider === "ollama" ? "ollama" : "sk-..."}
                    />
                </div>

                {/* Base URL */}
                <div className="ai-settings-group">
                    <label>URL de l'API</label>
                    <input
                        className="ai-settings-input"
                        value={baseUrl}
                        onChange={(e) => setBaseUrl(e.target.value)}
                    />
                </div>

                {/* Model */}
                <div className="ai-settings-group">
                    <label>Modèle</label>
                    <input
                        className="ai-settings-input"
                        value={model}
                        onChange={(e) => setModel(e.target.value)}
                        placeholder="gpt-4o-mini"
                    />
                </div>

                {/* Actions */}
                <div className="ai-settings-actions">
                    <button className="ai-settings-save" onClick={handleSave} disabled={!apiKey && provider !== "ollama"}>
                        {saved ? (
                            <>
                                <Zap size={14} style={{ marginRight: "0.3rem", verticalAlign: "middle" }} />
                                Connecté !
                            </>
                        ) : (
                            "Enregistrer"
                        )}
                    </button>
                    {isConfigured && (
                        <button className="ai-settings-clear" onClick={handleClear}>
                            Déconnecter
                        </button>
                    )}
                </div>

                {/* Status */}
                <div className="ai-settings-status">
                    <span className={`ai-status-dot ${isConfigured ? "connected" : "disconnected"}`} />
                    <span style={{ color: isConfigured ? "var(--color-success)" : "var(--color-text-tertiary)" }}>
                        {isConfigured ? "IA connectée" : "Non configuré"}
                    </span>
                </div>
            </div>
        </div>
    );
}
