import { sendInvoiceEmail, saveScheduledInvoice, deleteScheduledInvoice, getScheduledInvoices } from "./firebaseConfig";

// ─────────────────────────────────────────────
// VALIDATION HELPERS
// ─────────────────────────────────────────────

/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email.trim());
}

/**
 * Validate invoice number format (3 digits max)
 */
export function isValidInvoiceNumber(num: string): boolean {
  return /^\d{1,3}$/.test(num.trim());
}

/**
 * Escape HTML special characters to prevent injection
 */
export function escapeHtml(text: string): string {
  const map: { [key: string]: string } = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;",
  };
  return text.replace(/[&<>"']/g, (char) => map[char]);
}

/**
 * Validate base64 string and check size
 * @param base64 Base64 encoded string
 * @param maxSizeMB Maximum size in MB (default 5MB for Cloud Functions safety)
 */
export function isValidBase64(base64: string, maxSizeMB: number = 5): { valid: boolean; error?: string } {
  if (!base64 || typeof base64 !== "string") {
    return { valid: false, error: "PDF data is missing" };
  }

  // Check base64 format
  if (!/^[A-Za-z0-9+/=]+$/.test(base64)) {
    return { valid: false, error: "Invalid PDF data format" };
  }

  // Estimate size: base64 is ~4/3 of binary size
  const binarySize = (base64.length * 3) / 4;
  const sizeMB = binarySize / (1024 * 1024);

  if (sizeMB > maxSizeMB) {
    return { valid: false, error: `PDF is too large (${sizeMB.toFixed(1)}MB). Max: ${maxSizeMB}MB` };
  }

  return { valid: true };
}

/**
 * Validate scheduled date is not in the past
 */
export function isValidFutureDate(dateStr: string): { valid: boolean; error?: string } {
  if (!dateStr) {
    return { valid: false, error: "Date is required" };
  }
  
  const date = new Date(dateStr + "T00:00:00");
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  if (date < today) {
    return { valid: false, error: "Cannot schedule in the past" };
  }
  
  return { valid: true };
}

export interface InvoiceEmailData {
  senderEmail: string;
  senderName: string;
  recipientEmail: string;
  clientName: string;
  invoiceNumber: string;
  invoiceDate: string;
  dueDate: string;
  totalAmount: number;
  pdfBase64: string; // base64 encoded PDF
}

export interface ScheduledInvoice {
  id?: string;
  invoiceNumber: string;
  clientEmail: string;
  clientName: string;
  recurringType: "monthly" | "quarterly" | "yearly";
  nextSendDate: string; // ISO date
  lastSentDate?: string;
  isActive: boolean;
  createdAt: string;
  totalAmount: number;
}

/**
 * Send invoice email immediately
 */
export async function sendInvoiceNow(data: InvoiceEmailData): Promise<{ success: boolean; message: string }> {
  // Validate sender email
  if (!isValidEmail(data.senderEmail)) {
    return { success: false, message: "Invalid sender email format" };
  }

  // Validate recipient email
  if (!isValidEmail(data.recipientEmail)) {
    return { success: false, message: "Invalid recipient email format" };
  }

  // Validate invoice number format
  if (!isValidInvoiceNumber(data.invoiceNumber)) {
    return { success: false, message: "Invalid invoice number format (3 digits max)" };
  }

  // Validate PDF
  const pdfValidation = isValidBase64(data.pdfBase64);
  if (!pdfValidation.valid) {
    return { success: false, message: pdfValidation.error || "Invalid PDF data" };
  }

  try {
    const result = await sendInvoiceEmail({
      senderEmail: data.senderEmail,
      senderName: data.senderName,
      recipientEmail: data.recipientEmail,
      clientName: data.clientName,
      invoiceNumber: data.invoiceNumber,
      invoiceDate: data.invoiceDate,
      dueDate: data.dueDate,
      totalAmount: data.totalAmount,
      pdfBase64: data.pdfBase64,
    });
    return { success: true, message: "Invoice sent successfully!" };
  } catch (error) {
    console.error("Error sending invoice:", error);
    return { success: false, message: `Failed to send invoice: ${error instanceof Error ? error.message : "Unknown error"}` };
  }
}

/**
 * Schedule an invoice to send automatically
 */
export async function scheduleInvoice(invoice: ScheduledInvoice): Promise<{ success: boolean; id?: string; message: string }> {
  // Validate recipient email
  if (!isValidEmail(invoice.clientEmail)) {
    return { success: false, message: "Invalid client email format" };
  }

  // Validate date is not in the past
  const dateValidation = isValidFutureDate(invoice.nextSendDate);
  if (!dateValidation.valid) {
    return { success: false, message: dateValidation.error || "Invalid schedule date" };
  }

  try {
    const result = await saveScheduledInvoice({
      ...invoice,
      createdAt: new Date().toISOString(),
    });
    return { success: true, id: (result.data as any).id, message: "Invoice scheduled successfully!" };
  } catch (error) {
    console.error("Error scheduling invoice:", error);
    return { success: false, message: `Failed to schedule invoice: ${error instanceof Error ? error.message : "Unknown error"}` };
  }
}

/**
 * Get all scheduled invoices
 */
export async function getScheduledInvoicesList(): Promise<ScheduledInvoice[]> {
  try {
    const result = await getScheduledInvoices({});
    return (result.data as any).invoices || [];
  } catch (error) {
    console.error("Error fetching scheduled invoices:", error);
    return [];
  }
}

/**
 * Delete a scheduled invoice
 */
export async function deleteScheduledInvoiceById(id: string): Promise<{ success: boolean; message: string }> {
  try {
    await deleteScheduledInvoice({ id });
    return { success: true, message: "Scheduled invoice deleted." };
  } catch (error) {
    console.error("Error deleting scheduled invoice:", error);
    return { success: false, message: `Failed to delete: ${error instanceof Error ? error.message : "Unknown error"}` };
  }
}
