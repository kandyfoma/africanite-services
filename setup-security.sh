#!/bin/bash

# Setup script for Git security hooks
# Run this once after cloning the repository

echo "🔐 Setting up Git security..."

# Check if .git directory exists
if [ ! -d ".git" ]; then
    echo "❌ Not a git repository. Please run this from the repository root."
    exit 1
fi

# Configure git hooks path
echo "📝 Configuring git hooks path..."
git config core.hooksPath .githooks

if [ $? -eq 0 ]; then
    echo "✅ Git hooks path configured"
else
    echo "❌ Failed to configure git hooks"
    exit 1
fi

# Make hooks executable (Unix/Linux/MacOS)
if [[ "$OSTYPE" != "msys" && "$OSTYPE" != "cygwin" && "$OSTYPE" != "win32" ]]; then
    echo "🔑 Making hooks executable..."
    chmod +x .githooks/pre-commit .githooks/pre-push
    echo "✅ Hooks are executable"
else
    echo "ℹ️  On Windows, Git should handle script permissions automatically"
fi

# Check if .env exists, if not create from example
if [ ! -f ".env" ] && [ -f ".env.example" ]; then
    echo "📄 Creating .env from .env.example..."
    cp .env.example .env
    echo "✅ .env created"
    echo "⚠️  IMPORTANT: Edit .env with your actual configuration values!"
fi

# Check if gitleaks is installed
if command -v gitleaks &> /dev/null; then
    echo "✅ gitleaks is installed"
else
    echo "ℹ️  gitleaks not found. Consider installing for better secret detection:"
    echo "   npm install -g gitleaks"
fi

echo ""
echo "🎉 Setup complete!"
echo ""
echo "Next steps:"
echo "1. Edit .env with your actual Firebase configuration"
echo "2. Run: firebase functions:config:set gmail.email=\"your-email\" gmail.password=\"your-app-password\""
echo "3. Commit your changes"
echo ""
echo "The pre-commit hook will now check for secrets before each commit."
