# MediaMatch Frontend

## Authenticatie & Abonnementen
- Login, registratie en abonnementen verlopen via de bestaande MusicMedia API:
  - `https://cgi-season-procedure-dom.trycloudflare.com`
  - Hierdoor hebben gebruikers dezelfde premium-status als op MusicMedia.

## Foto-upload & Gezichtsherkenning
- Uploaden en zoeken van foto's verloopt via de eigen MediaMatch backend (`http://localhost:5050`).
- Gezichtsherkenning kan later worden toegevoegd via open-source libs zoals `face_recognition` of `InsightFace`.

## Configuratie
- Zie `config.js` voor API endpoints.

## Opzet
- Gebruik deze frontend om in te loggen, foto's te uploaden, en gezichten te zoeken.
- Voorbeeld login-flow:
  1. Login met MusicMedia account (token ophalen via authApiUrl).
  2. Upload foto's via photoApiUrl.
  3. Zoek gezichten via photoApiUrl (endpoint volgt).

---

**Let op:**
- Abonnementen (premium) worden altijd gecontroleerd via de MusicMedia API.
- Foto-data en gezichtsherkenning zijn gescheiden van de hoofd-API voor privacy en schaalbaarheid.
