# FairMind - Quick Start Guide

## 🚀 Get Started in 3 Minutes

### Step 1: Install Dependencies

```bash
# Navigate to frontend
cd fairmind/frontend

# Install all dependencies
npm install
```

### Step 2: Start the Development Server

```bash
# Start frontend (runs on http://localhost:5173)
npm run dev
```

### Step 3: Start the Backend (in a new terminal)

```bash
# Navigate to backend
cd fairmind/backend

# Install Python dependencies
uv pip install -r pyproject.toml

# Start backend server (runs on http://localhost:8000)
python main.py
```

## 🎨 What You'll See

### 1. **Modern Landing Page**
- Beautiful gradient hero section
- Stats showcase (10K+ models audited)
- Feature cards with hover effects
- Step-by-step process guide
- Dark mode toggle in header

### 2. **Audit Form**
- Drag & drop file upload zones
- Visual feedback when files are loaded
- "Load Demo Data" button for quick testing
- Smooth animations and transitions

### 3. **Results Dashboard**
- Risk level indicator (Low/Medium/High)
- Interactive charts (Bar, Line, Radar)
- Detailed metrics table
- Mitigation strategies
- PDF report download

## 🎯 Try It Out

### Option 1: Use Demo Data
1. Click "Start Audit"
2. Click "Load Demo Data"
3. Click "Run Audit"
4. View beautiful results!

### Option 2: Upload Your Own Data
1. Click "Start Audit"
2. Enter model name
3. Select protected attribute
4. Upload predictions file (one 0 or 1 per line)
5. Upload actuals file (one 0 or 1 per line)
6. Optionally upload groups file (one group name per line)
7. Click "Run Audit"

## 🌓 Dark Mode

Click the moon/sun icon in the header to toggle between light and dark modes. Your preference is saved automatically!

## 📱 Responsive Design

Try resizing your browser - the UI adapts beautifully to any screen size:
- Mobile (< 768px)
- Tablet (768px - 1024px)
- Desktop (> 1024px)

## 🎨 Key Features to Explore

### Animations
- Smooth page transitions
- Hover effects on cards and buttons
- Staggered animations on dashboard
- Loading spinners
- Icon transitions

### Visualizations
- Color-coded bias metrics (green = good, red = high bias)
- Radar chart for fairness overview
- Line chart for group comparisons
- Interactive tooltips
- Responsive charts

### User Experience
- Glass morphism effects
- Gradient accents
- Soft shadows
- Rounded corners
- Backdrop blur

## 🔧 Configuration

### Environment Variables

Create `frontend/.env`:
```env
VITE_API_URL=http://localhost:8000/api
```

Create `backend/.env`:
```env
CORS_ORIGINS=http://localhost:5173,http://localhost:3000
DEBUG=True
```

## 🐛 Troubleshooting

### Frontend won't start
```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

### Backend not responding
```bash
# Check if backend is running
curl http://localhost:8000/docs

# Restart backend
cd backend
python main.py
```

### CORS errors
- Make sure backend `.env` includes your frontend URL
- Check that both servers are running
- Clear browser cache

## 📚 Next Steps

1. **Explore the code** - Check out the component structure
2. **Customize colors** - Edit `tailwind.config.js`
3. **Add features** - Build on the modern foundation
4. **Deploy** - Use Vercel for frontend, Railway for backend

## 🎓 Learn More

- Read `UPGRADE_NOTES.md` for detailed design decisions
- Check `README.md` for full documentation
- Explore component files in `src/components/`

## 💡 Tips

- Use the demo data to quickly test the UI
- Try dark mode - it's beautiful!
- Hover over cards and buttons to see animations
- Resize the window to see responsive design
- Check the browser console for any errors

---

**Enjoy your modern AI bias auditing experience! 🎉**
