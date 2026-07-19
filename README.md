# Damba SV Freiburg — site simplifié multilingue

Site Next.js composé de :
- une page vitrine `/`
- une page d'inscription `/inscription`
- une interface en français, anglais et allemand
- un sélecteur de langue dans l'en-tête
- mémorisation automatique de la langue choisie dans le navigateur
- une API locale `/api/members` qui enregistre les demandes dans `data/members.json`

## Installation
```bash
npm install
npm run dev
```
Ouvrir : http://localhost:3000

## Production
```bash
npm run build
npm start
```

## Gestion des traductions
Les traductions se trouvent dans `components/LanguageProvider.tsx`.

## Important pour l'hébergement
L'enregistrement dans `data/members.json` exige un hébergement Node.js avec stockage persistant et droit d'écriture. Sur Vercel, utilisez plutôt Supabase, Firebase ou PostgreSQL.
