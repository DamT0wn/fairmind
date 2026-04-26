# FairMind Frontend - Modern UI

A beautiful, modern React application for AI bias detection and mitigation, built with the latest web technologies and design trends.

## ✨ Features

- 🎨 **Modern Design System** - Tailwind CSS with custom design tokens
- 🌓 **Dark Mode** - Full dark mode support with system preference detection
- ✨ **Smooth Animations** - Framer Motion for fluid micro-interactions
- 📊 **Data Visualizations** - Interactive charts with Recharts
- 📱 **Responsive Design** - Works beautifully on all devices
- ♿ **Accessible** - WCAG AA compliant with semantic HTML
- 🚀 **Fast** - Optimized bundle size and performance

## 🚀 Quick Start

### Install Dependencies
```bash
npm install
```

### Start Development Server
```bash
npm run dev
```

### Build for Production
```bash
npm run build
```

### Preview Production Build
```bash
npm run preview
```

## 🛠️ Tech Stack

- **React 19** - Latest React with concurrent features
- **Vite 8** - Lightning-fast build tool
- **Tailwind CSS 3.4** - Utility-first CSS framework
- **Framer Motion 12** - Production-ready animation library
- **Recharts 3.8** - Composable charting library
- **Lucide React** - Beautiful, consistent icons
- **Axios** - Promise-based HTTP client

## 📁 Project Structure

```
src/
├── App.jsx                 # Main app component with routing
├── index.css              # Tailwind imports & custom styles
├── main.jsx               # App entry point
├── components/
│   ├── Dashboard.jsx      # Landing page with hero & features
│   ├── AuditForm.jsx      # File upload & audit form
│   └── ResultsDisplay.jsx # Results with charts & metrics
└── services/              # API services (if needed)
```

## 🎨 Design System

### Colors
- **Primary**: Blue-600 to Indigo-600 gradient
- **Accent**: Green-500 to Emerald-500
- **Success**: Green-500
- **Warning**: Amber-500
- **Danger**: Red-500

### Typography
- **Font**: System fonts for optimal performance
- **Scale**: Responsive from text-sm to text-6xl
- **Weight**: Regular (400) to Bold (700)

### Spacing
- **Container**: max-w-7xl (1280px)
- **Padding**: 4-8 units (1rem-2rem)
- **Gap**: 4-6 units for grids

### Components
- **Cards**: Glass effect with backdrop blur
- **Buttons**: Gradient with shadow effects
- **Inputs**: Glass effect with focus states
- **Charts**: Responsive with custom tooltips

## 🌓 Dark Mode

Dark mode is automatically detected from system preferences and can be toggled manually. The preference is saved to localStorage.

```javascript
// Toggle dark mode
const toggleDarkMode = () => {
  document.documentElement.classList.toggle('dark');
  localStorage.setItem('theme', isDark ? 'light' : 'dark');
};
```

## 📊 Charts & Visualizations

### Chart Types
- **Bar Chart** - Bias metrics comparison
- **Radar Chart** - Fairness metrics overview
- **Line Chart** - Group performance analysis

### Features
- Interactive tooltips
- Responsive containers
- Color-coded values
- Custom styling

## 🎭 Animations

### Page Transitions
```javascript
const pageVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 }
};
```

### Micro-interactions
- Button hover: `scale(1.05)`
- Button tap: `scale(0.95)`
- Card hover: `translateY(-8px)`
- Icon transitions: `rotate + fade`

## 📱 Responsive Breakpoints

```javascript
sm: '640px'   // Small devices
md: '768px'   // Tablets
lg: '1024px'  // Laptops
xl: '1280px'  // Desktops
2xl: '1536px' // Large screens
```

## 🔧 Configuration

### Environment Variables

Create a `.env` file:

```env
VITE_API_URL=http://localhost:8000/api
```

### Tailwind Configuration

Edit `tailwind.config.js` to customize:
- Colors
- Fonts
- Spacing
- Animations
- Breakpoints

## 🎯 Key Components

### Dashboard
Landing page with:
- Hero section with gradient text
- Stats showcase
- Feature cards
- Process steps
- CTA sections

### AuditForm
Upload form with:
- Drag & drop file zones
- Visual feedback
- Demo data loader
- Form validation
- Error handling

### ResultsDisplay
Results page with:
- Risk level indicator
- Multiple chart types
- Metrics table
- Mitigation strategies
- PDF report download

## 🚀 Performance

### Optimizations
- Tree-shaking for icons
- CSS purging with Tailwind
- Code splitting ready
- Lazy loading ready
- Optimized animations

### Bundle Size
- Initial: ~150KB gzipped
- Tailwind: ~10KB (after purge)
- Framer Motion: ~30KB
- Recharts: ~50KB

## ♿ Accessibility

- Semantic HTML elements
- ARIA labels on interactive elements
- Keyboard navigation support
- Color contrast ratios (WCAG AA)
- Focus indicators
- Screen reader friendly

## 🐛 Troubleshooting

### Port already in use
```bash
# Change port in vite.config.js
export default {
  server: { port: 5174 }
}
```

### Tailwind not working
```bash
# Rebuild
npm run build
```

### Dark mode not persisting
```bash
# Clear localStorage
localStorage.clear()
```

## 📚 Documentation

- [Tailwind CSS](https://tailwindcss.com/docs)
- [Framer Motion](https://www.framer.com/motion/)
- [Recharts](https://recharts.org/)
- [Lucide Icons](https://lucide.dev/)
- [Vite](https://vitejs.dev/)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details

## 🙏 Acknowledgments

- Design inspiration from modern SaaS platforms
- Icons from Lucide React
- Charts from Recharts
- Animations from Framer Motion

---

**Built with ❤️ using modern web technologies**
