"""Dataset loader and augmentation for iris disease training.

To use with real datasets:
1. Download UBIRIS.v2 from http://iris.di.ubi.pt/
2. Download CASIA-IrisV4 from http://www.cripac.ia.ac.cn/
3. Update the paths below to point to your dataset directories
"""

import torch
from torch.utils.data import Dataset, DataLoader
from torchvision import transforms
import cv2
import numpy as np
import os
from typing import Optional, Tuple, List


class IrisDataset(Dataset):
    """Iris dataset with augmentation.

    To use with a real dataset:
    - Place images in /data/{class_id}/*.jpg
    - Or override __getitem__ to load from your dataset format
    """

    def __init__(
        self,
        root_dir: str,
        transform: Optional[transforms.Compose] = None,
        is_train: bool = True,
    ):
        self.root_dir = root_dir
        self.is_train = is_train

        if transform is None:
            if is_train:
                self.transform = transforms.Compose([
                    transforms.ToPILImage(),
                    transforms.RandomHorizontalFlip(),
                    transforms.RandomRotation(15),
                    transforms.ColorJitter(brightness=0.2, contrast=0.2, saturation=0.2, hue=0.1),
                    transforms.RandomErasing(p=0.1),
                    transforms.Resize((224, 224)),
                    transforms.ToTensor(),
                    transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225]),
                ])
            else:
                self.transform = transforms.Compose([
                    transforms.ToPILImage(),
                    transforms.Resize((224, 224)),
                    transforms.ToTensor(),
                    transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225]),
                ])

        # Load file paths
        self.samples: List[Tuple[str, int]] = []
        if os.path.exists(root_dir):
            for class_id in sorted(os.listdir(root_dir)):
                class_path = os.path.join(root_dir, class_id)
                if os.path.isdir(class_path):
                    for fname in os.listdir(class_path):
                        if fname.lower().endswith(('.jpg', '.jpeg', '.png', '.bmp')):
                            self.samples.append((
                                os.path.join(class_path, fname),
                                int(class_id),
                            ))

        # If no real data found, generate synthetic samples
        if len(self.samples) == 0:
            print(f"Warning: No data found in {root_dir}. Using synthetic data.")
            self._generate_synthetic()

    def _generate_synthetic(self, num_samples: int = 100):
        """Generate synthetic iris-like samples for development/testing."""
        for i in range(num_samples):
            synthetic = np.random.rand(224, 224, 3).astype(np.float32)
            cx, cy = 112, 112
            for r in range(20, 100, 5):
                cv2.circle(synthetic, (cx, cy), r, (0.3, 0.2, 0.1), 1)
            class_id = i % 16
            self.samples.append((synthetic, class_id))

    def __len__(self) -> int:
        return len(self.samples)

    def __getitem__(self, idx: int) -> Tuple[torch.Tensor, int]:
        data, label = self.samples[idx]
        if isinstance(data, str):
            image = cv2.imread(data)
            if image is None:
                image = np.random.rand(224, 224, 3).astype(np.float32)
            image = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
        else:
            image = (data * 255).astype(np.uint8)

        if self.transform:
            image = self.transform(image)

        return image, torch.tensor(label, dtype=torch.long)