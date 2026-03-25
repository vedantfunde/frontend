# Company Dossier Frontend

Modern React + TypeScript + Vite frontend for the Company Dossier venture capital investment recommendation system. Provides interactive analysis, deep company intelligence, and comparative evaluation tools for investment decision-making.

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm/yarn

### Installation & Development
```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Start dev server (runs on http://localhost:5173)
npm run dev

# Build for production
npm run build
```

### Configuration
Update API endpoint in `src/api.ts` if backend is not on `http://127.0.0.1:8000`:
```typescript
const API_BASE = 'http://your-backend-url:8000';
```

## 📁 Project Structure

```
frontend/
├── src/
│   ├── components/
│   │   ├── App.tsx                 # Main application shell
│   │   ├── Sidebar.tsx             # Search input & scraper tools
│   │   ├── SignalCard.tsx          # Analysis result display
│   │   ├── CompanyList.tsx         # Database browser
│   │   ├── CompanyDetail.tsx       # Deep company profile
│   │   └── ComparisonTool.tsx      # Side-by-side analysis
│   ├── styles/                     # CSS Modules
│   ├── api.ts                      # Axios HTTP client & types
│   └── main.tsx                    # React entry point
├── index.html                      # HTML template
├── package.json                    # Dependencies & scripts
└── vite.config.ts                  # Vite build configuration
```

## 🎯 Key Features

- **Real-time Investment Signals**: AI-powered scoring (0-100) with detailed rationales
- **Multi-source Intelligence**: Aggregates data from Clearbit, Twitter, LinkedIn, GitHub
- **Interactive Dashboard**: Tabbed interface for analysis, browsing, and comparisons
- **Deep Company Intelligence**: Comprehensive profiles with metrics and founder details
- **Comparative Analysis**: Side-by-side evaluation of up to 3 companies

## 🔌 Backend Integration

The frontend integrates with the FastAPI backend on `http://127.0.0.1:8000`.

### Primary Endpoints
- `POST /enrich-and-analyze/{domain}` — Full pipeline: scrape, store, analyze
- `GET /companies` — Paginated company list
- `GET /companies/{id}` — Detailed company profile with founders

## 🚦 Example Usage

### Full Stack Development Setup
1. **Start backend** (terminal 1):
```bash
# From project root
pip install -r requirements.txt
python main.py
```
Backend runs on http://localhost:8000

2. **Start frontend** (terminal 2):
```bash
cd frontend
npm install
npm run dev
```
Frontend runs on http://localhost:5173

3. **Open browser** and navigate to http://localhost:5173

### Using the Application
- Enter company domain (e.g., `clearbit.com`) and click "🚀 Analyze"
- View real-time scraping and AI analysis results
- Browse analyzed companies in the database tab
- Compare companies side-by-side

## 🐛 Troubleshooting

### "Failed to analyze" error
- Ensure backend is running on http://127.0.0.1:8000
- Check `.env` on backend has valid API keys (`GOOGLE_API_KEY`, etc.)
- Verify CORS is enabled on backend

### API endpoint not found
- Confirm backend `main.py` is running
- Check endpoint spelling in `src/api.ts`

---
