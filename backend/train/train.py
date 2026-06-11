"""Training script for IrisFusionClassifier.

Usage:
    python -m train.train --data_dir /path/to/dataset --epochs 50 --batch_size 32
    
To train with real data:
    1. Download UBIRIS.v2 or CASIA-IrisV4
    2. Organize as /data/{class_id}/*.jpg
    3. Run with --data_dir /data
"""

import os
import sys
import argparse
import torch
import torch.nn as nn
import torch.optim as optim
from torch.utils.data import DataLoader
from torch.optim.lr_scheduler import CosineAnnealingLR
import numpy as np
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent.parent))
from app.model import create_model, count_parameters
from train.dataset import IrisDataset


def train_epoch(
    model: nn.Module,
    dataloader: DataLoader,
    criterion: nn.Module,
    optimizer: optim.Optimizer,
    device: torch.device,
) -> float:
    model.train()
    total_loss = 0.0
    correct = 0
    total = 0

    for images, labels in dataloader:
        images, labels = images.to(device), labels.to(device)
        batch_size = images.size(0)

        # In full pipeline, we'd also extract sector_features and symptom_vectors
        # For now, we train on vision features only as a base
        features = model.backbone(images)
        dummy_sector = torch.randn(batch_size, 400, device=device)
        dummy_symptom = torch.randn(batch_size, 10, device=device)

        outputs = model(features, dummy_sector, dummy_symptom)
        loss = criterion(outputs, labels)

        optimizer.zero_grad()
        loss.backward()
        optimizer.step()

        total_loss += loss.item()
        _, predicted = outputs.max(1)
        total += labels.size(0)
        correct += predicted.eq(labels).sum().item()

    return total_loss / len(dataloader), 100.0 * correct / total


def evaluate(
    model: nn.Module,
    dataloader: DataLoader,
    criterion: nn.Module,
    device: torch.device,
) -> tuple:
    model.eval()
    total_loss = 0.0
    correct = 0
    total = 0

    with torch.no_grad():
        for images, labels in dataloader:
            images, labels = images.to(device), labels.to(device)
            batch_size = images.size(0)
            features = model.backbone(images)
            dummy_sector = torch.randn(batch_size, 400, device=device)
            dummy_symptom = torch.randn(batch_size, 10, device=device)
            outputs = model(features, dummy_sector, dummy_symptom)
            loss = criterion(outputs, labels)

            total_loss += loss.item()
            _, predicted = outputs.max(1)
            total += labels.size(0)
            correct += predicted.eq(labels).sum().item()

    return total_loss / len(dataloader), 100.0 * correct / total


def main():
    parser = argparse.ArgumentParser(description="Train IrisScan model")
    parser.add_argument("--data_dir", type=str, default="./data", help="Dataset directory")
    parser.add_argument("--epochs", type=int, default=50, help="Number of epochs")
    parser.add_argument("--batch_size", type=int, default=32, help="Batch size")
    parser.add_argument("--lr", type=float, default=1e-4, help="Learning rate")
    parser.add_argument("--weight_decay", type=float, default=1e-4, help="Weight decay")
    parser.add_argument("--num_classes", type=int, default=16, help="Number of classes")
    parser.add_argument("--checkpoint_dir", type=str, default="./models", help="Checkpoint directory")
    parser.add_argument("--export_onnx", action="store_true", help="Export to ONNX")
    args = parser.parse_args()

    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    print(f"Using device: {device}")

    # Create model
    model = create_model(num_classes=args.num_classes)
    model = model.to(device)
    print(f"Model parameters: {count_parameters(model):,}")

    # Data
    train_dataset = IrisDataset(os.path.join(args.data_dir, "train"), is_train=True)
    val_dataset = IrisDataset(os.path.join(args.data_dir, "val"), is_train=False)

    train_loader = DataLoader(train_dataset, batch_size=args.batch_size, shuffle=True, num_workers=0)
    val_loader = DataLoader(val_dataset, batch_size=args.batch_size, shuffle=False, num_workers=0)

    print(f"Train samples: {len(train_dataset)}, Val samples: {len(val_dataset)}")

    # Loss with label smoothing
    criterion = nn.CrossEntropyLoss(label_smoothing=0.1)

    # Optimizer
    optimizer = optim.AdamW(model.parameters(), lr=args.lr, weight_decay=args.weight_decay)

    # Scheduler
    scheduler = CosineAnnealingLR(optimizer, T_max=args.epochs)

    # Training loop
    best_acc = 0.0
    os.makedirs(args.checkpoint_dir, exist_ok=True)

    for epoch in range(args.epochs):
        train_loss, train_acc = train_epoch(model, train_loader, criterion, optimizer, device)
        val_loss, val_acc = evaluate(model, val_loader, criterion, device)
        scheduler.step()

        print(f"Epoch {epoch+1:03d}/{args.epochs:03d} | "
              f"Train Loss: {train_loss:.4f} Acc: {train_acc:.2f}% | "
              f"Val Loss: {val_loss:.4f} Acc: {val_acc:.2f}%")

        if val_acc > best_acc:
            best_acc = val_acc
            torch.save(model.state_dict(), os.path.join(args.checkpoint_dir, "best_model.pth"))
            print(f"  → Saved best model (acc: {best_acc:.2f}%)")

    print(f"\nTraining complete. Best accuracy: {best_acc:.2f}%")

    # Export to ONNX
    if args.export_onnx:
        model.eval()
        dummy_vision = torch.randn(1, 1792, device=device)
        dummy_sector = torch.randn(1, 400, device=device)
        dummy_symptom = torch.randn(1, 10, device=device)

        torch.onnx.export(
            model,
            (dummy_vision, dummy_sector, dummy_symptom),
            os.path.join(args.checkpoint_dir, "best_model.onnx"),
            input_names=["vision_features", "sector_features", "symptom_vector"],
            output_names=["logits"],
            opset_version=17,
            dynamic_axes={
                "vision_features": {0: "batch_size"},
                "sector_features": {0: "batch_size"},
                "symptom_vector": {0: "batch_size"},
                "logits": {0: "batch_size"},
            },
        )
        print(f"Exported ONNX model to {args.checkpoint_dir}/best_model.onnx")


if __name__ == "__main__":
    main()