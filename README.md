# FairScan AI Bias Auditor

FairScan is a comprehensive AI model bias detection and mitigation platform. It helps data scientists and ML engineers identify, analyze, and mitigate bias in their machine learning models across different demographic groups.

## Features

- **Comprehensive Bias Detection**: Analyze multiple fairness metrics including demographic parity, equalized odds, and predictive parity
- **Group Performance Analysis**: Compare model performance across different demographic groups
- **Detailed Visualizations**: Interactive charts and graphs showing bias metrics and group comparisons
- **Mitigation Strategies**: Get actionable recommendations to reduce model bias
- **PDF Report Generation**: Download detailed audit reports with all findings and recommendations
- **Easy-to-use Interface**: Intuitive web-based UI for running bias audits

## Project Structure

```
fairscan/
├── backend/                 # Python FastAPI backend
│   ├── main.py             # FastAPI application
│   ├── fairness_metrics.py # Fairness metrics calculation
│   ├── report_generator.py # PDF report generation
│   ├── pyproject.toml      # Python dependencies
│   └── .env                # Environment variables
├── frontend/               # React + Vite frontend
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── App.jsx        # Main app component
│   │   ├── App.css        # Global styles
│   │   └── index.css      # Base styles
│   ├── vite.config.js     # Vite configuration
│   ├── package.json       # NPM dependencies
│   └── .env              # Environment variables
└── README.md             # This file
```

## Prerequisites

- Python 3.9+
- Node.js 16+
- npm or pnpm

## Installation & Setup

### Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Install dependencies using `uv`:
```bash
uv pip install -r pyproject.toml
# or
uv add fastapi uvicorn python-multipart scikit-learn pandas numpy scipy matplotlib seaborn reportlab pydantic python-dotenv
```

3. Create a `.env` file with the following content:
```
CORS_ORIGINS=http://localhost:5173,http://localhost:3000
DEBUG=True
```

4. Run the backend server:
```bash
uv run main.py
# or
python main.py
```

The API will be available at `http://localhost:8000`

### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
# or
pnpm install
```

3. Create a `.env` file:
```
VITE_API_URL=http://localhost:8000/api
```

4. Start the development server:
```bash
npm run dev
# or
pnpm dev
```

The frontend will be available at `http://localhost:5173`

## Usage

1. Open the frontend in your browser: `http://localhost:5173`
2. Click "Start Audit" to begin a bias audit
3. Either:
   - Upload your own model predictions, actual outcomes, and demographic groups as text files
   - Click "Load Demo Data" to test with sample data
4. Click "Run Audit" to analyze bias in your model
5. Review the detailed results with visualizations
6. Download a PDF report with your findings

## API Endpoints

### Audit Endpoint
```
POST /api/audit
```

Request body:
```json
{
  "model_name": "Credit Approval Model",
  "protected_attribute": "gender",
  "predictions": [1, 0, 1, ...],
  "actuals": [1, 0, 1, ...],
  "groups": ["Male", "Female", ...]
}
```

Response:
```json
{
  "audit_id": "uuid",
  "model_name": "Credit Approval Model",
  "protected_attribute": "gender",
  "total_samples": 100,
  "bias_metrics": {
    "demographic_parity": 0.15,
    "equalized_odds": 0.12,
    "predictive_parity": 0.08,
    "overall_accuracy": 0.85
  },
  "group_metrics": {
    "Male": { "accuracy": 0.87, ... },
    "Female": { "accuracy": 0.83, ... }
  },
  "mitigation_strategies": [...]
}
```

### Report Generation Endpoint
```
POST /api/generate-report
```

Request body:
```json
{
  "audit_id": "uuid"
}
```

Returns a PDF file.

## Fairness Metrics Explained

- **Demographic Parity**: Measures if the positive prediction rate is equal across groups
- **Equalized Odds**: Ensures that true positive and false positive rates are equal across groups
- **Predictive Parity**: Measures if the precision (positive predictive value) is equal across groups
- **False Positive Rate (FPR)**: Percentage of negative cases incorrectly predicted as positive
- **False Negative Rate (FNR)**: Percentage of positive cases incorrectly predicted as negative

## Mitigation Strategies

The system recommends mitigation strategies based on detected bias:

- **Data Balancing**: Balance training data across demographic groups
- **Feature Engineering**: Engineer features to reduce disparate impact
- **Threshold Adjustment**: Adjust decision thresholds per group to equalize outcomes
- **Model Retraining**: Retrain model with fairness constraints
- **Post-processing**: Apply fairness-aware post-processing techniques

## File Format Requirements

### Predictions & Actuals Files
- One value per line (0 or 1 for binary classification)
- Plain text format (.txt) or CSV
- Must have same number of lines

### Groups/Demographic Files
- One value per line (e.g., "Male", "Female")
- Plain text format (.txt) or CSV
- Must have same number of lines as predictions

## Technology Stack

### Backend
- **FastAPI**: Modern Python web framework
- **scikit-learn**: Machine learning utilities
- **pandas**: Data manipulation
- **numpy**: Numerical computing
- **scipy**: Scientific computing
- **ReportLab**: PDF generation
- **Pydantic**: Data validation

### Frontend
- **React**: UI library
- **Vite**: Build tool and dev server
- **Recharts**: Charts and visualizations
- **Axios**: HTTP client
- **React Router**: Client-side routing (expandable)

## Development

### Running Tests (Backend)
```bash
cd backend
# Add pytest if not installed
uv add pytest pytest-asyncio

# Run tests
pytest
```

### Building for Production

Frontend:
```bash
cd frontend
npm run build
# Output in: frontend/dist/
```

Backend:
```bash
cd backend
# Use gunicorn for production
uv add gunicorn
gunicorn main:app --workers 4 --worker-class uvicorn.workers.UvicornWorker
```

## Troubleshooting

### CORS Issues
Make sure the backend `.env` includes your frontend URL in `CORS_ORIGINS`:
```
CORS_ORIGINS=http://localhost:5173,http://localhost:3000
```

### Port Already in Use
- Backend: `python main.py` uses port 8000
- Frontend: `npm run dev` uses port 5173

If ports are in use, you can specify different ports:
```bash
# Backend (in main.py, change the port parameter)
uvicorn.run(app, host="0.0.0.0", port=8001)

# Frontend (in vite.config.js)
server: { port: 5174 }
```

### Backend Not Responding
- Check that backend is running: `http://localhost:8000/docs`
- Verify API URL in frontend `.env` matches backend address
- Check browser console for errors

## License

MIT License - feel free to use this project for your own purposes

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## Support

For issues or questions, please open an issue on the repository.
