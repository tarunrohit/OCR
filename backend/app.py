from flask import Flask, request, jsonify
import io
from PIL import Image
from datetime import datetime
import os
import uuid
from ocr_engine.extractor import run_ocr_pipeline
from db import card_collection
from flask_cors import CORS

app = Flask(__name__)
CORS(app)
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg'}

UPLOAD_BASE = "identity_cards"
os.makedirs(UPLOAD_BASE, exist_ok=True)

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

@app.route('/health', methods=['GET'])
def health_check():
    return jsonify({
        "status": "OK",
        "timestamp": datetime.utcnow().isoformat() + "Z"
    })

@app.route('/upload', methods=['POST'])
def upload_image():
    if 'image' not in request.files:
        return jsonify({'error': 'No image uploaded'}), 400

    file = request.files['image']

    if file and allowed_file(file.filename):
        try:
            image = Image.open(file.stream).convert("RGB")

            image_bytes_io = io.BytesIO()
            image.save(image_bytes_io, format='PNG')
            image_bytes = image_bytes_io.getvalue()
            extracted_data = run_ocr_pipeline(image_bytes)

            if 'error' in extracted_data:
                return jsonify(extracted_data), 400

            document_type = extracted_data.get("Document_Type", "Unknown")
            folder_map = {
                "PAN": "pan",
                "Aadhaar_Front": "aadhaar_front",
                "Aadhaar_Back": "aadhaar_back"
            }

            folder_name = folder_map.get(document_type, "unknown")
            save_dir = os.path.join(UPLOAD_BASE, folder_name)
            os.makedirs(save_dir, exist_ok=True)

            unique_filename = f"{uuid.uuid4().hex}.png"
            save_path = os.path.join(save_dir, unique_filename)
            image.save(save_path)

            extracted_data["image_path"] = save_path
            result = card_collection.insert_one(extracted_data)
            extracted_data["_id"] = str(result.inserted_id)

            return jsonify({
                     "data": extracted_data,
                     "mongodb_id": str(result.inserted_id)
                    }), 200


        except Exception as e:
            return jsonify({'error': str(e)}), 500
    else:
        return jsonify({'error': 'Invalid file type. Please upload a PNG or JPG image.'}), 400

port = int(os.environ.get("PORT", 5001))
app.run(host='0.0.0.0', port=port)

