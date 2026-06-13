"""
Inference pipeline for multi-condition eye screening.
Returns multiple possible conditions with confidence scores, health score,
and detailed explanations for each prediction.
"""

import numpy as np
from typing import Dict, List, Optional
from .diseases import (
    DISEASE_CLASSES,
    get_disease_info,
    get_risk_level,
    get_condition_meaning,
    get_condition_action,
    CONDITION_RISK_MAP,
    CONDITION_MEANINGS,
    CONDITION_ACTIONS,
)
from .symptoms import encode_symptoms, symptom_disease_correlation

SECTOR_LABELS = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW']

# Symptom-to-condition mapping for explanation generation
SYMPTOM_EXPLANATIONS = {
    "eyePain": {
        "mild": "Mild eye pain reported, commonly associated with inflammatory conditions like uveitis or iritis.",
        "moderate": "Moderate eye pain detected, often indicates active inflammation or infection.",
        "severe": "Severe eye pain indicates significant ocular pathology requiring immediate attention.",
    },
    "visionStatus": {
        "slightlyBlurred": "Slightly blurred vision can be an early indicator of cataract development or corneal issues.",
        "veryBlurred": "Significant vision blurring detected, strongly associated with advanced cataracts or glaucoma.",
        "blindSpots": "Blind spots reported, a classic symptom of glaucoma-related optic nerve damage.",
    },
    "lightSensitivity": {
        "mild": "Mild light sensitivity (photophobia) present, common in inflammatory eye conditions.",
        "intolerable": "Severe photophobia strongly indicates anterior uveitis or iritis.",
    },
    "rednessLevel": {
        "slight": "Slight redness detected, may indicate mild conjunctival inflammation.",
        "veryRed": "Significant redness detected, strongly associated with conjunctivitis, uveitis, or acute glaucoma.",
    },
    "discharge": {
        "watery": "Watery discharge present, commonly seen in viral conjunctivitis or allergies.",
        "thick": "Thick discharge detected, a classic sign of bacterial conjunctivitis.",
    },
    "itchingBurning": {
        "mild": "Mild itching/burning reported, could indicate dry eye syndrome or mild allergies.",
        "intense": "Intense itching and burning sensation, strongly suggestive of allergic conjunctivitis.",
    },
}

# Region-based explanations for iris sectors
REGION_EXPLANATIONS = {
    "N": "The upper iris region (N) shows indicators commonly linked to systemic health markers.",
    "NE": "The upper-nasal iris zone (NE) patterns correlate with vascular health indicators.",
    "E": "The lateral iris region (E) reflects autonomic nervous system balance.",
    "SE": "The lower-nasal zone (SE) patterns are associated with kidney and urinary system markers.",
    "S": "The lower iris region (S) shows correlations with reproductive system health indicators.",
    "SW": "The lower-temporal zone (SW) relates to lymphatic system markers.",
    "W": "The temporal iris region (W) corresponds to respiratory system indicators.",
    "NW": "The upper-temporal zone (NW) relates to brain and neurological health markers.",
}

# Affected regions for each condition
CONDITION_REGIONS = {
    "Healthy / Normal": [],
    "Glaucoma (early)": ["N", "NE", "E"],
    "Glaucoma (advanced)": ["N", "NE", "E", "SE"],
    "Cataracts": ["W", "NW", "N"],
    "Uveitis (anterior)": ["E", "SE", "S"],
    "Uveitis (posterior)": ["SE", "S", "SW"],
    "Iritis": ["E", "SE"],
    "Iridocyclitis": ["E", "SE", "S"],
    "Aniridia": ["N", "NE", "E", "SE", "S", "SW", "W", "NW"],
    "Coloboma": ["S", "SW"],
    "Fuchs Endothelial Dystrophy": ["W", "NW"],
    "Pigment Dispersion Syndrome": ["N", "NE", "E"],
    "Rubeosis Iridis": ["NE", "E", "SE"],
    "Iris Melanoma": ["E", "SE", "S"],
    "Essential Iris Atrophy": ["N", "NE", "E"],
    "Ocular Hypertension": ["N", "NE"],
}


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


def generate_explanation(disease_name: str, confidence: float, symptoms_dict: Dict[str, str]) -> Dict:
    """Generate a detailed explanation of why this condition was predicted.

    Args:
        disease_name: The predicted condition name.
        confidence: Confidence percentage (0-100).
        symptoms_dict: User-reported symptoms.

    Returns:
        Dictionary with explanation text, affected regions, and symptom evidence.
    """
    affected_regions = CONDITION_REGIONS.get(disease_name, [])
    region_descriptions = [REGION_EXPLANATIONS.get(r, "") for r in affected_regions if r in REGION_EXPLANATIONS]

    # Build symptom evidence
    symptom_evidence = []
    for symptom_key, symptom_value in symptoms_dict.items():
        if symptom_value and symptom_key in SYMPTOM_EXPLANATIONS:
            val_map = SYMPTOM_EXPLANATIONS[symptom_key]
            if symptom_value in val_map:
                symptom_evidence.append(val_map[symptom_value])

    # Build main explanation
    if disease_name == "Healthy / Normal":
        explanation = (
            "Your iris scan shows normal, healthy patterns. No significant anomalies were detected "
            "in any of the examined iris regions. The AI analysis found your iris texture, "
            "pigmentation, and fiber structure to be within normal ranges."
        )
    else:
        region_text = ", ".join(affected_regions) if affected_regions else "multiple regions"
        explanation = (
            f"This prediction is based on analyzing patterns in the {region_text} of your iris. "
            f"The AI detected characteristic markers with {confidence:.1f}% confidence. "
        )

        if region_descriptions:
            explanation += " ".join(region_descriptions[:2]) + " "

        if symptom_evidence:
            explanation += "Your reported symptoms support this finding: " + symptom_evidence[0]
            if len(symptom_evidence) > 1:
                explanation += ". Additionally, " + symptom_evidence[1]

        explanation += (
            f" {CONDITION_MEANINGS.get(disease_name, '')}"
        )

    return {
        "explanation": explanation,
        "affected_regions": affected_regions,
        "symptom_evidence": symptom_evidence,
    }


def run_mock_inference(
    symptoms_dict: Optional[Dict[str, str]] = None,
    quality_score: float = 0.8,
) -> Dict:
    """Run multi-condition inference for eye screening.

    Returns multiple possible conditions with confidence scores,
    an eye health score, detailed explanations, and quality assessment.

    Predictions are based on:
    1. Symptom-disease correlations (from symptoms.py)
    2. Image quality score (better quality = more reliable predictions)
    3. Deterministic confidence calculation (no random noise)

    Args:
        symptoms_dict: Optional dictionary of symptom values.
        quality_score: Image quality score from preprocessing (0-1).

    Returns:
        Dictionary with conditions list (including explanations), eye_health_score,
        quality_score, heatmap, and supporting info.
    """
    if symptoms_dict is None:
        symptoms_dict = {}

    symptom_correlations = symptom_disease_correlation(symptoms_dict)

    # Generate multi-condition predictions
    predictions = []
    for disease_id in range(len(DISEASE_CLASSES)):
        # Base confidence from symptom correlations
        base_conf = symptom_correlations.get(disease_id, 0.1)

        # Quality score influences confidence: better quality = more reliable
        # Low quality reduces confidence, high quality maintains it
        quality_factor = 0.5 + (quality_score * 0.5)
        confidence = min(0.99, base_conf * quality_factor)
        confidence = round(confidence * 100, 1)

        if confidence < 3:
            continue

        disease_name = DISEASE_CLASSES[disease_id]
        risk = assign_risk_from_confidence(confidence, disease_name)

        # Generate detailed explanation
        explanation_data = generate_explanation(disease_name, confidence, symptoms_dict)

        predictions.append({
            "name": disease_name,
            "confidence": confidence,
            "risk": risk,
            "description": get_disease_info(disease_id).get("description", ""),
            "meaning": get_condition_meaning(disease_name),
            "what_to_do": get_condition_action(disease_name),
            "explanation": explanation_data["explanation"],
            "affected_regions": explanation_data["affected_regions"],
            "symptom_evidence": explanation_data["symptom_evidence"],
        })

    # Sort by confidence descending
    predictions.sort(key=lambda x: x["confidence"], reverse=True)

    # Keep top 5 maximum
    predictions = predictions[:5]

    # If nothing found above threshold, return healthy
    if all(p["name"] == "Healthy / Normal" for p in predictions) or not predictions:
        healthy_explanation = generate_explanation("Healthy / Normal", 95.0, symptoms_dict)
        predictions = [{
            "name": "Healthy / Normal",
            "confidence": 95.0,
            "risk": "Low",
            "description": "No significant abnormalities detected in this screening.",
            "meaning": "Your eyes appear healthy based on the scan. Regular check-ups are still recommended.",
            "what_to_do": "Continue regular eye check-ups. No immediate action needed.",
            "explanation": healthy_explanation["explanation"],
            "affected_regions": [],
            "symptom_evidence": [],
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