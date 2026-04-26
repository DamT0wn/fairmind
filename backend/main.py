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
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Pydantic models
class AuditRequest(BaseModel):
    dataset_name: str
    sensitive_attributes: List[str]
    target_variable: str
    positive_outcome: Optional[str] = None

class MitigationRequest(BaseModel):
    bias_report: Dict
    selected_strategies: List[str]

class AuditResponse(BaseModel):
    audit_id: str
    dataset_name: str
    metrics: Dict
    visualizations: Dict
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

@app.post("/audit", response_model=AuditResponse)
async def perform_audit(
    file: UploadFile = File(...),
    sensitive_attributes: str = None,
    target_variable: str = None
):
    """
    Perform fairness audit on uploaded dataset
    """
    try:
        # Read uploaded CSV file
        contents = await file.read()
        df = pd.read_csv(io.StringIO(contents.decode('utf-8')))
        
        # Parse sensitive attributes
        sensitive_attrs = sensitive_attributes.split(',') if sensitive_attributes else []
        sensitive_attrs = [attr.strip() for attr in sensitive_attrs]
        
        if not target_variable:
            raise HTTPException(status_code=400, detail="target_variable is required")
        
        # Calculate fairness metrics
        metrics = calculate_fairness_metrics(df, sensitive_attrs, target_variable)
        
        # Generate visualizations data
        visualizations = generate_visualizations_data(df, sensitive_attrs, target_variable)
        
        # Create audit ID
        audit_id = f"audit_{datetime.now().strftime('%Y%m%d_%H%M%S')}"
        
        # Store results
        audit_results[audit_id] = {
            "dataset_name": file.filename,
            "metrics": metrics,
            "visualizations": visualizations,
            "sensitive_attributes": sensitive_attrs,
            "target_variable": target_variable,
            "timestamp": datetime.now().isoformat()
        }
        
        return AuditResponse(
            audit_id=audit_id,
            dataset_name=file.filename,
            metrics=metrics,
            visualizations=visualizations,
            timestamp=datetime.now().isoformat()
        )
    
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.post("/mitigate")
async def suggest_mitigations(request: MitigationRequest):
    """
    Get mitigation strategies based on identified biases
    """
    try:
        bias_report = request.bias_report
        strategies = get_mitigation_strategies(bias_report, request.selected_strategies)
        
        return {
            "strategies": strategies,
            "implementation_guide": generate_implementation_guide(strategies)
        }
    
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.get("/report/{audit_id}")
async def get_report(audit_id: str):
    """
    Generate and download PDF report for an audit
    """
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

@app.get("/audits")
async def list_audits():
    """
    List all completed audits
    """
    return {
        "audits": [
            {
                "audit_id": audit_id,
                "dataset_name": data.get("dataset_name"),
                "timestamp": data.get("timestamp"),
                "bias_score": calculate_overall_bias_score(data.get("metrics", {}))
            }
            for audit_id, data in audit_results.items()
        ]
    }

@app.post("/demo-audit")
async def create_demo_audit():
    """
    Create a demo audit with sample data
    """
    try:
        # Generate synthetic dataset
        np.random.seed(42)
        n_samples = 1000
        
        df = pd.DataFrame({
            'age': np.random.randint(18, 70, n_samples),
            'gender': np.random.choice(['Male', 'Female'], n_samples),
            'education': np.random.choice(['HS', 'Bachelor', 'Master', 'PhD'], n_samples),
            'income': np.random.choice(['<50K', '>=50K'], n_samples, p=[0.7, 0.3]),
            'loan_approved': np.random.choice([0, 1], n_samples, p=[0.4, 0.6])
        })
        
        # Add some bias to make it realistic
        df.loc[df['gender'] == 'Female', 'loan_approved'] = np.where(
            np.random.random(len(df[df['gender'] == 'Female'])) < 0.45, 0, 1
        )
        
        sensitive_attrs = ['gender', 'age']
        target_var = 'loan_approved'
        
        # Calculate fairness metrics
        metrics = calculate_fairness_metrics(df, sensitive_attrs, target_var)
        visualizations = generate_visualizations_data(df, sensitive_attrs, target_var)
        
        # Create audit ID
        audit_id = f"demo_{datetime.now().strftime('%Y%m%d_%H%M%S')}"
        
        # Store results
        audit_results[audit_id] = {
            "dataset_name": "Loan Approval Dataset (Demo)",
            "metrics": metrics,
            "visualizations": visualizations,
            "sensitive_attributes": sensitive_attrs,
            "target_variable": target_var,
            "timestamp": datetime.now().isoformat()
        }
        
        return {
            "audit_id": audit_id,
            "dataset_name": "Loan Approval Dataset (Demo)",
            "metrics": metrics,
            "visualizations": visualizations,
            "timestamp": datetime.now().isoformat()
        }
    
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

def generate_visualizations_data(df: pd.DataFrame, sensitive_attrs: List[str], target_var: str) -> Dict:
    """
    Generate data for frontend visualizations
    """
    visualizations = {}
    
    for attr in sensitive_attrs:
        if attr in df.columns:
            # Calculate approval rates by sensitive attribute
            approval_rates = df.groupby(attr)[target_var].agg(['sum', 'count'])
            approval_rates['rate'] = (approval_rates['sum'] / approval_rates['count'] * 100).round(2)
            
            visualizations[f"{attr}_approval_rates"] = {
                "labels": approval_rates.index.tolist(),
                "values": approval_rates['rate'].tolist()
            }
    
    return visualizations

def calculate_overall_bias_score(metrics: Dict) -> float:
    """
    Calculate an overall bias score from metrics
    """
    if not metrics:
        return 0.0
    
    scores = []
    if 'demographic_parity_difference' in metrics:
        scores.append(min(abs(metrics['demographic_parity_difference']), 1.0))
    if 'equal_opportunity_difference' in metrics:
        scores.append(min(abs(metrics['equal_opportunity_difference']), 1.0))
    
    return round(sum(scores) / len(scores) * 100, 2) if scores else 0.0

def generate_implementation_guide(strategies: List[Dict]) -> str:
    """
    Generate implementation guide for selected strategies
    """
    guide = "# Bias Mitigation Implementation Guide\n\n"
    for i, strategy in enumerate(strategies, 1):
        guide += f"## {i}. {strategy.get('name', 'Strategy')}\n"
        guide += f"{strategy.get('description', '')}\n\n"
        guide += f"**Steps:**\n"
        if isinstance(strategy.get('steps'), list):
            for step in strategy['steps']:
                guide += f"- {step}\n"
        guide += "\n"
    
    return guide

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
