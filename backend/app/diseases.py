"""Disease metadata and descriptions for 16 iris disease classes.
Extended for multi-condition eye screening platform.
"""

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

# Risk levels for each condition (can be multiple)
CONDITION_RISK_MAP = {
    "Healthy / Normal": "Low",
    "Glaucoma (early)": "High",
    "Glaucoma (advanced)": "Critical",
    "Cataracts": "Medium",
    "Uveitis (anterior)": "High",
    "Uveitis (posterior)": "High",
    "Iritis": "Medium",
    "Iridocyclitis": "High",
    "Aniridia": "High",
    "Coloboma": "Medium",
    "Fuchs Endothelial Dystrophy": "Medium",
    "Pigment Dispersion Syndrome": "Medium",
    "Rubeosis Iridis": "Critical",
    "Iris Melanoma": "Critical",
    "Essential Iris Atrophy": "High",
    "Ocular Hypertension": "Medium",
}

# Simple recommendations based on risk level
RISK_RECOMMENDATIONS = {
    "Low": [
        "Continue regular eye check-ups every 2 years",
        "Maintain a balanced diet rich in Vitamin A, C, and E",
        "Protect your eyes from UV light with sunglasses",
        "Take regular breaks from screen time (20-20-20 rule)",
    ],
    "Medium": [
        "Schedule an eye examination within the next month",
        "Monitor your symptoms and note any changes",
        "Avoid eye strain — take frequent breaks",
        "Consider over-the-counter lubricating eye drops if dryness occurs",
    ],
    "High": [
        "Consult an ophthalmologist within the next week",
        "Avoid self-medication — seek professional advice",
        "Rest your eyes and reduce screen time",
        "Keep a symptom diary for your doctor visit",
    ],
    "Critical": [
        "Seek immediate medical attention at an eye hospital",
        "Do NOT wait — visit the nearest ophthalmology department",
        "Avoid rubbing or putting pressure on your eyes",
        "Bring this screening report to your consultation",
    ],
}

# What each condition means for patient understanding
CONDITION_MEANINGS = {
    "Healthy / Normal": "Your eyes appear healthy with no detectable abnormalities.",
    "Glaucoma (early)": "Early signs of optic nerve stress detected. Glaucoma is often silent — early management can prevent vision loss.",
    "Glaucoma (advanced)": "Significant optic nerve changes detected. This requires immediate specialist care to preserve remaining vision.",
    "Cataracts": "Clouding of the eye's natural lens detected. Cataracts are treatable with surgery when they affect daily life.",
    "Uveitis (anterior)": "Inflammation in the front part of the eye's uvea. Prompt treatment can prevent complications.",
    "Uveitis (posterior)": "Inflammation in the back part of the uvea. This can affect vision and needs specialist care.",
    "Iritis": "Inflammation of the iris — the coloured part of your eye. Treatable with medication.",
    "Iridocyclitis": "Inflammation of both the iris and ciliary body. Requires prompt medical attention.",
    "Aniridia": "Partial or complete absence of the iris. This is typically a congenital condition.",
    "Coloboma": "Missing tissue in the iris structure. Usually present from birth.",
    "Fuchs Endothelial Dystrophy": "Degeneration of the corneal endothelial cells. Can lead to corneal swelling over time.",
    "Pigment Dispersion Syndrome": "Pigment granules from the iris being dispersed in the eye. May increase glaucoma risk.",
    "Rubeosis Iridis": "Abnormal blood vessel growth on the iris surface. Often linked to advanced eye disease.",
    "Iris Melanoma": "A rare pigmented tumour on the iris. Requires immediate specialist evaluation.",
    "Essential Iris Atrophy": "Progressive thinning and hole formation in the iris tissue. Needs monitoring.",
    "Ocular Hypertension": "Higher than normal eye pressure without visible optic nerve damage. A glaucoma risk factor.",
}

# What the patient should do for each condition
CONDITION_ACTIONS = {
    "Healthy / Normal": "No action needed. Maintain healthy habits and regular check-ups.",
    "Glaucoma (early)": "Visit an eye doctor for a comprehensive glaucoma evaluation including eye pressure measurement and visual field test.",
    "Glaucoma (advanced)": "Seek immediate ophthalmologist consultation. Treatment may include pressure-lowering medications or surgery.",
    "Cataracts": "Consult an ophthalmologist for cataract evaluation. Surgery may be recommended when vision affects daily activities.",
    "Uveitis (anterior)": "Visit an ophthalmologist within the week for anti-inflammatory treatment.",
    "Uveitis (posterior)": "Seek specialist care promptly as this may affect vision more significantly.",
    "Iritis": "See an eye doctor for steroid eye drops and dilating drops to prevent scarring.",
    "Iridocyclitis": "Seek immediate medical attention to prevent complications like glaucoma or cataracts.",
    "Aniridia": "Consult an ophthalmologist for management strategies. Special contact lenses or sunglasses can help with light sensitivity.",
    "Coloboma": "Regular monitoring by an eye specialist. Vision correction may help if needed.",
    "Fuchs Endothelial Dystrophy": "Regular follow-ups with an ophthalmologist. Advanced cases may need corneal transplant.",
    "Pigment Dispersion Syndrome": "Annual eye pressure checks. Exercise caution with activities that jiggle the eye (like bungee jumping).",
    "Rubeosis Iridis": "Immediate specialist evaluation. Often requires treatment of the underlying cause.",
    "Iris Melanoma": "Urgent referral to an ocular oncologist for biopsy and treatment planning.",
    "Essential Iris Atrophy": "Regular monitoring. Watch for signs of glaucoma as it can be associated.",
    "Ocular Hypertension": "Regular eye pressure monitoring. Your doctor may recommend preventive treatment if risk is high.",
}

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
    5: {
        "description": "Inflammation of the back part of the uvea. Can affect the retina and cause vision changes.",
        "causes": ["Autoimmune disorders", "Infections like toxoplasmosis", "Systemic inflammatory diseases"],
        "common_symptoms": [
            "Floaters",
            "Blurred vision",
            "Eye floaters or flashes",
            "Sometimes painless",
        ],
        "urgency": "within_week",
        "recommendations": [
            "See an ophthalmologist within the week",
            "Treatment depends on underlying cause",
            "May need oral or injectable medications",
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

# Additional eye conditions beyond the 16-class set for broader screening
EXTENDED_CONDITIONS = [
    "Conjunctivitis (Pink Eye)",
    "Dry Eye Syndrome",
    "Stye (Hordeolum)",
    "Blepharitis",
    "Diabetic Retinopathy",
    "Age-related Macular Degeneration",
    "Retinal Detachment",
    "Corneal Ulcer",
    "Keratitis",
    "Scleritis",
]


def get_disease_info(class_id: int) -> dict:
    """Get disease information for a given class ID."""
    return DISEASE_INFO.get(class_id, DISEASE_INFO[0])


def get_disease_name(class_id: int) -> str:
    """Get disease name for a given class ID."""
    if 0 <= class_id < len(DISEASE_CLASSES):
        return DISEASE_CLASSES[class_id]
    return "Unknown"


def get_risk_level(condition_name: str) -> str:
    """Get risk level for a condition name."""
    return CONDITION_RISK_MAP.get(condition_name, "Medium")


def get_condition_meaning(condition_name: str) -> str:
    """Get patient-friendly explanation for a condition."""
    return CONDITION_MEANINGS.get(
        condition_name,
        "This condition requires professional evaluation."
    )


def get_condition_action(condition_name: str) -> str:
    """Get recommended action for a condition."""
    return CONDITION_ACTIONS.get(
        condition_name,
        "Please consult an ophthalmologist for personalized advice."
    )


def get_recommendations_for_risk(risk_level: str) -> list:
    """Get recommendations based on risk level."""
    return RISK_RECOMMENDATIONS.get(risk_level, RISK_RECOMMENDATIONS["Low"])


def get_all_supported_conditions() -> list:
    """Get list of all supported conditions with metadata."""
    conditions = []
    for i, name in enumerate(DISEASE_CLASSES):
        conditions.append({
            "id": i,
            "name": name,
            "risk": get_risk_level(name),
            "meaning": get_condition_meaning(name),
        })
    for name in EXTENDED_CONDITIONS:
        conditions.append({
            "id": -1,
            "name": name,
            "risk": get_risk_level(name),
            "meaning": get_condition_meaning(name),
        })
    return conditions