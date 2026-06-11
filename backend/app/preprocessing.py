"""OpenCV-based iris segmentation and preprocessing pipeline."""

import cv2
import numpy as np
from typing import Tuple, Optional, List


def preprocess_iris(image: np.ndarray, target_size: Tuple[int, int] = (224, 224)) -> np.ndarray:
    """Full preprocessing pipeline for iris images.

    1. Convert to RGB
    2. Detect iris using circular Hough transform
    3. Crop and resize to target_size
    4. Normalize
    """
    if len(image.shape) == 2:
        image = cv2.cvtColor(image, cv2.COLOR_GRAY2RGB)
    elif image.shape[2] == 4:
        image = cv2.cvtColor(image, cv2.COLOR_RGBA2RGB)

    rgb = cv2.cvtColor(image, cv2.COLOR_BGR2RGB) if image.shape[2] == 3 else image
    gray = cv2.cvtColor(rgb, cv2.COLOR_RGB2GRAY)

    circles = detect_iris(gray)
    if circles is not None:
        x, y, r = circles[0][0].astype(int)
        x1, y1 = max(0, x - r), max(0, y - r)
        x2, y2 = min(rgb.shape[1], x + r), min(rgb.shape[0], y + r)
        cropped = rgb[y1:y2, x1:x2]
    else:
        cropped = rgb

    resized = cv2.resize(cropped, target_size, interpolation=cv2.INTER_LINEAR)
    normalized = resized.astype(np.float32) / 255.0
    mean = np.array([0.485, 0.456, 0.406])
    std = np.array([0.229, 0.224, 0.225])
    normalized = (normalized - mean) / std

    return normalized


def detect_iris(gray: np.ndarray) -> Optional[np.ndarray]:
    """Detect iris using circular Hough transform."""
    blurred = cv2.medianBlur(gray, 5)
    circles = cv2.HoughCircles(
        blurred,
        cv2.HOUGH_GRADIENT,
        dp=1,
        minDist=gray.shape[0] // 8,
        param1=50,
        param2=30,
        minRadius=gray.shape[0] // 6,
        maxRadius=gray.shape[0] // 2,
    )
    return circles


def extract_sector(image: np.ndarray, sector_idx: int, num_sectors: int = 8) -> np.ndarray:
    """Extract a polar sector from the iris image."""
    h, w = image.shape[:2]
    cx, cy = w // 2, h // 2
    radius = min(cx, cy) - 5

    angle_per_sector = 2 * np.pi / num_sectors
    start_angle = sector_idx * angle_per_sector
    end_angle = (sector_idx + 1) * angle_per_sector

    mask = np.zeros((h, w), dtype=np.uint8)
    cv2.ellipse(
        mask,
        (cx, cy),
        (radius, radius),
        0,
        np.degrees(start_angle),
        np.degrees(end_angle),
        255,
        -1,
    )

    sector = cv2.bitwise_and(image, image, mask=mask)
    return sector


def compute_sector_features(sector: np.ndarray) -> np.ndarray:
    """Compute HSV histogram features for a sector (48 features)."""
    if sector.sum() == 0:
        return np.zeros(48, dtype=np.float32)

    hsv = cv2.cvtColor(sector, cv2.COLOR_RGB2HSV)
    hist_features = []
    for channel in range(3):
        hist = cv2.calcHist(
            [hsv], [channel], None, [16], [0, 256]
        ).flatten()
        hist = hist / (hist.sum() + 1e-6)
        hist_features.extend(hist)

    return np.array(hist_features, dtype=np.float32)


def compute_contour_density(sector: np.ndarray) -> float:
    """Compute contour density score for a sector."""
    gray = cv2.cvtColor(sector, cv2.COLOR_RGB2GRAY)
    _, binary = cv2.threshold(gray, 50, 255, cv2.THRESH_BINARY)
    contours, _ = cv2.findContours(binary, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    total_area = sector.shape[0] * sector.shape[1]
    contour_area = sum(cv2.contourArea(c) for c in contours)
    return contour_area / total_area if total_area > 0 else 0.0


def compute_lbp_score(gray: np.ndarray) -> float:
    """Compute Local Binary Pattern-based irregularity score."""
    from skimage.feature import local_binary_pattern
    radius = 2
    n_points = 8 * radius
    lbp = local_binary_pattern(gray, n_points, radius, method="uniform")
    hist, _ = np.histogram(lbp.ravel(), bins=n_points + 2, range=(0, n_points + 2))
    hist = hist.astype(np.float32)
    hist /= hist.sum() + 1e-6
    variance = np.var(hist)
    return float(variance)


def extract_all_sector_features(image: np.ndarray) -> np.ndarray:
    """Extract features from all 8 sectors.

    Returns 400-dimensional feature vector (8 sectors × (48 HSV + 2 scores)).
    """
    features = []
    for i in range(8):
        sector = extract_sector(image, i)
        hsv_hist = compute_sector_features(sector)
        contour_density = compute_contour_density(sector)
        gray = cv2.cvtColor(sector, cv2.COLOR_RGB2GRAY)
        lbp_score = compute_lbp_score(gray) if gray.sum() > 0 else 0.0
        sector_feat = np.concatenate([hsv_hist, [contour_density, lbp_score]])
        features.append(sector_feat)

    return np.concatenate(features).astype(np.float32)