import re
from typing import Dict, List, Optional
from datetime import datetime


def extract_patient_name(text: str) -> Optional[str]:
    """Extract patient name from common patterns"""
    # Look for name patterns - OCR often splits lines
    patterns = [
        r'([A-Z][a-z]+)\s+([A-Z][a-z]+)\s+\(ICD',  # Mehta Arjun (ICD - reversed order
        r'([A-Z][a-z]+)\s*\n\s*([A-Z][a-z]+)\s+\(ICD',  # Name split across lines
        r'patient\s*name\s*[:\-]?\s*([A-Z][a-z]+\s+[A-Z][a-z]+)',
        r'name\s*[:\-]?\s*([A-Z][a-z]+\s+[A-Z][a-z]+)',
        r'([A-Z][a-z]+)\s+([A-Z][a-z]+)\s+(?:Male|Female|years)',
    ]
    
    for pattern in patterns:
        match = re.search(pattern, text, re.IGNORECASE)
        if match:
            if len(match.groups()) == 2:
                # Two separate groups - check if it's reversed (last name first)
                first = match.group(1).strip()
                second = match.group(2).strip()
                
                # If pattern includes (ICD, it's likely reversed (Mehta Arjun)
                if '(ICD' in pattern:
                    name = f"{second} {first}"  # Reverse to Arjun Mehta
                else:
                    name = f"{first} {second}"
            else:
                name = match.group(1).strip()
            
            # Clean up
            name = name.replace('=', '').replace('(', '').replace(')', '').strip()
            
            # Filter out false positives
            false_positives = ['patient', 'name', 'record', 'fever', 'diagnosis', 
                             'with', 'detalls', 'medical', 'hospital', 'date', 
                             'outpatient', 'prescription', 'dengue', 'iyer', 'yakeb']
            
            if len(name) > 3 and not any(x in name.lower() for x in false_positives):
                return name
    
    return None


def extract_age(text: str) -> Optional[int]:
    """Extract age from text"""
    patterns = [
        r'age\s*[:\-]?\s*(\d+)',
        r'(\d+)\s*(?:years?|yrs?|y\.?o\.?)',
        r'(\d+)\s*-?\s*(?:year|yr)',
        r'(\d+)\s*-?\s*yu\s*ur-old',  # OCR artifact for "year old"
    ]
    
    for pattern in patterns:
        match = re.search(pattern, text, re.IGNORECASE)
        if match:
            age = int(match.group(1))
            if 0 < age < 120:
                return age
    return None


def extract_gender(text: str) -> Optional[str]:
    """Extract gender/sex from text"""
    patterns = [
        r'(?:sex|gender)\s*[:\-]?\s*(male|female|m|f|turnule)',
        r'\b(male|female)\b',
    ]
    
    for pattern in patterns:
        match = re.search(pattern, text, re.IGNORECASE)
        if match:
            gender = match.group(1).lower()
            if 'f' in gender or 'turnule' in gender:
                return "Female"
            elif 'm' in gender:
                return "Male"
    return None


def extract_medical_record_number(text: str) -> Optional[str]:
    """Extract medical record number"""
    patterns = [
        r'(?:medical\s*)?record\s*(?:number|no|#)\s*[:\-]?\s*([A-Z0-9\-]+)',
        r'veteal\s*recordnuinbcr\s*[:\-]?\s*(\d+)',
        r'patient\s*id\s*[:\-]?\s*([A-Z0-9\-]+)',
        r'(?:no|number)\s*[:\.]+\s*([A-Z0-9\-]{5,})',
        r'CCH-OPD-\d+-\d+',
        r'[A-Z]{2,}-[A-Z]{3}-\d{4}-\d{5}',
    ]
    
    for pattern in patterns:
        match = re.search(pattern, text, re.IGNORECASE)
        if match:
            mrn = match.group(0) if 'CCH' in match.group(0) else match.group(1)
            return mrn.strip()
    return None


def extract_dates(text: str) -> Dict[str, Optional[str]]:
    """Extract admission, discharge, and other dates"""
    dates = {
        "admission_date": None,
        "discharge_date": None,
        "bill_date": None,
        "prescription_date": None
    }
    
    # Admission date patterns
    admission_patterns = [
        r'(?:date\s*of\s*)?admission\s*[:\-]?\s*([A-Za-z]+\s+\d+,?\s*\d{4})',
        r'admitted\s*(?:on)?\s*[:\-]?\s*([A-Za-z]+\s+\d+,?\s*\d{4})',
        r'admission\s*[:\-]?\s*(\d{1,2}[/-]\d{1,2}[/-]\d{2,4})',
    ]
    
    for pattern in admission_patterns:
        match = re.search(pattern, text, re.IGNORECASE)
        if match:
            dates["admission_date"] = match.group(1).strip()
            break
    
    # Discharge date patterns
    discharge_patterns = [
        r'discharge\s*date\s*[:\-]?\s*([A-Za-z]+\s+\d+,?\s*\d{4})',
        r'discharged\s*(?:on)?\s*[:\-]?\s*([A-Za-z]+\s+\d+,?\s*\d{4})',
        r'discharge\s*[:\-]?\s*(\d{1,2}[/-]\d{1,2}[/-]\d{2,4})',
    ]
    
    for pattern in discharge_patterns:
        match = re.search(pattern, text, re.IGNORECASE)
        if match:
            dates["discharge_date"] = match.group(1).strip()
            break
    
    # Prescription/Bill date - handle OCR splitting across lines
    # Pattern 1: Look for "Date" followed by day number, then month and year within 200 chars
    date_match = re.search(r'Date[:\s]*(\d{1,2})', text, re.IGNORECASE)
    if date_match:
        day = date_match.group(1)
        # Look for month and year after the day
        context_start = date_match.end()
        context = text[context_start:context_start + 300]
        
        # Find year and month (they might be in any order due to OCR)
        year_match = re.search(r'(20\d{2})', context)
        month_match = re.search(r'(January|February|March|April|May|June|July|August|September|October|November|December)', context, re.IGNORECASE)
        
        if year_match and month_match:
            dates["prescription_date"] = f"{day} {month_match.group(1)} {year_match.group(1)}"
    
    # Pattern 2: Look for standalone date patterns
    if not dates["prescription_date"]:
        standalone_patterns = [
            r'(\d{1,2})\s+(January|February|March|April|May|June|July|August|September|October|November|December)\s+(20\d{2})',
            r'(January|February|March|April|May|June|July|August|September|October|November|December)\s+(\d{1,2}),?\s+(20\d{2})',
            r'(\d{1,2})[/-](\d{1,2})[/-](20\d{2})',
        ]
        
        for pattern in standalone_patterns:
            match = re.search(pattern, text, re.IGNORECASE)
            if match:
                groups = match.groups()
                if len(groups) == 3:
                    if groups[0].isdigit() and int(groups[0]) <= 31:
                        # Format: day month year
                        dates["prescription_date"] = f"{groups[0]} {groups[1]} {groups[2]}"
                    else:
                        # Format: month day year
                        dates["prescription_date"] = f"{groups[1]} {groups[0]} {groups[2]}"
                break
    
    return dates


def extract_hospital_info(text: str) -> Dict[str, Optional[str]]:
    """Extract hospital/clinic information"""
    hospital_info = {
        "name": None,
        "address": None,
        "phone": None
    }
    
    # Hospital name patterns
    name_patterns = [
        r'([\w\s]+(?:hospital|clinic|medical center|health center|care))',
        r'^([A-Z][A-Za-z\s&]+(?:Hospital|Clinic|Medical|Care))',
        r'hospital\s*[:\-]?\s*([A-Za-z\s]+)',
    ]
    
    for pattern in name_patterns:
        match = re.search(pattern, text, re.IGNORECASE | re.MULTILINE)
        if match:
            name = match.group(1).strip()
            # Filter out noise
            if len(name) > 3 and not any(x in name.lower() for x in ['date', 'patient', 'diagnosis']):
                hospital_info["name"] = name
                break
    
    # Phone number
    phone_match = re.search(r'(?:phone|tel|contact)\s*[:\-]?\s*([\d\-\+\(\)\s]+)', text, re.IGNORECASE)
    if phone_match:
        hospital_info["phone"] = phone_match.group(1).strip()
    
    # Address patterns
    address_patterns = [
        r'address\s*[:\-]?\s*([^\n]+)',
        r'(?:city|location)\s*[:\-]?\s*([A-Za-z\s]+)',
    ]
    
    for pattern in address_patterns:
        match = re.search(pattern, text, re.IGNORECASE)
        if match:
            hospital_info["address"] = match.group(1).strip()
            break
    
    return hospital_info


def extract_diagnosis(text: str) -> List[str]:
    """Extract diagnosis information"""
    diagnoses = []
    
    patterns = [
        r'diagnosis\s*[:\-]?\s*([^\n]+)',
        r'condition\s*[:\-]?\s*([^\n]+)',
        r'diagnosed\s*with\s*[:\-]?\s*([^\n]+)',
        r'patient\s*with\s*([^\n]+?)(?:\n|diagnosis)',
        r'\(ICD-10[:\-]?\s*([^\)]+)\)',
    ]
    
    for pattern in patterns:
        matches = re.finditer(pattern, text, re.IGNORECASE)
        for match in matches:
            diagnosis = match.group(1).strip()
            # Clean up
            diagnosis = diagnosis.replace('(', '').replace(')', '').strip()
            if len(diagnosis) > 3 and diagnosis not in diagnoses:
                # Filter out noise
                if not any(x in diagnosis.lower() for x in ['take', 'tablet', 'injection', 'protocol']):
                    diagnoses.append(diagnosis)
    
    return diagnoses


def extract_medications(text: str) -> List[Dict]:
    """Extract medication information"""
    medications = []
    seen_meds = set()
    
    # Common medication patterns - look for actual drug names
    med_patterns = [
        r'(?:tab|tablet)\s+([A-Z][a-z]+(?:[A-Z][a-z]+)?)',  # Tab Paracetamol
        r'(?:inj|injection)\s+([A-Z][a-z]+(?:[A-Z][a-z]+)?)',  # Inj PlateMax
        r'(?:syp|syrup)\s+([A-Z][a-z]+(?:[A-Z][a-z]+)?)',  # Syp Electral
        r'(?:cap|capsule)\s+([A-Z][a-z]+(?:[A-Z][a-z]+)?)',
    ]
    
    # Known medication names to look for
    known_meds = ['paracetamol', 'pantoprazole', 'platemax', 'electral', 'aspirin', 
                  'ibuprofen', 'amoxicillin', 'azithromycin', 'metformin', 'insulin']
    
    # First, try pattern matching
    for pattern in med_patterns:
        matches = re.finditer(pattern, text, re.IGNORECASE)
        for match in matches:
            med_name = match.group(1).strip()
            med_type = "Tablet" if "tab" in match.group(0).lower() else \
                      "Injection" if "inj" in match.group(0).lower() else \
                      "Syrup" if "syp" in match.group(0).lower() else "Capsule"
            
            # Filter out numbers and common words
            if len(med_name) > 3 and not med_name.lower() in ['three', 'tablet', 'twice', 'daily', 'once', 'take']:
                if med_name.lower() not in seen_meds:
                    seen_meds.add(med_name.lower())
                    medications.append({
                        "name": med_name,
                        "type": med_type
                    })
    
    # Second, look for known medication names anywhere in text
    for known_med in known_meds:
        if known_med in text.lower() and known_med not in seen_meds:
            # Find the context to determine type
            context_pattern = rf'(tab|tablet|inj|injection|syp|syrup|cap|capsule)?\s*{known_med}'
            match = re.search(context_pattern, text, re.IGNORECASE)
            if match:
                med_type = "Tablet" if match.group(1) and "tab" in match.group(1).lower() else \
                          "Injection" if match.group(1) and "inj" in match.group(1).lower() else \
                          "Syrup" if match.group(1) and "syp" in match.group(1).lower() else \
                          "Medication"
                
                seen_meds.add(known_med)
                medications.append({
                    "name": known_med.capitalize(),
                    "type": med_type
                })
    
    return medications


def extract_vital_signs(text: str) -> Dict:
    """Extract vital signs"""
    vitals = {}
    
    # Blood pressure
    bp_match = re.search(r'(?:blood\s*pressure|bp)\s*[:\-]?\s*(\d+/\d+)', text, re.IGNORECASE)
    if bp_match:
        vitals["blood_pressure"] = bp_match.group(1)
    
    # Heart rate/pulse
    pulse_match = re.search(r'(?:pulse|heart\s*rate|rutu)\s*[:\-]?\s*(\d+)', text, re.IGNORECASE)
    if pulse_match:
        vitals["pulse"] = f"{pulse_match.group(1)} bpm"
    
    # Temperature
    temp_match = re.search(r'(?:temperature|temp)\s*[:\-]?\s*(\d+\.?\d*)', text, re.IGNORECASE)
    if temp_match:
        vitals["temperature"] = f"{temp_match.group(1)}°F"
    
    # Respiratory rate
    resp_match = re.search(r'(?:respiratory\s*rate|resp)\s*[:\-]?\s*(\d+)', text, re.IGNORECASE)
    if resp_match:
        vitals["respiratory_rate"] = f"{resp_match.group(1)} /min"
    
    return vitals


def parse_medical_text(raw_text: str) -> Dict:
    """
    Comprehensive medical document parser
    Extracts: patient info, hospital info, diagnosis, medications, vital signs, etc.
    """
    
    # Initialize structured data with all common fields
    structured_data = {
        # Patient Information
        "patient_name": extract_patient_name(raw_text),
        "age": extract_age(raw_text),
        "gender": extract_gender(raw_text),
        "medical_record_number": extract_medical_record_number(raw_text),
        
        # Hospital/Clinic Information
        "hospital_info": extract_hospital_info(raw_text),
        
        # Dates
        "dates": extract_dates(raw_text),
        
        # Medical Information
        "diagnosis": extract_diagnosis(raw_text),
        "medications": extract_medications(raw_text),
        "vital_signs": extract_vital_signs(raw_text),
        
        # Additional fields
        "ward_room": None,
        "attending_physician": None,
    }
    
    # Extract ward/room information
    ward_match = re.search(r'(?:ward|room)\s*[:\-]?\s*([A-Za-z0-9\s]+?)(?:\n|$)', raw_text, re.IGNORECASE)
    if ward_match:
        structured_data["ward_room"] = ward_match.group(1).strip()
    
    # Extract doctor/physician name
    doctor_patterns = [
        r'(?:doctor|dr\.?|physician)\s*[:\-]?\s*([A-Za-z\s\.]+?)(?:\n|$|reg|mci)',
        r'attending\s*[:\-]?\s*([A-Za-z\s\.]+?)(?:\n|$)',
        r'dr[_\s]+([A-Za-z\s]+?)(?:\n|reg|mci)',
        r'(?:mbbs|md)[,\s]+([A-Za-z\s]+)',
    ]
    
    for pattern in doctor_patterns:
        match = re.search(pattern, raw_text, re.IGNORECASE)
        if match:
            doctor_name = match.group(1).strip()
            # Clean up
            doctor_name = doctor_name.replace('_', ' ').strip()
            if len(doctor_name) > 2 and not any(x in doctor_name.lower() for x in ['medicine', 'internal', 'reg', 'no']):
                structured_data["attending_physician"] = doctor_name
                break
    
    return structured_data