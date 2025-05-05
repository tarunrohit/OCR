import cv2
import numpy as np
import pytesseract
from passporteye import read_mrz
import re
import tempfile
import os

def deskew_image(image):
    gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
    edges = cv2.Canny(gray, 50, 150, apertureSize=3)
    lines = cv2.HoughLinesP(edges, 1, np.pi/180, 100, minLineLength=100, maxLineGap=10)

    if lines is not None:
        angles = [np.arctan2(y2 - y1, x2 - x1) for [[x1, y1, x2, y2]] in lines]
        median_angle = np.median(angles)
        (h, w) = image.shape[:2]
        center = (w // 2, h // 2)
        M = cv2.getRotationMatrix2D(center, np.degrees(median_angle), 1.0)
        image = cv2.warpAffine(image, M, (w, h), flags=cv2.INTER_CUBIC, borderMode=cv2.BORDER_REPLICATE)

    return image

def preprocess_image(image):
    gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
    gray = cv2.bilateralFilter(gray, 9, 75, 75)  
    adaptive_thresh = cv2.adaptiveThreshold(
        gray, 255, cv2.ADAPTIVE_THRESH_GAUSSIAN_C, cv2.THRESH_BINARY, 31, 2
    )
    kernel = np.ones((1, 1), np.uint8)
    processed = cv2.morphologyEx(adaptive_thresh, cv2.MORPH_CLOSE, kernel)

    return processed

def extract_mrz(image_path):
    mrz = read_mrz(image_path)
    if mrz:
        return mrz.to_dict()
    return None

def format_date(mrz_date):
    if len(mrz_date) == 6:
        return f"{mrz_date[4:6]}/{mrz_date[2:4]}/{mrz_date[0:2]}"
    return mrz_date

def clean_mrz_text(text):
    text = text.replace("<", " ").strip()
    text = re.sub(r"\s+", " ", text)
    return text

def format_mrz_data(mrz_data):
    first_name = clean_mrz_text(mrz_data.get("names", ""))
    surname = clean_mrz_text(mrz_data.get("surname", ""))

    first_name = re.sub(r'K+\s*K+', '', first_name).strip()
    surname = re.sub(r'K+\s*K+', '', surname).strip()

    return {
        "First Name": first_name,
        "Surname": surname,
        "Passport Number": mrz_data.get("number", "").replace("<", ""),
        "Date of Birth": format_date(mrz_data.get("date_of_birth", "")),
        "Gender": "Male" if mrz_data.get("sex", "") == "M" else "Female",
        "Nationality": mrz_data.get("nationality", "").replace("<", ""),
        "Expiration Date": format_date(mrz_data.get("expiration_date", "")),
        "MRZ Raw Text": mrz_data.get("raw_text", ""),
    }

def process_passport(image_path):
    image = cv2.imread(image_path)
    if image is None:
        raise ValueError(f"Unable to load image: {image_path}")

    image = deskew_image(image)
    _ = preprocess_image(image)

    mrz_data = extract_mrz(image_path)
    if mrz_data:
        return format_mrz_data(mrz_data)
    else:
        return None

def extract_mrz_from_bytes(image_bytes):
    with tempfile.NamedTemporaryFile(delete=False, suffix=".jpg") as temp:
        temp.write(image_bytes)
        temp.flush()
        result = process_passport(temp.name)
    os.unlink(temp.name)
    return result
