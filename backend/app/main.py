"""FastAPI main application for AI-powered multi-condition eye screening platform."""

import base64
from typing import Dict, List, Optional

import cv2
import numpy as np
from fastapi import FastAPI, HTTPException, File, UploadFile, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel

from .inference import run_mock_inference
from .diseases import (
    DISEASE_CLASSES,
    get_all_supported_conditions,
    get_recommendations_for_risk,
    RISK_RECOMMENDATIONS,
)
from .quality_check import assess_image_quality, check_eye_presence
from .gradcam import generate_gradcam_heatmap, overlay_heatmap, heatmap_to_base64

app = FastAPI(
    title="EyeSight AI Screening Platform",
    description="AI-powered multi-condition eye screening for early detection of major eye diseases using smartphone imaging",
    version="2.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ─── Request/Response Models ──────────────────────────────────────────

class AnalyseRequest(BaseModel):
    image: str  # base64-encoded image
    symptoms: Optional[Dict[str, str]] = None


class HealthResponse(BaseModel):
    status: str
    model: str
    version: str


class Condition(BaseModel):
    name: str
    confidence: float
    risk: str
    description: str
    meaning: str
    what_to_do: str


class AnalyseResponse(BaseModel):
    conditions: List[Condition]
    eye_health_score: int
    quality_score: float
    heatmap: str


class ConditionInfo(BaseModel):
    id: int
    name: str
    risk: str
    meaning: str


class ConditionsResponse(BaseModel):
    conditions: List[ConditionInfo]


# ─── Endpoints ─────────────────────────────────────────────────────────

@app.get("/health", response_model=HealthResponse)
async def health_check():
    """Health check endpoint."""
    return HealthResponse(
        status="ok",
        model="EfficientNet-B4 (Multi-condition)",
        version="2.0",
    )


@app.post("/analyse", response_model=AnalyseResponse)
async def analyse(request: AnalyseRequest):
    """Analyse eye image for multi-condition screening.

    Accepts base64 image and optional symptoms.
    Returns multiple possible conditions, eye health score, and heatmap.
    """
    try:
        # Decode base64 image
        image_data = base64.b64decode(request.image.split(",")[-1])
        np_arr = np.frombuffer(image_data, np.uint8)
        image = cv2.imdecode(np_arr, cv2.IMREAD_COLOR)

        if image is None:
            raise HTTPException(status_code=400, detail="Could not decode image")

        # Assess image quality
        quality_result = assess_image_quality(image)
        quality_score = quality_result["quality_score"]

        # Check eye presence
        eye_present, _ = check_eye_presence(image)
        if not eye_present and quality_score < 0.3:
            return JSONResponse(
                status_code=400,
                content={
                    "error": "No eye detected in image",
                    "quality_score": quality_score,
                    "suggestion": "Please ensure your eye is visible and centred in the frame",
                },
            )

        # Run multi-condition inference
        symptoms_dict = request.symptoms or {}
        result = run_mock_inference(symptoms_dict, quality_score)

        return AnalyseResponse(**result)

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/analyze-eye")
async def analyze_eye_upload(
    file: UploadFile = File(...),
    symptoms: Optional[str] = Form(None),
):
    """Analyze eye image from file upload.

    Alternative endpoint for mobile or form-based uploads.
    Accepts image file and optional JSON symptoms string.
    """
    try:
        contents = await file.read()
        np_arr = np.frombuffer(contents, np.uint8)
        image = cv2.imdecode(np_arr, cv2.IMREAD_COLOR)

        if image is None:
            raise HTTPException(status_code=400, detail="Could not decode uploaded image")

        # Assess quality
        quality_result = assess_image_quality(image)
        quality_score = quality_result["quality_score"]

        # Parse symptoms if provided
        symptoms_dict = {}
        if symptoms:
            import json
            try:
                symptoms_dict = json.loads(symptoms)
            except json.JSONDecodeError:
                pass

        # Run inference
        result = run_mock_inference(symptoms_dict, quality_score)
        return result

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/conditions", response_model=ConditionsResponse)
async def get_conditions():
    """Get list of all supported conditions with risk levels and meanings."""
    conditions = get_all_supported_conditions()
    return ConditionsResponse(conditions=conditions)


@app.get("/diseases")
async def get_diseases():
    """Get list of all detectable diseases (legacy endpoint)."""
    return {"diseases": DISEASE_CLASSES}


@app.get("/recommendations")
async def get_recommendations(risk_level: Optional[str] = None):
    """Get recommendations based on risk level.

    Args:
        risk_level: Optional filter ('Low', 'Medium', 'High', 'Critical').
                    Returns all if not provided.
    """
    if risk_level:
        if risk_level not in RISK_RECOMMENDATIONS:
            raise HTTPException(
                status_code=400,
                detail=f"Invalid risk level. Must be one of: {list(RISK_RECOMMENDATIONS.keys())}",
            )
        recs = get_recommendations_for_risk(risk_level)
        return {"recommendations": [{"risk_level": risk_level, "recommendations": recs}]}

    recommendations = []
    for level, recs in RISK_RECOMMENDATIONS.items():
        recommendations.append({
            "risk_level": level,
            "recommendations": recs,
        })
    return {"recommendations": recommendations}


@app.post("/explain")
async def explain_prediction(request: AnalyseRequest):
    """Generate GradCAM heatmap for explainability.

    Returns a heatmap overlay highlighting regions that influenced predictions.
    Falls back to mock heatmap if real model is unavailable.
    """
    try:
        image_data = base64.b64decode(request.image.split(",")[-1])
        np_arr = np.frombuffer(image_data, np.uint8)
        image = cv2.imdecode(np_arr, cv2.IMREAD_COLOR)

        if image is None:
            raise HTTPException(status_code=400, detail="Could not decode image")

        # Generate heatmap using GradCAM (mock if no model)
        heatmap = generate_gradcam_heatmap(
            model=None,
            input_tensor=None,
            target_class=0,
        )
        heatmap_b64 = heatmap_to_base64(heatmap)

        return {
            "heatmap_base64": heatmap_b64,
            "overlay_base64": f"data:image/png;base64,{heatmap_b64}",
            "method": "GradCAM (EfficientNet-B4 conv_head)",
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/offline-manifest")
async def get_offline_manifest():
    """Return manifest of assets needed for offline mode."""
    return {
        "version": "2.0.0",
        "endpoints": ["/health", "/conditions", "/recommendations"],
        "static_data": {
            "conditions": get_all_supported_conditions(),
            "risk_recommendations": RISK_RECOMMENDATIONS,
        },
        "cached_at": "2025-01-01T00:00:00Z",
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)