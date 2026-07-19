# Damba SV Freiburg — site simplifié multilingue

Site Next.js composé de :
- une page vitrine `/`
- une page d'inscription `/inscription`
- une interface en français, anglais et allemand
- un sélecteur de langue dans l'en-tête
- mémorisation automatique de la langue choisie dans le navigateur
- une API `/api/members` qui enregistre durablement les demandes dans PostgreSQL
- une notification facultative par e-mail après chaque nouvelle inscription

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

## Configuration Railway

Ajoutez un service PostgreSQL au projet Railway. Railway fournit normalement
automatiquement la variable `DATABASE_URL` au service relié.

Pour recevoir une notification à chaque inscription, ajoutez ces variables au
service web :

```text
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=votre-adresse@example.com
SMTP_PASS=votre-mot-de-passe-d-application
SMTP_FROM=Damba SV Freiburg <votre-adresse@example.com>
NOTIFICATION_EMAIL=adresse-qui-recoit-les-inscriptions@example.com
```

La table `membership_applications` est créée automatiquement lors de la première
inscription. Si SMTP n'est pas encore configuré, l'inscription est tout de même
conservée dans PostgreSQL.
