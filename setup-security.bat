@echo off
REM Setup script for Git security hooks on Windows
REM Run this once after cloning the repository

echo.
echo 🔐 Setting up Git security...
echo.

REM Check if .git directory exists
if not exist ".git\" (
    echo ❌ Not a git repository. Please run this from the repository root.
    pause
    exit /b 1
)

REM Configure git hooks path
echo 📝 Configuring git hooks path...
git config core.hooksPath .githooks

if %errorlevel% equ 0 (
    echo ✅ Git hooks path configured
) else (
    echo ❌ Failed to configure git hooks
    pause
    exit /b 1
)

REM Check if .env exists, if not create from example
if not exist ".env" (
    if exist ".env.example" (
        echo 📄 Creating .env from .env.example...
        copy .env.example .env
        echo ✅ .env created
        echo ⚠️  IMPORTANT: Edit .env with your actual configuration values!
    )
) else (
    echo ℹ️  .env already exists
)

REM Check if gitleaks is installed
where gitleaks >nul 2>nul
if %errorlevel% equ 0 (
    echo ✅ gitleaks is installed
) else (
    echo ℹ️  gitleaks not found. Consider installing for better secret detection:
    echo    npm install -g gitleaks
)

echo.
echo 🎉 Setup complete!
echo.
echo Next steps:
echo 1. Edit .env with your actual Firebase configuration
echo 2. Run: firebase functions:config:set gmail.email="your-email" gmail.password="your-app-password"
echo 3. Commit your changes
echo.
echo The pre-commit hook will now check for secrets before each commit.
echo.
pause
