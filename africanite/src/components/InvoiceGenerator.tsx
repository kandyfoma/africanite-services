import React, { useState, useMemo, useRef, useEffect } from "react";
import {
    Container, Row, Col, Form, Button, Card, Accordion, Badge,
} from "react-bootstrap";
import { motion } from "framer-motion";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faPlus, faTrash, faEye, faFilePdf, faPen,
    faCalculator, faUser, faCalendarDays, faClock,
    faTag, faFileInvoiceDollar, faMoneyBillWave,
    faCheck, faTimes, faMagicWandSparkles,
    faUniversity, faPalette,
} from "@fortawesome/free-solid-svg-icons";
import "../styles/Invoice.css";

// ─────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────
interface PublicHoliday {
    id: string;
    date: string;
    name: string;
}

interface ProviderInfo {
    name: string;
    company: string;
    address1: string;
    address2: string;
}

interface ClientInfo {
    company: string;
    vatNumber: string;
    address1: string;
    address2: string;
}

interface BankInfo {
    accountName: string;
    bankName: string;
    accountNumber: string;
    swiftCode: string;
    bankAddress: string;
}

interface InvoiceFormData {
    invoiceNumber: string;
    invoiceDate: string;
    dueDate: string;
    startDate: string;
    endDate: string;
    hourlyRate: number;
    hoursPerDay: number;
    serviceDescription: string;
    publicHolidays: PublicHoliday[];
    notes: string;
}

// ─────────────────────────────────────────────
// DEFAULT DATA (from extracted invoice PDF)
// ─────────────────────────────────────────────
const DEFAULT_PROVIDER: ProviderInfo = {
    name: "Kandy Foma",
    company: "",
    address1: "10 David Street, Alberton",
    address2: "Johannesburg, South Africa",
};

// ─────────────────────────────────────────────
// THEME
// ─────────────────────────────────────────────
type InvoiceTheme = "classic" | "emerald" | "obsidian";

const THEMES: { id: InvoiceTheme; label: string; accent: string; bg: string }[] = [
    { id: "classic",  label: "Classic Navy",    accent: "#1e3a5f", bg: "#eef3fb" },
    { id: "emerald",  label: "Emerald Green",   accent: "#14532d", bg: "#f0fdf4" },
    { id: "obsidian", label: "Obsidian",        accent: "#1c1c2e", bg: "#f1f1f3" },
];

// ─────────────────────────────────────────────
// LOCALSTORAGE — INVOICE NUMBER TRACKING
// ─────────────────────────────────────────────
const LS_INVOICE_KEY = "africanite_invoice_seq";
const LS_BANK_KEY    = "africanite_bank_details";
const LS_DRAFT_KEY   = "africanite_invoice_draft";

function getNextInvoiceNumber(): string {
    try {
        const stored = localStorage.getItem(LS_INVOICE_KEY);
        if (stored) {
            const last = parseInt(stored, 10);
            if (!isNaN(last)) return String(last + 1).padStart(3, "0");
        }
    } catch { /* localStorage unavailable */ }
    return "018"; // first-time default
}

function persistInvoiceNumber(num: string): void {
    try {
        const n = parseInt(num, 10);
        if (!isNaN(n)) localStorage.setItem(LS_INVOICE_KEY, String(n));
    } catch { /* ignore */ }
}

function loadBank(): BankInfo {
    try {
        const s = localStorage.getItem(LS_BANK_KEY);
        if (s) return JSON.parse(s) as BankInfo;
    } catch { /* ignore */ }
    return DEFAULT_BANK;
}

function persistBank(b: BankInfo): void {
    try { localStorage.setItem(LS_BANK_KEY, JSON.stringify(b)); } catch { /* ignore */ }
}

function loadDraft(): InvoiceFormData {
    try {
        const s = localStorage.getItem(LS_DRAFT_KEY);
        if (s) return JSON.parse(s) as InvoiceFormData;
    } catch { /* ignore */ }
    return buildDefaultFormData();
}

function persistDraft(data: InvoiceFormData): void {
    try { localStorage.setItem(LS_DRAFT_KEY, JSON.stringify(data)); } catch { /* ignore */ }
}

function clearDraft(): void {
    try { localStorage.removeItem(LS_DRAFT_KEY); } catch { /* ignore */ }
}

const DEFAULT_CLIENT: ClientInfo = {
    company: "GANITECH (PTY) LTD",
    vatNumber: "4760302390",
    address1: "218 Barkston Drive, Blairgowrie",
    address2: "Randburg, 2195",
};

const DEFAULT_BANK: BankInfo = {
    accountName: "FOMA KANDY",
    bankName: "Ecobank Congo, DRC",
    accountNumber: "35200024690",
    swiftCode: "ECOCCDKI",
    bankAddress: "Immeuble Future Tower, 3642 Boulevard du 30 Juin, Kinshasa, DRC",
};

function buildDefaultFormData(): InvoiceFormData {
    const today = new Date();
    
    // Auto-adjust service period based on 25th-to-25th pay cycle
    let startDate: Date;
    let endDate: Date;
    if (today.getDate() <= 25) {
        // Before or on 25th: period is 25th of last month to 25th of this month
        startDate = new Date(today.getFullYear(), today.getMonth() - 1, 25);
        endDate = new Date(today.getFullYear(), today.getMonth(), 25);
    } else {
        // After 25th: period is 25th of this month to 25th of next month
        startDate = new Date(today.getFullYear(), today.getMonth(), 25);
        endDate = new Date(today.getFullYear(), today.getMonth() + 1, 25);
    }
    
    const due = new Date(today);
    due.setMonth(due.getMonth() + 1);
    return {
        invoiceNumber: getNextInvoiceNumber(),
        invoiceDate: today.toISOString().split("T")[0],
        dueDate: due.toISOString().split("T")[0],
        startDate: startDate.toISOString().split("T")[0],
        endDate: endDate.toISOString().split("T")[0],
        hourlyRate: 650,
        hoursPerDay: 8,
        serviceDescription: "Consulting Services",
        publicHolidays: [],
        notes: "Payment is due within 30 days of the invoice date.",
    };
}

// ─────────────────────────────────────────────
// SOUTH AFRICAN PUBLIC HOLIDAYS ENGINE
// ─────────────────────────────────────────────

/** Calculates Easter Sunday date for a given year (Anonymous Gregorian algorithm) */
function getEasterSunday(year: number): Date {
    const a = year % 19;
    const b = Math.floor(year / 100);
    const c = year % 100;
    const d = Math.floor(b / 4);
    const e = b % 4;
    const f = Math.floor((b + 8) / 25);
    const g = Math.floor((b - f + 1) / 3);
    const h = (19 * a + b - d - g + 15) % 30;
    const i = Math.floor(c / 4);
    const k = c % 4;
    const l = (32 + 2 * e + 2 * i - h - k) % 7;
    const m = Math.floor((a + 11 * h + 22 * l) / 451);
    const month = Math.floor((h + l - 7 * m + 114) / 31); // 1-based
    const day = ((h + l - 7 * m + 114) % 31) + 1;
    return new Date(year, month - 1, day);
}

function addDays(date: Date, days: number): Date {
    const d = new Date(date);
    d.setDate(d.getDate() + days);
    return d;
}

function toYMD(date: Date): string {
    return date.toISOString().split("T")[0];
}

interface SuggestedHoliday {
    date: string;
    name: string;
    isWeekend: boolean;
    /** "observed" date when a holiday falls on Sunday → moved to Monday */
    observedDate?: string;
}

/** Returns all SA public holidays for the given year */
function getSAHolidays(year: number): SuggestedHoliday[] {
    const easter = getEasterSunday(year);

    const fixed: Array<[string, string]> = [
        [`${year}-01-01`, "New Year's Day"],
        [`${year}-03-21`, "Human Rights Day"],
        [`${year}-04-27`, "Freedom Day"],
        [`${year}-05-01`, "Workers' Day"],
        [`${year}-06-16`, "Youth Day"],
        [`${year}-08-09`, "National Women's Day"],
        [`${year}-09-24`, "Heritage Day"],
        [`${year}-12-16`, "Day of Reconciliation"],
        [`${year}-12-25`, "Christmas Day"],
        [`${year}-12-26`, "Day of Goodwill"],
    ];

    const moveable: Array<[Date, string]> = [
        [addDays(easter, -2), "Good Friday"],
        [addDays(easter, 1), "Family Day"],
    ];

    const all: SuggestedHoliday[] = [];

    for (const [dateStr, name] of fixed) {
        const d = new Date(dateStr + "T00:00:00");
        const dow = d.getDay();
        const isWeekend = dow === 0 || dow === 6;
        // SA rule: if public holiday falls on Sunday → following Monday is observed
        const observedDate =
            dow === 0 ? toYMD(addDays(d, 1)) : undefined;
        all.push({ date: dateStr, name, isWeekend, observedDate });
    }

    for (const [d, name] of moveable) {
        const dow = d.getDay();
        const isWeekend = dow === 0 || dow === 6;
        all.push({ date: toYMD(d), name, isWeekend });
    }

    return all.sort((a, b) => a.date.localeCompare(b.date));
}

/** Get SA holidays that fall within the service period (across multiple years if needed) */
function getSuggestedHolidays(start: string, end: string): SuggestedHoliday[] {
    if (!start || !end || start > end) return [];
    const startYear = new Date(start + "T00:00:00").getFullYear();
    const endYear = new Date(end + "T00:00:00").getFullYear();
    const results: SuggestedHoliday[] = [];
    for (let y = startYear; y <= endYear; y++) {
        for (const h of getSAHolidays(y)) {
            // Check the actual date OR the observed Monday
            const effectiveDate = h.observedDate ?? h.date;
            if (effectiveDate >= start && effectiveDate <= end) {
                results.push({ ...h, date: effectiveDate });
            }
        }
    }
    return results;
}

// ─────────────────────────────────────────────
// HELPER FUNCTIONS
// ─────────────────────────────────────────────
function countWorkingDays(start: string, end: string): number {
    if (!start || !end) return 0;
    const s = new Date(start + "T00:00:00");
    const e = new Date(end + "T00:00:00");
    if (s > e) return 0;
    let count = 0;
    const cur = new Date(s);
    while (cur <= e) {
        const d = cur.getDay();
        if (d !== 0 && d !== 6) count++;
        cur.setDate(cur.getDate() + 1);
    }
    return count;
}

function countHolidayWeekdays(holidays: PublicHoliday[], start: string, end: string): number {
    if (!start || !end || holidays.length === 0) return 0;
    const s = new Date(start + "T00:00:00");
    const e = new Date(end + "T00:00:00");
    return holidays.filter((h) => {
        if (!h.date) return false;
        const d = new Date(h.date + "T00:00:00");
        const day = d.getDay();
        return d >= s && d <= e && day !== 0 && day !== 6;
    }).length;
}

function formatDateLong(dateStr: string): string {
    if (!dateStr) return "";
    return new Date(dateStr + "T00:00:00").toLocaleDateString("en-ZA", {
        day: "numeric",
        month: "long",
        year: "numeric",
    });
}

function formatCurrency(amount: number): string {
    return `R\u00a0${amount.toLocaleString("en-ZA", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    })}`;
}

function uid(): string {
    return Math.random().toString(36).slice(2, 9);
}

// ─────────────────────────────────────────────
// COMPONENT
// ─────────────────────────────────────────────
const InvoiceGenerator: React.FC = () => {
    const [view, setView] = useState<"form" | "preview">("form");
    const [formData, setFormData] = useState<InvoiceFormData>(loadDraft);
    const [provider, setProvider] = useState<ProviderInfo>(DEFAULT_PROVIDER);
    const [client, setClient] = useState<ClientInfo>(DEFAULT_CLIENT);
    const [bank, setBank] = useState<BankInfo>(loadBank);
    const [bankSaved, setBankSaved] = useState(false);
    const [theme, setTheme] = useState<InvoiceTheme>("classic");
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
    const [pdfDownloaded, setPdfDownloaded] = useState(false);
    const [dismissedSuggestions, setDismissedSuggestions] = useState<Set<string>>(new Set());
    const invoiceRef = useRef<HTMLDivElement>(null);

    // ── Auto-save draft on every form change ──
    useEffect(() => { persistDraft(formData); }, [formData]);

    // ── SA Holiday suggestions ────────────────
    const allSuggestions = useMemo(
        () => getSuggestedHolidays(formData.startDate, formData.endDate),
        [formData.startDate, formData.endDate]
    );

    const pendingSuggestions = useMemo(
        () => allSuggestions.filter((s) => {
            if (dismissedSuggestions.has(s.date)) return false;
            // Already added by user
            return !formData.publicHolidays.some((h) => h.date === s.date);
        }),
        [allSuggestions, formData.publicHolidays, dismissedSuggestions]
    );

    const approveSuggestion = (s: SuggestedHoliday) => {
        update("publicHolidays", [
            ...formData.publicHolidays,
            { id: uid(), date: s.date, name: s.name },
        ]);
    };

    const dismissSuggestion = (date: string) => {
        setDismissedSuggestions((prev) => new Set([...prev, date]));
    };

    const approveAll = () => {
        const toAdd = pendingSuggestions.map((s) => ({ id: uid(), date: s.date, name: s.name }));
        update("publicHolidays", [...formData.publicHolidays, ...toAdd]);
    };

    // ── Computed values ─────────────────────
    const workingDays = useMemo(
        () => countWorkingDays(formData.startDate, formData.endDate),
        [formData.startDate, formData.endDate]
    );
    const holidayDays = useMemo(
        () => countHolidayWeekdays(formData.publicHolidays, formData.startDate, formData.endDate),
        [formData.publicHolidays, formData.startDate, formData.endDate]
    );
    const billableDays = Math.max(0, workingDays - holidayDays);
    const billableHours = billableDays * formData.hoursPerDay;
    const totalAmount = billableHours * formData.hourlyRate;

    // ── Handlers ────────────────────────────
    const update = <K extends keyof InvoiceFormData>(field: K, value: InvoiceFormData[K]) =>
        setFormData((prev) => ({ ...prev, [field]: value }));

    const addHoliday = () =>
        update("publicHolidays", [...formData.publicHolidays, { id: uid(), date: "", name: "" }]);

    const updateHoliday = (id: string, field: "date" | "name", value: string) =>
        update(
            "publicHolidays",
            formData.publicHolidays.map((h) => (h.id === id ? { ...h, [field]: value } : h))
        );

    const removeHoliday = (id: string) =>
        update("publicHolidays", formData.publicHolidays.filter((h) => h.id !== id));

    const validate = (): boolean => {
        const e: Record<string, string> = {};
        if (!formData.invoiceNumber.trim()) e.invoiceNumber = "Invoice number is required";
        if (!formData.invoiceDate) e.invoiceDate = "Invoice date is required";
        if (!formData.dueDate) e.dueDate = "Due date is required";
        if (!formData.startDate) e.startDate = "Start date is required";
        if (!formData.endDate) e.endDate = "End date is required";
        if (formData.startDate && formData.endDate && formData.startDate > formData.endDate)
            e.endDate = "End date must be after start date";
        if (!formData.hourlyRate || formData.hourlyRate <= 0)
            e.hourlyRate = "Hourly rate must be greater than 0";
        if (!formData.hoursPerDay || formData.hoursPerDay <= 0)
            e.hoursPerDay = "Hours per day must be greater than 0";
        setErrors(e);
        return Object.keys(e).length === 0;
    };

    const handlePreview = () => { if (validate()) { setView("preview"); setPdfDownloaded(false); } };

    const handleNewInvoice = () => {
        clearDraft();
        setFormData(buildDefaultFormData());
        setPdfDownloaded(false);
        setErrors({});
        setDismissedSuggestions(new Set());
        setView("form");
    };

    const handleDownloadPDF = async () => {
        if (!invoiceRef.current) return;
        setIsGeneratingPDF(true);
        try {
            const html2canvas = (await import("html2canvas")).default;
            const { jsPDF } = await import("jspdf");
            const el = invoiceRef.current;
            const canvas = await html2canvas(el, {
                scale: 2,
                useCORS: true,
                backgroundColor: "#ffffff",
                logging: false,
                width: el.offsetWidth,
                height: el.scrollHeight,
            });
            const imgData = canvas.toDataURL("image/png");
            // Use custom page size matching the invoice content
            const mmPerPx = 0.264583; // 1px = 0.264583mm at 96dpi
            const pageW = el.offsetWidth * mmPerPx;
            const pageH = el.scrollHeight * mmPerPx;
            const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: [pageW, pageH] });
            pdf.addImage(imgData, "PNG", 0, 0, pageW, pageH);
            pdf.save(`Invoice-INV-${formData.invoiceNumber}-${formData.invoiceDate}.pdf`);
            // Persist this invoice number so the next session auto-increments
            persistInvoiceNumber(formData.invoiceNumber);
            setPdfDownloaded(true);
        } catch (err) {
            console.error("PDF generation error:", err);
            alert("Could not generate PDF. Please try again.");
        } finally {
            setIsGeneratingPDF(false);
        }
    };

    // ─────────────────────────────────────────────
    // FORM VIEW
    // ─────────────────────────────────────────────
    if (view === "form") {
        return (
            <div className="inv-page">
                <Container className="py-5">
                    <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
                        <div className="text-center mb-5">
                            <div className="inv-page-icon">
                                <FontAwesomeIcon icon={faFileInvoiceDollar} />
                            </div>
                            <h1 className="inv-page-title">Invoice Generator</h1>
                            <p className="inv-page-sub">Generate professional monthly invoices in seconds</p>
                        </div>
                    </motion.div>

                    <Row className="g-4">
                        {/* ── Left column: form ── */}
                        <Col lg={8}>
                            {/* Invoice Details */}
                            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                                <Card className="inv-card mb-4">
                                    <Card.Body>
                                        <h5 className="inv-section-title">
                                            <FontAwesomeIcon icon={faTag} className="me-2" />
                                            Invoice Details
                                        </h5>
                                        <Row>
                                            <Col md={4}>
                                                <Form.Group className="mb-3">
                                                    <Form.Label className="d-flex align-items-center gap-2">
                                                        Invoice Number *
                                                        <Badge bg="success" style={{ fontSize: "0.65rem", fontWeight: 600 }}>Auto-tracked</Badge>
                                                    </Form.Label>
                                                    <Form.Control
                                                        type="text"
                                                        value={formData.invoiceNumber}
                                                        onChange={(e) => update("invoiceNumber", e.target.value)}
                                                        isInvalid={!!errors.invoiceNumber}
                                                        placeholder="e.g. 018"
                                                    />
                                                    <Form.Text className="text-muted" style={{ fontSize: "0.75rem" }}>
                                                        Auto-increments after each PDF download
                                                    </Form.Text>
                                                    <Form.Control.Feedback type="invalid">{errors.invoiceNumber}</Form.Control.Feedback>
                                                </Form.Group>
                                            </Col>
                                            <Col md={4}>
                                                <Form.Group className="mb-3">
                                                    <Form.Label>Invoice Date *</Form.Label>
                                                    <Form.Control
                                                        type="date"
                                                        value={formData.invoiceDate}
                                                        onChange={(e) => update("invoiceDate", e.target.value)}
                                                        isInvalid={!!errors.invoiceDate}
                                                    />
                                                    <Form.Control.Feedback type="invalid">{errors.invoiceDate}</Form.Control.Feedback>
                                                </Form.Group>
                                            </Col>
                                            <Col md={4}>
                                                <Form.Group className="mb-3">
                                                    <Form.Label>Payment Due Date *</Form.Label>
                                                    <Form.Control
                                                        type="date"
                                                        value={formData.dueDate}
                                                        onChange={(e) => update("dueDate", e.target.value)}
                                                        isInvalid={!!errors.dueDate}
                                                    />
                                                    <Form.Control.Feedback type="invalid">{errors.dueDate}</Form.Control.Feedback>
                                                </Form.Group>
                                            </Col>
                                        </Row>
                                    </Card.Body>
                                </Card>
                            </motion.div>

                            {/* Service Period */}
                            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
                                <Card className="inv-card mb-4">
                                    <Card.Body>
                                        <h5 className="inv-section-title">
                                            <FontAwesomeIcon icon={faCalendarDays} className="me-2" />
                                            Service Period
                                        </h5>
                                        <Row>
                                            <Col md={6}>
                                                <Form.Group className="mb-3">
                                                    <Form.Label>Start Date *</Form.Label>
                                                    <Form.Control
                                                        type="date"
                                                        value={formData.startDate}
                                                        onChange={(e) => update("startDate", e.target.value)}
                                                        isInvalid={!!errors.startDate}
                                                    />
                                                    <Form.Control.Feedback type="invalid">{errors.startDate}</Form.Control.Feedback>
                                                </Form.Group>
                                            </Col>
                                            <Col md={6}>
                                                <Form.Group className="mb-3">
                                                    <Form.Label>End Date *</Form.Label>
                                                    <Form.Control
                                                        type="date"
                                                        value={formData.endDate}
                                                        onChange={(e) => update("endDate", e.target.value)}
                                                        isInvalid={!!errors.endDate}
                                                    />
                                                    <Form.Control.Feedback type="invalid">{errors.endDate}</Form.Control.Feedback>
                                                </Form.Group>
                                            </Col>
                                        </Row>
                                        <Form.Group>
                                            <Form.Label>Service Description</Form.Label>
                                            <Form.Control
                                                type="text"
                                                value={formData.serviceDescription}
                                                onChange={(e) => update("serviceDescription", e.target.value)}
                                                placeholder="e.g. Consulting Services"
                                            />
                                        </Form.Group>
                                    </Card.Body>
                                </Card>
                            </motion.div>

                            {/* Billing Rate */}
                            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                                <Card className="inv-card mb-4">
                                    <Card.Body>
                                        <h5 className="inv-section-title">
                                            <FontAwesomeIcon icon={faMoneyBillWave} className="me-2" />
                                            Billing Rate
                                        </h5>
                                        <Row>
                                            <Col md={6}>
                                                <Form.Group className="mb-3">
                                                    <Form.Label>Hourly Rate (R) *</Form.Label>
                                                    <div className="input-group">
                                                        <span className="input-group-text inv-input-prefix">R</span>
                                                        <Form.Control
                                                            type="number"
                                                            min="0"
                                                            step="0.01"
                                                            value={formData.hourlyRate}
                                                            onChange={(e) => update("hourlyRate", parseFloat(e.target.value) || 0)}
                                                            isInvalid={!!errors.hourlyRate}
                                                        />
                                                        <Form.Control.Feedback type="invalid">{errors.hourlyRate}</Form.Control.Feedback>
                                                    </div>
                                                </Form.Group>
                                            </Col>
                                            <Col md={6}>
                                                <Form.Group className="mb-3">
                                                    <Form.Label>Hours Per Working Day *</Form.Label>
                                                    <div className="input-group">
                                                        <Form.Control
                                                            type="number"
                                                            min="1"
                                                            max="24"
                                                            value={formData.hoursPerDay}
                                                            onChange={(e) => update("hoursPerDay", parseInt(e.target.value) || 8)}
                                                            isInvalid={!!errors.hoursPerDay}
                                                        />
                                                        <span className="input-group-text inv-input-suffix">hrs/day</span>
                                                        <Form.Control.Feedback type="invalid">{errors.hoursPerDay}</Form.Control.Feedback>
                                                    </div>
                                                </Form.Group>
                                            </Col>
                                        </Row>
                                    </Card.Body>
                                </Card>
                            </motion.div>

                            {/* Public Holidays */}
                            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
                                <Card className="inv-card mb-4">
                                    <Card.Body>
                                        <div className="d-flex justify-content-between align-items-center mb-3">
                                            <h5 className="inv-section-title mb-0">
                                                <FontAwesomeIcon icon={faClock} className="me-2" />
                                                Public Holidays
                                                {formData.publicHolidays.length > 0 && (
                                                    <Badge bg="warning" text="dark" className="ms-2">
                                                        {formData.publicHolidays.length} deducted
                                                    </Badge>
                                                )}
                                            </h5>
                                            <Button variant="outline-success" size="sm" onClick={addHoliday}>
                                                <FontAwesomeIcon icon={faPlus} className="me-1" />
                                                Add Manual
                                            </Button>
                                        </div>

                                        {/* SA Holiday Suggestions */}
                                        {pendingSuggestions.length > 0 && (
                                            <div className="inv-suggestions-box mb-3">
                                                <div className="inv-suggestions-header">
                                                    <span>
                                                        <FontAwesomeIcon icon={faMagicWandSparkles} className="me-2" />
                                                        <strong>{pendingSuggestions.length} South African public holiday{pendingSuggestions.length > 1 ? "s" : ""}</strong>
                                                        {" "}detected in your period — did you have these off?
                                                    </span>
                                                    {pendingSuggestions.length > 1 && (
                                                        <Button
                                                            size="sm"
                                                            className="inv-approve-all-btn"
                                                            onClick={approveAll}
                                                        >
                                                            <FontAwesomeIcon icon={faCheck} className="me-1" />
                                                            Yes to all
                                                        </Button>
                                                    )}
                                                </div>
                                                <div className="inv-suggestions-list">
                                                    {pendingSuggestions.map((s) => {
                                                        const dow = new Date(s.date + "T00:00:00").toLocaleDateString("en-ZA", { weekday: "long" });
                                                        return (
                                                            <div key={s.date} className="inv-suggestion-row">
                                                                <div className="inv-suggestion-info">
                                                                    <span className="inv-suggestion-name">{s.name}</span>
                                                                    <span className="inv-suggestion-date">{formatDateLong(s.date)} &middot; {dow}</span>
                                                                </div>
                                                                <div className="inv-suggestion-actions">
                                                                    <button
                                                                        className="inv-sug-btn approve"
                                                                        onClick={() => approveSuggestion(s)}
                                                                        title="Yes, I was off — deduct this day"
                                                                    >
                                                                        <FontAwesomeIcon icon={faCheck} className="me-1" />
                                                                        I was off
                                                                    </button>
                                                                    <button
                                                                        className="inv-sug-btn dismiss"
                                                                        onClick={() => dismissSuggestion(s.date)}
                                                                        title="No, I worked this day — ignore it"
                                                                    >
                                                                        <FontAwesomeIcon icon={faTimes} className="me-1" />
                                                                        I worked
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        )}

                                        {/* Already-approved holidays */}
                                        {formData.publicHolidays.length === 0 && pendingSuggestions.length === 0 ? (
                                            <div className="inv-empty-holidays">
                                                <p className="mb-0">
                                                    {formData.startDate && formData.endDate
                                                        ? "No South African public holidays fall within your service period, or all have been reviewed. You can still add one manually."
                                                        : "Set your service period above — SA public holidays will be suggested automatically."
                                                    }
                                                </p>
                                            </div>
                                        ) : formData.publicHolidays.length > 0 ? (
                                            <div>
                                                {formData.publicHolidays.map((h) => {
                                                    const isOutsidePeriod =
                                                        h.date &&
                                                        (h.date < formData.startDate || h.date > formData.endDate);
                                                    const d = h.date ? new Date(h.date + "T00:00:00") : null;
                                                    const isWeekend = d ? d.getDay() === 0 || d.getDay() === 6 : false;
                                                    return (
                                                        <div key={h.id} className="inv-holiday-row">
                                                            <Row className="align-items-end g-2">
                                                                <Col md={4}>
                                                                    <Form.Group>
                                                                        <Form.Label className="small fw-semibold">Date</Form.Label>
                                                                        <Form.Control
                                                                            type="date"
                                                                            size="sm"
                                                                            value={h.date}
                                                                            onChange={(e) => updateHoliday(h.id, "date", e.target.value)}
                                                                        />
                                                                    </Form.Group>
                                                                </Col>
                                                                <Col md={6}>
                                                                    <Form.Group>
                                                                        <Form.Label className="small fw-semibold">Holiday Name</Form.Label>
                                                                        <Form.Control
                                                                            type="text"
                                                                            size="sm"
                                                                            value={h.name}
                                                                            placeholder="e.g. Workers Day"
                                                                            onChange={(e) => updateHoliday(h.id, "name", e.target.value)}
                                                                        />
                                                                    </Form.Group>
                                                                </Col>
                                                                <Col md={2}>
                                                                    <Button
                                                                        variant="outline-danger"
                                                                        size="sm"
                                                                        className="w-100"
                                                                        onClick={() => removeHoliday(h.id)}
                                                                    >
                                                                        <FontAwesomeIcon icon={faTrash} />
                                                                    </Button>
                                                                </Col>
                                                            </Row>
                                                            {isOutsidePeriod && (
                                                                <small className="text-warning d-block mt-1">
                                                                    ⚠ This date is outside the service period — it will not be deducted.
                                                                </small>
                                                            )}
                                                            {isWeekend && (
                                                                <small className="text-muted d-block mt-1">
                                                                    ℹ This falls on a weekend — no deduction applied.
                                                                </small>
                                                            )}
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        ) : null}
                                    </Card.Body>
                                </Card>
                            </motion.div>

                            {/* Notes */}
                            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
                                <Card className="inv-card mb-4">
                                    <Card.Body>
                                        <h5 className="inv-section-title">Notes / Payment Terms</h5>
                                        <Form.Control
                                            as="textarea"
                                            rows={2}
                                            value={formData.notes}
                                            onChange={(e) => update("notes", e.target.value)}
                                            placeholder="Payment terms, additional notes..."
                                        />
                                    </Card.Body>
                                </Card>
                            </motion.div>

                            {/* Provider, Client & Bank (collapsible) */}
                            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}>
                                <Accordion className="mb-4 inv-accordion">
                                    <Accordion.Item eventKey="0">
                                        <Accordion.Header>
                                            <FontAwesomeIcon icon={faUser} className="me-2" />
                                            Provider &amp; Client Details
                                            <span className="ms-2 text-muted" style={{ fontSize: "0.8rem", fontWeight: 400 }}>
                                                (click to edit)
                                            </span>
                                        </Accordion.Header>
                                        <Accordion.Body>
                                            <Row>
                                                <Col md={6}>
                                                    <h6 className="inv-party-heading">FROM — Your Details</h6>
                                                    {(["name", "company", "address1", "address2"] as (keyof ProviderInfo)[]).map((field) => (
                                                        <Form.Group className="mb-2" key={field}>
                                                            <Form.Label className="small text-capitalize">{field.replace(/([A-Z])/g, " $1")}</Form.Label>
                                                            <Form.Control
                                                                type="text"
                                                                size="sm"
                                                                value={provider[field]}
                                                                onChange={(e) => setProvider((p) => ({ ...p, [field]: e.target.value }))}
                                                            />
                                                        </Form.Group>
                                                    ))}
                                                </Col>
                                                <Col md={6}>
                                                    <h6 className="inv-party-heading">BILL TO — Client Details</h6>
                                                    {(["company", "vatNumber", "address1", "address2"] as (keyof ClientInfo)[]).map((field) => (
                                                        <Form.Group className="mb-2" key={field}>
                                                            <Form.Label className="small text-capitalize">{field.replace(/([A-Z])/g, " $1")}</Form.Label>
                                                            <Form.Control
                                                                type="text"
                                                                size="sm"
                                                                value={client[field]}
                                                                onChange={(e) => setClient((c) => ({ ...c, [field]: e.target.value }))}
                                                            />
                                                        </Form.Group>
                                                    ))}
                                                </Col>
                                            </Row>
                                        </Accordion.Body>
                                    </Accordion.Item>

                                    {/* ── Bank Details ── */}
                                    <Accordion.Item eventKey="1">
                                        <Accordion.Header>
                                            <FontAwesomeIcon icon={faUniversity} className="me-2" />
                                            Banking Details
                                            <span className="ms-2 text-muted" style={{ fontSize: "0.8rem", fontWeight: 400 }}>
                                                (saved in your browser)
                                            </span>
                                        </Accordion.Header>
                                        <Accordion.Body>
                                            <p className="text-muted" style={{ fontSize: "0.82rem" }}>
                                                These details appear on every invoice. Changes are saved automatically in your browser — no login needed.
                                            </p>
                                            <Row>
                                                <Col md={6}>
                                                    <Form.Group className="mb-2">
                                                        <Form.Label className="small">Account Name</Form.Label>
                                                        <Form.Control size="sm" value={bank.accountName}
                                                            onChange={(e) => setBank((b) => ({ ...b, accountName: e.target.value }))} />
                                                    </Form.Group>
                                                    <Form.Group className="mb-2">
                                                        <Form.Label className="small">Bank Name</Form.Label>
                                                        <Form.Control size="sm" value={bank.bankName}
                                                            onChange={(e) => setBank((b) => ({ ...b, bankName: e.target.value }))} />
                                                    </Form.Group>
                                                    <Form.Group className="mb-2">
                                                        <Form.Label className="small">Account Number</Form.Label>
                                                        <Form.Control size="sm" value={bank.accountNumber}
                                                            onChange={(e) => setBank((b) => ({ ...b, accountNumber: e.target.value }))} />
                                                    </Form.Group>
                                                </Col>
                                                <Col md={6}>
                                                    <Form.Group className="mb-2">
                                                        <Form.Label className="small">SWIFT / BIC Code</Form.Label>
                                                        <Form.Control size="sm" value={bank.swiftCode}
                                                            onChange={(e) => setBank((b) => ({ ...b, swiftCode: e.target.value }))} />
                                                    </Form.Group>
                                                    <Form.Group className="mb-2">
                                                        <Form.Label className="small">Bank Address</Form.Label>
                                                        <Form.Control as="textarea" rows={2} size="sm" value={bank.bankAddress}
                                                            onChange={(e) => setBank((b) => ({ ...b, bankAddress: e.target.value }))} />
                                                    </Form.Group>
                                                </Col>
                                            </Row>
                                            <div className="d-flex align-items-center gap-2 mt-2">
                                                <Button
                                                    size="sm"
                                                    className="inv-save-bank-btn"
                                                    onClick={() => { persistBank(bank); setBankSaved(true); setTimeout(() => setBankSaved(false), 3000); }}
                                                >
                                                    <FontAwesomeIcon icon={faUniversity} className="me-1" />
                                                    Save Banking Details
                                                </Button>
                                                {bankSaved && (
                                                    <span className="text-success" style={{ fontSize: "0.82rem", fontWeight: 600 }}>
                                                        <FontAwesomeIcon icon={faCheck} className="me-1" />
                                                        Saved to your browser!
                                                    </span>
                                                )}
                                            </div>
                                        </Accordion.Body>
                                    </Accordion.Item>
                                </Accordion>
                            </motion.div>
                        </Col>

                        {/* ── Right column: summary ── */}
                        <Col lg={4}>
                            <motion.div
                                className="sticky-top"
                                style={{ top: "80px" }}
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.2 }}
                            >
                                <Card className="inv-summary-card">
                                    <Card.Header className="inv-summary-header">
                                        <FontAwesomeIcon icon={faCalculator} className="me-2" />
                                        Live Invoice Summary
                                    </Card.Header>
                                    <Card.Body className="p-0">
                                        <div className="inv-summary-body">
                                            <div className="inv-summary-row">
                                                <span className="inv-summary-label">Working Days</span>
                                                <span className="inv-summary-value">{workingDays}</span>
                                            </div>
                                            <div className="inv-summary-row holiday">
                                                <span className="inv-summary-label">Public Holidays (deducted)</span>
                                                <span className="inv-summary-value holiday">− {holidayDays}</span>
                                            </div>
                                            <div className="inv-summary-row separator">
                                                <span className="inv-summary-label fw-bold">Billable Days</span>
                                                <span className="inv-summary-value billable">{billableDays}</span>
                                            </div>
                                            <div className="inv-summary-row">
                                                <span className="inv-summary-label">Hours per Day</span>
                                                <span className="inv-summary-value">{formData.hoursPerDay} h</span>
                                            </div>
                                            <div className="inv-summary-row">
                                                <span className="inv-summary-label">Total Billable Hours</span>
                                                <span className="inv-summary-value">{billableHours} h</span>
                                            </div>
                                            <div className="inv-summary-row">
                                                <span className="inv-summary-label">Hourly Rate</span>
                                                <span className="inv-summary-value">R {formData.hourlyRate.toFixed(2)}</span>
                                            </div>
                                        </div>
                                        <div className="inv-summary-total">
                                            <div className="inv-total-label">TOTAL INVOICE AMOUNT</div>
                                            <div className="inv-total-value">{formatCurrency(totalAmount)}</div>
                                        </div>
                                        <div className="p-3">
                                            <Button className="w-100 inv-preview-btn" size="lg" onClick={handlePreview}>
                                                <FontAwesomeIcon icon={faEye} className="me-2" />
                                                Preview Invoice
                                            </Button>
                                        </div>
                                    </Card.Body>
                                </Card>

                                {/* Period info */}
                                {formData.startDate && formData.endDate && (
                                    <div className="inv-period-info mt-3">
                                        <div className="inv-period-label">Service Period</div>
                                        <div className="inv-period-value">
                                            {formatDateLong(formData.startDate)}
                                            <span className="inv-period-to"> to </span>
                                            {formatDateLong(formData.endDate)}
                                        </div>
                                    </div>
                                )}
                            </motion.div>
                        </Col>
                    </Row>
                </Container>
            </div>
        );
    }

    // ─────────────────────────────────────────────
    // PREVIEW / INVOICE PAPER VIEW
    // ─────────────────────────────────────────────
    const billableHolidays = formData.publicHolidays.filter((h) => {
        if (!h.date) return false;
        const d = new Date(h.date + "T00:00:00");
        const day = d.getDay();
        return (
            day !== 0 && day !== 6 &&
            h.date >= formData.startDate &&
            h.date <= formData.endDate
        );
    });

    return (
        <div className="inv-preview-page">
            {/* Toolbar */}
            <div className="inv-toolbar">
                <Container>
                    <div className="inv-toolbar-inner">
                        <div className="d-flex align-items-center gap-2">
                            <span className="inv-toolbar-title">Invoice INV-{formData.invoiceNumber}</span>
                            {pdfDownloaded
                                ? <Badge bg="success">✓ Downloaded</Badge>
                                : <Badge bg="secondary">Preview</Badge>
                            }
                        </div>
                        {/* Theme Switcher */}
                        <div className="inv-theme-switcher">
                            <FontAwesomeIcon icon={faPalette} className="inv-theme-icon" />
                            {THEMES.map((t) => (
                                <button
                                    key={t.id}
                                    className={`inv-theme-chip ${theme === t.id ? "active" : ""}`}
                                    style={{ "--chip-color": t.accent } as React.CSSProperties}
                                    onClick={() => setTheme(t.id)}
                                    title={t.label}
                                >
                                    <span className="inv-theme-dot" style={{ background: t.accent }} />
                                    {t.label}
                                </button>
                            ))}
                        </div>
                        <div className="d-flex gap-2 align-items-center">
                            {pdfDownloaded && (
                                <span className="inv-next-hint">
                                    Next invoice will be INV-{String(parseInt(formData.invoiceNumber, 10) + 1).padStart(3, "0")}
                                </span>
                            )}
                            <Button variant="outline-secondary" onClick={() => setView("form")}>
                                <FontAwesomeIcon icon={faPen} className="me-2" />
                                Edit
                            </Button>
                            {pdfDownloaded ? (
                                <Button className="inv-new-btn" onClick={handleNewInvoice}>
                                    <FontAwesomeIcon icon={faPlus} className="me-2" />
                                    New Invoice
                                </Button>
                            ) : (
                                <Button
                                    className="inv-dl-btn"
                                    onClick={handleDownloadPDF}
                                    disabled={isGeneratingPDF}
                                >
                                    <FontAwesomeIcon icon={faFilePdf} className="me-2" />
                                    {isGeneratingPDF ? "Generating PDF…" : "Download PDF"}
                                </Button>
                            )}
                        </div>
                    </div>
                </Container>
            </div>

            {/* A4 Paper */}
            <div className="inv-paper-wrap">
                <div className={`inv-paper inv-theme-${theme}`} ref={invoiceRef}>

                    {/* ══════════════════════════════════════════
                        THEME: CLASSIC NAVY  (default)
                        Clean corporate, gold accent bars
                    ══════════════════════════════════════════ */}
                    {theme === "classic" && (<>
                        <div className="inv-accent-bar top" />
                        <div className="inv-header">
                            <div className="inv-from-block">
                                {provider.company && <div className="inv-from-company">{provider.company}</div>}
                                <div className="inv-from-name" style={!provider.company ? { fontSize: "22px", fontWeight: 800 } : {}}>{provider.name}</div>
                                <div className="inv-from-address">{provider.address1}</div>
                                <div className="inv-from-address">{provider.address2}</div>
                            </div>
                            <div className="inv-meta-block">
                                <div className="inv-title-word">INVOICE</div>
                                <table className="inv-meta-table"><tbody>
                                    <tr><td className="inv-meta-label">Invoice #</td><td className="inv-meta-val">INV-{formData.invoiceNumber}</td></tr>
                                    <tr><td className="inv-meta-label">Invoice Date</td><td className="inv-meta-val">{formatDateLong(formData.invoiceDate)}</td></tr>
                                    <tr><td className="inv-meta-label">Due Date</td><td className="inv-meta-val inv-due">{formatDateLong(formData.dueDate)}</td></tr>
                                    <tr><td className="inv-meta-label">Status</td><td className="inv-meta-val inv-status-unpaid">UNPAID</td></tr>
                                </tbody></table>
                            </div>
                        </div>
                        <div className="inv-rule" />
                        <div className="inv-parties">
                            <div>
                                <div className="inv-party-tag">BILL TO</div>
                                <div className="inv-party-company">{client.company}</div>
                                {client.vatNumber && <div className="inv-party-detail">VAT Registration No: {client.vatNumber}</div>}
                                <div className="inv-party-detail">{client.address1}</div>
                                <div className="inv-party-detail">{client.address2}</div>
                            </div>
                        </div>
                    </>)}

                    {/* ══════════════════════════════════════════
                        THEME: EMERALD GREEN
                        Modern, sidebar stripe left
                    ══════════════════════════════════════════ */}
                    {theme === "emerald" && (<>
                        <div className="em-sidebar" />
                        <div className="em-header">
                            <div className="em-from-block">
                                {provider.company && <div className="em-company">{provider.company}</div>}
                                <div className="em-name">{provider.name}</div>
                                <div className="em-addr">{provider.address1}</div>
                                <div className="em-addr">{provider.address2}</div>
                            </div>
                            <div className="em-badge-block">
                                <div className="em-title-badge">INVOICE</div>
                                <div className="em-inv-num">INV-{formData.invoiceNumber}</div>
                                <div className="em-meta-row"><span className="em-ml">Date</span><span className="em-mv">{formatDateLong(formData.invoiceDate)}</span></div>
                                <div className="em-meta-row"><span className="em-ml">Due</span><span className="em-mv em-due">{formatDateLong(formData.dueDate)}</span></div>
                                <div className="em-meta-row"><span className="em-ml">Status</span><span className="em-status">UNPAID</span></div>
                            </div>
                        </div>
                        <div className="em-bill-to-wrap">
                            <div className="em-bill-tag">BILL TO</div>
                            <div className="em-bill-company">{client.company}</div>
                            {client.vatNumber && <div className="em-bill-detail">VAT: {client.vatNumber}</div>}
                            <div className="em-bill-detail">{client.address1} · {client.address2}</div>
                        </div>
                    </>)}

                    {/* ══════════════════════════════════════════
                        THEME: OBSIDIAN DARK
                        Dark header band, minimal white body
                    ══════════════════════════════════════════ */}
                    {theme === "obsidian" && (<>
                        <div className="ob-header">
                            <div className="ob-header-left">
                                {provider.company && <div className="ob-company">{provider.company}</div>}
                                <div className="ob-name">{provider.name}</div>
                                <div className="ob-addr">{provider.address1}</div>
                                <div className="ob-addr">{provider.address2}</div>
                            </div>
                            <div className="ob-header-right">
                                <div className="ob-invoice-word">INVOICE</div>
                                <div className="ob-inv-num">INV-{formData.invoiceNumber}</div>
                            </div>
                        </div>
                        <div className="ob-meta-strip">
                            <div className="ob-meta-cell"><div className="ob-mc-label">INVOICE DATE</div><div className="ob-mc-val">{formatDateLong(formData.invoiceDate)}</div></div>
                            <div className="ob-meta-cell"><div className="ob-mc-label">DUE DATE</div><div className="ob-mc-val ob-due">{formatDateLong(formData.dueDate)}</div></div>
                            <div className="ob-meta-cell"><div className="ob-mc-label">STATUS</div><div className="ob-mc-val ob-unpaid">UNPAID</div></div>
                        </div>
                        <div className="ob-bill-to">
                            <span className="ob-bill-tag">BILL TO</span>
                            <div className="ob-bill-company">{client.company}</div>
                            {client.vatNumber && <div className="ob-bill-detail">VAT Registration No: {client.vatNumber}</div>}
                            <div className="ob-bill-detail">{client.address1} · {client.address2}</div>
                        </div>
                    </>)}

                    {/* ══════════════════════════════════════════
                        SHARED: Line Items, Totals, Payment, Notes, Footer
                    ══════════════════════════════════════════ */}

                    {/* Line Items Table */}
                    <div className="inv-table-wrap">
                        <table className="inv-table">
                            <thead>
                                <tr className="inv-thead">
                                    <th className="inv-th inv-col-desc">DESCRIPTION</th>
                                    <th className="inv-th inv-col-period">SERVICE PERIOD</th>
                                    <th className="inv-th inv-col-qty">QTY</th>
                                    <th className="inv-th inv-col-rate">UNIT PRICE</th>
                                    <th className="inv-th inv-col-amt">AMOUNT</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr className="inv-row">
                                    <td className="inv-td inv-col-desc">
                                        <div className="inv-service-name">{formData.serviceDescription}</div>
                                        <div className="inv-service-meta">
                                            <span>Working Days: {workingDays}</span>
                                            {holidayDays > 0 && <span> &nbsp;·&nbsp; Public Holidays: −{holidayDays}</span>}
                                            <span> &nbsp;·&nbsp; Billable Days: {billableDays}</span>
                                        </div>
                                    </td>
                                    <td className="inv-td inv-col-period">
                                        <span className="inv-period-from">{formatDateLong(formData.startDate)}</span>
                                        <span className="inv-period-sep"> to </span>
                                        <span className="inv-period-to-inv">{formatDateLong(formData.endDate)}</span>
                                    </td>
                                    <td className="inv-td inv-col-qty">{billableHours}&nbsp;h</td>
                                    <td className="inv-td inv-col-rate">R&nbsp;{formData.hourlyRate.toFixed(2)}/h</td>
                                    <td className="inv-td inv-col-amt">{formatCurrency(totalAmount)}</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>

                    {/* Public Holidays Section */}
                    {billableHolidays.length > 0 && (
                        <div className="inv-holidays">
                            <div className="inv-holidays-title">PUBLIC HOLIDAYS DEDUCTED WITHIN PERIOD</div>
                            {billableHolidays.map((h) => (
                                <div key={h.id} className="inv-holiday-item">
                                    <span className="inv-h-bullet">●</span>
                                    <span className="inv-h-name">{h.name || "Public Holiday"}</span>
                                    <span className="inv-h-date">{" "}&mdash;{" "}{formatDateLong(h.date)}</span>
                                    <span className="inv-h-impact">
                                        {" "}({formData.hoursPerDay}h @ R{formData.hourlyRate.toFixed(2)}/h
                                        {" "}= −{formatCurrency(formData.hoursPerDay * formData.hourlyRate)})
                                    </span>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Totals */}
                    <div className="inv-totals-wrap">
                        <table className="inv-totals-table"><tbody>
                            <tr>
                                <td className="inv-tot-label">Subtotal</td>
                                <td className="inv-tot-val">{formatCurrency(totalAmount)}</td>
                            </tr>
                            <tr>
                                <td className="inv-tot-label">VAT (0%)</td>
                                <td className="inv-tot-val">R 0.00</td>
                            </tr>
                            <tr className="inv-tot-final">
                                <td className="inv-tot-label final">TOTAL DUE</td>
                                <td className="inv-tot-val final">{formatCurrency(totalAmount)}</td>
                            </tr>
                        </tbody></table>
                    </div>

                    {/* Payment Details */}
                    <div className="inv-payment">
                        <div className="inv-payment-title">PAYMENT DETAILS</div>
                        <div className="inv-payment-rows">
                            {bank.accountName  && <div className="inv-pay-row"><span className="inv-pay-label">Account Name</span><span className="inv-pay-val">{bank.accountName}</span></div>}
                            {bank.bankName     && <div className="inv-pay-row"><span className="inv-pay-label">Bank Name</span><span className="inv-pay-val">{bank.bankName}</span></div>}
                            {bank.accountNumber && <div className="inv-pay-row"><span className="inv-pay-label">Account Number</span><span className="inv-pay-val">{bank.accountNumber}</span></div>}
                            {bank.swiftCode    && <div className="inv-pay-row"><span className="inv-pay-label">SWIFT / BIC Code</span><span className="inv-pay-val">{bank.swiftCode}</span></div>}
                            {bank.bankAddress  && <div className="inv-pay-row"><span className="inv-pay-label">Bank Address</span><span className="inv-pay-val">{bank.bankAddress}</span></div>}
                        </div>
                    </div>

                    {/* Notes */}
                    {formData.notes && (
                        <div className="inv-notes">
                            <span className="inv-notes-label">NOTES &amp; TERMS: </span>
                            <span className="inv-notes-text">{formData.notes}</span>
                        </div>
                    )}

                    {/* Footer */}
                    <div className="inv-footer">
                        <div className="inv-footer-line" />
                        <div className="inv-footer-content">
                            <span className="inv-footer-thanks">Thank you for your business!</span>
                            <span className="inv-footer-company">{provider.company ? `${provider.company} · ` : ""}{provider.name}</span>
                        </div>
                    </div>

                    {theme === "classic" && <div className="inv-accent-bar bottom" />}
                    {theme === "emerald"  && <div className="em-footer-bar" />}
                    {theme === "obsidian" && <div className="ob-footer-bar" />}
                </div>
            </div>
        </div>
    );
};

export default InvoiceGenerator;
