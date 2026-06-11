# IrisScan — AI-Powered Iris Disease Detection

A production-ready browser-based web application for AI-powered iris disease detection. Capture your iris via webcam, answer symptom questions, and receive a detailed diagnostic report.

## Architecture

```
iriscan/
├── frontend/          # React 18 + TypeScript + Vite + Tailwind CSS
│   ├── src/
│   │   ├── components/  # Reusable UI components
│   │   ├── pages/       # Route pages (Home, Capture, Results, etc.)
│   │   ├── hooks/       # Custom React hooks
│   │   ├── store/       # Zustand state management
│   │   ├── i18n/        # Internationalization (EN / தமிழ் / हिंदी)
│   │   ├── types/       # TypeScript interfaces
│   │   └── utils/       # Utility functions
│   └── ...
├── backend/           # Python FastAPI + PyTorch
│   ├── app/
│   │   ├── main.py       # FastAPI server
│   │   ├── model.py      # EfficientNet-B4 fusion model
│   │   ├── inference.py  # Prediction pipeline
│   │   ├── preprocessing.py # OpenCV iris segmentation
│   │   ├── gradcam.py    # Grad-CAM explainability
│   │   ├── symptoms.py   # Symptom encoding
│   │   └── diseases.py   # Disease metadata
│   ├── train/           # Training scripts
│   └── models/          # Model weights (after training)
├── docker-compose.yml
└── README.md
```

## Prerequisites

- **Frontend:** Node.js 18+ and npm
- **Backend:** Python 3.11+ and pip
- **Docker** (optional, for containerized deployment)

## Quick Start (Frontend Only)

```bash
# Install and start the frontend
cd frontend
npm install --legacy-peer-deps
npm run dev
```

The frontend will start at http://localhost:5173 and works with mock data without the backend.

## Full Local Setup

### Backend

```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### Frontend

```bash
cd frontend
npm install --legacy-peer-deps
npm run dev
```

- Frontend: http://localhost:5173
- Backend API: http://localhost:8000
- Health check: http://localhost:8000/health

## Docker Compose

```bash
docker-compose up --build
```

- Frontend: http://localhost:5173
- Backend API: http://localhost:8000

## Vercel Deployment

```bash
cd frontend
npm install --legacy-peer-deps
npm run build
# Deploy the dist/ folder to Vercel, or connect the GitHub repo
```

The included `vercel.json` handles SPA routing and caching.

## Training the Model

### With Real Data

1. Download UBIRIS.v2 or CASIA-IrisV4 datasets
2. Organize images as `/data/{class_id}/*.jpg`
3. Run training:

```bash
cd backend
pip install -r requirements.txt
python -m train.train --data_dir ./data --epochs 50 --batch_size 32
```

The best model will be saved to `models/best_model.pth` and exported to ONNX.

### Synthetic Data

The training script automatically generates synthetic iris samples if no real data is found. This allows testing the training pipeline end-to-end.

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `VITE_API_URL` | `http://localhost:8000` | Backend API URL |
| `PYTHONUNBUFFERED` | `1` | Python output buffering |

## Features

- **Iris Capture:** Webcam-based iris capture with quality checking
- **Symptom Assessment:** Adaptive questionnaire with multilingual support
- **AI Analysis:** EfficientNet-B4 + symptom fusion classifier (16 disease classes)
- **Grad-CAM Heatmaps:** Explainability visualizations
- **8-Sector Analysis:** Detailed sector-by-sector iris analysis
- **PDF Reports:** Downloadable diagnostic reports
- **Multilingual:** English, Tamil, and Hindi support
- **Scan History:** Local storage with compare mode
- **Dark Mode:** Full dark mode support
- **Responsive:** Mobile-first design

## Disease Classes

0. Healthy / Normal
1. Glaucoma (early)
2. Glaucoma (advanced)
3. Cataracts
4. Uveitis (anterior)
5. Uveitis (posterior)
6. Iritis
7. Iridocyclitis
8. Aniridia
9. Coloboma
10. Fuchs Endothelial Dystrophy
11. Pigment Dispersion Syndrome
12. Rubeosis Iridis
13. Iris Melanoma
14. Essential Iris Atrophy
15. Ocular Hypertension

## Known Limitations

- The backend uses mock inference until a trained model is provided
- MediaPipe eye landmarks and Recharts PDF rendering are planned enhancements
- Real iris datasets require registration with UBIRIS/CASIA
- Camera access requires HTTPS in production (or localhost for development)
- Maximum 20 scans stored in localStorage

## Medical Disclaimer

IrisScan is a screening tool only. It does NOT provide a medical diagnosis. Always consult a qualified ophthalmologist for professional evaluation.

## License

MIT