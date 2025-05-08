from flask import Flask, request, jsonify
from ocr_engine.passport import extract_mrz_from_bytes
from werkzeug.utils import secure_filename
from pymongo import MongoClient
from bson import ObjectId
import os
import uuid
from flask_cors import CORS

app = Flask(__name__)
CORS(app)
client = MongoClient("mongodb://localhost:27017/")
db = client["ocr_database"]
collection = db["passport_data"]
UPLOAD_FOLDER = "uploaded_images/passport"
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

@app.route('/extract', methods=['POST'])
def extract_passport():
    if 'image' not in request.files:
        return jsonify({'error': 'Image file is missing'}), 400

    image_file = request.files['image']
    image_bytes = image_file.read()

    try:
        if not image_bytes:
            return jsonify({'error': 'Empty image file'}), 400
        ext = os.path.splitext(image_file.filename)[1]
        filename = f"{uuid.uuid4()}_{secure_filename(image_file.filename)}"
        image_path = os.path.join(UPLOAD_FOLDER, filename).replace("\\", "/")

        with open(image_path, 'wb') as f:
            f.write(image_bytes)

    
        mrz_info = extract_mrz_from_bytes(image_bytes)
        if not mrz_info:
            return jsonify({'error': 'No MRZ data found'}), 400

    
        mrz_info["image_path"] = image_path
        result = collection.insert_one(mrz_info)
        mrz_info["_id"] = str(result.inserted_id) 

        response_data = {
            "First Name": mrz_info.get("First Name", ""),
            "Surname": mrz_info.get("Surname", ""),
            "Passport Number": mrz_info.get("Passport Number", ""),
            "Date of Birth": mrz_info.get("Date of Birth", ""),
            "Gender": mrz_info.get("Gender", ""),
            "Nationality": mrz_info.get("Nationality", ""),
            "Expiration Date": mrz_info.get("Expiration Date", ""),
            "MRZ Raw Text": mrz_info.get("MRZ Raw Text", "")
        }

        return jsonify(response_data), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/health', methods=['GET'])
def health():
    return jsonify({'status': 'Passport OCR API is running'})

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
