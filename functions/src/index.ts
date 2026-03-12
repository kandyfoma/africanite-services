import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import * as nodemailer from "nodemailer";

// Initialize Firebase Admin
admin.initializeApp();
const db = admin.firestore();

// ─────────────────────────────────────────────────────────────────────────
// HELPER FUNCTIONS
// ─────────────────────────────────────────────────────────────────────────

/**
 * Escape HTML to prevent injection attacks
 */
function escapeHtml(text: string): string {
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
 * Validate email format
 */
function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email.trim());
}

/**
 * Validate base64 string
 */
function isValidBase64(base64: string): boolean {
  if (!base64 || typeof base64 !== "string") return false;
  return /^[A-Za-z0-9+/=]+$/.test(base64);
}

// ─────────────────────────────────────────────────────────────────────────
// EMAIL CONFIGURATION
// To use Gmail, you must:
// 1. Enable 2-Factor Authentication on your Gmail account
// 2. Generate an App-Specific Password: https://myaccount.google.com/apppasswords
// 3. Set these environment variables:
//    firebase functions:config:set gmail.email="your-email@gmail.com" gmail.password="your-app-password"
// ─────────────────────────────────────────────────────────────────────────

const gmailEmail = functions.config().gmail?.email || process.env.GMAIL_EMAIL;
const gmailPassword = functions.config().gmail?.password || process.env.GMAIL_PASSWORD;

if (!gmailEmail || !gmailPassword) {
    console.warn("⚠️ Gmail credentials not configured. Email functions will fail. Set up environment variables.");
}

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: gmailEmail,
        pass: gmailPassword,
    },
});

// ─────────────────────────────────────────────────────────────────────────
// SEND INVOICE EMAIL (Callable Function)
// ─────────────────────────────────────────────────────────────────────────
export const sendInvoiceEmail = functions.https.onCall(async (data, context) => {
    const { 
        senderEmail, 
        senderName, 
        recipientEmail, 
        clientName,
        invoiceNumber, 
        invoiceDate, 
        dueDate, 
        totalAmount, 
        pdfBase64 
    } = data;

    // ─────── VALIDATION ───────
    if (!senderEmail || !senderName || !recipientEmail || !pdfBase64 || !invoiceNumber) {
        throw new functions.https.HttpsError("invalid-argument", "Missing required fields");
    }

    // Validate email formats
    if (!isValidEmail(senderEmail)) {
        throw new functions.https.HttpsError("invalid-argument", "Invalid sender email format");
    }
    if (!isValidEmail(recipientEmail)) {
        throw new functions.https.HttpsError("invalid-argument", "Invalid recipient email format");
    }

    // Validate sender email matches configured Gmail
    if (senderEmail !== gmailEmail) {
        throw new functions.https.HttpsError("invalid-argument", `Sender email must be ${gmailEmail}`);
    }

    // Validate base64
    if (!isValidBase64(pdfBase64)) {
        throw new functions.https.HttpsError("invalid-argument", "Invalid PDF data format");
    }

    // Validate PDF size (<10MB for Cloud Functions limit)
    const pdfSizeMB = (pdfBase64.length * 3) / (4 * 1024 * 1024);
    if (pdfSizeMB > 10) {
        throw new functions.https.HttpsError("invalid-argument", `PDF too large (${pdfSizeMB.toFixed(1)}MB). Max: 10MB`);
    }

    try {
        // Convert base64 to buffer
        const pdfBuffer = Buffer.from(pdfBase64, "base64");

        // Escape HTML in dynamic content
        const safeSenderName = escapeHtml(senderName);
        const safeClientName = escapeHtml(clientName || "Valued Client");
        const safeInvoiceNumber = escapeHtml(invoiceNumber);

        // Send email
        const mailOptions = {
            from: gmailEmail,
            to: recipientEmail,
            subject: `Invoice INV-${safeInvoiceNumber} from ${safeSenderName}`,
            html: `
                <h2 style="color: #333; margin-bottom: 20px;">Invoice INV-${safeInvoiceNumber}</h2>
                <p style="font-size: 14px; color: #555;">Dear ${safeClientName},</p>
                <p style="font-size: 14px; color: #555;">Please find attached your invoice for consulting services.</p>
                <p style="font-size: 14px; color: #555; margin-top: 20px; color: #666;">
                    Payment is due within 30 days of the invoice date.
                </p>
                <p style="font-size: 14px; color: #555;">Thank you for your business!</p>
                <p style="font-size: 14px; color: #555;">
                    Best regards,<br>
                    <strong>${safeSenderName}</strong>
                </p>
            `,
            attachments: [
                {
                    filename: `Invoice-INV-${safeInvoiceNumber}-${invoiceDate}.pdf`,
                    content: pdfBuffer,
                    contentType: "application/pdf",
                },
            ],
        };

        await transporter.sendMail(mailOptions);

        // Log the send
        await db.collection("invoice_sends").add({
            senderEmail,
            senderName: safeSenderName,
            recipientEmail,
            invoiceNumber: safeInvoiceNumber,
            sentAt: admin.firestore.FieldValue.serverTimestamp(),
            status: "success",
        });

        return { success: true, message: "Invoice sent successfully" };
    } catch (error) {
        console.error("Email send error:", error);

        // Log the failure
        await db.collection("invoice_sends").add({
            senderEmail,
            senderName,
            recipientEmail,
            invoiceNumber,
            sentAt: admin.firestore.FieldValue.serverTimestamp(),
            status: "failed",
            error: String(error),
        });

        throw new functions.https.HttpsError("internal", "Failed to send invoice email");
    }
});

// ─────────────────────────────────────────────────────────────────────────
// SAVE SCHEDULED INVOICE (Callable Function)
// ─────────────────────────────────────────────────────────────────────────
export const saveScheduledInvoice = functions.https.onCall(async (data, context) => {
    const {
        invoiceNumber,
        clientEmail,
        clientName,
        recurringType,
        nextSendDate,
        isActive,
        createdAt,
        totalAmount,
    } = data;

    if (!clientEmail || !clientName || !recurringType) {
        throw new functions.https.HttpsError("invalid-argument", "Missing required fields");
    }

    try {
        const docRef = await db.collection("scheduled_invoices").add({
            invoiceNumber,
            clientEmail,
            clientName,
            recurringType,
            nextSendDate,
            isActive,
            createdAt,
            totalAmount,
            lastSentDate: null,
        });

        return { success: true, id: docRef.id };
    } catch (error) {
        console.error("Schedule save error:", error);
        throw new functions.https.HttpsError("internal", "Failed to schedule invoice");
    }
});

// ─────────────────────────────────────────────────────────────────────────
// GET SCHEDULED INVOICES (Callable Function)
// ─────────────────────────────────────────────────────────────────────────
export const getScheduledInvoices = functions.https.onCall(async (data, context) => {
    try {
        const snapshot = await db
            .collection("scheduled_invoices")
            .where("isActive", "==", true)
            .get();

        const invoices = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
        }));

        return { invoices };
    } catch (error) {
        console.error("Get scheduled error:", error);
        throw new functions.https.HttpsError("internal", "Failed to retrieve scheduled invoices");
    }
});

// ─────────────────────────────────────────────────────────────────────────
// DELETE SCHEDULED INVOICE (Callable Function)
// ─────────────────────────────────────────────────────────────────────────
export const deleteScheduledInvoice = functions.https.onCall(async (data, context) => {
    const { id } = data;

    if (!id) {
        throw new functions.https.HttpsError("invalid-argument", "Missing invoice ID");
    }

    try {
        await db.collection("scheduled_invoices").doc(id).delete();
        return { success: true };
    } catch (error) {
        console.error("Delete scheduled error:", error);
        throw new functions.https.HttpsError("internal", "Failed to delete scheduled invoice");
    }
});

// ─────────────────────────────────────────────────────────────────────────
// DAILY SCHEDULER (Runs every day at 9:00 AM UTC)
// Checks for scheduled invoices and sends them if due
// ─────────────────────────────────────────────────────────────────────────
export const processDailyScheduledInvoices = functions.pubsub
    .schedule("0 9 * * *")
    .timeZone("UTC")
    .onRun(async (context) => {
        try {
            const today = new Date().toISOString().split("T")[0];

            // Get all active scheduled invoices due today
            const snapshot = await db
                .collection("scheduled_invoices")
                .where("isActive", "==", true)
                .where("nextSendDate", "<=", today)
                .get();

            console.log(`Found ${snapshot.size} invoices to process`);

            for (const doc of snapshot.docs) {
                const invoice = doc.data();

                // Send a placeholder message (in real app, you'd fetch the actual PDF)
                console.log(
                    `Processing scheduled invoice to ${invoice.clientEmail} (${invoice.recurringType})`
                );

                // Update nextSendDate based on recurring type
                let nextDate = new Date(invoice.nextSendDate);
                if (invoice.recurringType === "monthly") {
                    nextDate.setMonth(nextDate.getMonth() + 1);
                } else if (invoice.recurringType === "quarterly") {
                    nextDate.setMonth(nextDate.getMonth() + 3);
                } else if (invoice.recurringType === "yearly") {
                    nextDate.setFullYear(nextDate.getFullYear() + 1);
                }

                await doc.ref.update({
                    nextSendDate: nextDate.toISOString().split("T")[0],
                    lastSentDate: today,
                });

                console.log(`Updated next send date for ${doc.id}: ${nextDate.toISOString().split("T")[0]}`);
            }

            return null;
        } catch (error) {
            console.error("Daily scheduler error:", error);
            return null;
        }
    });
