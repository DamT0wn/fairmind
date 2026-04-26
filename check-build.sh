#!/bin/bash

echo "🔍 FairScan Build Diagnostic"
echo "============================"
echo ""

ERRORS=0
WARNINGS=0

error() {
    echo "❌ ERROR: $1"
    ((ERRORS++))
}

warning() {
    echo "⚠️  WARNING: $1"
    ((WARNINGS++))
}

success() {
    echo "✅ $1"
}

# Check Node.js and npm
echo "📋 Checking environment..."
if command -v node &> /dev/null; then
    NODE_VERSION=$(node --version)
    success "Node.js installed: $NODE_VERSION"
else
    error "Node.js not found - install from https://nodejs.org"
fi

if command -v npm &> /dev/null; then
    NPM_VERSION=$(npm --version)
    success "npm installed: $NPM_VERSION"
else
    error "npm not found"
fi

# Check frontend structure
echo ""
echo "📋 Checking frontend structure..."
required_files=(
    "frontend/package.json"
    "frontend/src/main.jsx"
    "frontend/src/App.jsx"
    "frontend/index.html"
    "frontend/vite.config.js"
    "frontend/eslint.config.js"
    "frontend/tailwind.config.js"
    "frontend/postcss.config.js"
)

for file in "${required_files[@]}"; do
    if [ -f "$file" ]; then
        success "$file exists"
    else
        error "$file is missing"
    fi
done

# Check dependencies are listed
echo ""
echo "📋 Checking dependencies in package.json..."
if grep -q "vite" frontend/package.json; then
    success "Vite is listed as dependency"
else
    error "Vite is not in dependencies"
fi

if grep -q "react" frontend/package.json; then
    success "React is listed as dependency"
else
    error "React is not in dependencies"
fi

# Check for syntax errors in key files
echo ""
echo "📋 Checking JavaScript syntax..."
if node -c frontend/vite.config.js 2>/dev/null; then
    success "vite.config.js syntax is valid"
else
    error "vite.config.js has syntax errors"
fi

if node -c frontend/eslint.config.js 2>/dev/null; then
    success "eslint.config.js syntax is valid"
else
    error "eslint.config.js has syntax errors"
fi

# Check package.json validity
echo ""
echo "📋 Checking package.json validity..."
if node -e "JSON.parse(require('fs').readFileSync('frontend/package.json'))" 2>/dev/null; then
    success "package.json is valid JSON"
else
    error "package.json has invalid JSON"
fi

# Summary
echo ""
echo "============================"
echo "Summary:"
echo "--------"

if [ $ERRORS -eq 0 ]; then
    echo "✅ No critical errors found!"
    echo ""
    echo "Try building locally:"
    echo "  cd frontend"
    echo "  npm install"
    echo "  npm run build"
else
    echo "❌ Found $ERRORS error(s) that need fixing"
fi

if [ $WARNINGS -gt 0 ]; then
    echo "⚠️  Found $WARNINGS warning(s)"
fi

exit $ERRORS
