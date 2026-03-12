import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import * as nodemailer from "nodemailer";
import {onCall, HttpsError} from "firebase-functions/v2/https";

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
// Credentials are loaded from functions/.env (deployed with Firebase CLI)
// The .env file is git-ignored but Firebase CLI includes it in deployment.
// ─────────────────────────────────────────────────────────────────────────

const gmailEmail = process.env.GMAIL_EMAIL;
const gmailPassword = process.env.GMAIL_PASSWORD;

if (!gmailEmail || !gmailPassword) {
    console.warn("⚠️ Gmail credentials not configured. GMAIL_EMAIL or GMAIL_PASSWORD env var is missing.");
}

// Create transporter immediately to catch issues early
let transporter: any = null;
try {
    transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
            user: gmailEmail,
            pass: gmailPassword,
        },
    });
} catch (error) {
    console.error("❌ Failed to create Gmail transporter:", error);
}

// ─────────────────────────────────────────────────────────────────────────
// SEND INVOICE EMAIL (Callable Function)
// ─────────────────────────────────────────────────────────────────────────
export const sendInvoiceEmailV2 = onCall({region: "us-central1", invoker: "public"}, async (request) => {
    const data = request.data as any;
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
    // Check if transporter is available
    if (!transporter) {
        throw new HttpsError("internal", "❌ Email service not configured. Gmail credentials missing.");
    }

    // Check if credentials are configured
    if (!gmailEmail || !gmailPassword) {
        throw new HttpsError("internal", "❌ Gmail credentials not configured. Run: firebase functions:config:set gmail.email=... gmail.password=...");
    }

    if (!senderEmail || !senderName || !recipientEmail || !pdfBase64 || !invoiceNumber) {
        throw new HttpsError("invalid-argument", "Missing required fields");
    }

    // Validate email formats
    if (!isValidEmail(senderEmail)) {
        throw new HttpsError("invalid-argument", "Invalid sender email format");
    }
    if (!isValidEmail(recipientEmail)) {
        throw new HttpsError("invalid-argument", "Invalid recipient email format");
    }

    // Validate sender email matches configured Gmail
    if (senderEmail !== gmailEmail) {
        throw new HttpsError("invalid-argument", `Sender email must be ${gmailEmail}`);
    }

    // Validate base64
    if (!isValidBase64(pdfBase64)) {
        throw new HttpsError("invalid-argument", "Invalid PDF data format");
    }

    // Validate PDF size (<10MB for Cloud Functions limit)
    const pdfSizeMB = (pdfBase64.length * 3) / (4 * 1024 * 1024);
    if (pdfSizeMB > 10) {
        throw new HttpsError("invalid-argument", `PDF too large (${pdfSizeMB.toFixed(1)}MB). Max: 10MB`);
    }

    try {
        // Test transporter connection
        console.log("Testing Gmail transporter connection...");
        await transporter.verify();
        console.log("✅ Gmail transporter verified successfully");

        // Convert base64 to buffer
        const pdfBuffer = Buffer.from(pdfBase64, "base64");
        console.log(`✓ PDF buffer created: ${pdfBuffer.length} bytes`);

        // Escape HTML in dynamic content
        const safeSenderName = escapeHtml(senderName);
        const safeClientName = escapeHtml(clientName || "Valued Client");
        const safeInvoiceNumber = escapeHtml(invoiceNumber);

        // Send email
        console.log(`Sending email to ${recipientEmail}...`);
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

        const sendResult = await transporter.sendMail(mailOptions);
        console.log(`✅ Email sent successfully. Message ID: ${sendResult.messageId}`);

        // Log the send
        try {
            await db.collection("invoice_sends").add({
                senderEmail,
                senderName: safeSenderName,
                recipientEmail,
                invoiceNumber: safeInvoiceNumber,
                sentAt: admin.firestore.FieldValue.serverTimestamp(),
                status: "success",
                messageId: sendResult.messageId,
            });
        } catch (logError) {
            console.error("Failed to log success to Firestore:", logError);
        }

        return { success: true, message: "Invoice sent successfully", messageId: sendResult.messageId };
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        console.error("❌ Email send error:", errorMessage, error);

        // Log the failure with detailed error
        try {
            await db.collection("invoice_sends").add({
                senderEmail,
                senderName,
                recipientEmail,
                invoiceNumber,
                sentAt: admin.firestore.FieldValue.serverTimestamp(),
                status: "failed",
                error: errorMessage,
            });
        } catch (logError) {
            console.error("Failed to log error to Firestore:", logError);
        }

        // Return detailed error message
        if (errorMessage.includes("Invalid login")) {
            throw new HttpsError("unauthenticated", "❌ Invalid Gmail credentials. Check your app-specific password.");
        } else if (errorMessage.includes("Less secure")) {
            throw new HttpsError("unauthenticated", "❌ Gmail requires app-specific password for this account.");
        } else if (errorMessage.includes("Too many login")) {
            throw new HttpsError("resource-exhausted", "❌ Too many login attempts. Try again later.");
        }
        
        throw new HttpsError("internal", `❌ Failed to send invoice email: ${errorMessage}`);
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
