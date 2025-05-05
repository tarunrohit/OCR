from flask import Flask, request, jsonify
import io
from PIL import Image
from ocr_engine.extractor import run_ocr_pipeline  
from datetime import datetime

app = Flask(__name__)

import os


ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif'}

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS


@app.route('/health', methods=['GET'])
def health_check():
    return jsonify({"status": "OK",
                    "timestamp": datetime.utcnow().isoformat() + "Z"})

@app.route('/upload', methods=['POST'])

def upload_image():
    if 'image' not in request.files:
        return jsonify({'error': 'No image uploaded'}), 400

    file = request.files['image']

    if file and allowed_file(file.filename):
        try:
           
            image = Image.open(file.stream).convert("RGB")
            img_byte_arr = io.BytesIO()
            image.save(img_byte_arr, format='PNG')
            image_bytes = img_byte_arr.getvalue()

            
            result = run_ocr_pipeline(image_bytes)
            return jsonify(result)

        except Exception as e:
            return jsonify({'error': str(e)}), 500

    else:
        return jsonify({'error': 'Invalid file type. Please upload a PNG or JPG image.'}), 400

if __name__ == '__main__':
    app.run(debug=True)
