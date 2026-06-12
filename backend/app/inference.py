"""
Inference pipeline for multi-condition eye screening.
Returns multiple possible conditions with confidence scores and health score.
"""

import numpy as np
from typing import Dict, List, Optional
from .diseases import (
    DISEASE_CLASSES,
    get_disease_info,
    get_risk_level,
    get_condition_meaning,
    get_condition_action,
)
from .symptoms import encode_symptoms, symptom_disease_correlation

SECTOR_LABELS = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW']


def compute_eye_health_score(predictions: List[Dict], quality_score: float) -> int:
    """Compute an eye health score from 0-100 based on predictions and quality.

    Higher score = healthier. Normalizes confidence values across conditions.

    Args:
        predictions: List of prediction dicts with 'confidence' and 'disease'.
        quality_score: Image quality score 0-1.

    Returns:
        Integer score 0-100.
    """
    if not predictions:
        return 95  # Default high score when no conditions detected

    # Find the highest confidence across any condition
    non_healthy = [p for p in predictions if p["name"] != "Healthy / Normal"]
    max_confidence = max((p["confidence"] for p in non_healthy), default=0.0)

    # Base penalty from worst condition
    # If highest non-healthy confidence is 90%, penalty is proportional
    penalty = max_confidence * 0.7

    # Additional penalty from number of conditions
    num_conditions = sum(1 for p in predictions if p["name"] != "Healthy / Normal" and p["confidence"] > 10)
    condition_penalty = num_conditions * 5

    # Quality adjustment (good quality gives slight boost)
    quality_bonus = quality_score * 5

    # Calculate score
    score = 100 - penalty - condition_penalty + quality_bonus
    score = max(0, min(100, int(score)))
    return score


def assign_risk_from_confidence(confidence: float, disease_name: str) -> str:
    """Assign risk level based on confidence and disease.

    Args:
        confidence: Confidence percentage (0-100).
        disease_name: Name of the condition.

    Returns:
        Risk level: 'Low', 'Medium', 'High', or 'Critical'.
    """
    if disease_name == "Healthy / Normal":
        return "Low"
    if confidence >= 75:
        return get_risk_level(disease_name)
    elif confidence >= 50:
        return "Medium"
    elif confidence >= 25:
        return "Low"
    return "Low"


def run_mock_inference(
    symptoms_dict: Optional[Dict[str, str]] = None,
    quality_score: float = 0.8,
) -> Dict:
    """Run multi-condition inference for eye screening.

    Returns multiple possible conditions with confidence scores,
    an eye health score, and quality assessment.

    Args:
        symptoms_dict: Optional dictionary of symptom values.
        quality_score: Image quality score from preprocessing (0-1).

    Returns:
        Dictionary with conditions list, eye_health_score, quality_score,
        heatmap, and supporting info.
    """
    if symptoms_dict is None:
        symptoms_dict = {}

    symptom_correlations = symptom_disease_correlation(symptoms_dict)

    # Generate multi-condition predictions
    predictions = []
    for disease_id in range(len(DISEASE_CLASSES)):
        base_conf = symptom_correlations.get(disease_id, 0.1)
        noise = np.random.uniform(-0.05, 0.05)
        confidence = min(0.99, max(0.01, base_conf + noise))
        confidence = round(confidence * 100, 1)

        if confidence < 3:
            continue

        disease_name = DISEASE_CLASSES[disease_id]
        risk = assign_risk_from_confidence(confidence, disease_name)

        predictions.append({
            "name": disease_name,
            "confidence": confidence,
            "risk": risk,
            "description": get_disease_info(disease_id).get("description", ""),
            "meaning": get_condition_meaning(disease_name),
            "what_to_do": get_condition_action(disease_name),
        })

    # Sort by confidence descending
    predictions.sort(key=lambda x: x["confidence"], reverse=True)

    # Keep top 5 maximum
    predictions = predictions[:5]

    # If nothing found above threshold, return healthy
    if all(p["name"] == "Healthy / Normal" for p in predictions) or not predictions:
        predictions = [{
            "name": "Healthy / Normal",
            "confidence": 95.0,
            "risk": "Low",
            "description": "No significant abnormalities detected in this screening.",
            "meaning": "Your eyes appear healthy based on the scan. Regular check-ups are still recommended.",
            "what_to_do": "Continue regular eye check-ups. No immediate action needed.",
        }]

    # Calculate eye health score
    eye_health_score = compute_eye_health_score(predictions, quality_score)

    # Generate heatmap (mock base64)
    heatmap_base64 = (
        "data:image/png;base64,"
        "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJ"
        "AAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=="
    )

    return {
        "conditions": predictions,
        "eye_health_score": eye_health_score,
        "quality_score": round(quality_score, 2),
        "heatmap": heatmap_base64,
    }