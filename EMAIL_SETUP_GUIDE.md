# Invoice Email System - Setup Guide

This guide will help you set up the invoice email functionality with automatic scheduling capabilities.

## Architecture Overview

The system consists of:
- **Frontend React App**: Invoice Generator with email UI
- **Firebase Services**: Firestore for storage, Cloud Functions for email sending
- **Scheduled Cloud Function**: Runs daily to auto-send scheduled invoices
- **Gmail**: SMTP provider for sending emails

---

## Step 1: Set Up Gmail for Sending

### Option A: Using Your Personal Gmail Account (Recommended)

1. **Enable 2-Factor Authentication** (required):
   - Go to https://myaccount.google.com/security
   - Click "2-Step Verification" and follow the steps
   - Complete any security checks

2. **Create an App-Specific Password**:
   - Go to https://myaccount.google.com/apppasswords
   - Select "Mail" and "Windows Computer"
   - Gmail will generate a 16-character password
   - **Copy this password** (you'll need it in Step 3)

### Option B: Using SendGrid (Alternative)

If you prefer not to use Gmail directly, set up SendGrid:
- Sign up at https://sendgrid.com
- Get your API key from sendgrid.com/settings/api_keys
- Modify the `functions/src/index.ts` to use SendGrid instead of Gmail (contact me for code changes)

---

## Step 2: Set Up Firebase Cloud Functions

### Prerequisites:
- Node.js 18+ installed
- Firebase CLI installed: `npm install -g firebase-tools`

### Install Dependencies:

```bash
cd c:\Personal Project\africanite-services
cd functions
npm install
cd ..
```

### Verify Installation:
```bash
firebase --version
```

---

## Step 3: Configure Firebase Environment Variables

Set your Gmail credentials in Firebase:

```bash
firebase functions:config:set gmail.email="your-email@gmail.com" gmail.password="your-16-char-app-password"
```

**Example:**
```bash
firebase functions:config:set gmail.email="kandy.foma@gmail.com" gmail.password="abcd efgh ijkl mnop"
```

Check the config was saved:
```bash
firebase functions:config:get
```

---

## Step 4: Deploy Cloud Functions

### Build and Deploy:

```bash
cd c:\Personal Project\africanite-services
firebase deploy --only functions
```

This will:
1. Build TypeScript to JavaScript (in `functions/lib/`)
2. Deploy 5 Cloud Functions to Firebase:
   - `sendInvoiceEmail` - Send invoice immediately
   - `saveScheduledInvoice` - Schedule for future sends
   - `getScheduledInvoices` - Retrieve all scheduled
   - `deleteScheduledInvoice` - Remove a schedule
   - `processDailyScheduledInvoices` - Daily scheduler (runs at 9 AM UTC)

**Success indicators:**
```
✔ Deploy complete!

Function URL: https://us-central1-africanite-services.cloudfunctions.net/sendInvoiceEmail
...
```

---

## Step 5: Update Firestore Security Rules

Go to Firebase Console → Firestore DB → Rules

Replace with:
```firestore
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow anyone to read/write invoice_sends (logging)
    match /invoice_sends/{document=**} {
      allow read, write;
    }
    // Allow anyone to read scheduled invoices
    match /scheduled_invoices/{document=**} {
      allow read, write;
    }
  }
}
```

**Note:** For production, you should add authentication checks.

---

## Step 6: Test the System

### Option A: Manual Test via Firebase Console

1. Go to Firebase Console → Functions
2. Click `sendInvoiceEmail`
3. Click "Testing" tab
4. Set up request data:
```json
{
  "recipientEmail": "test@example.com",
  "invoiceNumber": "001",
  "invoiceDate": "2026-03-12",
  "dueDate": "2026-04-12",
  "totalAmount": 5200,
  "clientName": "Test Client",
  "pdfBase64": "base64-encoded-pdf-data-here"
}
```

### Option B: Test via Invoice App

1. Open the Invoice Generator in your browser
2. Fill out the form and click "Preview"
3. Click "Download PDF"
4. Click "Send Email" button
5. Enter a test email address
6. Choose "Send Now" or schedule it
7. Check your email!

---

## Step 7: Monitor and Troubleshoot

### View Cloud Function Logs:

```bash
firebase functions:log
```

Or go to Firebase Console → Functions → your-function → Logs

### Common Issues:

**Error: "Gmail credentials not configured"**
- Run `firebase functions:config:get`
- Ensure gmail.email and gmail.password are set
- Re-deploy: `firebase deploy --only functions`

**Email not sending:**
- Check logs: `firebase functions:log`
- Verify Gmail app-specific password is correct
- Ensure 2FA is enabled on Gmail account
- Check spam folder in recipient's email

**Function timeout:**
- Check internet connection
- Verify Gmail SMTP is accessible
- Increase timeout in functions configuration

---

## Step 8: How to Use the Invoice Email Feature

### In the App:

1. **Fill out invoice** → Click "Preview" → Click "Download PDF"
2. Click **"Send Email"** button in toolbar
3. Enter recipient email address
4. Choose an option:
   - **Send Now**: Sends immediately
   - **Schedule for Future Months**: Accordion menu
     - Select frequency (Monthly, Quarterly, Yearly)
     - Click "Schedule"
5. View all scheduled invoices below

### Automatic Sends:

- Scheduled invoices are checked daily at **9 AM UTC**
- When the date matches, the system auto-generates and sends
- Next send date automatically advances based on frequency

---

## Advanced: Modify Scheduled Invoice Logic

If you need different behavior, edit `functions/src/index.ts`:

### Change daily check time:
Find line ~200:
```typescript
.schedule("0 9 * * *")  // Currently 9 AM UTC
```

Change to different time:
```typescript
.schedule("0 8 * * *")  // 8 AM UTC
.schedule("30 14 * * *") // 2:30 PM UTC
```

### Change email template:
Find the `sendInvoiceEmail` function (lines ~30-70) and modify the HTML email template.

### Re-deploy after changes:
```bash
firebase deploy --only functions
```

---

## Troubleshooting Checklist

- [ ] Gmail 2FA enabled
- [ ] App-specific password generated (16 chars)
- [ ] Firebase functions config set correctly
- [ ] Cloud Functions deployed successfully
- [ ] Firestore rules updated
- [ ] Can receive test email in personal inbox
- [ ] Email appears in logs: `firebase functions:log`

---

## Support & Next Steps

If you encounter issues:

1. Check the logs: `firebase functions:log`
2. Verify credentials are correct: `firebase functions:config:get`
3. Test Gmail SMTP manually (optional advanced step)
4. Check Firebase console for any deployment errors

Once everything is working:
- Download and send invoices manually anytime
- Set up auto-reminders for clients
- Track invoice sends in the logs
- Monitor daily auto-sends

---

**Your Invoice System is Now Ready! 🎉**
