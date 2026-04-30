import { useState, useRef } from "react";
import { Container } from "react-bootstrap";
import { Upload, X, Merge, Split, Download, FileText, Scissors, GripVertical } from "lucide-react";
import "../styles/PDFEditor.css";

interface PdfFile {
    id: number;
    file: File;
    name: string;
    size: number;
    pageCount: number | null;
}

function formatBytes(bytes: number): string {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
}

let nextId = 1;

export default function PDFEditor() {
    const [files, setFiles] = useState<PdfFile[]>([]);
    const [status, setStatus] = useState<{ text: string; color: string } | null>(null);
    const [processing, setProcessing] = useState(false);
    const [dragging, setDragging] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    const addFiles = async (fileList: FileList) => {
        const { PDFDocument } = await import("pdf-lib");
        const newFiles: PdfFile[] = [];
        for (const file of Array.from(fileList)) {
            if (file.type !== "application/pdf") continue;
            let pageCount: number | null = null;
            try {
                const buf = await file.arrayBuffer();
                const doc = await PDFDocument.load(buf, { ignoreEncryption: true });
                pageCount = doc.getPageCount();
            } catch {
                pageCount = null;
            }
            newFiles.push({ id: nextId++, file, name: file.name, size: file.size, pageCount });
        }
        setFiles((prev) => [...prev, ...newFiles]);
        setStatus(null);
    };

    const removeFile = (id: number) => setFiles((prev) => prev.filter((f) => f.id !== id));

    const moveFile = (fromIdx: number, toIdx: number) => {
        setFiles((prev) => {
            const arr = [...prev];
            const [item] = arr.splice(fromIdx, 1);
            arr.splice(toIdx, 0, item);
            return arr;
        });
    };

    const onDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setDragging(false);
        if (e.dataTransfer.files.length > 0) addFiles(e.dataTransfer.files);
    };

    // ── Merge all PDFs into one ──
    const mergePDFs = async () => {
        if (files.length < 2) {
            setStatus({ text: "Ajoutez au moins 2 fichiers PDF pour fusionner", color: "var(--color-warning)" });
            return;
        }
        setProcessing(true);
        setStatus({ text: "Fusion en cours…", color: "var(--color-text-secondary)" });
        try {
            const { PDFDocument } = await import("pdf-lib");
            const merged = await PDFDocument.create();
            for (const pdfFile of files) {
                const buf = await pdfFile.file.arrayBuffer();
                const doc = await PDFDocument.load(buf, { ignoreEncryption: true });
                const pages = await merged.copyPages(doc, doc.getPageIndices());
                pages.forEach((page) => merged.addPage(page));
            }
            const pdfBytes = await merged.save();
            downloadBlob(new Blob([pdfBytes], { type: "application/pdf" }), "fusionné.pdf");
            setStatus({ text: "Fusion terminée !", color: "var(--color-success)" });
        } catch (err) {
            setStatus({ text: `Erreur : ${err instanceof Error ? err.message : "Échec"}`, color: "var(--color-error)" });
        }
        setProcessing(false);
    };

    // ── Split PDF: each page becomes a separate file ──
    const splitPDF = async () => {
        if (files.length !== 1) {
            setStatus({ text: "Sélectionnez exactement 1 fichier PDF pour diviser", color: "var(--color-warning)" });
            return;
        }
        setProcessing(true);
        setStatus({ text: "Division en cours…", color: "var(--color-text-secondary)" });
        try {
            const { PDFDocument } = await import("pdf-lib");
            const buf = await files[0].file.arrayBuffer();
            const doc = await PDFDocument.load(buf, { ignoreEncryption: true });
            const total = doc.getPageCount();
            for (let i = 0; i < total; i++) {
                const single = await PDFDocument.create();
                const [page] = await single.copyPages(doc, [i]);
                single.addPage(page);
                const bytes = await single.save();
                downloadBlob(
                    new Blob([bytes], { type: "application/pdf" }),
                    `page-${i + 1}.pdf`
                );
            }
            setStatus({ text: `${total} pages extraites !`, color: "var(--color-success)" });
        } catch (err) {
            setStatus({ text: `Erreur : ${err instanceof Error ? err.message : "Échec"}`, color: "var(--color-error)" });
        }
        setProcessing(false);
    };

    // ── Extract page range ──
    const extractPages = async () => {
        if (files.length !== 1) {
            setStatus({ text: "Sélectionnez 1 fichier PDF", color: "var(--color-warning)" });
            return;
        }
        const range = prompt("Pages à extraire (ex: 1-3,5,8-10) :");
        if (!range) return;

        setProcessing(true);
        setStatus({ text: "Extraction en cours…", color: "var(--color-text-secondary)" });
        try {
            const { PDFDocument } = await import("pdf-lib");
            const buf = await files[0].file.arrayBuffer();
            const doc = await PDFDocument.load(buf, { ignoreEncryption: true });
            const total = doc.getPageCount();

            const indices = parsePageRange(range, total);
            if (indices.length === 0) {
                setStatus({ text: "Plage de pages invalide", color: "var(--color-error)" });
                setProcessing(false);
                return;
            }

            const extracted = await PDFDocument.create();
            const pages = await extracted.copyPages(doc, indices);
            pages.forEach((p) => extracted.addPage(p));
            const bytes = await extracted.save();
            downloadBlob(new Blob([bytes], { type: "application/pdf" }), `extrait-${range}.pdf`);
            setStatus({ text: `${indices.length} pages extraites !`, color: "var(--color-success)" });
        } catch (err) {
            setStatus({ text: `Erreur : ${err instanceof Error ? err.message : "Échec"}`, color: "var(--color-error)" });
        }
        setProcessing(false);
    };

    return (
        <div className="pdf-page">
            <Container>
                <h1 className="pdf-page-title">Éditeur de PDF</h1>
                <p className="pdf-page-subtitle">
                    Fusionnez, divisez et extrayez des pages — tout dans votre navigateur
                </p>

                <div className="pdf-card">
                    {/* Drop zone */}
                    <div
                        className={`pdf-dropzone ${dragging ? "dragging" : ""}`}
                        onClick={() => inputRef.current?.click()}
                        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
                        onDragLeave={() => setDragging(false)}
                        onDrop={onDrop}
                    >
                        <div className="pdf-dropzone-icon"><Upload size={36} /></div>
                        <div className="pdf-dropzone-text">
                            Glissez vos fichiers PDF ici ou cliquez pour choisir
                        </div>
                        <div className="pdf-dropzone-hint">Plusieurs fichiers acceptés</div>
                        <input
                            ref={inputRef}
                            type="file"
                            accept="application/pdf"
                            multiple
                            hidden
                            onChange={(e) => { if (e.target.files) addFiles(e.target.files); }}
                        />
                    </div>

                    {/* File list */}
                    {files.length > 0 && (
                        <div className="pdf-file-list">
                            {files.map((f, idx) => (
                                <div className="pdf-file-item" key={f.id}>
                                    <GripVertical
                                        size={16}
                                        style={{ color: "var(--color-text-tertiary)", marginRight: "0.5rem", flexShrink: 0 }}
                                    />
                                    <FileText size={16} style={{ color: "var(--color-accent)", marginRight: "0.5rem", flexShrink: 0 }} />
                                    <span className="pdf-file-name">{f.name}</span>
                                    <span className="pdf-file-size">
                                        {formatBytes(f.size)}
                                        {f.pageCount != null && ` · ${f.pageCount} p.`}
                                    </span>
                                    {idx > 0 && (
                                        <button
                                            className="pdf-file-remove"
                                            title="Monter"
                                            onClick={() => moveFile(idx, idx - 1)}
                                            style={{ color: "var(--color-text-tertiary)" }}
                                        >
                                            ↑
                                        </button>
                                    )}
                                    <button className="pdf-file-remove" onClick={() => removeFile(f.id)} title="Retirer">
                                        <X size={16} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Actions */}
                    {files.length > 0 && (
                        <div className="pdf-actions">
                            <button
                                className="pdf-action-btn primary"
                                onClick={mergePDFs}
                                disabled={processing || files.length < 2}
                            >
                                <Merge size={16} style={{ marginRight: "0.4rem", verticalAlign: "middle" }} />
                                Fusionner
                            </button>
                            <button
                                className="pdf-action-btn"
                                onClick={splitPDF}
                                disabled={processing || files.length !== 1}
                            >
                                <Split size={16} style={{ marginRight: "0.4rem", verticalAlign: "middle" }} />
                                Diviser
                            </button>
                            <button
                                className="pdf-action-btn"
                                onClick={extractPages}
                                disabled={processing || files.length !== 1}
                            >
                                <Scissors size={16} style={{ marginRight: "0.4rem", verticalAlign: "middle" }} />
                                Extraire pages
                            </button>
                        </div>
                    )}

                    {status && (
                        <div className="pdf-status" style={{ color: status.color }}>
                            {status.text}
                        </div>
                    )}
                </div>

                {/* Feature cards */}
                <div className="pdf-features-grid">
                    <div className="pdf-feature-card">
                        <div className="pdf-feature-icon">🔗</div>
                        <div className="pdf-feature-title">Fusionner</div>
                        <div className="pdf-feature-desc">Combinez plusieurs PDF en un seul fichier</div>
                    </div>
                    <div className="pdf-feature-card">
                        <div className="pdf-feature-icon">✂️</div>
                        <div className="pdf-feature-title">Diviser</div>
                        <div className="pdf-feature-desc">Séparez chaque page en fichier individuel</div>
                    </div>
                    <div className="pdf-feature-card">
                        <div className="pdf-feature-icon">📄</div>
                        <div className="pdf-feature-title">Extraire</div>
                        <div className="pdf-feature-desc">Extrayez des pages spécifiques (ex: 1-3, 5)</div>
                    </div>
                </div>
            </Container>
        </div>
    );
}

// ── Helpers ──

function parsePageRange(input: string, total: number): number[] {
    const indices: number[] = [];
    const parts = input.split(",").map((s) => s.trim());
    for (const part of parts) {
        if (part.includes("-")) {
            const [a, b] = part.split("-").map(Number);
            if (isNaN(a) || isNaN(b)) continue;
            const start = Math.max(1, Math.min(a, b));
            const end = Math.min(total, Math.max(a, b));
            for (let i = start; i <= end; i++) indices.push(i - 1);
        } else {
            const n = Number(part);
            if (!isNaN(n) && n >= 1 && n <= total) indices.push(n - 1);
        }
    }
    return [...new Set(indices)].sort((a, b) => a - b);
}

function downloadBlob(blob: Blob, filename: string) {
    const href = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = href;
    a.download = filename;
    a.click();
    setTimeout(() => URL.revokeObjectURL(href), 1000);
}
