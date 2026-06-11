"""FastAPI main application for IrisScan AI backend."""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Dict, List, Optional
import uvicorn

from .inference import run_mock_inference
from .diseases import DISEASE_CLASSES

app = FastAPI(
    title="IrisScan AI Backend",
    description="AI-powered iris disease detection API",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class AnalyseRequest(BaseModel):
    image: str  # base64-encoded image
    symptoms: Dict[str, str]


class HealthResponse(BaseModel):
    status: str
    model: str
    version: str


class AnalyseResponse(BaseModel):
    predictions: List[Dict]
    heatmap: str
    sectorAnalysis: List[Dict]
    diseaseInfo: Dict


@app.get("/health", response_model=HealthResponse)
async def health_check():
    """Health check endpoint."""
    return HealthResponse(
        status="ok",
        model="EfficientNet-B4",
        version="1.0",
    )


@app.post("/analyse", response_model=AnalyseResponse)
async def analyse(request: AnalyseRequest):
    """Analyse iris image and symptoms.

    Args:
        request: AnalyseRequest with base64 image and symptom dictionary.

    Returns:
        AnalyseResponse with predictions, heatmap, and sector analysis.
    """
    try:
        result = run_mock_inference(request.symptoms)
        return AnalyseResponse(**result)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/diseases")
async def get_diseases():
    """Get list of all detectable diseases."""
    return {"diseases": DISEASE_CLASSES}


if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)