# MediaMatch Platform - Stappenplan voor Implementatie

Dit document beschrijft stap voor stap hoe je het MediaMatch platform met gezichtsherkenning, abonnementsmodellen en HP laptop opslag kunt opzetten en configureren.

## Inhoudsopgave
1. [Backend opzetten op je HP laptop](#1-backend-opzetten-op-je-hp-laptop)
2. [Cloudflare tunnel configureren](#2-cloudflare-tunnel-configureren)
3. [Gezichtsherkenning instellen](#3-gezichtsherkenning-instellen)
4. [Abonnementsmodellen configureren](#4-abonnementsmodellen-configureren)
5. [Frontend verbinden met de backend](#5-frontend-verbinden-met-de-backend)
6. [Testen van de functionaliteit](#6-testen-van-de-functionaliteit)
7. [Doorlopend onderhoud](#7-doorlopend-onderhoud)

## 1. Backend opzetten op je HP laptop

### Stap 1.1: Benodigde software installeren
1. Download en installeer Node.js op je HP laptop (https://nodejs.org/en/download/)
2. Zorg dat je Git hebt geïnstalleerd (https://git-scm.com/downloads)

### Stap 1.2: Backend bestanden kopiëren
1. Kopieer de hele `backend` map naar een geschikte locatie op je HP laptop
2. Open een terminal/opdrachtprompt in de backend map
3. Installeer alle benodigde packages:
   ```bash
   npm install
   ```

### Stap 1.3: Mappenstructuur aanmaken
Maak de volgende mappen aan in de backend directory:
```bash
mkdir -p uploads db
```

### Stap 1.4: Configuratie voor AI
1. Maak een account aan op [Clarifai](https://www.clarifai.com/)
2. Maak een nieuw project aan in je Clarifai dashboard
3. Krijg je API-sleutel van het Clarifai dashboard
4. Maak een `.env` bestand aan in de backend map:
   ```
   CLARIFAI_API_KEY=jouw_clarifai_api_sleutel
   JWT_SECRET=kies_een_veilige_random_string_voor_authenticatie
   ```

## 2. Cloudflare tunnel configureren

### Stap 2.1: Cloudflare account aanmaken
1. Ga naar [Cloudflare](https://www.cloudflare.com/) en maak een gratis account

### Stap 2.2: Cloudflare CLI installeren
**Voor Windows:**
1. Download de installer van: https://developers.cloudflare.com/cloudflare-one/connections/connect-apps/install-and-setup/installation
2. Voer de installer uit

**Voor macOS (als je lokaal wilt testen):**
```bash
brew install cloudflare/cloudflare/cloudflared
```

### Stap 2.3: Inloggen op Cloudflare
```bash
cloudflared login
```
Dit opent een browser waar je kunt inloggen op je Cloudflare account.

### Stap 2.4: Tunnel aanmaken
```bash
cloudflared tunnel create mediamatch
```
Noteer de tunnel ID die je krijgt.

### Stap 2.5: Tunnel configureren
Maak een configuratiebestand aan in `~/.cloudflared/config.yml` (Windows: `%USERPROFILE%\.cloudflared\config.yml`):

```yaml
tunnel: JOUW_TUNNEL_ID
credentials-file: C:\Users\jouwnaam\.cloudflared\JOUW_TUNNEL_ID.json

ingress:
  - service: http://localhost:3000
  - service: http_status:404
```

Vervang JOUW_TUNNEL_ID met de ID die je in de vorige stap hebt gekregen.

## 3. Gezichtsherkenning instellen

### Stap 3.1: Clarifai modellen controleren
In het Clarifai dashboard, zorg ervoor dat je toegang hebt tot deze modellen:
- `face-detection` (voor het detecteren van gezichten)
- `face-embedding` (voor het vergelijken van gezichten)

### Stap 3.2: Backend testen
1. Start de backend server om te controleren of de gezichtsherkenning correct werkt:
   ```bash
   node server.js
   ```
2. De server moet melden dat hij draait op http://localhost:3000

## 4. Abonnementsmodellen configureren

### Stap 4.1: Admin account aanmaken
1. Gebruik een API-client zoals Postman of curl om een admin account aan te maken:
   ```bash
   curl -X POST http://localhost:3000/api/register -H "Content-Type: application/json" -d "{\"email\":\"admin@mediamatch.nl\",\"password\":\"jouw_wachtwoord\"}"
   ```

2. Bewerk het bestand `db/users.json` in de backend map om de nieuwe gebruiker tot admin te promoveren:
   Wijzig `"role": "user"` naar `"role": "admin"` voor je admin account.

### Stap 4.2: Abonnementsplannen controleren
1. Controleer het bestand `subscriptions.js` om zeker te zijn dat de abonnementsplannen kloppen:
   - FREE: 0 euro, 20 foto's per maand, geen AI
   - PRO: 9,99 euro, 100 foto's per maand, met AI, 14 dagen gratis proef
   - UNLIMITED: 19,99 euro, onbeperkt, met AI en branding, 30 dagen gratis proef

2. Pas deze plannen aan als je andere specificaties wenst.

## 5. Frontend verbinden met de backend

### Stap 5.1: Frontend bestanden updaten
1. Maak een bestand `config.js` in de hoofdmap van je frontend:
   ```javascript
   // config.js
   const config = {
     apiUrl: window.location.hostname === 'localhost' ? '' : 'https://JOUW-CLOUDFLARE-TUNNEL-URL'
   };
   ```
   Vervang `JOUW-CLOUDFLARE-TUNNEL-URL` met de URL van je Cloudflare tunnel.

2. Voeg deze config toe aan al je HTML bestanden, vlak voor de andere scripts:
   ```html
   <script src="config.js"></script>
   ```

3. Update alle fetch calls in je JavaScript bestanden om `config.apiUrl` te gebruiken:
   ```javascript
   fetch(`${config.apiUrl}/api/photos`)
   ```

### Stap 5.2: Gezichtsherkenningspagina maken
Maak een nieuwe pagina `facialRecognition.html` en `facialRecognition.js` om de gezichtsherkenningsfunctionaliteit beschikbaar te maken.

### Stap 5.3: Abonnementspagina's maken
Werk de bestaande `pricing.html` bij om gebruikers direct naar de proefperiode te leiden:
- Voor Pro-abonnement: 14 dagen gratis
- Voor Unlimited-abonnement: 30 dagen gratis

## 6. Testen van de functionaliteit

### Stap 6.1: Backend starten
1. Start de backend server:
   ```bash
   node server.js
   ```

2. Start de Cloudflare tunnel in een ander terminalvenster:
   ```bash
   cloudflared tunnel run mediamatch
   ```

3. Noteer de automatisch gegenereerde Cloudflare URL (als je geen eigen domein gebruikt).

### Stap 6.2: Frontend testen
1. Registreer een nieuwe gebruiker via de frontend
2. Test de uploadfunctionaliteit
3. Test de gezichtsherkenning door foto's te uploaden met dezelfde personen
4. Test de abonnementsmodellen door een proefperiode te starten

### Stap 6.3: End-to-end test
1. Test het volledige proces als een nieuwe gebruiker
2. Verifieer dat gezichtsherkenning alleen werkt voor Pro en Unlimited abonnementen
3. Controleer dat de gratis gebruikers beperkt zijn tot 20 uploads per maand
4. Verificeer dat de proefperiodes werken zoals verwacht

## 7. Doorlopend onderhoud

### Stap 7.1: Regelmatige backups
Stel een dagelijkse backup in van de `db` map om gegevensverlies te voorkomen.

### Stap 7.2: Monitoring
Houd server logs in de gaten voor fouten of performanceproblemen.

### Stap 7.3: Updates
Controleer regelmatig op updates voor Node.js en de gebruikte packages:
```bash
npm outdated
npm update
```

### Stap 7.4: Schijfruimte
Monitor de beschikbare schijfruimte op je HP laptop, omdat foto's veel ruimte kunnen innemen.

---

## Aanvullende informatie

### Endpoints voor de frontend
- Foto's ophalen: `GET /api/photos`
- Foto uploaden: `POST /api/upload`
- Gezichtsherkenning starten: `POST /api/facial-recognition/find-matches`
- Gezichtsmatches ophalen: `GET /api/facial-recognition/matches/:photoId`
- Gezichtsmatches verifiëren: `POST /api/facial-recognition/verify`
- Abonnement info: `GET /api/subscription`
- Abonnement plannen: `GET /api/subscription/plans`
- Proefperiode starten: `POST /api/subscription/trial`

### Abonnementsbeheer
- Gebruik de admin pagina om gebruikers en abonnementen te beheren
- Start proefperiodes handmatig via de API indien nodig
- Annuleer abonnementen via het admin panel of API

### Gezichtsherkenning optimalisatie
- Gezichtsherkenning kan CPU-intensief zijn
- Overweeg om gezichtsherkenning alleen 's nachts of in rustige periodes te draaien
- Implementeer een wachtrij voor gezichtsherkenning bij veel gelijktijdige uploads
