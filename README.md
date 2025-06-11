# EventRadar

EventRadar est une application web de gestion et de découverte d’événements, développée avec Next.js (frontend), Express.js (backend) et Supabase/Prisma (base de données et stockage). Elle permet la création, la consultation et le filtrage d’événements, avec gestion d’images, validation robuste et expérience utilisateur moderne.

## Fonctionnalités principales

- Création d’événements avec formulaire complet (titre, description, date, heure, lieu, type, image, etc.)

- Scraping automatique d’événements : le backend scrappe des sites partenaires, récupère et stocke automatiquement des événements dans la base de données, accessibles ensuite côté frontend

- Upload et gestion d’images (vérification taille, conversion en URL, affichage conditionnel)

- Filtrage des événements à venir/passés, par catégorie, recherche

- Affichage détaillé et carte d’événement

- Validation stricte des champs côté frontend (Yup) et backend (Zod)

- Gestion cohérente de l’id (généré côté backend)

- Expérience utilisateur : spinner, messages de succès/erreur, redirection après création

## Stack technique

- **Frontend** : Next.js 14, React, TypeScript, Formik, Yup
- **Backend** : Express.js, TypeScript, Zod, Prisma, Supabase
- **Base de données** : PostgreSQL (via Prisma)
- **Stockage images** : Supabase Storage

## Architecture

```
/ (monorepo)
  ├── backend/   # API Express, Prisma, schémas Zod, scraping
  └── frontend/  # Next.js, composants, validation, UX
```

## Instructions de démarrage

1. Cloner le repo et installer les dépendances dans chaque dossier (`backend`, `frontend`)

2. Configurer les variables d’environnement (voir `.env.local ou .env`)

3. Lancer le backend :
   ```bash
   cd backend
   npm install
   npm run dev
   ```
4. Lancer le frontend :
   ```bash
   cd frontend
   npm install
   npm run dev
   ```
5. Accéder à l’application sur [http://localhost:3000](http://localhost:3000)

## Contribution

- Forkez le repo, créez une branche, proposez vos améliorations via pull request.

- Merci de respecter la cohérence du typage et des validations frontend/backend.

## Auteurs

- Géry GUEDEGBE

## Licence

MIT
