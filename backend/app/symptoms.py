"""Symptom vector encoding and scoring for iris disease classification."""

from typing import List, Dict

SYMPTOM_KEYS = [
    "eyePain",
    "visionStatus",
    "lightSensitivity",
    "rednessLevel",
    "discharge",
    "itchingBurning",
    "symptomDuration",
    "painConstant",
]

SYMPTOM_OPTIONS: Dict[str, List[str]] = {
    "eyePain": ["none", "mild", "moderate", "severe"],
    "visionStatus": ["normal", "slightlyBlurred", "veryBlurred", "blindSpots"],
    "lightSensitivity": ["none", "mild", "intolerable"],
    "rednessLevel": ["no", "slight", "veryRed"],
    "discharge": ["no", "watery", "thick"],
    "itchingBurning": ["none", "mild", "intense"],
    "symptomDuration": ["newToday", "fewDays", "weeks", "months"],
    "painConstant": ["constant", "intermittent"],
}


def encode_symptoms(symptoms: Dict[str, str]) -> List[float]:
    """Encode symptom dictionary into a fixed-length numeric vector.

    Returns a 10-dimensional vector:
    - 1 one-hot encoding for each symptom key
    - 0 for missing keys
    """
    vector = []
    for key in SYMPTOM_KEYS:
        value = symptoms.get(key, "")
        options = SYMPTOM_OPTIONS.get(key, [])
        if key == "painConstant":
            vector.append(1.0 if value == "constant" else 0.0)
        else:
            if value and value in options:
                idx = options.index(value)
                normalized = idx / (len(options) - 1) if len(options) > 1 else 0.0
                vector.append(normalized)
            else:
                vector.append(0.0)
    return vector[:10]


def compute_symptom_severity_score(symptoms: Dict[str, str]) -> float:
    """Compute an overall severity score from symptoms (0.0 to 1.0)."""
    vector = encode_symptoms(symptoms)
    if not vector:
        return 0.0

    weights = [0.25, 0.20, 0.15, 0.15, 0.10, 0.10, 0.05, 0.0]
    weighted_sum = sum(v * w for v, w in zip(vector, weights[:len(vector)]))
    max_possible = sum(weights[:len(vector)])
    return round(weighted_sum / max_possible, 3) if max_possible > 0 else 0.0


def symptom_disease_correlation(symptoms: Dict[str, str]) -> Dict[int, float]:
    """Compute correlation scores between reported symptoms and each disease class.

    Returns a dict mapping disease class IDs to correlation scores (0.0 to 1.0).
    """
    severity_score = compute_symptom_severity_score(symptoms)

    pain = symptoms.get("eyePain", "none")
    vision = symptoms.get("visionStatus", "normal")
    light = symptoms.get("lightSensitivity", "none")
    redness = symptoms.get("rednessLevel", "no")

    correlations: Dict[int, float] = {
        0: 1.0 - severity_score,  # Healthy correlates inversely with symptom severity
        1: 0.3 if pain != "none" or vision != "normal" else 0.1,
        2: 0.5 if vision in ("veryBlurred", "blindSpots") or pain == "severe" else 0.1,
        3: 0.4 if vision != "normal" and pain == "none" else 0.1,
        4: 0.6 if redness == "veryRed" and pain != "none" and light != "none" else 0.2,
        5: 0.4 if vision == "blurred" and light != "none" else 0.1,
        6: 0.5 if redness != "no" and pain != "none" else 0.1,
        7: 0.5 if pain != "none" and redness != "no" and light != "none" else 0.1,
    }

    for i in range(8, 16):
        correlations[i] = 0.1

    return correlations