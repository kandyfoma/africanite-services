// ── AI Service ──
// OpenAI-compatible API client (Gemini, OpenAI, Groq, Together, Ollama)

const STORAGE_KEY = "africanite_ai_config";

export interface AIConfig {
    apiKey: string;
    baseUrl: string;
    model: string;
    provider: string;
}

const PROVIDERS = {
    gemini: { label: "Google Gemini", baseUrl: "https://generativelanguage.googleapis.com/v1beta/openai", model: "gemini-2.0-flash" },
    groq: { label: "Groq (Gratuit)", baseUrl: "https://api.groq.com/openai/v1", model: "llama-3.3-70b-versatile" },
    openai: { label: "OpenAI", baseUrl: "https://api.openai.com/v1", model: "gpt-4o-mini" },
    together: { label: "Together AI", baseUrl: "https://api.together.xyz/v1", model: "meta-llama/Llama-3.3-70B-Instruct-Turbo" },
    ollama: { label: "Ollama (Local)", baseUrl: "http://localhost:11434/v1", model: "llama3.2" },
} as const;

export type ProviderKey = keyof typeof PROVIDERS;

export { PROVIDERS };

// Auto-configure from env variable if available (VITE_GEMINI_API_KEY)
function getEnvConfig(): AIConfig | null {
    const key = import.meta.env.VITE_GEMINI_API_KEY;
    if (!key) return null;
    return {
        apiKey: key,
        baseUrl: PROVIDERS.gemini.baseUrl,
        model: PROVIDERS.gemini.model,
        provider: "gemini",
    };
}

export function loadAIConfig(): AIConfig | null {
    // 1. Check localStorage first (user override)
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (raw) return JSON.parse(raw);
    } catch { /* ignore */ }
    // 2. Fall back to env variable
    return getEnvConfig();
}

export function saveAIConfig(config: AIConfig): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
}

export function clearAIConfig(): void {
    localStorage.removeItem(STORAGE_KEY);
}

export function isAIConfigured(): boolean {
    const config = loadAIConfig();
    return !!(config?.apiKey && config?.baseUrl);
}

interface ChatMessage {
    role: "system" | "user" | "assistant";
    content: string;
}

interface AIRequestOptions {
    messages: ChatMessage[];
    temperature?: number;
    maxTokens?: number;
}

export async function aiChat(options: AIRequestOptions): Promise<string> {
    const config = loadAIConfig();
    if (!config?.apiKey) throw new Error("Clé API non configurée. Ouvrez les paramètres IA.");

    const res = await fetch(`${config.baseUrl}/chat/completions`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${config.apiKey}`,
        },
        body: JSON.stringify({
            model: config.model,
            messages: options.messages,
            temperature: options.temperature ?? 0.7,
            max_tokens: options.maxTokens ?? 1024,
        }),
    });

    if (!res.ok) {
        const err = await res.text();
        if (res.status === 401) throw new Error("Clé API invalide. Vérifiez vos paramètres.");
        if (res.status === 429) throw new Error("Limite de requêtes atteinte. Réessayez dans un moment.");
        throw new Error(`Erreur API (${res.status}): ${err.slice(0, 200)}`);
    }

    const data = await res.json();
    return data.choices?.[0]?.message?.content?.trim() ?? "";
}

// ── Pre-built AI prompts for each tool ──

const SYSTEM_FR = "Tu es un assistant professionnel. Réponds toujours en français. Sois concis et direct.";

export async function aiImproveText(text: string, context: string): Promise<string> {
    return aiChat({
        messages: [
            { role: "system", content: SYSTEM_FR },
            { role: "user", content: `Améliore ce texte pour qu'il soit plus professionnel et impactant. Contexte: ${context}.\n\nTexte original:\n${text}\n\nTexte amélioré (sans guillemets ni explications, juste le texte):` },
        ],
        temperature: 0.6,
    });
}

export async function aiGenerateCVSummary(name: string, title: string, experiences: string): Promise<string> {
    return aiChat({
        messages: [
            { role: "system", content: SYSTEM_FR },
            { role: "user", content: `Rédige un résumé de profil professionnel pour un CV (3-4 phrases).\n\nNom: ${name}\nTitre: ${title}\nExpériences: ${experiences}\n\nRésumé (sans guillemets):` },
        ],
        temperature: 0.7,
    });
}

export async function aiImproveExperienceDesc(title: string, company: string, description: string): Promise<string> {
    return aiChat({
        messages: [
            { role: "system", content: SYSTEM_FR },
            { role: "user", content: `Améliore cette description d'expérience professionnelle pour un CV. Utilise des verbes d'action, des résultats quantifiables si possible.\n\nPoste: ${title} chez ${company}\nDescription actuelle: ${description}\n\nDescription améliorée (2-3 bullet points, sans guillemets):` },
        ],
        temperature: 0.6,
    });
}

export async function aiSuggestSkills(title: string, experiences: string): Promise<string[]> {
    const result = await aiChat({
        messages: [
            { role: "system", content: "Tu es un assistant RH. Réponds uniquement avec une liste de compétences séparées par des virgules, sans numérotation ni explication." },
            { role: "user", content: `Suggère 8-10 compétences techniques et soft skills pertinentes pour ce profil:\n\nTitre: ${title}\nExpériences: ${experiences}\n\nCompétences (séparées par des virgules):` },
        ],
        temperature: 0.5,
        maxTokens: 256,
    });
    return result.split(",").map((s) => s.trim()).filter(Boolean);
}

export async function aiSuggestTitle(name: string, company: string, currentTitle: string): Promise<string> {
    return aiChat({
        messages: [
            { role: "system", content: SYSTEM_FR },
            { role: "user", content: `Suggère un titre professionnel élégant pour une signature email.\n\nNom: ${name}\nEntreprise: ${company}\nTitre actuel: ${currentTitle || "(aucun)"}\n\nSuggère 3 options séparées par " | " (sans numérotation, sans explication):` },
        ],
        temperature: 0.8,
        maxTokens: 128,
    });
}

export async function aiAutoFillInvoice(description: string): Promise<{
    items: { description: string; quantity: number; rate: number }[];
    notes?: string;
}> {
    const result = await aiChat({
        messages: [
            { role: "system", content: "Tu es un assistant de facturation. Réponds UNIQUEMENT en JSON valide, sans markdown ni explication." },
            { role: "user", content: `À partir de cette description de travail, génère les lignes de facture au format JSON:\n\n"${description}"\n\nFormat attendu:\n{"items": [{"description": "...", "quantity": 1, "rate": 0}], "notes": "..."}` },
        ],
        temperature: 0.3,
        maxTokens: 512,
    });
    try {
        const cleaned = result.replace(/```json?\n?/g, "").replace(/```/g, "").trim();
        return JSON.parse(cleaned);
    } catch {
        throw new Error("L'IA n'a pas pu structurer les données. Réessayez avec une description plus détaillée.");
    }
}

export async function aiAutoFillReceipt(description: string): Promise<{
    items: { description: string; qty: number; price: number }[];
    businessName?: string;
    customerName?: string;
}> {
    const result = await aiChat({
        messages: [
            { role: "system", content: "Tu es un assistant commercial. Réponds UNIQUEMENT en JSON valide, sans markdown ni explication." },
            { role: "user", content: `À partir de cette description de vente, génère les articles pour un reçu au format JSON:\n\n"${description}"\n\nFormat:\n{"items": [{"description": "...", "qty": 1, "price": 0}], "businessName": "...", "customerName": "..."}` },
        ],
        temperature: 0.3,
        maxTokens: 512,
    });
    try {
        const cleaned = result.replace(/```json?\n?/g, "").replace(/```/g, "").trim();
        return JSON.parse(cleaned);
    } catch {
        throw new Error("L'IA n'a pas pu structurer les données. Réessayez.");
    }
}

export async function aiExplainLoan(params: {
    principal: number;
    rate: number;
    years: number;
    monthly: number;
    totalInterest: number;
    currency: string;
}): Promise<string> {
    return aiChat({
        messages: [
            { role: "system", content: SYSTEM_FR },
            { role: "user", content: `Explique ce prêt en termes simples et donne des conseils pratiques (3-4 phrases):\n\nMontant: ${params.currency} ${params.principal.toLocaleString()}\nTaux: ${params.rate}% par an\nDurée: ${params.years} ans\nMensualité: ${params.currency} ${params.monthly.toFixed(2)}\nTotal intérêts: ${params.currency} ${params.totalInterest.toFixed(2)}\n\nExplication et conseils:` },
        ],
        temperature: 0.6,
        maxTokens: 300,
    });
}

export async function aiGenerateQRContent(description: string, type: string): Promise<string> {
    return aiChat({
        messages: [
            { role: "system", content: "Tu es un assistant technique. Réponds UNIQUEMENT avec le contenu demandé, sans explication." },
            { role: "user", content: `Génère le contenu pour un QR code de type "${type}" à partir de cette description:\n\n"${description}"\n\nContenu:` },
        ],
        temperature: 0.3,
        maxTokens: 256,
    });
}
