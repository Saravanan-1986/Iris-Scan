"""
Image quality assessment for eye screening.
Evaluates blur, brightness, contrast, and eye presence.
"""

import cv2
import numpy as np
from typing import Dict, Tuple, Optional


def assess_image_quality(image: np.ndarray) -> Dict:
    """Assess the quality of an eye image for screening suitability.

    Args:
        image: RGB or BGR image as numpy array.

    Returns:
        Dict with quality_score (0-1), blur_score, brightness_score,
        contrast_score, and is_acceptable flag.
    """
    if len(image.shape) == 2:
        gray = image
    elif image.shape[2] == 4:
        gray = cv2.cvtColor(image, cv2.COLOR_RGBA2GRAY)
    else:
        gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)

    blur_score = _assess_blur(gray)
    brightness_score = _assess_brightness(gray)
    contrast_score = _assess_contrast(gray)

    # Weighted combination: blur matters most, then brightness, then contrast
    quality_score = (
        0.5 * blur_score +
        0.3 * brightness_score +
        0.2 * contrast_score
    )
    quality_score = round(max(0.0, min(1.0, quality_score)), 3)

    return {
        "quality_score": quality_score,
        "blur_score": round(blur_score, 3),
        "brightness_score": round(brightness_score, 3),
        "contrast_score": round(contrast_score, 3),
        "is_acceptable": quality_score >= 0.4,
    }


def _assess_blur(gray: np.ndarray) -> float:
    """Assess blur using Laplacian variance.

    Higher variance = sharper image. Returns score normalized 0-1.
    """
    laplacian_var = cv2.Laplacian(gray, cv2.CV_64F).var()
    # Typical sharp image: var > 100, blurry: var < 20
    score = min(1.0, max(0.0, laplacian_var / 150.0))
    return float(score)


def _assess_brightness(gray: np.ndarray) -> float:
    """Assess brightness level.

    Optimal mean brightness is around 100-180 (out of 255).
    """
    mean_brightness = np.mean(gray)
    if mean_brightness < 30:
        return 0.0  # Too dark
    elif mean_brightness < 70:
        return float((mean_brightness - 30) / 40.0)  # 0-1 ramp up
    elif mean_brightness <= 200:
        return 1.0  # Ideal range
    elif mean_brightness <= 230:
        return float(1.0 - (mean_brightness - 200) / 30.0)  # Slight falloff
    else:
        return 0.3  # Overexposed


def _assess_contrast(gray: np.ndarray) -> float:
    """Assess image contrast using standard deviation.

    Good contrast: std dev > 40, low contrast: < 15.
    """
    std_dev = np.std(gray)
    score = min(1.0, max(0.0, std_dev / 60.0))
    return float(score)


def check_eye_presence(
    image: np.ndarray,
    mediapipe_available: bool = False,
) -> Tuple[bool, Optional[Dict]]:
    """Check if an eye is present and visible in the image.

    Uses basic heuristics (returns mock result if MediaPipe unavailable).

    Args:
        image: RGB/BGR image.
        mediapipe_available: Whether MediaPipe face mesh is available.

    Returns:
        (is_present, roi_dict) where roi_dict has 'bbox' and 'confidence'.
    """
    if len(image.shape) == 2:
        gray = image
    elif image.shape[2] == 4:
        gray = cv2.cvtColor(image, cv2.COLOR_RGBA2GRAY)
    elif image.shape[2] == 3:
        gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
    else:
        gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
    h, w = gray.shape

    # Simple pupil detection via circular Hough as fallback
    blurred = cv2.medianBlur(gray, 5)
    circles = cv2.HoughCircles(
        blurred,
        cv2.HOUGH_GRADIENT,
        dp=1.2,
        minDist=h // 4,
        param1=50,
        param2=20,
        minRadius=max(5, h // 20),
        maxRadius=h // 3,
    )

    if circles is not None:
        x, y, r = circles[0][0].astype(int)
        x1, y1 = max(0, x - r), max(0, y - r)
        x2, y2 = min(w, x + r), min(h, y + r)
        return True, {
            "bbox": [int(x1), int(y1), int(x2), int(y2)],
            "confidence": 0.85,
            "pupil_radius": int(r),
        }

    # Fallback: assume center region has content
    center_region = gray[h // 4:3 * h // 4, w // 4:3 * w // 4]
    if center_region.std() > 15:
        return True, {
            "bbox": [w // 4, h // 4, 3 * w // 4, 3 * h // 4],
            "confidence": 0.5,
            "pupil_radius": None,
        }

    return False, None