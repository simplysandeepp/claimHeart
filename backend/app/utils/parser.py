# def parse_medical_text(text):
#     import re

#     data = {}

#     # billing cost extraction...
#     cost_matches = re.findall(r'\$\s?\d+\.?\d*', text)

#     if cost_matches:
#         costs = [float(c.replace("$", "").strip()) for c in cost_matches]
#         data["estimated_cost"] = max(costs)

#     # Days
#     days_match = re.search(r'(\d+)\s*(days|day)', text.lower())
#     if days_match:
#         data["duration_days"] = int(days_match.group(1))

#     # treatment keywords detect ...
#     if "exam" in text.lower():
#         data["treatment"] = "exam"
#     elif "x-ray" in text.lower():
#         data["treatment"] = "x-ray"

#     return data


import re
from typing import Dict, List, Optional

def clean_number(text: str) -> Optional[float]:
    """Extract and clean numeric values, handling OCR artifacts like 'o' for '0' or 'z' for '2'"""
    # Basic OCR correction
    cleaned = text.lower().replace('o', '0').replace('z', '2').replace('s', '5')
    cleaned = re.sub(r'[^\d.]', '', cleaned)
    
    if cleaned:
        try:
            return float(cleaned)
        except:
            return None
    return None

def parse_medical_text(raw_text: str) -> Dict:
    lines = [line.strip() for line in raw_text.split("\n") if line.strip()]
    
    data = {
        "hospital_name": "Patient Medical Bill", # Defaulting as per your desired output
        "patient_name": None,
        "medications_and_services": [],
        "total_amount": None
    }

    service_keywords = {
        "pharmacy": "Medication (Pills/Tablets)",
        "drug": "Medication (General)",
        "bed": "Hospital Stay",
        "laboratory": "Laboratory Test",
        "test": "Laboratory Test",
        "theatre": "Surgery/Theatre",
        "procedure": "Surgery/Theatre",
        "feeding": "Feeding/Nutrition",
        "therapy": "Therapy",
        "fotc": "Therapy",
        "immuniz": "Vaccination/Immunization",
        "specialist": "Specialist Consultation"
    }

    for i, line in enumerate(lines):
        line_lower = line.lower()
        
        # 1. HANDLE TOTALS
        if "total" in line_lower:
            all_nums = []
            # Look at this line and next 2 lines for totals
            for search_idx in range(i, min(i + 4, len(lines))):
                found = re.findall(r'\d[\d,\.ozs]*', lines[search_idx])
                for f in found:
                    val = clean_number(f)
                    if val and val > 1000: all_nums.append(val)
            
            if len(all_nums) >= 2:
                data["total_amount"] = {
                    "total_billed": all_nums[0],
                    "total_paid": all_nums[1],
                    "outstanding_balance": all_nums[0] - all_nums[1]
                }
            continue

        # 2. HANDLE SERVICES
        for key, service_type in service_keywords.items():
            if key in line_lower:
                # We found a service! Now look ahead for numbers
                amounts = []
                # Look at the next 3 lines to find the 1-3 numbers associated with this service
                for next_line_idx in range(i + 1, min(i + 5, len(lines))):
                    # Check if the next line is another service keyword (stop if it is)
                    if any(k in lines[next_line_idx].lower() for k in service_keywords.keys()):
                        break
                        
                    found_nums = re.findall(r'\d[\d,\.ozs]*', lines[next_line_idx])
                    for f in found_nums:
                        val = clean_number(f)
                        if val and val > 10: # filter out tiny noise
                            amounts.append(val)
                
                if amounts:
                    data["medications_and_services"].append({
                        "item": line,
                        "type": service_type,
                        "billed_amount": amounts[0],
                        "amount_paid": amounts[1] if len(amounts) > 1 else 0.0,
                        "outstanding": amounts[2] if len(amounts) > 2 else amounts[0]
                    })
                break 

    return data