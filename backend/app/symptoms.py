"""
Symptom encoding and disease correlation utilities for eye screening.
Maps user-reported symptoms to disease likelihood vectors.
"""

from typing import Dict, List
import numpy as np
from .diseases import DISEASE_CLASSES

# Symptom keywords mapped to disease indices (matching DISEASE_CLASSES)
# 0=Healthy, 1=Glaucoma(early), 2=Glaucoma(advanced), 3=Cataracts,
# 4=Uveitis(anterior), 5=Uveitis(posterior), 6=Iritis, 7=Iridocyclitis,
# 8=Aniridia, 9=Coloboma, 10=Fuchs Dystrophy, 11=Pigment Dispersion,
# 12=Rubeosis Iridis, 13=Iris Melanoma, 14=Essential Iris Atrophy,
# 15=Ocular Hypertension
SYMPTOM_DISEASE_MAP: Dict[str, List[int]] = {
    "blurry_vision": [1, 2, 3],           # Glaucoma, Cataracts
    "blurred_vision": [1, 2, 3],
    "blurry": [1, 2, 3],
    "blurred": [1, 2, 3],
    "double_vision": [3],                 # Cataracts
    "double": [3],
    "night_blindness": [3],               # Cataracts
    "night": [3],
    "halos_around_lights": [3, 1],        # Cataracts, Glaucoma(early)
    "halos": [3, 1],
    "glare": [3],                         # Cataracts
    "tunnel_vision": [2],                 # Glaucoma(advanced)
    "tunnel": [2],
    "peripheral_vision_loss": [1, 2],     # Glaucoma
    "peripheral": [1, 2],
    "eye_pain": [4, 7],                   # Uveitis, Iridocyclitis
    "pain": [4, 7],
    "redness": [4, 6],                    # Uveitis(anterior), Iritis
    "red_eye": [4, 6],
    "floating_spots": [5, 12],           # Uveitis(posterior), Rubeosis
    "floaters": [5, 12],
    "spots": [5, 12],
    "distorted_vision": [9, 14],         # Coloboma, Iris Atrophy
    "metamorphopsia": [9],
    "central_vision_loss": [13, 14],     # Iris Melanoma, Essential Iris Atrophy
    "central": [13, 14],
    "blind_spots": [11, 12],             # Pigment Dispersion, Rubeosis
    "scotoma": [11, 12],
    "sudden_vision_loss": [2, 12],       # Glaucoma(advanced), Rubeosis
    "sudden_vision_change": [2, 12],
    "dry_eyes": [10],                    # Fuchs Dystrophy
    "dryness": [10],
    "itching": [6],                      # Iritis
    "itchy": [6],
    "burning_sensation": [4, 6],         # Uveitis, Iritis
    "burning": [4, 6],
    "gritty_sensation": [10],            # Fuchs Dystrophy
    "gritty": [10],
    "watery_eyes": [4, 6],              # Uveitis, Iritis
    "watery": [4, 6],
    "eye_strain": [15, 1],              # Ocular Hypertension, Glaucoma(early)
    "strain": [15, 1],
    "headache": [1, 2, 15],             # Glaucoma, Ocular Hypertension
    "headaches": [1, 2, 15],
    "squinting": [1, 2],                # Glaucoma
    "squint": [1, 2],
    "difficulty_reading": [3, 9],       # Cataracts, Coloboma
    "reading_difficulty": [3, 9],
    "photophobia": [4, 6, 7],           # Uveitis, Iritis, Iridocyclitis
    "light_sensitivity": [4, 6, 7],
    "tearing": [4, 6],
    "iris_discoloration": [11, 13, 14],  # Pigment Dispersion, Melanoma, Atrophy
    "iris_color_change": [11, 13, 14],
    "high_pressure": [15],               # Ocular Hypertension
    "ocular_pressure": [15, 1],
}


def encode_symptoms(symptoms_dict: Dict[str, str]) -> np.ndarray:
    """Encode symptom severity into a feature vector.

    Args:
        symptoms_dict: Dict mapping symptom names to severity strings
                       (e.g., "mild", "moderate", "severe").

    Returns:
        NumPy array of encoded symptom features.
    """
    SEVERITY_MAP = {
        "none": 0.0,
        "mild": 0.25,
        "moderate": 0.5,
        "severe": 0.75,
        "critical": 1.0,
    }

    # Build a fixed-length feature vector based on known symptom-disease correlations
    vector = np.zeros(len(DISEASE_CLASSES), dtype=np.float32)

    for symptom_name, severity_str in symptoms_dict.items():
        severity = SEVERITY_MAP.get(severity_str.lower(), 0.3)
        normalized_symptom = symptom_name.lower().replace(" ", "_")

        # Find matching disease indices
        matched_indices = []
        for key, indices in SYMPTOM_DISEASE_MAP.items():
            if key == normalized_symptom or key in normalized_symptom or normalized_symptom in key:
                matched_indices.extend(indices)

        if matched_indices:
            for idx in set(matched_indices):
                vector[idx] = max(vector[idx], severity)

    return vector


def symptom_disease_correlation(symptoms_dict: Dict[str, str]) -> Dict[int, float]:
    """Compute correlation scores between reported symptoms and each disease.

    Args:
        symptoms_dict: Dict mapping symptom names to severity strings.

    Returns:
        Dict mapping disease_id (int) to correlation score (0.0 - 1.0).
    """
    if not symptoms_dict:
        return {}

    SEVERITY_WEIGHT = {
        "none": 0.0,
        "mild": 0.3,
        "moderate": 0.5,
        "severe": 0.75,
        "critical": 0.95,
    }

    disease_scores: Dict[int, float] = {}

    for symptom_name, severity_str in symptoms_dict.items():
        weight = SEVERITY_WEIGHT.get(severity_str.lower(), 0.3)
        normalized_symptom = symptom_name.lower().replace(" ", "_")

        for key, indices in SYMPTOM_DISEASE_MAP.items():
            if key == normalized_symptom or key in normalized_symptom or normalized_symptom in key:
                for idx in indices:
                    disease_scores[idx] = max(disease_scores.get(idx, 0.0), weight)

    return disease_scores