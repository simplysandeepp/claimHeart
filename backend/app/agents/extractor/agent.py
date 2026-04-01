# from app.utils.ocr import extract_text_from_image
# from app.utils.parser import parse_medical_text


# def extractor_agent(file_path):
#     raw_text = extract_text_from_image(file_path)

#     # Parse structured data
#     parsed_data = parse_medical_text(raw_text)

#     return {
#         "raw_text": raw_text,
#         "structured_data": parsed_data
#     }

from app.utils.ocr import extract_text_from_image
from app.utils.parser import parse_medical_text as extract_structured_data

def extractor_agent(file_path):
    raw_text = extract_text_from_image(file_path)

    structured = extract_structured_data(raw_text)

    return {
        "raw_text": raw_text,
        "structured_data": structured
    }