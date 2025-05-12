# Face Recognition (Python) installeren op je server

**1. Vereisten:**
- Python 3.8 of hoger
- pip
- (Linux/Mac) build-essential, cmake, libboost, libopenblas-dev, liblapack-dev, libjpeg-dev, libpng-dev

**2. Installatie stappen:**

```bash
# (Optioneel, maar aanbevolen) Maak een virtual environment aan:
python3 -m venv venv
source venv/bin/activate

# Installeer de basisvereisten (dlib heeft C++ build tools nodig):
pip install --upgrade pip
pip install cmake

# Installeer face_recognition (installeert automatisch dlib)
pip install face_recognition
```

**3. Testen of het werkt:**

```bash
face_recognition --help
```

**4. Simpele Python demo:**

```python
import face_recognition
image = face_recognition.load_image_file("jouw_foto.jpg")
faces = face_recognition.face_locations(image)
print(f"Aantal gezichten gevonden: {len(faces)}")
```

**5. Gebruik als API (voorbeeld):**
- Je kunt een simpele Flask server maken die uploads accepteert en gezichten zoekt/herkent.
- Zie: https://github.com/ageitgey/face_recognition#web-service-example

**6. Meer info:**
- Officiële repo: https://github.com/ageitgey/face_recognition
- Voor Windows: zie extra instructies in de repo (Visual Studio Build Tools vereist)

**Let op:**
- Voor grote datasets of productiegebruik: overweeg GPU/optimalisatie of InsightFace.
- AVG/privacy: informeer gebruikers en sla alleen noodzakelijke data op.
