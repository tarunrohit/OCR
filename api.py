from flask import Flask, request, jsonify
from ocr_engine.passport import extract_mrz_from_bytes

app = Flask(__name__)

@app.route('/extract-passport', methods=['POST'])
def extract_passport():
    if 'image' not in request.files:
        return jsonify({'error': 'Image file is missing'}), 400

    image_file = request.files['image']
    image_bytes = image_file.read()

    try:
        mrz_info = extract_mrz_from_bytes(image_bytes)
        if not mrz_info:
            return jsonify({'error': 'No MRZ data found'}), 400
        return jsonify(mrz_info), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/health', methods=['GET'])
def health():
    return jsonify({'status': 'Passport OCR API is running'})

if __name__ == '__main__':
    app.run(debug=True)
