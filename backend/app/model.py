"""EfficientNet-B4 architecture and multimodal fusion model for iris disease classification."""

import torch
import torch.nn as nn
import torch.nn.functional as F
import timm


class SymptomEncoder(nn.Module):
    """MLP encoder for symptom vectors."""

    def __init__(self, input_dim: int = 10, hidden_dims: list = [64, 32], output_dim: int = 32):
        super().__init__()
        layers = []
        prev_dim = input_dim
        for h_dim in hidden_dims:
            layers.extend([
                nn.Linear(prev_dim, h_dim),
                nn.ReLU(inplace=True),
                nn.Dropout(0.2),
            ])
            prev_dim = h_dim
        layers.append(nn.Linear(prev_dim, output_dim))
        self.encoder = nn.Sequential(*layers)

    def forward(self, x: torch.Tensor) -> torch.Tensor:
        return self.encoder(x)


class IrisFusionClassifier(nn.Module):
    """Multimodal fusion classifier combining vision, sector, and symptom features.

    Architecture:
    - Vision: EfficientNet-B4 backbone → 1792-dim
    - Sector: 400-dim sector features
    - Symptom: 32-dim symptom embedding (via MLP)
    - Concatenated: 2224-dim → FC[512, 256, 128] → softmax 16 classes
    """

    def __init__(self, num_classes: int = 16, dropout_rate: float = 0.3):
        super().__init__()

        # Vision encoder (EfficientNet-B4)
        self.backbone = timm.create_model("efficientnet_b4", pretrained=True, num_classes=0)
        vision_dim = self.backbone.num_features  # 1792

        # Sector feature encoder
        self.sector_proj = nn.Sequential(
            nn.Linear(400, 256),
            nn.ReLU(inplace=True),
            nn.Dropout(dropout_rate),
        )

        # Symptom encoder
        self.symptom_encoder = SymptomEncoder()

        # Fusion classifier
        fusion_dim = vision_dim + 256 + 32
        self.classifier = nn.Sequential(
            nn.Linear(fusion_dim, 512),
            nn.ReLU(inplace=True),
            nn.Dropout(dropout_rate),
            nn.Linear(512, 256),
            nn.ReLU(inplace=True),
            nn.Dropout(dropout_rate),
            nn.Linear(256, 128),
            nn.ReLU(inplace=True),
            nn.Dropout(dropout_rate),
            nn.Linear(128, num_classes),
        )

    def forward(
        self,
        vision_features: torch.Tensor,
        sector_features: torch.Tensor,
        symptom_vector: torch.Tensor,
    ) -> torch.Tensor:
        """Forward pass.

        Args:
            vision_features: (B, 1792) features from EfficientNet-B4
            sector_features: (B, 400) sector features
            symptom_vector: (B, 10) encoded symptom vector

        Returns:
            (B, num_classes) logits
        """
        # Project sector features
        sector_encoded = self.sector_proj(sector_features)

        # Encode symptoms
        symptom_encoded = self.symptom_encoder(symptom_vector)

        # Concatenate and classify
        combined = torch.cat([vision_features, sector_encoded, symptom_encoded], dim=1)
        logits = self.classifier(combined)
        return logits


def create_model(num_classes: int = 16, pretrained: bool = True) -> nn.Module:
    """Create the IrisFusionClassifier model.

    Args:
        num_classes: Number of disease classes (default: 16)
        pretrained: Whether to load pretrained EfficientNet weights

    Returns:
        IrisFusionClassifier instance
    """
    model = IrisFusionClassifier(num_classes=num_classes)
    return model


def count_parameters(model: nn.Module) -> int:
    """Count trainable parameters in the model."""
    return sum(p.numel() for p in model.parameters() if p.requires_grad)