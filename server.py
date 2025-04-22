
from flask import Flask, request, jsonify
import os
import face_recognition
from werkzeug.utils import secure_filename

UPLOAD_FOLDER = './uploads'
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg'}
app = Flask(__name__)
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def load_known_faces():
    encodings = []
    filenames = []
    for filename in os.listdir(UPLOAD_FOLDER):
        if allowed_file(filename):
            image_path = os.path.join(UPLOAD_FOLDER, filename)
            image = face_recognition.load_image_file(image_path)
            encoding = face_recognition.face_encodings(image)
            if encoding:
                encodings.append(encoding[0])
                filenames.append(filename)
    return encodings, filenames

@app.route('/upload', methods=['POST'])
def upload_file():
    if 'file' not in request.files:
        return 'Geen bestand gekozen', 400
    file = request.files['file']
    if file.filename == '':
        return 'Geen bestand gekozen', 400
    if file and allowed_file(file.filename):
        filename = secure_filename(file.filename)
        filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        file.save(filepath)

        known_encodings, known_filenames = load_known_faces()
        uploaded_image = face_recognition.load_image_file(filepath)
        uploaded_encoding = face_recognition.face_encodings(uploaded_image)

        if not uploaded_encoding:
            return 'Geen gezicht gevonden in de foto', 400

        uploaded_encoding = uploaded_encoding[0]
        matches = face_recognition.compare_faces(known_encodings, uploaded_encoding)

        matching_files = [known_filenames[i] for i, match in enumerate(matches) if match]
        return jsonify(matching_files)

@app.route('/gallery', methods=['GET'])
def gallery():
    image_files = os.listdir(UPLOAD_FOLDER)
    return jsonify(image_files)

@app.route('/admin/photos', methods=['GET'])
def admin_photos():
    photo_files = os.listdir(UPLOAD_FOLDER)
    return jsonify(photo_files)

@app.route('/admin/delete/<filename>', methods=['DELETE'])
def delete_photo(filename):
    filepath = os.path.join(UPLOAD_FOLDER, filename)
    if os.path.exists(filepath):
        os.remove(filepath)
        return f"Foto {filename} verwijderd", 200
    return f"Foto {filename} niet gevonden", 404

@app.route('/search', methods=['POST'])
def search():
    file = request.files['file']
    filename = secure_filename(file.filename)
    filepath = os.path.join(UPLOAD_FOLDER, filename)
    file.save(filepath)

    uploaded_image = face_recognition.load_image_file(filepath)
    uploaded_encoding = face_recognition.face_encodings(uploaded_image)

    if not uploaded_encoding:
        return jsonify([])

    uploaded_encoding = uploaded_encoding[0]
    known_encodings, known_filenames = load_known_faces()

    matches = face_recognition.compare_faces(known_encodings, uploaded_encoding)
    matching_files = [known_filenames[i] for i, match in enumerate(matches) if match]

    return jsonify(matching_files)

if __name__ == '__main__':
    if not os.path.exists(UPLOAD_FOLDER):
        os.makedirs(UPLOAD_FOLDER)
    app.run(debug=True)
