import pandas as pd
import numpy as np
from typing import List, Dict, Tuple

def calculate_fairness_metrics(
    predictions: List[int],
    actuals: List[int],
    protected_attribute: str,
    groups: List[str] = None
) -> Dict:
    """
    Calculate comprehensive fairness metrics for model predictions
    """
    predictions = np.array(predictions)
    actuals = np.array(actuals)
    
    metrics = {
        "overall_accuracy": float(np.mean(predictions == actuals)),
        "true_positives": int(np.sum((predictions == 1) & (actuals == 1))),
        "true_negatives": int(np.sum((predictions == 0) & (actuals == 0))),
        "false_positives": int(np.sum((predictions == 1) & (actuals == 0))),
        "false_negatives": int(np.sum((predictions == 0) & (actuals == 1))),
        "approval_rate": float(np.mean(predictions))
    }
    
    # Calculate fairness metrics
    if groups and len(groups) == len(predictions):
        groups = np.array(groups)
        unique_groups = np.unique(groups)
        
        group_metrics = {}
        approval_rates = {}
        accuracies = {}
        
        for group in unique_groups:
            group_mask = groups == group
            group_preds = predictions[group_mask]
            group_actuals = actuals[group_mask]
            
            approval_rate = float(np.mean(group_preds))
            accuracy = float(np.mean(group_preds == group_actuals))
            
            group_metrics[str(group)] = {
                "count": int(np.sum(group_mask)),
                "approval_rate": approval_rate,
                "accuracy": accuracy,
                "true_positives": int(np.sum((group_preds == 1) & (group_actuals == 1))),
                "false_positives": int(np.sum((group_preds == 1) & (group_actuals == 0))),
                "true_negatives": int(np.sum((group_preds == 0) & (group_actuals == 0))),
                "false_negatives": int(np.sum((group_preds == 0) & (group_actuals == 1)))
            }
            
            approval_rates[str(group)] = approval_rate
            accuracies[str(group)] = accuracy
        
        # Calculate fairness gaps
        if len(approval_rates) >= 2:
            rates = np.array(list(approval_rates.values()))
            
            metrics["demographic_parity_difference"] = float(np.max(rates) - np.min(rates))
            
            if np.min(rates) > 0:
                metrics["disparate_impact_ratio"] = float(np.min(rates) / np.max(rates))
            
            metrics["max_accuracy_diff"] = float(np.max(list(accuracies.values())) - np.min(list(accuracies.values())))
            
            # Bias severity assessment
            if metrics.get("disparate_impact_ratio", 1.0) >= 0.8:
                metrics["bias_level"] = "Low"
            elif metrics.get("disparate_impact_ratio", 0) >= 0.6:
                metrics["bias_level"] = "Moderate"
            else:
                metrics["bias_level"] = "High"
        
        metrics["group_metrics"] = group_metrics
        metrics["approval_rates_by_group"] = {k: round(v, 4) for k, v in approval_rates.items()}
    
    return metrics



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
