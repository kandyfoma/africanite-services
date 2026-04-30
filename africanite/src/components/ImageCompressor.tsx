import { useState, useRef, useCallback } from "react";
import { Container } from "react-bootstrap";
import { Upload, Download } from "lucide-react";
import "../styles/ImageCompressor.css";

type OutputFormat = "jpeg" | "png" | "webp";

function formatBytes(bytes: number): string {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
}

export default function ImageCompressor() {
    const [originalFile, setOriginalFile] = useState<File | null>(null);
    const [originalUrl, setOriginalUrl] = useState<string | null>(null);
    const [compressedUrl, setCompressedUrl] = useState<string | null>(null);
    const [compressedSize, setCompressedSize] = useState(0);
    const [quality, setQuality] = useState(75);
    const [maxWidth, setMaxWidth] = useState(1920);
    const [format, setFormat] = useState<OutputFormat>("jpeg");
    const [dragging, setDragging] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    const compress = useCallback(
        (file: File, q: number, mw: number, fmt: OutputFormat) => {
            const reader = new FileReader();
            reader.onload = () => {
                const img = new Image();
                img.onload = () => {
                    const scale = img.width > mw ? mw / img.width : 1;
                    const w = Math.round(img.width * scale);
                    const h = Math.round(img.height * scale);

                    const canvas = document.createElement("canvas");
                    canvas.width = w;
                    canvas.height = h;
                    const ctx = canvas.getContext("2d")!;
                    ctx.drawImage(img, 0, 0, w, h);

                    canvas.toBlob(
                        (blob) => {
                            if (!blob) return;
                            if (compressedUrl) URL.revokeObjectURL(compressedUrl);
                            const url = URL.createObjectURL(blob);
                            setCompressedUrl(url);
                            setCompressedSize(blob.size);
                        },
                        `image/${fmt}`,
                        q / 100
                    );
                };
                img.src = reader.result as string;
            };
            reader.readAsDataURL(file);
        },
        [compressedUrl]
    );

    const handleFile = (file: File) => {
        if (!file.type.startsWith("image/")) return;
        setOriginalFile(file);
        if (originalUrl) URL.revokeObjectURL(originalUrl);
        setOriginalUrl(URL.createObjectURL(file));
        compress(file, quality, maxWidth, format);
    };

    const onDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setDragging(false);
        const file = e.dataTransfer.files[0];
        if (file) handleFile(file);
    };

    const onQualityChange = (q: number) => {
        setQuality(q);
        if (originalFile) compress(originalFile, q, maxWidth, format);
    };

    const onMaxWidthChange = (mw: number) => {
        setMaxWidth(mw);
        if (originalFile) compress(originalFile, quality, mw, format);
    };

    const onFormatChange = (fmt: OutputFormat) => {
        setFormat(fmt);
        if (originalFile) compress(originalFile, quality, maxWidth, fmt);
    };

    const download = () => {
        if (!compressedUrl || !originalFile) return;
        const name = originalFile.name.replace(/\.[^.]+$/, "");
        const a = document.createElement("a");
        a.href = compressedUrl;
        a.download = `${name}-compressed.${format}`;
        a.click();
    };

    const savings =
        originalFile && compressedSize > 0
            ? Math.max(0, Math.round((1 - compressedSize / originalFile.size) * 100))
            : 0;

    return (
        <div className="compressor-page">
            <Container>
                <h1 className="compressor-page-title">Compresseur d'Image</h1>
                <p className="compressor-page-subtitle">
                    Réduisez la taille de vos images sans perte visible de qualité
                </p>

                <div className="compressor-card">
                    {/* Drop zone */}
                    <div
                        className={`compressor-dropzone ${dragging ? "dragging" : ""}`}
                        onClick={() => inputRef.current?.click()}
                        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
                        onDragLeave={() => setDragging(false)}
                        onDrop={onDrop}
                    >
                        <div className="compressor-dropzone-icon">
                            <Upload size={36} />
                        </div>
                        <div className="compressor-dropzone-text">
                            Glissez une image ici ou cliquez pour choisir
                        </div>
                        <div className="compressor-dropzone-hint">
                            JPG, PNG, WebP — max 20 MB
                        </div>
                        <input
                            ref={inputRef}
                            type="file"
                            accept="image/*"
                            hidden
                            onChange={(e) => {
                                const f = e.target.files?.[0];
                                if (f) handleFile(f);
                            }}
                        />
                    </div>

                    {originalFile && (
                        <>
                            {/* Controls */}
                            <div className="compressor-controls">
                                <label>Qualité : {quality}%</label>
                                <input
                                    type="range"
                                    className="compressor-slider"
                                    min={10}
                                    max={100}
                                    value={quality}
                                    onChange={(e) => onQualityChange(Number(e.target.value))}
                                />

                                <label>Largeur max : {maxWidth}px</label>
                                <input
                                    type="range"
                                    className="compressor-slider"
                                    min={320}
                                    max={3840}
                                    step={80}
                                    value={maxWidth}
                                    onChange={(e) => onMaxWidthChange(Number(e.target.value))}
                                />

                                <label>Format de sortie</label>
                                <div className="compressor-format-group">
                                    {(["jpeg", "png", "webp"] as const).map((f) => (
                                        <button
                                            key={f}
                                            className={`compressor-format-btn ${format === f ? "active" : ""}`}
                                            onClick={() => onFormatChange(f)}
                                        >
                                            {f.toUpperCase()}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Preview */}
                            <div className="compressor-preview-grid">
                                <div className="compressor-preview-card">
                                    {originalUrl && <img src={originalUrl} alt="Original" />}
                                    <div className="compressor-preview-label">Original</div>
                                    <div className="compressor-preview-size">
                                        {formatBytes(originalFile.size)}
                                    </div>
                                </div>
                                <div className="compressor-preview-card">
                                    {compressedUrl && <img src={compressedUrl} alt="Compressé" />}
                                    <div className="compressor-preview-label">Compressé</div>
                                    <div className="compressor-preview-size">
                                        {formatBytes(compressedSize)}
                                    </div>
                                </div>
                            </div>

                            {/* Savings */}
                            <div className="compressor-savings">
                                <div className="compressor-savings-pct">−{savings}%</div>
                                <div className="compressor-savings-label">Réduction de taille</div>
                            </div>

                            {/* Download */}
                            <button className="compressor-download-btn" onClick={download}>
                                <Download size={16} style={{ marginRight: "0.5rem", verticalAlign: "middle" }} />
                                Télécharger l'image compressée
                            </button>
                        </>
                    )}
                </div>
            </Container>
        </div>
    );
}
