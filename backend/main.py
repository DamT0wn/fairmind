from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
import io
from pydantic import BaseModel
from typing import List, Dict, Optional
import pandas as pd
import numpy as np
from datetime import datetime
import json
import os

from fairness_metrics import calculate_fairness_metrics, get_mitigation_strategies
from report_generator import generate_pdf_report

app = FastAPI(title="FairScan AI Bias Auditor", version="1.0.0")

# Add CORS middleware
cors_origins_str = os.getenv("CORS_ORIGINS", "http://localhost:5173,http://localhost:3000")
cors_origins = [o.strip() for o in cors_origins_str.split(",") if o.strip()]

app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins,
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Pydantic models
class AuditRequest(BaseModel):
    model_name: str
    protected_attribute: str
    predictions: List[int]
    actuals: List[int]
    groups: Optional[List[str]] = None

class MitigationRequest(BaseModel):
    bias_report: Dict
    selected_strategies: List[str]

class AuditResponse(BaseModel):
    audit_id: str
    model_name: str
    bias_metrics: Dict
    mitigation_strategies: List[Dict]
    group_metrics: Dict
    timestamp: str

# Store audit results in memory (in production, use a database)
audit_results = {}

@app.get("/")
async def root():
    return {
        "name": "FairScan AI Bias Auditor",
        "version": "1.0.0",
        "status": "active"
    }

@app.post("/api/audit")
async def perform_audit(request: AuditRequest):
    """
    Perform fairness audit on model predictions and actuals
    """
    try:
        # Validate input
        if len(request.predictions) != len(request.actuals):
            raise HTTPException(status_code=400, detail="predictions and actuals must have same length")
        
        # Create DataFrame with predictions and actuals
        data = {
            'predictions': request.predictions,
            'actuals': request.actuals
        }
        
        if request.groups:
            data['groups'] = request.groups
        
        df = pd.DataFrame(data)
        
        # Calculate fairness metrics (includes group_metrics internally)
        bias_metrics = calculate_fairness_metrics(
            request.predictions,
            request.actuals,
            request.protected_attribute,
            request.groups
        )
        
        # Get mitigation strategies
        mitigation_strategies = get_mitigation_strategies(bias_metrics)
        
        # Extract group_metrics from bias_metrics (already computed inside calculate_fairness_metrics)
        group_metrics = bias_metrics.pop("group_metrics", {})
        
        # Create audit ID
        audit_id = f"audit_{datetime.now().strftime('%Y%m%d_%H%M%S')}"
        
        # Store results
        audit_results[audit_id] = {
            "model_name": request.model_name,
            "protected_attribute": request.protected_attribute,
            "bias_metrics": bias_metrics,
            "mitigation_strategies": mitigation_strategies,
            "group_metrics": group_metrics,
            "timestamp": datetime.now().isoformat()
        }
        
        return {
            "audit_id": audit_id,
            "model_name": request.model_name,
            "protected_attribute": request.protected_attribute,
            "bias_metrics": bias_metrics,
            "mitigation_strategies": mitigation_strategies,
            "group_metrics": group_metrics,
            "timestamp": datetime.now().isoformat()
        }
    
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.get("/api/health")
async def health_check():
    """
    Health check endpoint
    """
    return {"status": "healthy", "service": "FairScan AI Bias Auditor"}

@app.get("/api/demo-data")
async def get_demo_data():
    """
    Get demo data for testing
    """
    return {
        "modelName": "Demo Credit Approval Model",
        "protectedAttribute": "gender",
        "predictions": [1, 0, 1, 1, 0, 1, 1, 0, 1, 1, 0, 0, 1, 1, 0, 1, 1, 0, 1, 0],
        "actuals": [1, 0, 1, 1, 1, 0, 1, 0, 1, 1, 0, 0, 1, 0, 0, 1, 1, 0, 1, 0],
        "groups": ['Male', 'Female', 'Male', 'Female', 'Male', 'Female', 'Male', 'Female', 'Male', 'Female',
                   'Male', 'Female', 'Male', 'Female', 'Male', 'Female', 'Male', 'Female', 'Male', 'Female']
    }

@app.post("/api/generate-report")
async def generate_report(data: Dict):
    """
    Generate and download PDF report for an audit
    """
    try:
        audit_id = data.get("audit_id")
        if audit_id not in audit_results:
            raise HTTPException(status_code=404, detail="Audit not found")
        
        audit_data = audit_results[audit_id]
        
        # Generate PDF
        pdf_buffer = generate_pdf_report(audit_data)
        
        return FileResponse(
            pdf_buffer,
            filename=f"{audit_id}_report.pdf",
            media_type="application/pdf"
        )
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))







if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
