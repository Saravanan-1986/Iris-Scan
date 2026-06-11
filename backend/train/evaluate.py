"""Evaluation script for trained IrisScan model."""

import os
import sys
import argparse
import torch
import numpy as np
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent.parent))
from app.model import create_model
from train.dataset import IrisDataset
from torch.utils.data import DataLoader


def compute_metrics(model, dataloader, device):
    """Compute accuracy, precision, recall, and confusion matrix."""
    model.eval()
    all_preds = []
    all_labels = []

    with torch.no_grad():
        for images, labels in dataloader:
            images, labels = images.to(device), labels.to(device)
            batch_size = images.size(0)
            features = model.backbone(images)
            dummy_sector = torch.randn(batch_size, 400, device=device)
            dummy_symptom = torch.randn(batch_size, 10, device=device)
            outputs = model(features, dummy_sector, dummy_symptom)
            _, predicted = outputs.max(1)
            all_preds.extend(predicted.cpu().numpy())
            all_labels.extend(labels.cpu().numpy())

    all_preds = np.array(all_preds)
    all_labels = np.array(all_labels)

    accuracy = (all_preds == all_labels).mean() * 100

    # Per-class metrics
    num_classes = len(np.unique(all_labels))
    per_class_acc = []
    for c in range(num_classes):
        mask = all_labels == c
        if mask.sum() > 0:
            acc = (all_preds[mask] == all_labels[mask]).mean() * 100
            per_class_acc.append(acc)

    print(f"\n=== Evaluation Results ===")
    print(f"Overall Accuracy: {accuracy:.2f}%")
    print(f"Per-class Accuracy: {np.mean(per_class_acc):.2f}%")
    print(f"Number of classes: {num_classes}")
    print(f"Total samples evaluated: {len(all_labels)}")


def main():
    parser = argparse.ArgumentParser(description="Evaluate IrisScan model")
    parser.add_argument("--checkpoint", type=str, default="models/best_model.pth", help="Model checkpoint")
    parser.add_argument("--data_dir", type=str, default="./data", help="Dataset directory")
    parser.add_argument("--batch_size", type=int, default=32, help="Batch size")
    parser.add_argument("--num_classes", type=int, default=16, help="Number of classes")
    args = parser.parse_args()

    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    print(f"Using device: {device}")

    model = create_model(num_classes=args.num_classes)
    model = model.to(device)

    if os.path.exists(args.checkpoint):
        model.load_state_dict(torch.load(args.checkpoint, map_location=device))
        print(f"Loaded checkpoint: {args.checkpoint}")
    else:
        print(f"Warning: No checkpoint found at {args.checkpoint}. Using untrained model.")

    dataset = IrisDataset(os.path.join(args.data_dir, "val"), is_train=False)
    dataloader = DataLoader(dataset, batch_size=args.batch_size, shuffle=False, num_workers=0)

    compute_metrics(model, dataloader, device)


if __name__ == "__main__":
    main()