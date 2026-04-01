# backend/app/ml_tests/test_ocr.py

import os
import json
from unittest import result

from app.tasks.extraction import process_document


#PATH TO YOUR IMAGE
TEST_IMAGE_PATH = "temp_uploads/sample_image2.jpg"


def run_test():
    if not os.path.exists(TEST_IMAGE_PATH):
        print("File not found:", TEST_IMAGE_PATH)
        return

    print("Processing:", TEST_IMAGE_PATH)

    result = process_document(TEST_IMAGE_PATH)

    print("\nRAW TEXT:\n")
    print(result["raw_text"])
    print(json.dumps(result, indent=4))

    # Save output to file
    output_file = "ocr_output.json"
    with open(output_file, "w") as f:
        json.dump(result, f, indent=4)

    print(f"\nOutput saved to {output_file}")


if __name__ == "__main__":
    run_test()