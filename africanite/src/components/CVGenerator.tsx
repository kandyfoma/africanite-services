import { useState, useRef } from "react";
import { Container } from "react-bootstrap";
import { Plus, X, Download, Sparkles } from "lucide-react";
import {
    isAIConfigured,
    aiGenerateCVSummary,
    aiImproveExperienceDesc,
    aiSuggestSkills,
} from "../services/aiService";
import "../styles/CVGenerator.css";
import "../styles/AIFeatures.css";

interface Experience {
    id: number;
    title: string;
    company: string;
    period: string;
    description: string;
}
interface Education {
    id: number;
    degree: string;
    school: string;
    period: string;
}

let nid = 1;

export default function CVGenerator() {
    const [fullName, setFullName] = useState("");
    const [jobTitle, setJobTitle] = useState("");
    const [email, setEmail] = useState("");
    const [phone, setPhone] = useState("");
    const [location, setLocation] = useState("");
    const [linkedin, setLinkedin] = useState("");
    const [summary, setSummary] = useState("");
    const [accentColor, setAccentColor] = useState("#0071e3");

    const [experiences, setExperiences] = useState<Experience[]>([
        { id: nid++, title: "", company: "", period: "", description: "" },
    ]);
    const [educations, setEducations] = useState<Education[]>([
        { id: nid++, degree: "", school: "", period: "" },
    ]);

    const [skillInput, setSkillInput] = useState("");
    const [skills, setSkills] = useState<string[]>([]);
    const [languages, setLanguages] = useState("");

    // AI state
    const [aiLoading, setAiLoading] = useState<string | null>(null);
    const [aiResult, setAiResult] = useState<{ key: string; text: string } | null>(null);

    const previewRef = useRef<HTMLDivElement>(null);

    const addExperience = () => setExperiences((p) => [...p, { id: nid++, title: "", company: "", period: "", description: "" }]);
    const removeExperience = (id: number) => setExperiences((p) => p.filter((e) => e.id !== id));
    const updateExperience = (id: number, field: keyof Experience, val: string) =>
        setExperiences((p) => p.map((e) => (e.id === id ? { ...e, [field]: val } : e)));

    const addEducation = () => setEducations((p) => [...p, { id: nid++, degree: "", school: "", period: "" }]);
    const removeEducation = (id: number) => setEducations((p) => p.filter((e) => e.id !== id));
    const updateEducation = (id: number, field: keyof Education, val: string) =>
        setEducations((p) => p.map((e) => (e.id === id ? { ...e, [field]: val } : e)));

    const addSkill = () => {
        const s = skillInput.trim();
        if (s && !skills.includes(s)) setSkills((p) => [...p, s]);
        setSkillInput("");
    };
    const removeSkill = (s: string) => setSkills((p) => p.filter((x) => x !== s));

    const aiEnabled = isAIConfigured();
    const expSummary = experiences.map((e) => `${e.title} chez ${e.company}`).filter((s) => s.trim() !== " chez ").join(", ");

    const handleAIGenerateSummary = async () => {
        setAiLoading("summary");
        try {
            const result = await aiGenerateCVSummary(fullName, jobTitle, expSummary);
            setAiResult({ key: "summary", text: result });
        } catch (e: unknown) {
            alert(e instanceof Error ? e.message : "Erreur IA");
        }
        setAiLoading(null);
    };

    const handleAIImproveExp = async (expId: number) => {
        const exp = experiences.find((e) => e.id === expId);
        if (!exp?.description) return;
        setAiLoading(`exp-${expId}`);
        try {
            const result = await aiImproveExperienceDesc(exp.title, exp.company, exp.description);
            setAiResult({ key: `exp-${expId}`, text: result });
        } catch (e: unknown) {
            alert(e instanceof Error ? e.message : "Erreur IA");
        }
        setAiLoading(null);
    };

    const handleAISuggestSkills = async () => {
        setAiLoading("skills");
        try {
            const suggested = await aiSuggestSkills(jobTitle, expSummary);
            const newSkills = suggested.filter((s) => !skills.includes(s));
            setSkills((p) => [...p, ...newSkills]);
        } catch (e: unknown) {
            alert(e instanceof Error ? e.message : "Erreur IA");
        }
        setAiLoading(null);
    };

    const downloadPNG = () => {
        const canvas = document.createElement("canvas");
        const W = 800;
        const pad = 50;
        const lineH = 18;
        const lines: { text: string; font: string; color: string; y?: number; indent?: number }[] = [];

        let y = pad;
        const push = (text: string, font: string, color = "#1d1d1f", indent = 0) => {
            lines.push({ text, font, color, y, indent });
            y += lineH;
        };
        const gap = (n = 0.5) => { y += lineH * n; };

        push(fullName || "Votre Nom", "bold 26px -apple-system, sans-serif");
        if (jobTitle) push(jobTitle, "500 14px -apple-system, sans-serif", "#86868b");
        const contact = [email, phone, location, linkedin].filter(Boolean).join("  ·  ");
        if (contact) push(contact, "12px -apple-system, sans-serif", "#86868b");
        gap();

        if (summary) {
            push("PROFIL", `bold 12px -apple-system, sans-serif`, accentColor);
            y += 2;
            // word wrap summary
            const words = summary.split(" ");
            let line = "";
            for (const w of words) {
                if ((line + " " + w).length > 85) {
                    push(line, "11px -apple-system, sans-serif", "#333");
                    line = w;
                } else {
                    line = line ? line + " " + w : w;
                }
            }
            if (line) push(line, "11px -apple-system, sans-serif", "#333");
            gap();
        }

        if (experiences.some((e) => e.title)) {
            push("EXPÉRIENCE", `bold 12px -apple-system, sans-serif`, accentColor);
            y += 2;
            experiences.forEach((e) => {
                if (!e.title) return;
                push(`${e.title}${e.company ? ` — ${e.company}` : ""}`, "bold 11px -apple-system, sans-serif");
                if (e.period) push(e.period, "10px -apple-system, sans-serif", "#86868b");
                if (e.description) {
                    const dWords = e.description.split(" ");
                    let dl = "";
                    for (const w of dWords) {
                        if ((dl + " " + w).length > 85) { push(dl, "10px -apple-system, sans-serif", "#555"); dl = w; }
                        else dl = dl ? dl + " " + w : w;
                    }
                    if (dl) push(dl, "10px -apple-system, sans-serif", "#555");
                }
                gap(0.3);
            });
            gap(0.5);
        }

        if (educations.some((e) => e.degree)) {
            push("FORMATION", `bold 12px -apple-system, sans-serif`, accentColor);
            y += 2;
            educations.forEach((e) => {
                if (!e.degree) return;
                push(`${e.degree}${e.school ? ` — ${e.school}` : ""}`, "bold 11px -apple-system, sans-serif");
                if (e.period) push(e.period, "10px -apple-system, sans-serif", "#86868b");
                gap(0.3);
            });
            gap(0.5);
        }

        if (skills.length > 0) {
            push("COMPÉTENCES", `bold 12px -apple-system, sans-serif`, accentColor);
            y += 2;
            push(skills.join("  ·  "), "11px -apple-system, sans-serif", "#333");
            gap(0.5);
        }

        if (languages) {
            push("LANGUES", `bold 12px -apple-system, sans-serif`, accentColor);
            y += 2;
            push(languages, "11px -apple-system, sans-serif", "#333");
        }

        const H = y + pad;
        canvas.width = W;
        canvas.height = H;
        const ctx = canvas.getContext("2d")!;
        ctx.fillStyle = "#fff";
        ctx.fillRect(0, 0, W, H);

        // accent line at top
        ctx.fillStyle = accentColor;
        ctx.fillRect(0, 0, W, 4);

        lines.forEach((l) => {
            ctx.font = l.font;
            ctx.fillStyle = l.color;
            ctx.textAlign = "left";
            ctx.fillText(l.text, pad + (l.indent || 0), l.y!);
        });

        canvas.toBlob((blob) => {
            if (!blob) return;
            const href = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = href;
            a.download = `cv-${(fullName || "cv").replace(/[^a-zA-Z0-9]/g, "_")}.png`;
            a.click();
            setTimeout(() => URL.revokeObjectURL(href), 1000);
        });
    };

    return (
        <div className="cv-page">
            <Container>
                <h1 className="cv-page-title">Générateur de CV</h1>
                <p className="cv-page-subtitle">
                    Créez un CV professionnel et téléchargez-le en un clic
                </p>

                <div className="cv-layout">
                    {/* Form */}
                    <div className="cv-form-card">
                        <div className="cv-section-title">Informations personnelles</div>
                        <div className="cv-row">
                            <div className="cv-input-group">
                                <label>Nom complet</label>
                                <input className="cv-input" value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Kandy Foma" />
                            </div>
                            <div className="cv-input-group">
                                <label>Titre professionnel</label>
                                <input className="cv-input" value={jobTitle} onChange={(e) => setJobTitle(e.target.value)} placeholder="Développeur Full-Stack" />
                            </div>
                        </div>
                        <div className="cv-row">
                            <div className="cv-input-group">
                                <label>Email</label>
                                <input className="cv-input" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="kandy@email.com" />
                            </div>
                            <div className="cv-input-group">
                                <label>Téléphone</label>
                                <input className="cv-input" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+243 82 881 2498" />
                            </div>
                        </div>
                        <div className="cv-row">
                            <div className="cv-input-group">
                                <label>Localisation</label>
                                <input className="cv-input" value={location} onChange={(e) => setLocation(e.target.value)} placeholder="Lubumbashi, RDC" />
                            </div>
                            <div className="cv-input-group">
                                <label>LinkedIn</label>
                                <input className="cv-input" value={linkedin} onChange={(e) => setLinkedin(e.target.value)} placeholder="linkedin.com/in/kandy" />
                            </div>
                        </div>
                        <div className="cv-input-group">
                            <label>Profil / Résumé</label>
                            <textarea className="cv-input cv-textarea" value={summary} onChange={(e) => setSummary(e.target.value)} placeholder="Bref résumé de votre profil professionnel…" />
                            {aiEnabled && (
                                <div className="ai-assist-inline">
                                    <button
                                        className="ai-assist-btn sm"
                                        onClick={handleAIGenerateSummary}
                                        disabled={aiLoading === "summary" || !jobTitle}
                                    >
                                        <Sparkles size={12} />
                                        {aiLoading === "summary" ? "Génération…" : summary ? "Améliorer" : "Générer avec IA"}
                                    </button>
                                </div>
                            )}
                            {aiResult?.key === "summary" && (
                                <div className="ai-result-card">
                                    <div className="ai-result-header">
                                        <span className="ai-result-label"><Sparkles size={12} /> Suggestion IA</span>
                                    </div>
                                    <div className="ai-result-text">{aiResult.text}</div>
                                    <div className="ai-result-actions">
                                        <button className="ai-result-apply" onClick={() => { setSummary(aiResult.text); setAiResult(null); }}>Appliquer</button>
                                        <button className="ai-result-dismiss" onClick={() => setAiResult(null)}>Ignorer</button>
                                    </div>
                                </div>
                            )}
                        </div>
                        <div className="cv-input-group" style={{ maxWidth: "180px" }}>
                            <label>Couleur d'accent</label>
                            <input type="color" className="cv-input" style={{ padding: "4px", height: "36px", cursor: "pointer" }} value={accentColor} onChange={(e) => setAccentColor(e.target.value)} />
                        </div>

                        {/* Experience */}
                        <div className="cv-section-title" style={{ marginTop: "var(--space-lg)" }}>Expérience</div>
                        {experiences.map((exp) => (
                            <div className="cv-entry" key={exp.id}>
                                {experiences.length > 1 && (
                                    <button className="cv-entry-remove" onClick={() => removeExperience(exp.id)}>
                                        <X size={14} />
                                    </button>
                                )}
                                <div className="cv-row">
                                    <div className="cv-input-group">
                                        <label>Poste</label>
                                        <input className="cv-input" value={exp.title} onChange={(e) => updateExperience(exp.id, "title", e.target.value)} placeholder="Développeur Senior" />
                                    </div>
                                    <div className="cv-input-group">
                                        <label>Entreprise</label>
                                        <input className="cv-input" value={exp.company} onChange={(e) => updateExperience(exp.id, "company", e.target.value)} placeholder="Africanite" />
                                    </div>
                                </div>
                                <div className="cv-input-group">
                                    <label>Période</label>
                                    <input className="cv-input" value={exp.period} onChange={(e) => updateExperience(exp.id, "period", e.target.value)} placeholder="Jan 2022 – Présent" />
                                </div>
                                <div className="cv-input-group">
                                    <label>Description</label>
                                    <textarea className="cv-input cv-textarea" value={exp.description} onChange={(e) => updateExperience(exp.id, "description", e.target.value)} placeholder="Responsabilités et réalisations…" />
                                    {aiEnabled && exp.description && (
                                        <div className="ai-assist-inline">
                                            <button
                                                className="ai-assist-btn sm outline"
                                                onClick={() => handleAIImproveExp(exp.id)}
                                                disabled={aiLoading === `exp-${exp.id}`}
                                            >
                                                <Sparkles size={11} />
                                                {aiLoading === `exp-${exp.id}` ? "Amélioration…" : "Améliorer"}
                                            </button>
                                        </div>
                                    )}
                                    {aiResult?.key === `exp-${exp.id}` && (
                                        <div className="ai-result-card">
                                            <div className="ai-result-header">
                                                <span className="ai-result-label"><Sparkles size={12} /> Suggestion IA</span>
                                            </div>
                                            <div className="ai-result-text">{aiResult.text}</div>
                                            <div className="ai-result-actions">
                                                <button className="ai-result-apply" onClick={() => { updateExperience(exp.id, "description", aiResult.text); setAiResult(null); }}>Appliquer</button>
                                                <button className="ai-result-dismiss" onClick={() => setAiResult(null)}>Ignorer</button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                        <button className="cv-add-btn" onClick={addExperience}>
                            <Plus size={14} style={{ marginRight: "0.25rem", verticalAlign: "middle" }} />
                            Ajouter une expérience
                        </button>

                        {/* Education */}
                        <div className="cv-section-title">Formation</div>
                        {educations.map((edu) => (
                            <div className="cv-entry" key={edu.id}>
                                {educations.length > 1 && (
                                    <button className="cv-entry-remove" onClick={() => removeEducation(edu.id)}>
                                        <X size={14} />
                                    </button>
                                )}
                                <div className="cv-row">
                                    <div className="cv-input-group">
                                        <label>Diplôme</label>
                                        <input className="cv-input" value={edu.degree} onChange={(e) => updateEducation(edu.id, "degree", e.target.value)} placeholder="Licence en Informatique" />
                                    </div>
                                    <div className="cv-input-group">
                                        <label>Établissement</label>
                                        <input className="cv-input" value={edu.school} onChange={(e) => updateEducation(edu.id, "school", e.target.value)} placeholder="Université de Lubumbashi" />
                                    </div>
                                </div>
                                <div className="cv-input-group">
                                    <label>Période</label>
                                    <input className="cv-input" value={edu.period} onChange={(e) => updateEducation(edu.id, "period", e.target.value)} placeholder="2018 – 2022" />
                                </div>
                            </div>
                        ))}
                        <button className="cv-add-btn" onClick={addEducation}>
                            <Plus size={14} style={{ marginRight: "0.25rem", verticalAlign: "middle" }} />
                            Ajouter une formation
                        </button>

                        {/* Skills */}
                        <div className="cv-section-title">Compétences</div>
                        <div className="cv-input-group">
                            <label>Ajouter une compétence</label>
                            <div style={{ display: "flex", gap: "var(--space-sm)" }}>
                                <input
                                    className="cv-input"
                                    value={skillInput}
                                    onChange={(e) => setSkillInput(e.target.value)}
                                    onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addSkill(); } }}
                                    placeholder="React, Python, etc."
                                />
                                <button className="cv-add-btn" onClick={addSkill} style={{ marginBottom: 0, whiteSpace: "nowrap" }}>
                                    + Ajouter
                                </button>
                                {aiEnabled && (
                                    <button
                                        className="ai-assist-btn sm"
                                        onClick={handleAISuggestSkills}
                                        disabled={aiLoading === "skills" || !jobTitle}
                                        style={{ marginBottom: 0 }}
                                    >
                                        <Sparkles size={11} />
                                        {aiLoading === "skills" ? "…" : "Suggérer"}
                                    </button>
                                )}
                            </div>
                            <div className="cv-skill-tags">
                                {skills.map((s) => (
                                    <span className="cv-skill-tag" key={s}>
                                        {s}
                                        <button onClick={() => removeSkill(s)}>×</button>
                                    </span>
                                ))}
                            </div>
                        </div>

                        {/* Languages */}
                        <div className="cv-section-title">Langues</div>
                        <div className="cv-input-group">
                            <label>Langues parlées</label>
                            <input className="cv-input" value={languages} onChange={(e) => setLanguages(e.target.value)} placeholder="Français (natif), Anglais (courant), Swahili" />
                        </div>
                    </div>

                    {/* Preview */}
                    <div className="cv-preview-card">
                        <div className="cv-preview-paper" ref={previewRef}>
                            <div style={{ borderTop: `3px solid ${accentColor}`, marginBottom: "12px" }} />
                            <div className="cv-p-name">{fullName || "Votre Nom"}</div>
                            {jobTitle && <div className="cv-p-title">{jobTitle}</div>}
                            {(email || phone || location) && (
                                <div className="cv-p-contact">
                                    {[email, phone, location, linkedin].filter(Boolean).join("  ·  ")}
                                </div>
                            )}
                            {summary && (
                                <>
                                    <div className="cv-p-section-title" style={{ color: accentColor, borderBottom: `1px solid ${accentColor}` }}>Profil</div>
                                    <div className="cv-p-entry-desc">{summary}</div>
                                </>
                            )}
                            {experiences.some((e) => e.title) && (
                                <>
                                    <div className="cv-p-section-title" style={{ color: accentColor, borderBottom: `1px solid ${accentColor}` }}>Expérience</div>
                                    {experiences.map((e) => e.title ? (
                                        <div key={e.id} style={{ marginBottom: "8px" }}>
                                            <div className="cv-p-entry-title">{e.title}{e.company ? ` — ${e.company}` : ""}</div>
                                            {e.period && <div className="cv-p-entry-sub">{e.period}</div>}
                                            {e.description && <div className="cv-p-entry-desc">{e.description}</div>}
                                        </div>
                                    ) : null)}
                                </>
                            )}
                            {educations.some((e) => e.degree) && (
                                <>
                                    <div className="cv-p-section-title" style={{ color: accentColor, borderBottom: `1px solid ${accentColor}` }}>Formation</div>
                                    {educations.map((e) => e.degree ? (
                                        <div key={e.id} style={{ marginBottom: "8px" }}>
                                            <div className="cv-p-entry-title">{e.degree}{e.school ? ` — ${e.school}` : ""}</div>
                                            {e.period && <div className="cv-p-entry-sub">{e.period}</div>}
                                        </div>
                                    ) : null)}
                                </>
                            )}
                            {skills.length > 0 && (
                                <>
                                    <div className="cv-p-section-title" style={{ color: accentColor, borderBottom: `1px solid ${accentColor}` }}>Compétences</div>
                                    <div className="cv-p-skills">
                                        {skills.map((s) => (
                                            <span key={s} className="cv-p-skill" style={{ background: `${accentColor}15`, color: accentColor }}>
                                                {s}
                                            </span>
                                        ))}
                                    </div>
                                </>
                            )}
                            {languages && (
                                <>
                                    <div className="cv-p-section-title" style={{ color: accentColor, borderBottom: `1px solid ${accentColor}` }}>Langues</div>
                                    <div className="cv-p-entry-desc">{languages}</div>
                                </>
                            )}
                        </div>
                        <div className="cv-preview-actions">
                            <button className="cv-dl-btn" onClick={downloadPNG}>
                                <Download size={14} style={{ marginRight: "0.35rem", verticalAlign: "middle" }} />
                                Télécharger PNG
                            </button>
                        </div>
                    </div>
                </div>
            </Container>
        </div>
    );
}
