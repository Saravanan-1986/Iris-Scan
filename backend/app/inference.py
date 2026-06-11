"""Mock inference pipeline that returns realistic predictions without a trained model."""

import numpy as np
from typing import Dict, List, Optional
from .diseases import DISEASE_CLASSES, get_disease_info
from .symptoms import encode_symptoms, symptom_disease_correlation

SECTOR_LABELS = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW']


def run_mock_inference(
    symptoms_dict: Dict[str, str],
) -> Dict:
    """Run mock inference returning realistic predictions.

    This function simulates the AI model when no trained weights are available.
    Replace with actual model inference once best_model.pth is available.

    Args:
        symptoms_dict: Dictionary of symptom values.

    Returns:
        Dictionary with predictions, heatmap, and sector analysis.
    """
    symptom_vector = encode_symptoms(symptoms_dict)

    severity_map = {0: 'low', 1: 'moderate', 2: 'high', 3: 'critical'}
    symptom_correlations = symptom_disease_correlation(symptoms_dict)

    predictions = []
    for disease_id in range(len(DISEASE_CLASSES)):
        base_conf = symptom_correlations.get(disease_id, 0.1)
        noise = np.random.uniform(-0.05, 0.05)
        confidence = min(0.99, max(0.01, base_conf + noise))
        confidence = round(confidence * 100, 1)

        if confidence < 5:
            continue

        severity_idx = min(3, int(confidence / 25))
        affected_sectors = _get_affected_sectors(disease_id, confidence)

        predictions.append({
            "diseaseId": disease_id,
            "disease": DISEASE_CLASSES[disease_id],
            "confidence": confidence,
            "severity": severity_map[severity_idx],
            "description": _get_description(disease_id),
            "affectedSectors": affected_sectors,
        })

    # Sort by confidence descending, take top 3
    predictions.sort(key=lambda x: x["confidence"], reverse=True)
    top_predictions = predictions[:3]

    if not top_predictions:
        top_predictions = [{
            "diseaseId": 0,
            "disease": "Healthy / Normal",
            "confidence": 85.0,
            "severity": "low",
            "description": "No abnormalities detected.",
            "affectedSectors": [],
        }]

    sector_analysis = _generate_sector_analysis(top_predictions)
    heatmap = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=="
    disease_info = get_disease_info(top_predictions[0]["diseaseId"])

    return {
        "predictions": top_predictions,
        "heatmap": heatmap,
        "sectorAnalysis": sector_analysis,
        "diseaseInfo": disease_info,
    }


def _get_description(disease_id: int) -> str:
    info = get_disease_info(disease_id)
    return info.get("description", "Condition detected.")


def _get_affected_sectors(disease_id: int, confidence: float) -> List[str]:
    if disease_id == 0:
        return []
    num_sectors = min(4, max(1, int(confidence / 25)))
    np.random.seed(disease_id)
    return list(np.random.choice(SECTOR_LABELS, size=num_sectors, replace=False))


def _generate_sector_analysis(predictions: List[Dict]) -> List[Dict]:
    affected = set()
    for pred in predictions:
        for s in pred.get("affectedSectors", []):
            affected.add(s)

    analysis = []
    for i, label in enumerate(SECTOR_LABELS):
        is_affected = label in affected
        analysis.append({
            "label": label,
            "index": i,
            "anomalies": ["Pigmentation irregularity detected"] if is_affected else [],
            "pigmentationScore": round(np.random.uniform(10, 90), 1),
            "contourDensity": round(np.random.uniform(10, 90), 1),
            "irregularityScore": round(np.random.uniform(10, 90), 1),
            "severity": "low" if is_affected else None,
        })
    return analysis