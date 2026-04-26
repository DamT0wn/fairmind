# FairMind Installation Guide

## 🎯 Complete Setup Instructions

Follow these steps to get FairMind running with the new modern UI.

## Prerequisites

- **Node.js** 16+ (check with `node --version`)
- **Python** 3.9+ (check with `python --version`)
- **npm** or **pnpm** (check with `npm --version`)

## 📦 Installation Steps

### Step 1: Install Frontend Dependencies

```bash
cd fairmind/frontend
npm install
```

This will install:
- React 19
- Vite 8
- Tailwind CSS 3.4
- Framer Motion 12
- Recharts 3.8
- Lucide React
- Axios

**Expected time**: 1-2 minutes

### Step 2: Install Backend Dependencies

```bash
cd ../backend
uv pip install -r pyproject.toml
```

Or if you don't have `uv`:

```bash
pip install fastapi uvicorn python-multipart scikit-learn pandas numpy scipy matplotlib seaborn reportlab pydantic python-dotenv
```

**Expected time**: 2-3 minutes

### Step 3: Configure Environment Variables

#### Frontend Configuration

Create `frontend/.env`:

```bash
cd ../frontend
cat > .env << EOF
VITE_API_URL=http://localhost:8000/api
EOF
```

Or manually create the file with:
```env
VITE_API_URL=http://localhost:8000/api
```

#### Backend Configuration

Create `backend/.env`:

```bash
cd ../backend
cat > .env << EOF
CORS_ORIGINS=http://localhost:5173,http://localhost:3000
DEBUG=True
EOF
```

Or manually create the file with:
```env
CORS_ORIGINS=http://localhost:5173,http://localhost:3000
DEBUG=True
```

### Step 4: Start the Servers

#### Terminal 1 - Backend Server

```bash
cd fairmind/backend
python main.py
```

You should see:
```
INFO:     Uvicorn running on http://0.0.0.0:8000
INFO:     Application startup complete.
```

#### Terminal 2 - Frontend Server

```bash
cd fairmind/frontend
npm run dev
```

You should see:
```
  VITE v8.x.x  ready in xxx ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
```

### Step 5: Open in Browser

Navigate to: **http://localhost:5173**

You should see the beautiful new FairMind UI! 🎉

## 🎨 What to Expect

### Landing Page
- Modern gradient hero section
- Animated stats cards
- Feature showcase
- Dark mode toggle in header

### Try It Out
1. Click "Start Audit"
2. Click "Load Demo Data"
3. Click "Run Audit"
4. View the beautiful results dashboard!

## 🔧 Verification Checklist

- [ ] Frontend loads at http://localhost:5173
- [ ] Backend API docs at http://localhost:8000/docs
- [ ] Dark mode toggle works
- [ ] Animations are smooth
- [ ] Demo data loads successfully
- [ ] Charts display correctly
- [ ] PDF download works

## 🐛 Common Issues & Solutions

### Issue 1: Port Already in Use

**Frontend (5173)**
```bash
# Kill process on port 5173
# Windows
netstat -ano | findstr :5173
taskkill /PID <PID> /F

# Mac/Linux
lsof -ti:5173 | xargs kill -9
```

**Backend (8000)**
```bash
# Kill process on port 8000
# Windows
netstat -ano | findstr :8000
taskkill /PID <PID> /F

# Mac/Linux
lsof -ti:8000 | xargs kill -9
```

### Issue 2: Module Not Found

**Frontend**
```bash
cd fairmind/frontend
rm -rf node_modules package-lock.json
npm install
```

**Backend**
```bash
cd fairmind/backend
pip install --upgrade pip
pip install -r pyproject.toml
```

### Issue 3: CORS Errors

Check that:
1. Backend `.env` includes frontend URL
2. Both servers are running
3. URLs match exactly (including http://)

Fix:
```bash
# backend/.env
CORS_ORIGINS=http://localhost:5173
```

### Issue 4: Tailwind Styles Not Loading

```bash
cd fairmind/frontend
npm run build
npm run dev
```

### Issue 5: Dark Mode Not Working

Clear browser cache and localStorage:
```javascript
// In browser console
localStorage.clear()
location.reload()
```

## 📱 Testing on Mobile

### Option 1: Use Network URL

```bash
# Start frontend with --host flag
npm run dev -- --host

# Access from mobile using your computer's IP
# Example: http://192.168.1.100:5173
```

### Option 2: Use ngrok

```bash
# Install ngrok
npm install -g ngrok

# Expose frontend
ngrok http 5173

# Use the ngrok URL on mobile
```

## 🚀 Production Build

### Build Frontend

```bash
cd fairmind/frontend
npm run build
```

Output will be in `dist/` folder.

### Deploy Frontend (Vercel)

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
cd fairmind/frontend
vercel
```

### Deploy Backend (Railway)

1. Create account at railway.app
2. Connect GitHub repository
3. Select backend folder
4. Add environment variables
5. Deploy!

## 🎓 Next Steps

1. **Explore the UI** - Try all features
2. **Read Documentation** - Check UPGRADE_NOTES.md
3. **Customize** - Edit tailwind.config.js
4. **Add Features** - Build on the foundation
5. **Deploy** - Share with the world!

## 📚 Additional Resources

- [Quick Start Guide](QUICKSTART.md)
- [UI Improvements](UI_IMPROVEMENTS.md)
- [Upgrade Notes](UPGRADE_NOTES.md)
- [Frontend README](frontend/README.md)

## 💡 Pro Tips

1. **Use Demo Data** - Fastest way to see the UI in action
2. **Try Dark Mode** - Toggle in the header
3. **Resize Window** - See responsive design
4. **Hover Everything** - Discover micro-interactions
5. **Check Console** - Look for any errors

## 🆘 Need Help?

If you encounter issues:

1. Check this guide's troubleshooting section
2. Verify all prerequisites are installed
3. Check browser console for errors
4. Check terminal output for errors
5. Try clearing cache and reinstalling

## ✅ Success Indicators

You'll know everything is working when:

- ✅ Frontend loads with beautiful gradient background
- ✅ Dark mode toggle works smoothly
- ✅ Animations are fluid and smooth
- ✅ Demo data loads and displays results
- ✅ Charts are interactive and colorful
- ✅ PDF download generates successfully

---

**Congratulations! You're ready to use FairMind! 🎉**

Enjoy the modern, beautiful interface for AI bias detection and mitigation.
