# Platsbanken/JobTech API Integration

Denna mapp innehåller API-endpoints för att hämta rekommenderade jobb från Arbetsförmedlingens JobTech API (tidigare Platsbanken API).

## Översikt

API:et används för att matcha användarens CV-innehåll med relevanta jobbannonser från Arbetsförmedlingen. Systemet extraherar nyckelord från användarens CV och gör sedan sökningar mot JobTech API för att hitta relevanta jobbannonser.

## Viktigt om API-nycklar

Från och med 2024 kräver JobTech API inte längre någon API-nyckel för grundläggande användning av deras öppna data. Detta framgår av sidorna på deras dokumentation: [https://jobtechdev.se/](https://jobtechdev.se/)

Om detta skulle ändras i framtiden, kan applikationen konfigureras att använda en API-nyckel genom att:

1. Ansöka om en API-nyckel från [https://jobtechdev.se/](https://jobtechdev.se/)
2. Lägga till API-nyckeln i din `.env.local` fil:
   ```
   JOBTECH_API_KEY=din-api-nyckel
   ```
3. Uppdatera `route.ts` filen för att inkludera API-nyckeln i header:
   ```typescript
   const headers = {
     'Accept': 'application/json',
     'api-key': process.env.JOBTECH_API_KEY
   }
   ```

## API-endpoints

### GET /api/jobs/recommended

Hämtar rekommenderade jobb baserat på användarens CV-profil.

#### Respons

```json
{
  "jobs": [
    {
      "id": "string",
      "headline": "string",
      "description": "string",
      "employer": {
        "name": "string",
        "logoUrl": "string" | null
      },
      "location": "string",
      "publishedAt": "string",
      "deadline": "string",
      "applicationUrl": "string",
      "workType": "string",
      "skills": ["string"]
    }
  ]
}
```

## Implementationsdetaljer

Systemet fungerar enligt följande:

1. Användarens CV hämtas från Supabase
2. Relevanta nyckelord extraheras från CV:t (titlar, kompetenser, etc)
3. En sökning görs mot JobTech API med dessa nyckelord
4. Resultaten transformeras till vårt interna jobbformat
5. Om API-anropet misslyckas används mockade jobb som fallback

## Konfigurationsalternativ

Vissa aspekter kan konfigureras via miljövariabler:

- `JOBTECH_MAX_JOBS`: Maxantalet jobb att hämta (standard: 10)
- `JOBTECH_API_KEY`: API-nyckel om sådan skulle krävas i framtiden

## Resurser

- [JobTech Developer Portal](https://jobtechdev.se/)
- [JobSearch API Dokumentation](https://jobsearch.api.jobtechdev.se/)
- [Arbetsförmedlingens Dataportal](https://arbetsformedlingen.se/om-webbplatsen/apier-och-oppna-data) 