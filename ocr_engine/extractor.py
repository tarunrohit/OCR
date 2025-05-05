import re
import json
import easyocr
import os
from PIL import Image
import numpy as np
import io


reader = easyocr.Reader(['en'], gpu=False)


def clean_text(text):
    return ''.join(c for c in text if c.isprintable() and not (0xD800 <= ord(c) <= 0xDFFF))

def load_json_config(json_filename):
    path = os.path.join("templates", json_filename)
    with open(path, 'r', encoding='utf-8') as f:
        return json.load(f)

def detect_card_type(text_lines):
    joined_text = ' '.join([line.lower() for line in text_lines])
    if any(x in joined_text for x in ['income tax department', 'permanent account number', 'govt. of india', 'signature', 'permanent account number card','govt of india']):
        return 'pan'
    elif any(x in joined_text for x in ['aadhaar', 'uidai', 'government of india','unique identification authority of india','government oi india','address']):
        return 'aadhaar'
    return 'unknown'

def detect_pan_format(text_lines):
    pan_idx = -1
    dob_idx = -1
    for i, line in enumerate(text_lines):
        if re.search(r'\b[A-Z]{5}[0-9]{4}[A-Z]\b', line):
            pan_idx = i
        if re.search(r'\d{2}/\d{2}/\d{4}', line):
            dob_idx = i
    return 'pan_format1.json' if pan_idx < dob_idx else 'pan_format2.json'

def detect_aadhaar_format(text_lines):
    joined_text = ' '.join([line.lower() for line in text_lines])
    if any(x in joined_text for x in ["address", "s/o", "d/o", "w/o", "c/o", "पताः", "पता"]):
        return 'aadhaar_back.json'
    return 'aadhaar_front.json'

def extract_pan_number(text_lines):
    for line in text_lines:
        match = re.search(r'\b[A-Z]{5}[0-9]{4}[A-Z]\b', line)
        if match:
            return match.group().strip()
    return None


def extract_pan_by_config(text_lines, config):
    extracted = {}
    for key, rule in config.items():
        heading = rule.get('heading', "")
        direction = rule.get('direction')
        format_type = rule.get('format')
        pattern = rule.get('pattern', "")
        line_offset = rule.get('line_offset', 1)

        heading_lines = []
        if isinstance(heading, list):
            heading_lines = [i for i, line in enumerate(text_lines) if any(h.lower() in line.lower() for h in heading)]
        elif heading:
            heading_lines = [i for i, line in enumerate(text_lines) if heading.lower() in line.lower()]
        else:
            heading_lines = list(range(len(text_lines)))

        if format_type in ["pattern", "date"]:
            regex = pattern.replace("C", "[A-Z]").replace("N", "[0-9]")
            for line in text_lines:
                match = re.search(regex, line)
                if match:
                    extracted[key] = clean_text(match.group().strip())
                    break
        elif format_type == "line_relative":
            for idx in heading_lines:
                new_idx = idx + line_offset if direction == "down" else idx - line_offset
                if 0 <= new_idx < len(text_lines):
                    extracted[key] = clean_text(text_lines[new_idx].strip().upper())
                    break
    return extracted

def extract_aadhaar_by_config(text_lines, config):
    extracted = {}
    for key, rule in config.items():
        heading = rule.get('heading', "")
        direction = rule.get('direction')
        format_type = rule.get('format')
        pattern = rule.get('pattern', "")
        line_offset = rule.get('line_offset', 1)
        keywords = rule.get('keywords', [])

        heading_lines = []
        if isinstance(heading, list):
            heading_lines = [i for i, line in enumerate(text_lines) if any(h.lower() in line.lower() for h in heading)]
        elif heading:
            heading_lines = [i for i, line in enumerate(text_lines) if re.search(heading, line, re.IGNORECASE)]
        else:
            heading_lines = list(range(len(text_lines)))

        if format_type == "regex":
            for line in text_lines:
                match = re.search(pattern, line, re.IGNORECASE)
                if match:
                    extracted[key] = clean_text(match.group(1).strip() if match.groups() else match.group().strip().upper())
                    break
        elif format_type == "keyword":
            for line in text_lines:
                for keyword in keywords:
                    if keyword.lower() in line.lower():
                        extracted[key] = keyword
                        break
        elif format_type == "line_relative":
            if not isinstance(line_offset, list):
                line_offset = [line_offset]

            if key == "Person_Name":
                for idx in heading_lines:
                    for offset in line_offset:
                        new_idx = idx - offset
                        while new_idx >= 0:
                            text = text_lines[new_idx].strip().upper()
                            if not re.search(r'[A-Za-z]', text) or re.search(r'[^A-Za-z\s]', text):
                                new_idx -= 1
                                continue
                            if 2 <= len(text.split()) <= 5:
                                extracted[key] = clean_text(text)
                                break
                            new_idx -= 1
                        if key in extracted:
                            break
            else:
                for idx in heading_lines:
                    for offset in line_offset:
                        new_idx = idx + offset if direction == "down" else idx - offset
                        if 0 <= new_idx < len(text_lines):
                            extracted[key] = clean_text(text_lines[new_idx].strip().upper())
                            break

        elif format_type == "block" and direction == "below":
            for idx in heading_lines:
                block_lines = []
                seen_lines = set()
                for j in range(idx + 1, len(text_lines)):
                    line = clean_text(text_lines[j].strip())
                    if re.search(r'\d{4}\s?\d{4}\s?\d{4}', line) or len(re.findall(r'\d{6}', line)) >= 2:
                        break
                    if len(re.findall(r'\d', line)) > 10:
                        continue
                    if re.search(r'[\u0900-\u097F]', line) or len(line) <= 2:
                        continue
                    if any(x in line.lower() for x in ["uidai", "help", "toll", "visit", ".in", "gov", "www"]):
                        continue
                    cleaned = re.sub(r'[^\w\s,/-]', '', line)
                    if cleaned.lower() in seen_lines:
                        continue
                    seen_lines.add(cleaned.lower())
                    block_lines.append(cleaned)

                if block_lines:
                    extracted[key] = clean_text(' '.join(block_lines).strip().upper())
                    break
    return extracted


def run_ocr_pipeline(image_bytes):
    
    image = Image.open(io.BytesIO(image_bytes)).convert("RGB")
    image_np = np.array(image)

    results = reader.readtext(image_np)
    if not results:
        return {"error": "No text detected"}

    text_lines = []
    for (_, text, _) in results:
        text = clean_text(text)
        if not re.search(r'[\u0900-\u097F]', text):  
            text_lines.append(text)

    card_type = detect_card_type(text_lines)
    if card_type == 'pan':
        json_file = detect_pan_format(text_lines)
        config = load_json_config(json_file)
        extracted = extract_pan_by_config(text_lines, config)
        pan_number = extract_pan_number(text_lines)
        if pan_number:
            extracted["PAN_No"] = clean_text(pan_number)
    elif card_type == 'aadhaar':
        json_file = detect_aadhaar_format(text_lines)
        config = load_json_config(json_file)
        extracted = extract_aadhaar_by_config(text_lines, config)
    else:
        return {"error": "Unable to determine card type"}

    extracted["Document_Type"] = "PAN" if card_type == 'pan' else "Aadhaar_Front" if json_file == 'aadhaar_front.json' else "Aadhaar_Back"
    return extracted
