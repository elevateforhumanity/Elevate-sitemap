#!/bin/bash
set -euo pipefail

echo "🚀 Cloning Elevate for Humanity ecosystem repositories..."
echo ""

# Define repositories: url#branch|path|purpose
# Note: LMS repository not yet available - add when created
declare -A REPOS=(
  ["https://github.com/elevateforhumanity/ecosystem3#main"]="apps/marketing|Marketing Website"
  ["https://github.com/elevateforhumanity/ecosystem2#main"]="apps/admin|Admin Dashboard"
  ["https://github.com/elevateforhumanity/ecosystem-5#main"]="packages/shared|Shared Packages"
)

# Clone each repository
for repo_spec in "${!REPOS[@]}"; do
  IFS='|' read -r path purpose <<< "${REPOS[$repo_spec]}"
  url="${repo_spec%%#*}"
  branch="${repo_spec##*#}"
  
  echo "📦 Cloning $purpose → $path"
  mkdir -p "$(dirname "$path")"
  
  if [ -d "$path" ]; then
    echo "  ⚠️  Directory exists, pulling latest..."
    (cd "$path" && git pull) || echo "  ⚠️  Pull failed, continuing..."
  else
    git clone --depth=1 -b "$branch" "$url" "$path" || {
      echo "  ❌ Failed to clone $url"
      continue
    }
  fi
  
  echo "  ✅ $purpose ready"
  echo ""
done

echo "📊 Analyzing repository structures..."
node scripts/analyze-structure.js || echo "⚠️  Analysis script failed"

echo ""
echo "📦 Installing dependencies across workspace..."
pnpm install --no-frozen-lockfile || echo "⚠️  Some dependencies failed to install"

echo ""
echo "✅ Bootstrap complete!"
echo ""
echo "📋 Next steps:"
echo "  1. Review STRUCTURE_ANALYSIS.json"
echo "  2. Run 'pnpm dev' to start all apps"
echo "  3. Check running services on their respective ports"
echo ""
