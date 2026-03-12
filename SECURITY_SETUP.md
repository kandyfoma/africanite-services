# 🔐 Secret Management & Git Security Setup

## ⚠️ Current Status

Your project contains **hardcoded sensitive information** that should NOT be committed to GitHub:

### Identified Issues:
1. **Firebase API Key** in `src/services/firebaseConfig.ts` (line 7-14)
   - Contains: `apiKey: "AIzaSyB9OEgQmHKvYUex0PvbreJUzhT2574B8kc"`
   
2. **Gmail Credentials** mentioned in code comments (from Cloud Functions)
   - Email: `foma.kandy@gmail.com`
   - App password configured in Firebase config

3. **No root-level .gitignore** - sensitive files could be accidentally committed

???

## ✅ Security Setup (COMPLETED)

The following security measures have been implemented:

### 1. **Updated `.gitignore` Files**
- Root-level `.gitignore` created with comprehensive patterns
- Blocks: `.env`, `.runtimeconfig.json`, `credentials.json`, Firebase configs, etc.
- Functions `.gitignore` already has sensitive patterns

### 2. **`.gitleaks.toml` Configuration**
- Detects Firebase API Keys, AWS credentials, private keys, passwords, etc.
- Ready to use with `gitleaks` CLI tool

### 3. **Git Hooks for Secret Detection**
- `.githooks/pre-commit` - Blocks commits with secrets
- `.githooks/pre-push` - Blocks pushes with secrets (if gitleaks installed)

### 4. **Environment Configuration**
- `.env.example` created showing what should be in `.env`
- Safe template for team members to copy and configure

---

## 🚀 Next Steps (REQUIRED)

### Step 1: Install Git Hooks
```bash
# Configure git to use the .githooks directory
git config core.hooksPath .githooks

# Make hooks executable (Unix/Mac)
chmod +x .githooks/pre-commit .githooks/pre-push
```

### Step 2: Refactor Firebase Config to Use Environment Variables

**Before (UNSAFE):**
```typescript
// src/services/firebaseConfig.ts
const firebaseConfig = {
  apiKey: "AIzaSyB9OEgQmHKvYUex0PvbreJUzhT2574B8kc", // ❌ EXPOSED
  authDomain: "africanite-services.firebaseapp.com",
  // ...
};
```

**After (SAFE):**
```typescript
// src/services/firebaseConfig.ts
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "",
};

if (!firebaseConfig.apiKey) {
  throw new Error("Firebase config variables not set. Check .env file.");
}
```

### Step 3: Create `.env` File Locally (NOT committed)
```bash
# Copy example to create local .env
cp .env.example .env

# Edit .env with your actual values
echo "VITE_FIREBASE_API_KEY=AIzaSyB9OEgQmHKvYUex0PvbreJUzhT2574B8kc" >> .env
```

### Step 4: Install gitleaks (Recommended)
For stronger secret detection:
```bash
# Using npm
npm install -g gitleaks

# Or download from https://github.com/gitleaks/gitleaks/releases
```

### Step 5: Configure Firebase Functions Secrets
DON'T commit Gmail credentials to `.env`:
```bash
# Use Firebase CLI to securely store secrets
firebase functions:config:set gmail.email="foma.kandy@gmail.com" gmail.password="udjqnnvbvizfbekt"

# Verify
firebase functions:config:get

# Access in functions
functions.config().gmail.email
functions.config().gmail.password
```

### Step 6: Review Git History (If Already Committed)
If sensitive data was already pushed to GitHub:
```bash
# View what would be deleted
git filter-branch --tree-filter 'rm -f .env credentials.json' --prune-empty

# Clean sensitive files from history
bfg --delete-files .env --delete-files credentials.json
```

---

## 🛡️ Security Checklist

- [ ] `.gitignore` is configured in root and all subdirectories
- [ ] Git hooks are installed and executable
- [ ] `firebase.json` and `.firebaserc` are in `.gitignore` (if they contain secrets)
- [ ] `.env` is in `.gitignore` and only `.env.example` is committed
- [ ] Firebase config uses environment variables instead of hardcoded keys
- [ ] Gmail credentials are stored in Firebase config (not in code)
- [ ] Team members have a setup guide (this document)
- [ ] `git config core.hooksPath .githooks` is set locally
- [ ] No `.pem`, `.key`, or certificate files in repository
- [ ] `gitleaks` is installed for pre-push detection

---

## 📋 Testing Security Setup

### Test 1: Try to Commit Sensitive File
```bash
# Create .env with secrets
echo "API_KEY=secret123" > .env

# Add and try to stage
git add .env

# Try to commit (should be blocked)
git commit -m "test" # ❌ Pre-commit hook blocks this

# Pre-commit hook error message:
# ❌ ERROR: Sensitive file detected: .env
# ⚠️  COMMIT BLOCKED: Potential secrets detected!
```

### Test 2: Check Hooks Status
```bash
# Verify hooks are in use
git config --get core.hooksPath
# Expected output: .githooks

# Verify pre-commit hook exists and is executable
ls -l .githooks/pre-commit
```

### Test 3: Safe Commit
```bash
# Add .env to .gitignore if not already
echo ".env" >> .gitignore

# Commit gitignore update
git add .gitignore
git commit -m "Add .env to gitignore" # ✅ Should succeed
```

---

## 🚨 What TO DO If You Accidentally Push Secrets

1. **Immediately revoke credentials** (regenerate API keys in Firebase Console)
2. **Remove from GitHub** using BFG: `bfg --delete-files .env`
3. **Force push** to remove from history (if not public): `git push --force-with-lease`
4. **Notify team** about the breach
5. **Regenerate all Firebase API keys** in Console

---

## 📚 Additional Resources

- [GitHub Secret Scanning](https://docs.github.com/en/code-security/secret-scanning)
- [gitleaks Documentation](https://github.com/gitleaks/gitleaks)
- [Firebase Security Best Practices](https://firebase.google.com/docs/projects/locations)
- [OWASP Secrets Management](https://cheatsheetseries.owasp.org/cheatsheets/Secrets_Management_Cheat_Sheet.html)

---

## ⚡ Quick Reference

### Commands to Run Now

```bash
# 1. Configure git hooks
git config core.hooksPath .githooks

# 2. Make hooks executable (MacOS/Linux only)
chmod +x .githooks/*

# 3. Create local .env from example
cp .env.example .env

# 4. Configure Firebase secrets
firebase functions:config:set gmail.email="foma.kandy@gmail.com"

# 5. Test the setup
git status # Check what's staged
```

### Verify No Secrets Exposed

```bash
# Search git history for exposed patterns
git log -p -S 'AIzaSy' # Search for Firebase keys
git log -p -S 'password' # Search for passwords
git log -p -S 'secret' # Search for secrets
```

---

**Status**: ✅ Security infrastructure is ready. Follow "Next Steps" to complete the setup.
