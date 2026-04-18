PATIENT_TEMPLATE_EN = """
Dear {name},

Your claim {claim_id} has been marked as {status}.
Approved Amount: ₹{approved_amount}
Reason: {reason}
Policy Citation: {citation}

If you need clarification, please use the patient dashboard support flow.

Regards,
ClaimHeart Adjudication Desk
""".strip()

PATIENT_TEMPLATE_HI = """
प्रिय {name},

आपका क्लेम {claim_id} अब {status_hi} स्थिति में है।
स्वीकृत राशि: ₹{approved_amount}
कारण: {reason_hi}
पॉलिसी संदर्भ: {citation}

अधिक जानकारी के लिए कृपया डैशबोर्ड सहायता विकल्प का उपयोग करें।

सादर,
ClaimHeart Adjudication Desk
""".strip()

HOSPITAL_QUERY_EN = """
Subject: Clarification Required for Claim {claim_id}

Dear Hospital Team,

Please provide the following missing/clarifying documents for claim {claim_id}:
{missing_documents}

Reference: {citation}

Regards,
ClaimHeart Mediator Agent
""".strip()

HOSPITAL_QUERY_HI = """
विषय: क्लेम {claim_id} के लिए स्पष्टीकरण आवश्यक

आदरणीय अस्पताल टीम,

कृपया क्लेम {claim_id} के लिए निम्न दस्तावेज़/स्पष्टीकरण साझा करें:
{missing_documents}

संदर्भ: {citation}

सादर,
ClaimHeart Mediator Agent
""".strip()

INSURER_REPORT_EN = """
Claim ID: {claim_id}
Patient: {name}
Decision: {status}
Requested: ₹{requested_amount}
Approved: ₹{approved_amount}
Reasoning Summary: {reason}
Citations: {citation}
""".strip()

INSURER_REPORT_HI = """
क्लेम आईडी: {claim_id}
रोगी: {name}
निर्णय: {status_hi}
मांगी गई राशि: ₹{requested_amount}
स्वीकृत राशि: ₹{approved_amount}
कारण सारांश: {reason_hi}
संदर्भ: {citation}
""".strip()
