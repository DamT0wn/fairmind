# Vercel Build Fix Guide

## 🚨 Build Failed Error

If you see: "Deployment has failed" on Vercel, follow these steps.

---

## ✅ Step 1: Run Local Build Diagnostic

```bash
chmod +x check-build.sh
./check-build.sh
```

This will identify any issues before redeploying.

---

## ✅ Step 2: Build Frontend Locally

```bash
cd frontend

# Clear cache
rm -rf node_modules package-lock.json

# Clean install
npm ci

# Run build
npm run build
```

If this fails, see **Common Build Errors** below.

---

## ✅ Step 3: Fix and Push

Once local build works:

```bash
git add .
git commit -m "Fix build issues"
git push origin main
```

Vercel will automatically redeploy.

---

## 🔧 Common Build Errors

### ❌ Error: "Cannot find module 'vite'"

**Cause:** Dependencies not installed

**Fix:**
```bash
cd frontend
npm ci  # Use ci instead of install for CI/CD
```

### ❌ Error: "Unexpected token" or syntax error

**Cause:** ESLint or JSX parsing error

**Check:**
```bash
# Check files for syntax errors
node -c src/App.jsx
node -c src/components/Dashboard.jsx
node -c src/components/AuditForm.jsx
node -c src/components/ResultsDisplay.jsx
```

### ❌ Error: "Module not found: 'recharts'"

**Cause:** Dependencies missing from package.json

**Fix:**
```bash
cd frontend
npm install recharts axios framer-motion lucide-react react-router-dom
npm run build
```

### ❌ Error: "VITE_API_URL is not defined"

**Cause:** Environment variable not set in Vercel

**Fix on Vercel:**
1. Go to Project Settings
2. Environment Variables
3. Add: `VITE_API_URL` = `https://your-backend-url/api`
4. Redeploy

### ❌ Error: "Out of memory" or build timeout

**Cause:** Build is too large or slow

**Fix:**
- Update `vite.config.js` to optimize build
- Reduce chunk size
- Enable minification

---

## 🔍 Vercel Build Logs

To see detailed error messages:

1. Go to https://vercel.com
2. Select your project
3. Click "Deployments" tab
4. Click on the failed deployment
5. Scroll to "Build Logs" section
6. Look for error messages with red text

---

## 🔧 Configuration Files to Check

Make sure these files exist and are correct:

```
frontend/
├── package.json ✅
├── vite.config.js ✅
├── eslint.config.js ✅
├── tailwind.config.js ✅
├── postcss.config.js ✅
├── index.html ✅
└── src/
    ├── main.jsx ✅
    ├── App.jsx ✅
    ├── index.css ✅
    └── components/
        ├── Dashboard.jsx ✅
        ├── AuditForm.jsx ✅
        └── ResultsDisplay.jsx ✅
```

---

## 📝 Environment Variables Required

**On Vercel Project Settings:**

| Variable | Value | Example |
|----------|-------|---------|
| VITE_API_URL | Backend URL | https://fairmind-backend.onrender.com/api |

---

## 🔄 Redeploy After Fixes

### Option 1: Automatic (Git Push)
```bash
git push origin main
# Vercel will automatically redeploy
```

### Option 2: Manual Redeploy
1. Go to Vercel dashboard
2. Select project
3. Click "Deployments"
4. Click on latest deployment
5. Click "Redeploy"

---

## 💡 Pro Tips

1. **Use `npm ci` instead of `npm install`** in build commands
   - More reliable for CI/CD environments
   - Already in vercel.json

2. **Check file sizes**
   - Large builds may timeout
   - Monitor bundle size

3. **Enable build logging**
   - Save Vercel logs when reporting issues
   - Include: branch, commit, error message

4. **Verify locally first**
   - Run `npm run build` locally
   - Fix all errors before pushing
   - Test in `npm run preview`

---

## 🆘 Still Failing?

1. **Check build logs** on Vercel dashboard
2. **Run local diagnostic**: `./check-build.sh`
3. **Build locally**: `cd frontend && npm run build`
4. **Check git status**: `git status` (no uncommitted changes)
5. **Review recent commits**: `git log --oneline -5`

---

## 📚 Useful Links

- [Vercel Troubleshooting](https://vercel.com/docs/platform/frequently-asked-questions)
- [Vite Build Guide](https://vitejs.dev/guide/build.html)
- [npm ci Documentation](https://docs.npmjs.com/cli/ci)

---

**Last Updated:** 2026-04-26
**Status:** Ready for production deployment ✅
