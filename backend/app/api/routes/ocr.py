# from fastapi import APIRouter, UploadFile, File, HTTPException
# import os
# import uuid
# from io import BytesIO
# from PIL import Image
# from app.tasks.extraction import process_document

# router = APIRouter()

# UPLOAD_DIR = "temp_uploads"
# os.makedirs(UPLOAD_DIR, exist_ok=True)

# # Allowed MIME types
# ALLOWED_EXTENSIONS = {"image/jpeg", "image/png", "image/jpg", "application/pdf"}

# # Maximum file size in bytes (optional, e.g., 10MB)
# MAX_FILE_SIZE = 10 * 1024 * 1024  


# def save_file(file_bytes: bytes, ext: str = "jpg") -> str:
#     """Save bytes to a unique temporary file and return its path."""
#     unique_filename = f"{uuid.uuid4()}.{ext}"
#     file_path = os.path.join(UPLOAD_DIR, unique_filename)
#     with open(file_path, "wb") as f:
#         f.write(file_bytes)
#     return file_path


# @router.post("/upload")
# async def upload_file(file: UploadFile = File(None), local_path: str = None):
#     if not file and not local_path:
#         raise HTTPException(status_code=400, detail="Provide either a file or a local_path")

#     try:
#         # --------------------
#         # Handle file upload
#         # --------------------
#         if file:
#             if file.content_type not in ALLOWED_EXTENSIONS:
#                 raise HTTPException(
#                     status_code=400,
#                     detail="Invalid file type. Please upload an image or PDF."
#                 )

#             # Check file size
#             contents = await file.read()
#             if len(contents) > MAX_FILE_SIZE:
#                 raise HTTPException(status_code=400, detail="File too large")

#             ext = file.filename.split(".")[-1]
#             file_path = save_file(contents, ext)

#             try:
#                 result = process_document(file_path)
#             finally:
#                 os.remove(file_path)  # cleanup

#             return {
#                 "mode": "file_upload",
#                 "filename": file.filename,
#                 "status": "Processed",
#                 "extracted_data": result
#             }

#         # --------------------
#         # Handle local path
#         # --------------------
#         elif local_path:
#             # INSERT PATH HERE: Example - local_path = "C:/Users/vibby/Desktop/documents/medical_form.jpg"
            
#             local_path = "../temp_uploads/sample_image1.jpg"

#             # Validate path exists
#             if not os.path.exists(local_path):
#                 raise HTTPException(status_code=400, detail=f"File not found at path: {local_path}")
            
#             # Check if it's a file
#             if not os.path.isfile(local_path):
#                 raise HTTPException(status_code=400, detail="Path must point to a file, not a directory")
            
#             # Validate file extension
#             ext = local_path.split(".")[-1].lower()
#             valid_extensions = {"jpg", "jpeg", "png", "pdf"}
#             if ext not in valid_extensions:
#                 raise HTTPException(
#                     status_code=400,
#                     detail=f"Invalid file type. Allowed: {valid_extensions}"
#                 )
            
#             # Check file size
#             file_size = os.path.getsize(local_path)
#             if file_size > MAX_FILE_SIZE:
#                 raise HTTPException(status_code=400, detail="File too large")
            
#             # Process the file directly from local path
#             result = process_document(local_path)

#             return {
#                 "mode": "local_path",
#                 "path_used": local_path,
#                 "filename": os.path.basename(local_path),
#                 "status": "Processed",
#                 "extracted_data": result
#             }

#     except HTTPException:
#         raise
#     except Exception as e:
#         raise HTTPException(status_code=500, detail=f"Error processing input: {e}")



import json
import os

from app.tasks.extraction import process_document


TEST_IMAGE_PATH = "../temp_uploads/sample_image1.jpg"


def run_test():
    if not os.path.exists(TEST_IMAGE_PATH):
        print("File not found:", TEST_IMAGE_PATH)
        return

    print("Processing:", TEST_IMAGE_PATH)

    result = process_document(TEST_IMAGE_PATH)

    print("\nOCR RESULT:")
    print(json.dumps(result, indent=4))

    # Save output to file
    output_path = "ocr_output.json"
    with open(output_path, "w") as f:
        json.dump(result, f, indent=4)

    print(f"\nOutput saved to {output_path}")


if __name__ == "__main__":
    run_test()