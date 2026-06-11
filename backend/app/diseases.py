"""Disease metadata and descriptions for 16 iris disease classes."""

DISEASE_CLASSES = [
    "Healthy / Normal",
    "Glaucoma (early)",
    "Glaucoma (advanced)",
    "Cataracts",
    "Uveitis (anterior)",
    "Uveitis (posterior)",
    "Iritis",
    "Iridocyclitis",
    "Aniridia",
    "Coloboma",
    "Fuchs Endothelial Dystrophy",
    "Pigment Dispersion Syndrome",
    "Rubeosis Iridis",
    "Iris Melanoma",
    "Essential Iris Atrophy",
    "Ocular Hypertension",
]

DISEASE_INFO = {
    0: {
        "description": "No abnormalities detected in iris patterns. Eyes appear healthy.",
        "causes": ["N/A"],
        "common_symptoms": ["No symptoms reported"],
        "urgency": "monitor",
        "recommendations": [
            "Continue regular eye check-ups every 2 years",
            "Maintain a balanced diet rich in Vitamin A, C, and E",
            "Protect your eyes from UV light with sunglasses",
            "Take regular breaks from screen time",
        ],
    },
    1: {
        "description": "A condition that damages the optic nerve, often caused by abnormally high pressure in the eye. Early detection is crucial to prevent vision loss.",
        "causes": [
            "Increased intraocular pressure",
            "Family history of glaucoma",
            "Age over 60",
            "Medical conditions like diabetes",
        ],
        "common_symptoms": [
            "Often no early symptoms",
            "Gradual loss of peripheral vision",
            "Tunnel vision in advanced stages",
        ],
        "urgency": "within_month",
        "recommendations": [
            "Schedule an eye pressure test immediately",
            "Monitor intraocular pressure regularly",
            "Take prescribed eye drops as directed",
            "Avoid activities that increase eye pressure",
        ],
    },
    2: {
        "description": "Advanced stage of glaucoma with significant optic nerve damage and vision field loss.",
        "causes": [
            "Untreated or uncontrolled glaucoma",
            "Extremely high eye pressure",
            "Poor blood flow to the optic nerve",
        ],
        "common_symptoms": [
            "Severe peripheral vision loss",
            "Blurred vision",
            "Halos around lights",
            "Eye pain or redness",
        ],
        "urgency": "immediate",
        "recommendations": [
            "Seek immediate ophthalmologist consultation",
            "Consider surgical treatment options",
            "Use pressure-lowering medications",
            "Avoid heavy lifting and straining",
        ],
    },
    3: {
        "description": "Clouding of the eye's natural lens, leading to decreased vision. Most commonly related to aging.",
        "causes": ["Aging", "Diabetes", "Prolonged steroid use", "Eye injury", "Smoking"],
        "common_symptoms": [
            "Blurred or cloudy vision",
            "Difficulty with night vision",
            "Sensitivity to light and glare",
            "Fading or yellowing of colors",
        ],
        "urgency": "within_month",
        "recommendations": [
            "Consult an ophthalmologist for cataract evaluation",
            "Consider cataract surgery when vision affects daily life",
            "Use brighter lighting for reading",
            "Wear anti-glare sunglasses",
        ],
    },
    4: {
        "description": "Inflammation of the uvea, the middle layer of the eye. Anterior uveitis affects the front part.",
        "causes": ["Autoimmune disorders", "Infections", "Eye injury", "Unknown causes"],
        "common_symptoms": [
            "Eye redness",
            "Eye pain",
            "Light sensitivity",
            "Blurred vision",
            "Floaters",
        ],
        "urgency": "within_week",
        "recommendations": [
            "Visit an ophthalmologist within the week",
            "Use anti-inflammatory eye drops",
            "Take prescribed oral medications if needed",
            "Wear sunglasses for light sensitivity",
        ],
    },
    7: {
        "description": "Inflammation of the iris and ciliary body, a form of anterior uveitis.",
        "causes": ["Autoimmune diseases", "Infections", "Trauma to the eye", "Idiopathic"],
        "common_symptoms": [
            "Red eye",
            "Eye pain",
            "Photophobia",
            "Blurred vision",
            "Small or irregular pupil",
        ],
        "urgency": "immediate",
        "recommendations": [
            "Seek immediate medical attention",
            "Use corticosteroid eye drops",
            "Dilating eye drops to prevent scarring",
            "Treat underlying cause if identified",
        ],
    },
}


def get_disease_info(class_id: int) -> dict:
    """Get disease information for a given class ID."""
    return DISEASE_INFO.get(class_id, DISEASE_INFO[0])


def get_disease_name(class_id: int) -> str:
    """Get disease name for a given class ID."""
    if 0 <= class_id < len(DISEASE_CLASSES):
        return DISEASE_CLASSES[class_id]
    return "Unknown"