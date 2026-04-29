import React, { useState, useMemo, useRef, useEffect } from "react";
import {
    Container, Row, Col, Form, Button, Card, Accordion, Badge, Modal,
} from "react-bootstrap";
import { motion } from "framer-motion";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faPlus, faTrash, faEye, faFilePdf, faPen,
    faCalculator, faUser, faCalendarDays, faClock,
    faTag, faFileInvoiceDollar, faMoneyBillWave,
    faCheck, faTimes, faMagicWandSparkles,
    faUniversity, faPalette, faEnvelope, faPaperPlane,
    faClock as faClockRegular, faCheckCircle, faLink,
} from "@fortawesome/free-solid-svg-icons";
import "../styles/Invoice.css";
import { sendInvoiceNow, scheduleInvoice, getScheduledInvoicesList, deleteScheduledInvoiceById, ScheduledInvoice, InvoiceEmailData, isValidEmail, isValidInvoiceNumber, isValidFutureDate } from "../services/emailService";

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
    address1: "02 Esther, Gold Maisha, Lubumbashi, 0001",
    address2: "Democratic Republic of Congo",
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
// CURRENCY & INVOICE LANGUAGE
// ─────────────────────────────────────────────
type InvoiceCurrency = "ZAR" | "USD" | "EUR" | "CDF";

const CURRENCIES: { id: InvoiceCurrency; symbol: string; name: string }[] = [
    { id: "ZAR", symbol: "R",  name: "Rand Sud-Africain (ZAR)" },
    { id: "USD", symbol: "$",  name: "Dollar Américain (USD)" },
    { id: "EUR", symbol: "€",  name: "Euro (EUR)" },
    { id: "CDF", symbol: "FC", name: "Franc Congolais (CDF)" },
];

function getCurrencySymbol(c: InvoiceCurrency): string {
    return CURRENCIES.find((x) => x.id === c)?.symbol ?? "R";
}

type InvoiceLanguage = "en" | "fr";

const PAPER_LABELS = {
    en: {
        invoice: "INVOICE", invoiceHash: "Invoice #", invoiceDate: "Invoice Date",
        dueDate: "Due Date", status: "Status", unpaid: "UNPAID",
        billTo: "BILL TO", vatReg: "VAT Registration No", vat: "VAT",
        description: "DESCRIPTION", servicePeriod: "SERVICE PERIOD",
        qty: "QTY", unitPrice: "UNIT PRICE", amount: "AMOUNT",
        workingDays: "Working Days", publicHolidays: "Public Holidays",
        billableDays: "Billable Days", to: "to",
        holidaysDeducted: "PUBLIC HOLIDAYS DEDUCTED WITHIN PERIOD",
        publicHoliday: "Public Holiday",
        subtotal: "Subtotal", vatZero: "VAT (0%)", totalDue: "TOTAL DUE",
        paymentDetails: "PAYMENT DETAILS", accountName: "Account Name",
        bankName: "Bank Name", accountNumber: "Account Number",
        swiftCode: "SWIFT / BIC Code", bankAddress: "Bank Address",
        notesTerms: "NOTES & TERMS",
        thanks: "Thank you for your business!",
        date: "Date", due: "Due",
    },
    fr: {
        invoice: "FACTURE", invoiceHash: "Facture N°", invoiceDate: "Date de Facture",
        dueDate: "Date d'Échéance", status: "Statut", unpaid: "IMPAYÉ",
        billTo: "FACTURER À", vatReg: "N° TVA", vat: "TVA",
        description: "DESCRIPTION", servicePeriod: "PÉRIODE DE SERVICE",
        qty: "QTÉ", unitPrice: "PRIX UNITAIRE", amount: "MONTANT",
        workingDays: "Jours Ouvrables", publicHolidays: "Jours Fériés",
        billableDays: "Jours Facturables", to: "au",
        holidaysDeducted: "JOURS FÉRIÉS DÉDUITS DANS LA PÉRIODE",
        publicHoliday: "Jour Férié",
        subtotal: "Sous-total", vatZero: "TVA (0%)", totalDue: "TOTAL DÛ",
        paymentDetails: "DÉTAILS DE PAIEMENT", accountName: "Nom du Compte",
        bankName: "Nom de la Banque", accountNumber: "Numéro de Compte",
        swiftCode: "Code SWIFT / BIC", bankAddress: "Adresse de la Banque",
        notesTerms: "NOTES & CONDITIONS",
        thanks: "Merci pour votre confiance !",
        date: "Date", due: "Échéance",
    },
} as const;

// ─────────────────────────────────────────────
// LOCALSTORAGE — INVOICE NUMBER TRACKING
// ─────────────────────────────────────────────
const LS_INVOICE_KEY = "africanite_invoice_seq";
const LS_BANK_KEY    = "africanite_bank_details";
const LS_DRAFT_KEY   = "africanite_invoice_draft";
const LS_PROVIDER_KEY = "africanite_provider";
const LS_CLIENT_KEY   = "africanite_client";
const LS_CURRENCY_KEY = "africanite_currency";
const LS_LANGUAGE_KEY = "africanite_inv_language";

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

function loadProvider(): ProviderInfo {
    try {
        const s = localStorage.getItem(LS_PROVIDER_KEY);
        if (s) return JSON.parse(s) as ProviderInfo;
    } catch { /* ignore */ }
    return DEFAULT_PROVIDER;
}

function persistProvider(p: ProviderInfo): void {
    try { localStorage.setItem(LS_PROVIDER_KEY, JSON.stringify(p)); } catch { /* ignore */ }
}

function loadClient(): ClientInfo {
    try {
        const s = localStorage.getItem(LS_CLIENT_KEY);
        if (s) return JSON.parse(s) as ClientInfo;
    } catch { /* ignore */ }
    return DEFAULT_CLIENT;
}

function persistClient(c: ClientInfo): void {
    try { localStorage.setItem(LS_CLIENT_KEY, JSON.stringify(c)); } catch { /* ignore */ }
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

const PROVIDER_LABELS: Record<string, string> = {
    name: "Nom",
    company: "Société",
    address1: "Adresse 1",
    address2: "Adresse 2",
};

const CLIENT_LABELS: Record<string, string> = {
    company: "Société",
    vatNumber: "N° TVA",
    address1: "Adresse 1",
    address2: "Adresse 2",
};

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
        serviceDescription: "Services de Consultation",
        publicHolidays: [],
        notes: "Le paiement est dû dans les 30 jours suivant la date de facturation.",
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
    return new Date(dateStr + "T00:00:00").toLocaleDateString("fr-FR", {
        day: "numeric",
        month: "long",
        year: "numeric",
    });
}

function formatCurrency(amount: number, cur: InvoiceCurrency = "ZAR"): string {
    const csym = getCurrencySymbol(cur);
    return `${csym}\u00a0${amount.toLocaleString("fr-FR", {
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
    const [provider, setProvider] = useState<ProviderInfo>(loadProvider);
    const [client, setClient] = useState<ClientInfo>(loadClient);
    const [bank, setBank] = useState<BankInfo>(loadBank);
    const [bankSaved, setBankSaved] = useState(false);
    const [theme, setTheme] = useState<InvoiceTheme>("classic");
    const [currency, setCurrency] = useState<InvoiceCurrency>(() => {
        try { const s = localStorage.getItem(LS_CURRENCY_KEY); if (s && CURRENCIES.some((c) => c.id === s)) return s as InvoiceCurrency; } catch {}
        return "ZAR";
    });
    const [invoiceLanguage, setInvoiceLanguage] = useState<InvoiceLanguage>(() => {
        try { const s = localStorage.getItem(LS_LANGUAGE_KEY); if (s === "en" || s === "fr") return s; } catch {}
        return "en";
    });
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
    const [pdfDownloaded, setPdfDownloaded] = useState(false);
    const [dismissedSuggestions, setDismissedSuggestions] = useState<Set<string>>(new Set());
    const [emailRecipient, setEmailRecipient] = useState("");
    const [senderEmail, setSenderEmail] = useState("foma.kandy@gmail.com");
    const [senderName, setSenderName] = useState("Kandy Foma");
    const [pdfBase64, setPdfBase64] = useState<string>("");
    const [pdfSizeMB, setPdfSizeMB] = useState<number>(0);
    const [isSendingEmail, setIsSendingEmail] = useState(false);
    const [showScheduleModal, setShowScheduleModal] = useState(false);
    const [scheduledInvoices, setScheduledInvoices] = useState<ScheduledInvoice[]>([]);
    const [scheduleRecurrence, setScheduleRecurrence] = useState<"monthly" | "quarterly" | "yearly">("monthly");
    const [sendDebounce, setSendDebounce] = useState(false);
    const invoiceRef = useRef<HTMLDivElement>(null);

    // ── Auto-save draft on every form change ──
    useEffect(() => { persistDraft(formData); }, [formData]);

    // ── Auto-save provider & client on change ──
    useEffect(() => { persistProvider(provider); }, [provider]);
    useEffect(() => { persistClient(client); }, [client]);

    // ── Persist currency & language ──
    useEffect(() => { try { localStorage.setItem(LS_CURRENCY_KEY, currency); } catch {} }, [currency]);
    useEffect(() => { try { localStorage.setItem(LS_LANGUAGE_KEY, invoiceLanguage); } catch {} }, [invoiceLanguage]);

    // ── Computed helpers ──
    const sym = getCurrencySymbol(currency);
    const fmt = (amount: number) => formatCurrency(amount, currency);
    const L = PAPER_LABELS[invoiceLanguage];

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
        if (!formData.invoiceNumber.trim()) e.invoiceNumber = "Le numéro de facture est requis";
        if (!formData.invoiceDate) e.invoiceDate = "La date de facture est requise";
        if (!formData.dueDate) e.dueDate = "La date d'échéance est requise";
        if (!formData.startDate) e.startDate = "La date de début est requise";
        if (!formData.endDate) e.endDate = "La date de fin est requise";
        if (formData.startDate && formData.endDate && formData.startDate > formData.endDate)
            e.endDate = "La date de fin doit être après la date de début";
        if (formData.invoiceDate && formData.dueDate && formData.dueDate < formData.invoiceDate)
            e.dueDate = "La date d'échéance doit être après la date de facture";
        if (!formData.hourlyRate || formData.hourlyRate <= 0)
            e.hourlyRate = "Le taux horaire doit être supérieur à 0";
        if (!formData.hoursPerDay || formData.hoursPerDay <= 0)
            e.hoursPerDay = "Les heures par jour doivent être supérieures à 0";
        setErrors(e);
        return Object.keys(e).length === 0;
    };

    const handlePreview = () => {
        if (validate()) {
            setView("preview");
            setPdfDownloaded(false);
            window.scrollTo({ top: 0, behavior: "smooth" });
        }
    };

    const handleNewInvoice = () => {
        clearDraft();
        setFormData(buildDefaultFormData());
        setPdfDownloaded(false);
        setErrors({});
        setDismissedSuggestions(new Set());
        setView("form");
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    const handleDownloadPDF = async () => {
        if (!invoiceRef.current) return;
        setIsGeneratingPDF(true);
        try {
            const html2canvas = (await import("html2canvas")).default;
            const { jsPDF } = await import("jspdf");
            const el = invoiceRef.current;
            
            // Use lower scale (1.5) and JPEG compression to reduce file size
            const canvas = await html2canvas(el, {
                scale: 1.5,
                useCORS: true,
                backgroundColor: "#ffffff",
                logging: false,
                width: el.offsetWidth,
                height: el.scrollHeight,
            });
            
            // Use JPEG with quality setting for better compression than PNG
            const imgData = canvas.toDataURL("image/jpeg", 0.85);
            
            // Use custom page size matching the invoice content
            const mmPerPx = 0.264583; // 1px = 0.264583mm at 96dpi
            const pageW = el.offsetWidth * mmPerPx;
            const pageH = el.scrollHeight * mmPerPx;
            const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: [pageW, pageH] });
            
            // Add JPEG image instead of PNG for smaller file size
            pdf.addImage(imgData, "JPEG", 0, 0, pageW, pageH);
            const pdfDataUrl = pdf.output("dataurlstring");
            
            // Extract base64 from data URL: "data:application/pdf;base64,..."
            const base64String = pdfDataUrl.split(",")[1];
            
            // Calculate file size in MB
            const binarySizeBytes = (base64String.length * 3) / 4;
            const fileSizeMB = binarySizeBytes / (1024 * 1024);
            setPdfSizeMB(fileSizeMB);
            
            // Warn if file size is large
            if (fileSizeMB > 4) {
                alert(`⚠️  PDF generated successfully but is quite large (${fileSizeMB.toFixed(1)}MB).\n\nThe max size for email is 5MB. You may need to simplify the invoice content if it fails to send.`);
            }
            
            setPdfBase64(base64String);
            pdf.save(`Invoice-INV-${formData.invoiceNumber}-${formData.invoiceDate}.pdf`);
            
            // Persist this invoice number so the next session auto-increments
            persistInvoiceNumber(formData.invoiceNumber);
            setPdfDownloaded(true);
        } catch (err) {
            console.error("PDF generation error:", err);
            alert("Impossible de générer le PDF. Veuillez réessayer.");
        } finally {
            setIsGeneratingPDF(false);
        }
    };

    const handleSendEmail = async () => {
        // Debounce to prevent double-sends
        if (sendDebounce) {
            alert("Veuillez patienter pendant l'envoi de la facture...");
            return;
        }

        // Validate sender name
        if (!senderName.trim()) {
            alert("Veuillez entrer votre nom");
            return;
        }

        // Validate sender email format
        if (!isValidEmail(senderEmail)) {
            alert("Veuillez entrer une adresse email d'expéditeur valide");
            return;
        }

        // Validate recipient email format
        if (!isValidEmail(emailRecipient)) {
            alert("Veuillez entrer une adresse email de destinataire valide");
            return;
        }

        // Validate invoice number
        if (!isValidInvoiceNumber(formData.invoiceNumber)) {
            alert("Format de numéro de facture invalide");
            return;
        }

        // Check file size and warn if approaching limit
        if (pdfSizeMB > 5) {
            alert(`❌ Le PDF est trop volumineux (${pdfSizeMB.toFixed(1)}MB). Max : 5MB\n\nVeuillez retélécharger le PDF pour régénérer avec une compression optimisée.`);
            return;
        }
        
        if (pdfSizeMB > 4.5) {
            alert(`⚠️  Le PDF est assez volumineux (${pdfSizeMB.toFixed(1)}MB) et approche la limite de 5MB.\n\nL'envoi pourrait échouer. Envisagez de régénérer ou simplifier la facture.`);
        }

        if (!pdfBase64) {
            alert("Veuillez d'abord télécharger le PDF");
            return;
        }

        setSendDebounce(true);
        setIsSendingEmail(true);
        try {
            const emailData: InvoiceEmailData = {
                senderEmail: senderEmail,
                senderName: senderName,
                recipientEmail: emailRecipient,
                invoiceNumber: formData.invoiceNumber,
                invoiceDate: formData.invoiceDate,
                dueDate: formData.dueDate,
                totalAmount: totalAmount,
                clientName: client.company,
                pdfBase64: pdfBase64,
            };
            const result = await sendInvoiceNow(emailData);
            if (result.success) {
                alert("Facture envoyée avec succès !");
                setEmailRecipient("");
            } else {
                alert(result.message);
            }
        } catch (error) {
            console.error("Email send error:", error);
            alert("Échec de l'envoi de la facture. Vérifiez votre connexion ou contactez le support.");
        } finally {
            setIsSendingEmail(false);
            setSendDebounce(false);
        }
    };

    const handleScheduleInvoice = async () => {
        // Validate email
        if (!isValidEmail(emailRecipient)) {
            alert("Veuillez entrer une adresse email de destinataire valide");
            return;
        }

        // Calculate next month date
        const nextMonth = new Date();
        nextMonth.setMonth(nextMonth.getMonth() + 1);
        const nextSendDate = nextMonth.toISOString().split("T")[0];

        // Validate future date
        const dateValidation = isValidFutureDate(nextSendDate);
        if (!dateValidation.valid) {
            alert(dateValidation.error || "Date de planification invalide");
            return;
        }

        setIsSendingEmail(true);
        try {
            const scheduled: ScheduledInvoice = {
                invoiceNumber: formData.invoiceNumber,
                clientEmail: emailRecipient,
                clientName: client.company,
                recurringType: scheduleRecurrence,
                nextSendDate: nextSendDate,
                isActive: true,
                createdAt: new Date().toISOString(),
                totalAmount: totalAmount,
            };
            const result = await scheduleInvoice(scheduled);
            if (result.success) {
                alert(`Facture planifiée pour envoi ${scheduleRecurrence === "monthly" ? "mensuel" : scheduleRecurrence === "quarterly" ? "trimestriel" : "annuel"} à partir du ${new Date(nextSendDate).toLocaleDateString("fr-FR")} !`);
                setShowScheduleModal(false);
                setEmailRecipient("");
                loadScheduledInvoices();
            } else {
                alert(result.message);
            }
        } catch (error) {
            console.error("Schedule error:", error);
            alert("Échec de la planification de la facture.");
        } finally {
            setIsSendingEmail(false);
        }
    };

    const loadScheduledInvoices = async () => {
        const invoices = await getScheduledInvoicesList();
        setScheduledInvoices(invoices);
    };

    const handleDeleteScheduled = async (id: string | undefined) => {
        if (!id) return;
        if (!window.confirm("Supprimer cette facture planifiée ?")) return;
        
        const result = await deleteScheduledInvoiceById(id);
        if (result.success) {
            loadScheduledInvoices();
        } else {
            alert(result.message);
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
                            <h1 className="inv-page-title">Générateur de Factures</h1>
                            <p className="inv-page-sub">Générez des factures mensuelles professionnelles en quelques secondes</p>
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
                                            Détails de la Facture
                                        </h5>
                                        <Row>
                                            <Col md={4}>
                                                <Form.Group className="mb-3">
                                                    <Form.Label className="d-flex align-items-center gap-2">
                                                        Numéro de Facture *
                                                        <Badge bg="success" style={{ fontSize: "0.65rem", fontWeight: 600 }}>Suivi auto</Badge>
                                                    </Form.Label>
                                                    <Form.Control
                                                        type="text"
                                                        value={formData.invoiceNumber}
                                                        onChange={(e) => update("invoiceNumber", e.target.value)}
                                                        isInvalid={!!errors.invoiceNumber}
                                                        placeholder="ex. 018"
                                                    />
                                                    <Form.Text className="text-muted" style={{ fontSize: "0.75rem" }}>
                                                        Incrémentation automatique après chaque téléchargement PDF
                                                    </Form.Text>
                                                    <Form.Control.Feedback type="invalid">{errors.invoiceNumber}</Form.Control.Feedback>
                                                </Form.Group>
                                            </Col>
                                            <Col md={4}>
                                                <Form.Group className="mb-3">
                                                    <Form.Label>Date de Facture *</Form.Label>
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
                                                    <Form.Label>Date d'Échéance *</Form.Label>
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
                                        <Row>
                                            <Col md={6}>
                                                <Form.Group className="mb-3">
                                                    <Form.Label>Devise</Form.Label>
                                                    <Form.Select
                                                        value={currency}
                                                        onChange={(e) => setCurrency(e.target.value as InvoiceCurrency)}
                                                    >
                                                        {CURRENCIES.map((c) => (
                                                            <option key={c.id} value={c.id}>{c.name}</option>
                                                        ))}
                                                    </Form.Select>
                                                </Form.Group>
                                            </Col>
                                            <Col md={6}>
                                                <Form.Group className="mb-3">
                                                    <Form.Label>Langue de la Facture</Form.Label>
                                                    <Form.Select
                                                        value={invoiceLanguage}
                                                        onChange={(e) => setInvoiceLanguage(e.target.value as InvoiceLanguage)}
                                                    >
                                                        <option value="en">English</option>
                                                        <option value="fr">Français</option>
                                                    </Form.Select>
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
                                            Période de Service
                                        </h5>
                                        <Row>
                                            <Col md={6}>
                                                <Form.Group className="mb-3">
                                                    <Form.Label>Date de Début *</Form.Label>
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
                                                    <Form.Label>Date de Fin *</Form.Label>
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
                                            <Form.Label>Description du Service</Form.Label>
                                            <Form.Control
                                                type="text"
                                                value={formData.serviceDescription}
                                                onChange={(e) => update("serviceDescription", e.target.value)}
                                                placeholder="ex. Services de Consultation"
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
                                            Tarification
                                        </h5>
                                        <Row>
                                            <Col md={6}>
                                                <Form.Group className="mb-3">
                                                    <Form.Label>Taux Horaire ({sym}) *</Form.Label>
                                                    <div className="input-group">
                                                        <span className="input-group-text inv-input-prefix">{sym}</span>
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
                                                    <Form.Label>Heures Par Jour Ouvrable *</Form.Label>
                                                    <div className="input-group">
                                                        <Form.Control
                                                            type="number"
                                                            min="1"
                                                            max="24"
                                                            value={formData.hoursPerDay}
                                                            onChange={(e) => {
                                                                const val = parseInt(e.target.value);
                                                                update("hoursPerDay", isNaN(val) ? 0 : Math.min(24, Math.max(0, val)));
                                                            }}
                                                            isInvalid={!!errors.hoursPerDay}
                                                        />
                                                        <span className="input-group-text inv-input-suffix">h/jour</span>
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
                                                Jours Fériés
                                                {formData.publicHolidays.length > 0 && (
                                                    <Badge bg="warning" text="dark" className="ms-2">
                                                        {formData.publicHolidays.length} déduit(s)
                                                    </Badge>
                                                )}
                                            </h5>
                                            <Button variant="outline-success" size="sm" onClick={addHoliday}>
                                                <FontAwesomeIcon icon={faPlus} className="me-1" />
                                                Ajouter
                                            </Button>
                                        </div>

                                        {/* SA Holiday Suggestions */}
                                        {pendingSuggestions.length > 0 && (
                                            <div className="inv-suggestions-box mb-3">
                                                <div className="inv-suggestions-header">
                                                    <span>
                                                        <FontAwesomeIcon icon={faMagicWandSparkles} className="me-2" />
                                                        <strong>{pendingSuggestions.length} jour{pendingSuggestions.length > 1 ? "s" : ""} férié{pendingSuggestions.length > 1 ? "s" : ""} sud-africain{pendingSuggestions.length > 1 ? "s" : ""}</strong>
                                                        {" "}détecté{pendingSuggestions.length > 1 ? "s" : ""} dans votre période — étiez-vous en congé ?
                                                    </span>
                                                    {pendingSuggestions.length > 1 && (
                                                        <Button
                                                            size="sm"
                                                            className="inv-approve-all-btn"
                                                            onClick={approveAll}
                                                        >
                                                            <FontAwesomeIcon icon={faCheck} className="me-1" />
                                                            Oui à tous
                                                        </Button>
                                                    )}
                                                </div>
                                                <div className="inv-suggestions-list">
                                                    {pendingSuggestions.map((s) => {
                                                        const dow = new Date(s.date + "T00:00:00").toLocaleDateString("fr-FR", { weekday: "long" });
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
                                                                        title="Oui, j'étais en congé — déduire ce jour"
                                                                    >
                                                                        <FontAwesomeIcon icon={faCheck} className="me-1" />
                                                                        En congé
                                                                    </button>
                                                                    <button
                                                                        className="inv-sug-btn dismiss"
                                                                        onClick={() => dismissSuggestion(s.date)}
                                                                        title="Non, j'ai travaillé ce jour — ignorer"
                                                                    >
                                                                        <FontAwesomeIcon icon={faTimes} className="me-1" />
                                                                        J'ai travaillé
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
                                                        ? "Aucun jour férié sud-africain dans votre période de service, ou tous ont été examinés. Vous pouvez en ajouter un manuellement."
                                                        : "Définissez votre période de service ci-dessus — les jours fériés sud-africains seront suggérés automatiquement."
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
                                                                        <Form.Label className="small fw-semibold">Nom du Jour Férié</Form.Label>
                                                                        <Form.Control
                                                                            type="text"
                                                                            size="sm"
                                                                            value={h.name}
                                                                            placeholder="ex. Journée des Travailleurs"
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
                                                                    ⚠ Cette date est en dehors de la période de service — elle ne sera pas déduite.
                                                                </small>
                                                            )}
                                                            {isWeekend && (
                                                                <small className="text-muted d-block mt-1">
                                                                    ℹ Ce jour tombe un week-end — aucune déduction appliquée.
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
                                        <h5 className="inv-section-title">Notes / Conditions de Paiement</h5>
                                        <Form.Control
                                            as="textarea"
                                            rows={2}
                                            value={formData.notes}
                                            onChange={(e) => update("notes", e.target.value)}
                                            placeholder="Conditions de paiement, notes supplémentaires..."
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
                                            Prestataire &amp; Client
                                            <span className="ms-2 text-muted" style={{ fontSize: "0.8rem", fontWeight: 400 }}>
                                                (cliquer pour modifier)
                                            </span>
                                        </Accordion.Header>
                                        <Accordion.Body>
                                            <Row>
                                                <Col md={6}>
                                                    <h6 className="inv-party-heading">DE — Vos Coordonnées</h6>
                                                    {(["name", "company", "address1", "address2"] as (keyof ProviderInfo)[]).map((field) => (
                                                        <Form.Group className="mb-2" key={field}>
                                                            <Form.Label className="small">{PROVIDER_LABELS[field]}</Form.Label>
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
                                                    <h6 className="inv-party-heading">FACTURER À — Coordonnées Client</h6>
                                                    {(["company", "vatNumber", "address1", "address2"] as (keyof ClientInfo)[]).map((field) => (
                                                        <Form.Group className="mb-2" key={field}>
                                                            <Form.Label className="small">{CLIENT_LABELS[field]}</Form.Label>
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
                                                (enregistré dans votre navigateur)
                                            </span>
                                        </Accordion.Header>
                                        <Accordion.Body>
                                            <p className="text-muted" style={{ fontSize: "0.82rem" }}>
                                                Ces détails apparaissent sur chaque facture. Les modifications sont enregistrées automatiquement dans votre navigateur.
                                            </p>
                                            <Row>
                                                <Col md={6}>
                                                    <Form.Group className="mb-2">
                                                        <Form.Label className="small">Nom du Compte</Form.Label>
                                                        <Form.Control size="sm" value={bank.accountName}
                                                            onChange={(e) => setBank((b) => ({ ...b, accountName: e.target.value }))} />
                                                    </Form.Group>
                                                    <Form.Group className="mb-2">
                                                        <Form.Label className="small">Nom de la Banque</Form.Label>
                                                        <Form.Control size="sm" value={bank.bankName}
                                                            onChange={(e) => setBank((b) => ({ ...b, bankName: e.target.value }))} />
                                                    </Form.Group>
                                                    <Form.Group className="mb-2">
                                                        <Form.Label className="small">Numéro de Compte</Form.Label>
                                                        <Form.Control size="sm" value={bank.accountNumber}
                                                            onChange={(e) => setBank((b) => ({ ...b, accountNumber: e.target.value }))} />
                                                    </Form.Group>
                                                </Col>
                                                <Col md={6}>
                                                    <Form.Group className="mb-2">
                                                        <Form.Label className="small">Code SWIFT / BIC</Form.Label>
                                                        <Form.Control size="sm" value={bank.swiftCode}
                                                            onChange={(e) => setBank((b) => ({ ...b, swiftCode: e.target.value }))} />
                                                    </Form.Group>
                                                    <Form.Group className="mb-2">
                                                        <Form.Label className="small">Adresse de la Banque</Form.Label>
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
                                                    Enregistrer
                                                </Button>
                                                {bankSaved && (
                                                    <span className="text-success" style={{ fontSize: "0.82rem", fontWeight: 600 }}>
                                                        <FontAwesomeIcon icon={faCheck} className="me-1" />
                                                        Enregistré !
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
                                style={{ top: "80px" } as React.CSSProperties}
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.2 }}
                            >
                                <Card className="inv-summary-card">
                                    <Card.Header className="inv-summary-header">
                                        <FontAwesomeIcon icon={faCalculator} className="me-2" />
                                        Résumé de la Facture
                                    </Card.Header>
                                    <Card.Body className="p-0">
                                        <div className="inv-summary-body">
                                            <div className="inv-summary-row">
                                                <span className="inv-summary-label">Jours Ouvrables</span>
                                                <span className="inv-summary-value">{workingDays}</span>
                                            </div>
                                            <div className="inv-summary-row holiday">
                                                <span className="inv-summary-label">Jours Fériés (déduits)</span>
                                                <span className="inv-summary-value holiday">− {holidayDays}</span>
                                            </div>
                                            <div className="inv-summary-row separator">
                                                <span className="inv-summary-label fw-bold">Jours Facturables</span>
                                                <span className="inv-summary-value billable">{billableDays}</span>
                                            </div>
                                            <div className="inv-summary-row">
                                                <span className="inv-summary-label">Heures par Jour</span>
                                                <span className="inv-summary-value">{formData.hoursPerDay} h</span>
                                            </div>
                                            <div className="inv-summary-row">
                                                <span className="inv-summary-label">Total Heures Facturables</span>
                                                <span className="inv-summary-value">{billableHours} h</span>
                                            </div>
                                            <div className="inv-summary-row">
                                                <span className="inv-summary-label">Taux Horaire</span>
                                                <span className="inv-summary-value">{sym} {formData.hourlyRate.toFixed(2)}</span>
                                            </div>
                                        </div>
                                        <div className="inv-summary-total">
                                            <div className="inv-total-label">MONTANT TOTAL DE LA FACTURE</div>
                                            <div className="inv-total-value">{fmt(totalAmount)}</div>
                                        </div>
                                        <div className="p-3">
                                            <Button className="w-100 inv-preview-btn" size="lg" onClick={handlePreview}>
                                                <FontAwesomeIcon icon={faEye} className="me-2" />
                                                Aperçu de la Facture
                                            </Button>
                                        </div>
                                    </Card.Body>
                                </Card>

                                {/* Period info */}
                                {formData.startDate && formData.endDate && (
                                    <div className="inv-period-info mt-3">
                                        <div className="inv-period-label">Période de Service</div>
                                        <div className="inv-period-value">
                                            {formatDateLong(formData.startDate)}
                                            <span className="inv-period-to"> au </span>
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
                            <span className="inv-toolbar-title">Facture INV-{formData.invoiceNumber}</span>
                            {pdfDownloaded
                                ? <Badge bg="success">✓ Téléchargé</Badge>
                                : <Badge bg="secondary">Aperçu</Badge>
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
                        <div className="inv-theme-switcher">
                            <button
                                className={`inv-theme-chip ${invoiceLanguage === "en" ? "active" : ""}`}
                                style={{ "--chip-color": "#1e3a5f" } as React.CSSProperties}
                                onClick={() => setInvoiceLanguage("en")}
                                title="English Invoice"
                            >EN</button>
                            <button
                                className={`inv-theme-chip ${invoiceLanguage === "fr" ? "active" : ""}`}
                                style={{ "--chip-color": "#14532d" } as React.CSSProperties}
                                onClick={() => setInvoiceLanguage("fr")}
                                title="Facture en Français"
                            >FR</button>
                        </div>
                        <div className="d-flex gap-2 align-items-center flex-wrap">
                            {pdfDownloaded && (
                                <span className="inv-next-hint">
                                    Prochaine facture : INV-{String(parseInt(formData.invoiceNumber, 10) + 1).padStart(3, "0")}
                                </span>
                            )}
                            <Button variant="outline-secondary" onClick={() => { setView("form"); window.scrollTo({ top: 0, behavior: "smooth" }); }}>
                                <FontAwesomeIcon icon={faPen} className="me-2" />
                                Modifier
                            </Button>
                            {pdfDownloaded ? (
                                <>
                                    <Button className="inv-new-btn" onClick={handleNewInvoice}>
                                        <FontAwesomeIcon icon={faPlus} className="me-2" />
                                        Nouvelle Facture
                                    </Button>
                                    <Button 
                                        variant="success" 
                                        onClick={() => { setShowScheduleModal(true); loadScheduledInvoices(); }}
                                        title="Envoyer maintenant ou planifier"
                                    >
                                        <FontAwesomeIcon icon={faEnvelope} className="me-2" />
                                        Envoyer par Email
                                    </Button>
                                </>
                            ) : (
                                <Button
                                    className="inv-dl-btn"
                                    onClick={handleDownloadPDF}
                                    disabled={isGeneratingPDF}
                                >
                                    <FontAwesomeIcon icon={faFilePdf} className="me-2" />
                                    {isGeneratingPDF ? "Génération du PDF…" : "Télécharger le PDF"}
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
                                <div className="inv-title-word">{L.invoice}</div>
                                <table className="inv-meta-table"><tbody>
                                    <tr><td className="inv-meta-label">{L.invoiceHash}</td><td className="inv-meta-val">INV-{formData.invoiceNumber}</td></tr>
                                    <tr><td className="inv-meta-label">{L.invoiceDate}</td><td className="inv-meta-val">{formatDateLong(formData.invoiceDate)}</td></tr>
                                    <tr><td className="inv-meta-label">{L.dueDate}</td><td className="inv-meta-val inv-due">{formatDateLong(formData.dueDate)}</td></tr>
                                    <tr><td className="inv-meta-label">{L.status}</td><td className="inv-meta-val inv-status-unpaid">{L.unpaid}</td></tr>
                                </tbody></table>
                            </div>
                        </div>
                        <div className="inv-rule" />
                        <div className="inv-parties">
                            <div>
                                <div className="inv-party-tag">{L.billTo}</div>
                                <div className="inv-party-company">{client.company}</div>
                                {client.vatNumber && <div className="inv-party-detail">{L.vatReg}: {client.vatNumber}</div>}
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
                                <div className="em-title-badge">{L.invoice}</div>
                                <div className="em-inv-num">INV-{formData.invoiceNumber}</div>
                                <div className="em-meta-row"><span className="em-ml">{L.date}</span><span className="em-mv">{formatDateLong(formData.invoiceDate)}</span></div>
                                <div className="em-meta-row"><span className="em-ml">{L.due}</span><span className="em-mv em-due">{formatDateLong(formData.dueDate)}</span></div>
                                <div className="em-meta-row"><span className="em-ml">{L.status}</span><span className="em-status">{L.unpaid}</span></div>
                            </div>
                        </div>
                        <div className="em-bill-to-wrap">
                            <div className="em-bill-tag">{L.billTo}</div>
                            <div className="em-bill-company">{client.company}</div>
                            {client.vatNumber && <div className="em-bill-detail">{L.vat}: {client.vatNumber}</div>}
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
                                <div className="ob-invoice-word">{L.invoice}</div>
                                <div className="ob-inv-num">INV-{formData.invoiceNumber}</div>
                            </div>
                        </div>
                        <div className="ob-meta-strip">
                            <div className="ob-meta-cell"><div className="ob-mc-label">{L.invoiceDate.toUpperCase()}</div><div className="ob-mc-val">{formatDateLong(formData.invoiceDate)}</div></div>
                            <div className="ob-meta-cell"><div className="ob-mc-label">{L.dueDate.toUpperCase()}</div><div className="ob-mc-val ob-due">{formatDateLong(formData.dueDate)}</div></div>
                            <div className="ob-meta-cell"><div className="ob-mc-label">{L.status.toUpperCase()}</div><div className="ob-mc-val ob-unpaid">{L.unpaid}</div></div>
                        </div>
                        <div className="ob-bill-to">
                            <span className="ob-bill-tag">{L.billTo}</span>
                            <div className="ob-bill-company">{client.company}</div>
                            {client.vatNumber && <div className="ob-bill-detail">{L.vatReg}: {client.vatNumber}</div>}
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
                                    <th className="inv-th inv-col-desc">{L.description}</th>
                                    <th className="inv-th inv-col-period">{L.servicePeriod}</th>
                                    <th className="inv-th inv-col-qty">{L.qty}</th>
                                    <th className="inv-th inv-col-rate">{L.unitPrice}</th>
                                    <th className="inv-th inv-col-amt">{L.amount}</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr className="inv-row">
                                    <td className="inv-td inv-col-desc">
                                        <div className="inv-service-name">{formData.serviceDescription}</div>
                                        <div className="inv-service-meta">
                                            <span>{L.workingDays}: {workingDays}</span>
                                            {holidayDays > 0 && <span> &nbsp;·&nbsp; {L.publicHolidays}: −{holidayDays}</span>}
                                            <span> &nbsp;·&nbsp; {L.billableDays}: {billableDays}</span>
                                        </div>
                                    </td>
                                    <td className="inv-td inv-col-period">
                                        <span className="inv-period-from">{formatDateLong(formData.startDate)}</span>
                                        <span className="inv-period-sep"> {L.to} </span>
                                        <span className="inv-period-to-inv">{formatDateLong(formData.endDate)}</span>
                                    </td>
                                    <td className="inv-td inv-col-qty">{billableHours}&nbsp;h</td>
                                    <td className="inv-td inv-col-rate">{sym}&nbsp;{formData.hourlyRate.toFixed(2)}/h</td>
                                    <td className="inv-td inv-col-amt">{fmt(totalAmount)}</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>

                    {/* Public Holidays Section */}
                    {billableHolidays.length > 0 && (
                        <div className="inv-holidays">
                            <div className="inv-holidays-title">{L.holidaysDeducted}</div>
                            {billableHolidays.map((h) => (
                                <div key={h.id} className="inv-holiday-item">
                                    <span className="inv-h-bullet">●</span>
                                    <span className="inv-h-name">{h.name || L.publicHoliday}</span>
                                    <span className="inv-h-date">{" "}&mdash;{" "}{formatDateLong(h.date)}</span>
                                    <span className="inv-h-impact">
                                        {" "}({formData.hoursPerDay}h @ {sym}{formData.hourlyRate.toFixed(2)}/h
                                        {" "}= −{fmt(formData.hoursPerDay * formData.hourlyRate)})
                                    </span>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Totals */}
                    <div className="inv-totals-wrap">
                        <table className="inv-totals-table"><tbody>
                            <tr>
                                <td className="inv-tot-label">{L.subtotal}</td>
                                <td className="inv-tot-val">{fmt(totalAmount)}</td>
                            </tr>
                            <tr>
                                <td className="inv-tot-label">{L.vatZero}</td>
                                <td className="inv-tot-val">{sym} 0.00</td>
                            </tr>
                            <tr className="inv-tot-final">
                                <td className="inv-tot-label final">{L.totalDue}</td>
                                <td className="inv-tot-val final">{fmt(totalAmount)}</td>
                            </tr>
                        </tbody></table>
                    </div>

                    {/* Payment Details */}
                    <div className="inv-payment">
                        <div className="inv-payment-title">{L.paymentDetails}</div>
                        <div className="inv-payment-rows">
                            {bank.accountName  && <div className="inv-pay-row"><span className="inv-pay-label">{L.accountName}</span><span className="inv-pay-val">{bank.accountName}</span></div>}
                            {bank.bankName     && <div className="inv-pay-row"><span className="inv-pay-label">{L.bankName}</span><span className="inv-pay-val">{bank.bankName}</span></div>}
                            {bank.accountNumber && <div className="inv-pay-row"><span className="inv-pay-label">{L.accountNumber}</span><span className="inv-pay-val">{bank.accountNumber}</span></div>}
                            {bank.swiftCode    && <div className="inv-pay-row"><span className="inv-pay-label">{L.swiftCode}</span><span className="inv-pay-val">{bank.swiftCode}</span></div>}
                            {bank.bankAddress  && <div className="inv-pay-row"><span className="inv-pay-label">{L.bankAddress}</span><span className="inv-pay-val">{bank.bankAddress}</span></div>}
                        </div>
                    </div>

                    {/* Notes */}
                    {formData.notes && (
                        <div className="inv-notes">
                            <span className="inv-notes-label">{L.notesTerms}: </span>
                            <span className="inv-notes-text">{formData.notes}</span>
                        </div>
                    )}

                    {/* Footer */}
                    <div className="inv-footer">
                        <div className="inv-footer-line" />
                        <div className="inv-footer-content">
                            <span className="inv-footer-thanks">{L.thanks}</span>
                            <span className="inv-footer-company">{provider.company ? `${provider.company} · ` : ""}{provider.name}</span>
                        </div>
                    </div>

                    {theme === "classic" && <div className="inv-accent-bar bottom" />}
                    {theme === "emerald"  && <div className="em-footer-bar" />}
                    {theme === "obsidian" && <div className="ob-footer-bar" />}
                </div>
            </div>

            {/* Email & Scheduling Section */}
            <Modal
                show={pdfDownloaded && showScheduleModal}
                onHide={() => setShowScheduleModal(false)}
                centered
                size="lg"
                className="modern-modal"
                backdrop="static"
                keyboard={true}
            >
                <Modal.Header closeButton className="border-bottom">
                    <Modal.Title className="fw-bold">
                        <FontAwesomeIcon icon={faEnvelope} className="me-2" style={{ color: "#0d6efd" }} />
                        Envoyer la Facture
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                            {/* Sender Name Input */}
                            <Form.Group className="mb-3">
                                <Form.Label>
                                    <FontAwesomeIcon icon={faUser} className="me-2" />
                                    Votre Nom (Expéditeur)
                                </Form.Label>
                                <Form.Control
                                    type="text"
                                    placeholder="Kandy Foma"
                                    value={senderName}
                                    onChange={(e) => setSenderName(e.target.value)}
                                />
                                <Form.Text className="text-muted">
                                    Ce nom apparaîtra dans la signature de l'email
                                </Form.Text>
                            </Form.Group>

                            {/* Sender Email Input */}
                            <Form.Group className="mb-3">
                                <Form.Label>
                                    <FontAwesomeIcon icon={faEnvelope} className="me-2" />
                                    Votre Email (Expéditeur)
                                </Form.Label>
                                <Form.Control
                                    type="email"
                                    value={senderEmail}
                                    readOnly
                                    style={{ backgroundColor: "var(--bs-secondary-bg, #f8f9fa)", cursor: "default" }}
                                />
                                <Form.Text className="text-muted">
                                    Les emails sont envoyés depuis ce compte Gmail configuré
                                </Form.Text>
                            </Form.Group>

                            {/* Recipient Email Input */}
                            <Form.Group className="mb-3">
                                <Form.Label>
                                    <FontAwesomeIcon icon={faEnvelope} className="me-2" />
                                    Email du Destinataire
                                </Form.Label>
                                <Form.Control
                                    type="email"
                                    placeholder="client@example.com"
                                    value={emailRecipient}
                                    onChange={(e) => setEmailRecipient(e.target.value)}
                                />
                                <Form.Text className="text-muted">
                                    La facture sera envoyée à cette adresse email
                                </Form.Text>
                            </Form.Group>

                            {/* PDF File Size Indicator */}
                            {pdfDownloaded && pdfSizeMB > 0 && (
                                <motion.div
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="mb-3"
                                    style={{
                                        padding: "12px",
                                        borderRadius: "6px",
                                        backgroundColor: pdfSizeMB > 4.5 ? "#fff3cd" : "#d5e8d4",
                                        border: `1px solid ${pdfSizeMB > 4.5 ? "#ffc107" : "#82b366"}`,
                                    } as React.CSSProperties}
                                >
                                    <small style={{ fontSize: "0.9rem" }}>
                                        <strong>Taille PDF :</strong> {pdfSizeMB.toFixed(2)}MB / 5MB
                                        {pdfSizeMB > 4.5 && (
                                            <span style={{ color: "#ff6b6b", marginLeft: "8px" }}>
                                                ⚠️ Proche de la limite - l'envoi pourrait échouer
                                            </span>
                                        )}
                                        {pdfSizeMB <= 4.5 && (
                                            <span style={{ color: "#28a745", marginLeft: "8px" }}>
                                                ✓ Prêt à envoyer
                                            </span>
                                        )}
                                    </small>
                                </motion.div>
                            )}

                            {/* Send Now vs Schedule Toggle */}
                            <div className="mb-4">
                                <h5>Options d'Envoi</h5>
                                <div style={{ display: "flex", gap: "10px" }}>
                                    <Button
                                        variant="success"
                                        onClick={handleSendEmail}
                                        disabled={isSendingEmail || sendDebounce || !emailRecipient.trim() || !senderEmail.trim() || !senderName.trim()}
                                        style={{ flex: 1 }}
                                    >
                                        <FontAwesomeIcon icon={faPaperPlane} className="me-2" />
                                        {isSendingEmail ? "Envoi en cours..." : "Envoyer Maintenant"}
                                    </Button>
                                </div>
                            </div>

                            {/* Recurring Schedule Section */}
                            <Accordion defaultActiveKey="0">
                                <Accordion.Item eventKey="1">
                                    <Accordion.Header>
                                        <FontAwesomeIcon icon={faClockRegular} className="me-2" />
                                        Planifier pour les Prochains Mois
                                    </Accordion.Header>
                                    <Accordion.Body>
                                        <Form.Group className="mb-3">
                                            <Form.Label>Fréquence Récurrente</Form.Label>
                                            <div style={{ display: "flex", gap: "10px" }}>
                                                <Form.Check
                                                    type="radio"
                                                    id="recur-monthly"
                                                    label="Mensuel"
                                                    value="monthly"
                                                    checked={scheduleRecurrence === "monthly"}
                                                    onChange={(e) => setScheduleRecurrence(e.target.value as any)}
                                                />
                                                <Form.Check
                                                    type="radio"
                                                    id="recur-quarterly"
                                                    label="Trimestriel"
                                                    value="quarterly"
                                                    checked={scheduleRecurrence === "quarterly"}
                                                    onChange={(e) => setScheduleRecurrence(e.target.value as any)}
                                                />
                                                <Form.Check
                                                    type="radio"
                                                    id="recur-yearly"
                                                    label="Annuel"
                                                    value="yearly"
                                                    checked={scheduleRecurrence === "yearly"}
                                                    onChange={(e) => setScheduleRecurrence(e.target.value as any)}
                                                />
                                            </div>
                                            <Form.Text className="text-muted" style={{ display: "block", marginTop: "10px" }}>
                                                La facture sera envoyée automatiquement chaque {scheduleRecurrence === "quarterly" ? "3 mois" : scheduleRecurrence === "yearly" ? "12 mois" : "mois"} à partir du mois prochain
                                            </Form.Text>
                                        </Form.Group>
                                        <Button
                                            variant="info"
                                            onClick={handleScheduleInvoice}
                                            disabled={isSendingEmail || !emailRecipient.trim()}
                                            style={{ width: "100%" }}
                                        >
                                            <FontAwesomeIcon icon={faCheckCircle} className="me-2" />
                                            {isSendingEmail ? "Planification..." : "Planifier"}
                                        </Button>
                                    </Accordion.Body>
                                </Accordion.Item>
                            </Accordion>

                            {/* Scheduled Invoices List */}
                            {scheduledInvoices.length > 0 && (
                                <div style={{ marginTop: "30px", paddingTop: "20px", borderTop: "1px solid #dee2e6" }}>
                                    <h5 className="mb-3">
                                        <FontAwesomeIcon icon={faCheckCircle} className="me-2" />
                                        Factures Planifiées Actives
                                    </h5>
                                    {scheduledInvoices.map((inv) => (
                                        <Card key={inv.id} className="mb-2" style={{ background: "#f8f9fa" }}>
                                            <Card.Body style={{ padding: "12px" }}>
                                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                                                    <strong>{inv.clientName}</strong>
                                                    <Badge bg="info">{inv.recurringType}</Badge>
                                                </div>
                                                <small style={{ color: "#666", display: "block", marginBottom: "4px" }}>
                                                    {inv.clientEmail}
                                                </small>
                                                <small style={{ color: "#666", display: "block", marginBottom: "8px" }}>
                                                    Prochain envoi : {new Date(inv.nextSendDate).toLocaleDateString("fr-FR")}
                                                </small>
                                                <Button
                                                    size="sm"
                                                    variant="danger"
                                                    onClick={() => handleDeleteScheduled(inv.id)}
                                                    style={{ width: "100%" }}
                                                >
                                                    <FontAwesomeIcon icon={faTrash} className="me-2" />
                                                    Supprimer
                                                </Button>
                                            </Card.Body>
                                        </Card>
                                    ))}
                                </div>
                            )}
                </Modal.Body>
                <Modal.Footer className="border-top">
                    <Button
                        variant="secondary"
                        onClick={() => setShowScheduleModal(false)}
                    >
                        Fermer
                    </Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
};

export default InvoiceGenerator;
