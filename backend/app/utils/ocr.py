# import pytesseract
# from PIL import Image
# import cv2
# import numpy as np

# # agar tesseract detect nahi ho rah h to isse uncomment kar lana (only and only if u have not changes the default installation path of tesseract)
# # pytesseract.pytesseract.tesseract_cmd = r"C:\Program Files\Tesseract-OCR\tesseract.exe"


# def preprocess_image(image_path):
#     img = cv2.imread(image_path)

#     if img is None:
#         raise ValueError("Image not found")

#     # Convert to grayscale
#     gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)

#     # Increase contrast
#     gray = cv2.convertScaleAbs(gray, alpha=1.5, beta=0)

#     # Adaptive threshold (better for documents)
#     thresh = cv2.adaptiveThreshold(
#         gray, 255,
#         cv2.ADAPTIVE_THRESH_GAUSSIAN_C,
#         cv2.THRESH_BINARY,
#         11, 2
#     )

#     return thresh


# def extract_text_from_image(image_path):
#     processed_img = preprocess_image(image_path)

#     custom_config = r'--oem 3 --psm 6'  
#     text = pytesseract.image_to_string(processed_img, config=custom_config)

#     return text


import easyocr

reader = easyocr.Reader(['en'])

def extract_text_from_image(image_path):
    results = reader.readtext(image_path, detail=0)
    
    text = "\n".join(results)
    
    return text