from openai import OpenAI
import os
from dotenv import load_dotenv

load_dotenv()

client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

def extract_structured_data(raw_text):
    prompt = f"""
    Extract structured data from this medical invoice.

    Return ONLY JSON (no explanation):

    {{
        "hospital_name": "",
        "total_charges": "",
        "insurance_portion": "",
        "patient_portion": "",
        "items": []
    }}

    Text:
    {raw_text}
    """

    response = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[
            {"role": "user", "content": prompt}
        ],
        temperature=0
    )
    print("API KEY:", os.getenv("OPENAI_API_KEY"))
    return response.choices[0].message.content