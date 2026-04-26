import pandas as pd
import numpy as np
from typing import List, Dict, Tuple

def calculate_fairness_metrics(
    df: pd.DataFrame,
    sensitive_attributes: List[str],
    target_variable: str
) -> Dict:
    """
    Calculate comprehensive fairness metrics for a dataset
    """
    metrics = {
        "dataset_info": {
            "total_samples": len(df),
            "total_columns": len(df.columns),
            "sensitive_attributes": sensitive_attributes,
            "target_variable": target_variable
        },
        "group_metrics": {},
        "fairness_metrics": {}
    }
    
    # Calculate metrics for each sensitive attribute
    for attr in sensitive_attributes:
        if attr in df.columns:
            metrics["group_metrics"][attr] = calculate_group_metrics(
                df, attr, target_variable
            )
            
            # Calculate fairness gap metrics
            fairness_gaps = calculate_fairness_gaps(df, attr, target_variable)
            metrics["fairness_metrics"][attr] = fairness_gaps
    
    # Calculate overall fairness score
    metrics["overall_bias_score"] = calculate_overall_score(metrics["fairness_metrics"])
    
    return metrics

def calculate_group_metrics(
    df: pd.DataFrame,
    sensitive_attr: str,
    target_var: str
) -> Dict:
    """
    Calculate metrics broken down by groups in sensitive attribute
    """
    metrics = {}
    
    groups = df[sensitive_attr].unique()
    
    for group in groups:
        group_df = df[df[sensitive_attr] == group]
        
        if len(group_df) == 0:
            continue
        
        # Calculate approval rate
        approval_count = (group_df[target_var] == 1).sum()
        approval_rate = approval_count / len(group_df)
        
        metrics[str(group)] = {
            "count": len(group_df),
            "approval_count": int(approval_count),
            "approval_rate": round(approval_rate, 4),
            "denial_rate": round(1 - approval_rate, 4),
            "percentage_of_dataset": round(len(group_df) / len(df), 4)
        }
    
    return metrics

def calculate_fairness_gaps(
    df: pd.DataFrame,
    sensitive_attr: str,
    target_var: str
) -> Dict:
    """
    Calculate fairness gap metrics (demographic parity, equal opportunity, etc.)
    """
    gaps = {}
    
    groups = df[sensitive_attr].dropna().unique()
    approval_rates = {}
    
    for group in groups:
        group_df = df[df[sensitive_attr] == group]
        if len(group_df) > 0:
            approval_rate = (group_df[target_var] == 1).sum() / len(group_df)
            approval_rates[str(group)] = approval_rate
    
    if len(approval_rates) >= 2:
        rates_list = list(approval_rates.values())
        
        # Demographic Parity Difference
        gaps["demographic_parity_difference"] = round(
            max(rates_list) - min(rates_list), 4
        )
        
        # Disparate Impact Ratio
        min_rate = min(rates_list)
        max_rate = max(rates_list)
        if min_rate > 0:
            gaps["disparate_impact_ratio"] = round(min_rate / max_rate, 4)
        
        # Equal Opportunity Difference (simplified - uses approval rate as proxy)
        gaps["equal_opportunity_difference"] = round(
            max(rates_list) - min(rates_list), 4
        )
        
        # Fairness threshold assessment
        gaps["is_fair"] = gaps.get("disparate_impact_ratio", 1.0) >= 0.8
    
    gaps["approval_rates_by_group"] = {k: round(v, 4) for k, v in approval_rates.items()}
    
    return gaps

def calculate_overall_score(fairness_metrics: Dict) -> Dict:
    """
    Calculate an overall bias score
    """
    if not fairness_metrics:
        return {"score": 0.0, "level": "Unknown"}
    
    disparate_impacts = []
    fairness_gaps = []
    
    for attr_metrics in fairness_metrics.values():
        if isinstance(attr_metrics, dict):
            if "disparate_impact_ratio" in attr_metrics:
                disparate_impacts.append(attr_metrics["disparate_impact_ratio"])
            if "demographic_parity_difference" in attr_metrics:
                fairness_gaps.append(attr_metrics["demographic_parity_difference"])
    
    if not disparate_impacts and not fairness_gaps:
        return {"score": 0.0, "level": "Unknown"}
    
    # Calculate composite bias score
    overall_score = 0.0
    
    if disparate_impacts:
        # Lower is worse (more biased)
        di_score = (1 - min(disparate_impacts)) * 100
        overall_score += di_score * 0.5
    
    if fairness_gaps:
        # Higher gap means more biased
        gap_score = (1 - min(fairness_gaps)) * 100
        overall_score += gap_score * 0.5
    
    overall_score = max(0, min(100, overall_score))
    
    # Determine bias level
    if overall_score >= 80:
        level = "Low Bias"
    elif overall_score >= 50:
        level = "Moderate Bias"
    elif overall_score >= 20:
        level = "High Bias"
    else:
        level = "Severe Bias"
    
    return {
        "score": round(overall_score, 2),
        "level": level
    }

def get_mitigation_strategies(bias_report: Dict, selected_strategies: List[str] = None) -> List[Dict]:
    """
    Get mitigation strategies based on identified biases
    """
    all_strategies = {
        "resampling": {
            "name": "Resampling & Balancing",
            "description": "Adjust the training data distribution to balance outcomes across groups.",
            "steps": [
                "Identify underrepresented groups in the dataset",
                "Use oversampling or undersampling to balance group representation",
                "Retrain the model on the balanced dataset",
                "Validate that fairness metrics improve without major accuracy loss"
            ],
            "difficulty": "Easy",
            "estimated_impact": "High"
        },
        "threshold_optimization": {
            "name": "Threshold Optimization",
            "description": "Use different decision thresholds for different groups to achieve parity.",
            "steps": [
                "Analyze current decision thresholds and their impact by group",
                "Determine optimal thresholds for each group",
                "Implement group-specific thresholds in the model",
                "Monitor for any unintended consequences"
            ],
            "difficulty": "Medium",
            "estimated_impact": "Medium"
        },
        "feature_engineering": {
            "name": "Feature Engineering",
            "description": "Create or modify features to reduce correlation with sensitive attributes.",
            "steps": [
                "Identify features highly correlated with sensitive attributes",
                "Engineer new features that capture predictive power without bias",
                "Remove or transform problematic features",
                "Evaluate model performance and fairness on new features"
            ],
            "difficulty": "Hard",
            "estimated_impact": "High"
        },
        "adversarial_debiasing": {
            "name": "Adversarial Debiasing",
            "description": "Use adversarial learning to make the model robust against sensitive attributes.",
            "steps": [
                "Add an adversary network that tries to predict sensitive attributes",
                "Train the main model to fool the adversary while maintaining accuracy",
                "Gradually increase the strength of the adversarial component",
                "Monitor both fairness and performance metrics"
            ],
            "difficulty": "Hard",
            "estimated_impact": "High"
        },
        "fairness_constraints": {
            "name": "Fairness Constraints",
            "description": "Add constraints during model training to enforce fairness requirements.",
            "steps": [
                "Define fairness constraints based on your fairness metric",
                "Implement constrained optimization in your model training",
                "Set appropriate constraint weights",
                "Test model with different constraint strengths"
            ],
            "difficulty": "Medium",
            "estimated_impact": "High"
        },
        "data_augmentation": {
            "name": "Data Augmentation",
            "description": "Augment training data to improve representation of underrepresented groups.",
            "steps": [
                "Identify underrepresented groups and their characteristics",
                "Generate synthetic examples for underrepresented groups",
                "Ensure synthetic data is realistic and maintains data integrity",
                "Combine with original data and retrain model"
            ],
            "difficulty": "Medium",
            "estimated_impact": "Medium"
        },
        "transparency": {
            "name": "Transparency & Documentation",
            "description": "Improve model transparency and document fairness considerations.",
            "steps": [
                "Document all data collection and preprocessing steps",
                "Create fairness reports and impact assessments",
                "Implement model interpretability tools (SHAP, LIME)",
                "Establish regular fairness audits and monitoring"
            ],
            "difficulty": "Easy",
            "estimated_impact": "Medium"
        }
    }
    
    # Filter by selected strategies if provided
    if selected_strategies:
        strategies = [
            all_strategies[s] for s in selected_strategies 
            if s in all_strategies
        ]
    else:
        strategies = list(all_strategies.values())
    
    return strategies
