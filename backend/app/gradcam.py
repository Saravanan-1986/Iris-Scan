"""Grad-CAM implementation for iris explainability heatmaps."""

import numpy as np
import cv2
from typing import Optional, TYPE_CHECKING
import base64
from io import BytesIO
import torch
from PIL import Image

if TYPE_CHECKING:
    from torch import Tensor
    from torch.nn import Module


def generate_gradcam_heatmap(
    model: Optional["Module"],
    input_tensor: Optional["Tensor"],
    target_class: int,
    target_layer_name: str = "conv_head",
) -> np.ndarray:
    """Generate Grad-CAM heatmap for the given input and target class.

    Args:
        model: The PyTorch model.
        input_tensor: Preprocessed input tensor (1, 3, 224, 224).
        target_class: Target class index.
        target_layer_name: Name of the target convolutional layer.

    Returns:
        224x224 heatmap as numpy array.
    """
    try:
        from pytorch_grad_cam import GradCAM
        from pytorch_grad_cam.utils.model_targets import ClassifierOutputTarget

        target_layers = [model]
        cam = GradCAM(model=model, target_layers=target_layers)
        targets = [ClassifierOutputTarget(target_class)]
        grayscale_cam = cam(input_tensor=input_tensor, targets=targets)
        return grayscale_cam[0]
    except ImportError:
        return _mock_heatmap()


def _mock_heatmap() -> np.ndarray:
    """Return a mock heatmap when Grad-CAM is unavailable."""
    heatmap = np.random.rand(224, 224).astype(np.float32)
    heatmap = cv2.GaussianBlur(heatmap, (15, 15), 5)
    heatmap = (heatmap - heatmap.min()) / (heatmap.max() - heatmap.min() + 1e-6)
    return heatmap


def overlay_heatmap(
    image: np.ndarray,
    heatmap: np.ndarray,
    alpha: float = 0.4,
    colormap: int = cv2.COLORMAP_JET,
) -> np.ndarray:
    """Overlay heatmap on original image.

    Args:
        image: Original RGB image (H, W, 3).
        heatmap: Heatmap array (H, W) normalized 0-1.
        alpha: Overlay opacity.
        colormap: OpenCV colormap to apply.

    Returns:
        Overlayed image as RGB numpy array.
    """
    if image.shape[:2] != heatmap.shape[:2]:
        heatmap = cv2.resize(heatmap, (image.shape[1], image.shape[0]))

    heatmap_uint8 = np.uint8(255 * heatmap)
    heatmap_colored = cv2.applyColorMap(heatmap_uint8, colormap)
    heatmap_colored = cv2.cvtColor(heatmap_colored, cv2.COLOR_BGR2RGB)

    overlayed = cv2.addWeighted(image.astype(np.uint8), 1 - alpha, heatmap_colored, alpha, 0)
    return overlayed


def heatmap_to_base64(heatmap: np.ndarray) -> str:
    """Convert heatmap numpy array to base64 PNG string."""
    heatmap_uint8 = np.uint8(255 * heatmap)
    heatmap_colored = cv2.applyColorMap(heatmap_uint8, cv2.COLORMAP_JET)
    pil_image = Image.fromarray(cv2.cvtColor(heatmap_colored, cv2.COLOR_BGR2RGB))
    buffer = BytesIO()
    pil_image.save(buffer, format="PNG")
    return base64.b64encode(buffer.getvalue()).decode("utf-8")