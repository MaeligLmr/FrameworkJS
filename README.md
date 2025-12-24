# ZENTRA - Blog MERN

Une application blog complète construite avec le stack MERN (MongoDB, Express, React, Node.js).

## Description

ZENTRA est une plateforme de blog fonctionnelle permettant aux utilisateurs de :
- **Créer et publier des articles** avec images
- **Commenter les articles** avec support des réponses imbriquées
- **Gérer leur profil** et leurs statistiques
- **Rechercher et filtrer** les articles par catégorie et auteur
- **Voir les articles en brouillon** (mode privé)

## Architecture

```
FrameworkJS/
├── backend/          # API Node.js/Express
├── frontend/         # Application React avec Vite
└── docker-compose.yml # Orchestration des services
```

### Stack Technique

**Backend:**
- Node.js 20
- Express.js 5
- MongoDB 6.0
- JWT pour l'authentification
- Cloudinary pour le stockage d'images
- Jest pour les tests

**Frontend:**
- React 19
- Vite 7
- React Router 7
- Tailwind CSS 4
- Axios pour les appels API
- Font Awesome pour les icônes

## Démarrage rapide avec Docker

### Prérequis
- Docker et Docker Compose installés

### Lancer l'application

```bash
docker-compose up
```

Cela va:
1. Démarrer MongoDB sur `localhost:27017`
2. Démarrer le backend sur `http://localhost:3000`
3. Démarrer le frontend sur `http://localhost:5173`

L'application est accessible à **http://localhost:5173**

### Arrêter l'application

```bash
docker-compose down
```

## Documentation détaillée

- **[Backend README](./backend/README.md)** - Endpoints API, configuration, tests
- **[Frontend README](./frontend/README.md)** - Structure du projet, composants

## 🔧 Configuration des variables d'environnement

### Backend (.env)

```env
PORT=3000
ENVIRONNEMENT=development
MONGO_DB_URI=mongodb://admin:adminpassword@localhost:27017/blog_mern?authSource=admin
JWT_SECRET=votre_super_secret_jwt
JWT_EXPIRES_IN=1d
ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3000
CLOUD_NAME=nom_cloudinary
CLOUD_API_KEY=cle_cloudinary_api
CLOUD_API_SECRET=secret_cloudinary_api
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=votre_email@gmail.com
EMAIL_PASSWORD=votre_app_password
EMAIL_FROM_NAME=Blog App
FRONTEND_URL=http://localhost:5173
```

### Frontend (.env)

```env
VITE_API_URL=http://localhost:3000
```

## Fonctionnalités principales

### Authentification
- Inscription et connexion
- Récupération de mot de passe
- JWT tokens

### Articles
- Créer, éditer, supprimer des articles
- Publier/dépublier des articles
- Upload d'images avec Cloudinary
- Filtrage par catégorie
- Recherche par titre/contenu
- Comptage des vues

### Commentaires
- Commenter les articles publiés
- Réponses aux commentaires (support imbriqué)
- Affichage hiérarchique des réponses

### Profil utilisateur
- Éditer le profil
- Changer le mot de passe
- Voir ses articles et statistiques
- Avatar utilisateur

## Tests

### Backend
```bash
cd backend
npm run test
npm run test -- --coverage  # Avec couverture
```

### Frontend
Pas de tests configurés actuellement. À implémenter.

## Déploiement

### Sans Docker

**Backend:**
```bash
cd backend
npm install
npm start
```

**Frontend:**
```bash
cd frontend
npm install
npm start
```

### Avec Docker

Le `docker-compose.yml` contient déjà la configuration pour :
- MongoDB
- Backend
- Frontend

Consultez le fichier pour les détails de configuration.


