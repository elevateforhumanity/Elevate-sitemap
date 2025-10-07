#!/bin/bash
set -euo pipefail

echo "🚀 Initializing Elevate for Humanity Ecosystem..."
echo ""

# Enable corepack for pnpm
corepack enable
corepack prepare pnpm@8.15.0 --activate

# Install root dependencies
echo "📦 Installing root dependencies..."
pnpm install --no-frozen-lockfile

echo ""
echo "✅ Environment initialized!"
echo ""
echo "📋 This is a meta-workspace designed to manage multiple repositories."
echo ""
echo "To clone and set up all repositories, run:"
echo "  bash scripts/bootstrap-repos.sh"
echo ""
echo "Or work with the sitemap generator directly:"
echo "  node scripts/generate-sitemaps.js"
echo "  node scripts/validate-sitemaps.js"
echo ""
