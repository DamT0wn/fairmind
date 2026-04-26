import numpy as np
from typing import List, Dict, Optional


def _group_confusion(preds: np.ndarray, actuals: np.ndarray) -> Dict:
    tp = int(np.sum((preds == 1) & (actuals == 1)))
    fp = int(np.sum((preds == 1) & (actuals == 0)))
    tn = int(np.sum((preds == 0) & (actuals == 0)))
    fn = int(np.sum((preds == 0) & (actuals == 1)))
    total = tp + fp + tn + fn
    pos_actual = tp + fn
    neg_actual = fp + tn
    pos_pred   = tp + fp
    accuracy       = (tp + tn) / total if total > 0 else 0.0
    tpr            = tp / pos_actual if pos_actual > 0 else 0.0
    fpr            = fp / neg_actual if neg_actual > 0 else 0.0
    fnr            = fn / pos_actual if pos_actual > 0 else 0.0
    tnr            = tn / neg_actual if neg_actual > 0 else 0.0
    precision      = tp / pos_pred   if pos_pred   > 0 else 0.0
    approval_rate  = float(np.mean(preds)) if len(preds) > 0 else 0.0
    return {
        "count":               total,
        "approval_rate":       round(approval_rate, 4),
        "accuracy":            round(accuracy,      4),
        "true_positive_rate":  round(tpr,           4),
        "false_positive_rate": round(fpr,           4),
        "false_negative_rate": round(fnr,           4),
        "true_negative_rate":  round(tnr,           4),
        "precision":           round(precision,     4),
        "recall":              round(tpr,           4),
        "true_positives":  tp,
        "false_positives": fp,
        "true_negatives":  tn,
        "false_negatives": fn,
    }


def _fairness_grade(di: Optional[float], dp: float, eq: float, pp: float) -> str:
    if (di is None or di >= 0.9) and dp <= 0.05 and eq <= 0.05:
        return "A"
    if (di is None or di >= 0.8) and dp <= 0.10 and eq <= 0.10:
        return "B"
    if (di is None or di >= 0.7) and dp <= 0.20 and eq <= 0.20:
        return "C"
    if (di is None or di >= 0.6):
        return "D"
    return "F"


def calculate_fairness_metrics(
    predictions: List[int],
    actuals: List[int],
    protected_attribute: str,
    groups: Optional[List[str]] = None,
) -> Dict:
    """
    Comprehensive fairness audit metrics:
    - Demographic Parity Difference
    - Disparate Impact Ratio (EEOC 4/5ths Rule)
    - Equalized Odds Difference (TPR + FPR parity)
    - Equal Opportunity Difference (TPR parity)
    - Predictive Parity Difference (precision parity)
    - Fairness Grade A–F
    - EEOC 80% Rule pass/fail
    - EU AI Act compliance flag
    - Most disadvantaged group identification
    - Full per-group confusion matrix metrics
    """
    predictions = np.array(predictions, dtype=int)
    actuals     = np.array(actuals,     dtype=int)

    tp_all = int(np.sum((predictions == 1) & (actuals == 1)))
    fp_all = int(np.sum((predictions == 1) & (actuals == 0)))
    tn_all = int(np.sum((predictions == 0) & (actuals == 0)))
    fn_all = int(np.sum((predictions == 0) & (actuals == 1)))
    total  = len(predictions)
    pos_actual_all = tp_all + fn_all
    neg_actual_all = fp_all + tn_all

    metrics: Dict = {
        "overall_accuracy":      round(float(np.mean(predictions == actuals)), 4),
        "overall_approval_rate": round(float(np.mean(predictions)), 4),
        "true_positives":        tp_all,
        "false_positives":       fp_all,
        "true_negatives":        tn_all,
        "false_negatives":       fn_all,
        "overall_tpr":           round(tp_all / pos_actual_all if pos_actual_all > 0 else 0.0, 4),
        "overall_fpr":           round(fp_all / neg_actual_all if neg_actual_all > 0 else 0.0, 4),
        "total_samples":         total,
        "protected_attribute":   protected_attribute,
    }

    if groups and len(groups) == len(predictions):
        groups_arr    = np.array(groups)
        unique_groups = np.unique(groups_arr)

        group_metrics: Dict     = {}
        approval_rates: Dict    = {}
        tpr_by_group: Dict      = {}
        fpr_by_group: Dict      = {}
        precision_by_group: Dict = {}
        accuracy_by_group: Dict  = {}

        for grp in unique_groups:
            mask = groups_arr == grp
            cm   = _group_confusion(predictions[mask], actuals[mask])
            g    = str(grp)
            group_metrics[g]      = cm
            approval_rates[g]     = cm["approval_rate"]
            tpr_by_group[g]       = cm["true_positive_rate"]
            fpr_by_group[g]       = cm["false_positive_rate"]
            precision_by_group[g] = cm["precision"]
            accuracy_by_group[g]  = cm["accuracy"]

        metrics["group_metrics"]            = group_metrics
        metrics["approval_rates_by_group"]  = approval_rates

        if len(unique_groups) >= 2:
            rates = np.array(list(approval_rates.values()))
            tprs  = np.array(list(tpr_by_group.values()))
            fprs  = np.array(list(fpr_by_group.values()))
            precs = np.array(list(precision_by_group.values()))
            accs  = np.array(list(accuracy_by_group.values()))

            # Demographic Parity
            dp_diff = float(np.max(rates) - np.min(rates))
            metrics["demographic_parity_difference"] = round(dp_diff, 4)

            # Disparate Impact Ratio (EEOC 4/5ths)
            di_ratio = None
            if np.max(rates) > 0:
                di_ratio = float(np.min(rates) / np.max(rates))
                metrics["disparate_impact_ratio"] = round(di_ratio, 4)
            metrics["eeoc_80_rule_pass"]  = (di_ratio is not None and di_ratio >= 0.8)
            metrics["eeoc_80_rule_value"] = round(di_ratio, 4) if di_ratio is not None else None

            # Equalized Odds (max of TPR gap & FPR gap)
            tpr_diff    = float(np.max(tprs) - np.min(tprs))
            fpr_diff    = float(np.max(fprs) - np.min(fprs))
            eq_odds_diff = float(max(tpr_diff, fpr_diff))
            metrics["equalized_odds_difference"]    = round(eq_odds_diff, 4)
            metrics["equal_opportunity_difference"] = round(tpr_diff,     4)
            metrics["tpr_by_group"]                 = {k: round(v, 4) for k, v in tpr_by_group.items()}
            metrics["fpr_by_group"]                 = {k: round(v, 4) for k, v in fpr_by_group.items()}

            # Predictive Parity
            pred_parity_diff = float(np.max(precs) - np.min(precs))
            metrics["predictive_parity_difference"] = round(pred_parity_diff, 4)
            metrics["precision_by_group"]           = {k: round(v, 4) for k, v in precision_by_group.items()}

            # Max Accuracy Difference
            metrics["max_accuracy_diff"] = round(float(np.max(accs) - np.min(accs)), 4)

            # Fairness Grade A-F
            metrics["fairness_grade"] = _fairness_grade(di_ratio, dp_diff, eq_odds_diff, pred_parity_diff)

            # Bias level (friendly label)
            if di_ratio is not None:
                metrics["bias_level"] = "Low" if di_ratio >= 0.8 else ("Moderate" if di_ratio >= 0.6 else "High")
            else:
                metrics["bias_level"] = "Unknown"

            # EU AI Act compliance (Art.10 + Art.9 proxy)
            metrics["eu_ai_act_compliant"] = (di_ratio is not None and di_ratio >= 0.8) and eq_odds_diff <= 0.1

            # Most disadvantaged group
            min_group = min(approval_rates, key=approval_rates.get)
            metrics["most_disadvantaged_group"] = min_group
            metrics["most_disadvantaged_rate"]  = round(approval_rates[min_group], 4)

    return metrics


def get_mitigation_strategies(bias_report: Dict, selected_strategies: List[str] = None) -> List[Dict]:
    """Contextually prioritized mitigation strategies with phase and regulatory relevance tags."""
    all_strategies = {
        "resampling": {
            "name": "Resampling & Balancing",
            "phase": "Pre-processing",
            "description": "Adjust the training data distribution to balance outcomes across demographic groups.",
            "steps": [
                "Identify underrepresented groups in the dataset",
                "Apply SMOTE, oversampling, or undersampling to balance representation",
                "Retrain the model on the balanced dataset",
                "Validate fairness metrics improve without major accuracy loss",
            ],
            "difficulty": "Easy",
            "estimated_impact": "High",
            "regulatory_relevance": "EU AI Act Art. 10 — Data Governance",
        },
        "threshold_optimization": {
            "name": "Threshold Optimization",
            "phase": "Post-processing",
            "description": "Apply group-specific decision thresholds to achieve equalized odds or equal opportunity.",
            "steps": [
                "Analyze model probability scores by group",
                "Determine thresholds that equalize TPR or FPR across groups",
                "Implement group-specific thresholds in the inference pipeline",
                "Monitor for unintended accuracy trade-offs",
            ],
            "difficulty": "Medium",
            "estimated_impact": "High",
            "regulatory_relevance": "EEOC 4/5ths Rule — Disparate Impact Mitigation",
        },
        "feature_engineering": {
            "name": "Feature Engineering",
            "phase": "Pre-processing",
            "description": "Identify and transform features correlated with protected attributes.",
            "steps": [
                "Compute correlation of each feature with protected attributes",
                "Engineer new features that decouple predictive power from group membership",
                "Remove or transform high-correlation proxy features",
                "Re-evaluate model performance and fairness metrics",
            ],
            "difficulty": "Hard",
            "estimated_impact": "High",
            "regulatory_relevance": "EU AI Act Art. 10 — Bias in Input Data",
        },
        "adversarial_debiasing": {
            "name": "Adversarial Debiasing",
            "phase": "In-processing",
            "description": "Add an adversarial component that penalizes predictions correlated with sensitive attributes.",
            "steps": [
                "Add an adversary network trained to predict the protected attribute",
                "Train the primary model to fool the adversary while maintaining accuracy",
                "Gradually tune the adversarial loss weight",
                "Monitor both fairness metrics and accuracy at each epoch",
            ],
            "difficulty": "Hard",
            "estimated_impact": "High",
            "regulatory_relevance": "EU AI Act Art. 9 — Risk Management",
        },
        "fairness_constraints": {
            "name": "Fairness-Constrained Training",
            "phase": "In-processing",
            "description": "Reformulate training as a constrained optimization problem with explicit fairness constraints.",
            "steps": [
                "Define the fairness metric as a constraint (e.g., |TPR_A - TPR_B| ≤ ε)",
                "Use Lagrangian relaxation or exponentiated gradient methods",
                "Set appropriate constraint tolerance (epsilon)",
                "Compare accuracy-fairness trade-off curves across constraint strengths",
            ],
            "difficulty": "Medium",
            "estimated_impact": "High",
            "regulatory_relevance": "EU AI Act Art. 9 — Accuracy & Robustness",
        },
        "data_augmentation": {
            "name": "Synthetic Data Augmentation",
            "phase": "Pre-processing",
            "description": "Generate synthetic examples for underrepresented groups using CTGAN or conditional VAEs.",
            "steps": [
                "Identify underrepresented demographic groups",
                "Use CTGAN, TVAE, or conditional VAEs to generate synthetic records",
                "Validate synthetic data realism using statistical similarity tests",
                "Combine with real data and retrain — monitor fairness delta",
            ],
            "difficulty": "Medium",
            "estimated_impact": "Medium",
            "regulatory_relevance": "EU AI Act Art. 10 — Representative Training Data",
        },
        "transparency": {
            "name": "Explainability & Documentation",
            "phase": "Post-processing",
            "description": "Implement SHAP/LIME interpretability and produce regulatory-ready Model Cards.",
            "steps": [
                "Integrate SHAP or LIME to explain individual predictions",
                "Generate group-level feature importance breakdowns",
                "Produce a Model Card / Algorithmic Impact Assessment",
                "Establish a regular fairness monitoring pipeline",
            ],
            "difficulty": "Easy",
            "estimated_impact": "Medium",
            "regulatory_relevance": "EU AI Act Art. 13 — Transparency & Documentation",
        },
    }

    if selected_strategies:
        return [all_strategies[s] for s in selected_strategies if s in all_strategies]

    grade = bias_report.get("fairness_grade", "F")
    if grade == "A":
        return [all_strategies["transparency"]]
    elif grade == "B":
        return [all_strategies["threshold_optimization"], all_strategies["transparency"]]
    elif grade == "C":
        return [all_strategies["resampling"], all_strategies["threshold_optimization"], all_strategies["transparency"]]
    else:
        return list(all_strategies.values())
