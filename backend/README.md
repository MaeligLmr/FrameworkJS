# Backend - ZENTRA

API REST Node.js/Express pour l'application de blog MERN.

## Démarrage

### Installation

```bash
npm install
```

### Variables d'environnement

Créer un fichier `.env` à la racine du dossier backend:

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

### Démarrage

**Mode développement:**
```bash
npm run dev
```

**Mode production:**
```bash
npm start
```

Le serveur démarre sur `http://localhost:3000`

## Tests

```bash
# Lancer tous les tests
npm run test

# Avec couverture de code
npm run test -- --coverage
```

## API Endpoints

### Authentification (`/api/auth`)

#### POST `/api/auth/register`
Créer un nouveau compte utilisateur.

**Body:**
```json
{
  "username": "john_doe",
  "email": "john@example.com",
  "password": "securepass123"
}
```

**Response (201):**
```json
{
  "success": true,
  "token": "eyJhbGc...",
  "user": {
    "_id": "507f1f77bcf86cd799439011",
    "username": "john_doe",
    "email": "john@example.com"
  }
}
```

#### POST `/api/auth/login`
Se connecter avec email/mot de passe.

**Body:**
```json
{
  "email": "john@example.com",
  "password": "securepass123"
}
```

**Response (200):**
```json
{
  "success": true,
  "token": "eyJhbGc...",
  "user": {
    "_id": "507f1f77bcf86cd799439011",
    "username": "john_doe",
    "email": "john@example.com"
  }
}
```

#### POST `/api/auth/forgot-password`
Demander un lien de réinitialisation.

**Body:**
```json
{
  "email": "john@example.com"
}
```

#### POST `/api/auth/reset-password/:token`
Réinitialiser le mot de passe avec un token.

**Body:**
```json
{
  "password": "newpassword123"
}
```

### Articles (`/api/articles`)

#### GET `/api/articles`
Récupérer tous les articles avec filtres optionnels.

**Query Parameters:**
- `search` - Rechercher par titre/contenu
- `author` - Filtrer par ID auteur
- `category` - Filtrer par catégorie
- `page` - Pagination (défaut: 1)
- `limit` - Résultats par page (défaut: 10)
- `sort` - Tri (défaut: -createdAt)
- `showDrafts` - Inclure les brouillons (auth required)

**Response (200):**
```json
{
  "success": true,
  "count": 25,
  "data": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "title": "Mon Article",
      "content": "...",
      "category": "Tech",
      "author": { "_id": "...", "username": "john_doe" },
      "published": true,
      "views": 42,
      "createdAt": "2025-12-23T10:30:00Z",
      "updatedAt": "2025-12-23T10:30:00Z"
    }
  ]
}
```

#### GET `/api/articles/:id`
Récupérer un article spécifique.

**Response (200):** Un article (voir structure au-dessus)

#### POST `/api/articles`
Créer un nouvel article. **Authentification requise**

**Form Data:**
- `title` (string, required) - Titre de l'article
- `content` (string, required) - Contenu
- `category` (string, required) - Catégorie
- `image` (file, optional) - Image de couverture

**Response (201):** Article créé

#### PUT `/api/articles/:id`
Modifier un article. **Authentification requise, auteur seulement**

**Form Data:**
- `title` (string, optional)
- `content` (string, optional)
- `category` (string, optional)
- `image` (file, optional)

**Response (200):** Article modifié

#### PATCH `/api/articles/:id/publish`
Publier un article. **Authentification requise, auteur seulement**

**Response (200):** Article avec `published: true`

#### PATCH `/api/articles/:id/unpublish`
Dépublier un article. **Authentification requise, auteur seulement**

**Response (200):** Article avec `published: false`

#### DELETE `/api/articles/:id`
Supprimer un article. **Authentification requise, auteur seulement**

**Response (204):** Pas de contenu

#### GET `/api/articles/author/count/:authorId`
Compter les articles d'un auteur.

**Response (200):**
```json
{
  "count": 12
}
```

#### GET `/api/articles/author/views/:authorId`
Obtenir le nombre total de vues pour un auteur.

**Response (200):**
```json
{
  "views": 1234
}
```

### Commentaires (`/api/articles/:articleId/comments`)

#### GET `/api/articles/:articleId/comments`
Récupérer tous les commentaires d'un article.

**Response (200):**
```json
{
  "success": true,
  "count": 5,
  "data": [
    {
      "_id": "607f1f77bcf86cd799439012",
      "content": "Excellent article!",
      "author": {
        "_id": "507f1f77bcf86cd799439011",
        "username": "jane_doe",
        "avatar": "https://..."
      },
      "article": "507f1f77bcf86cd799439010",
      "comment": null,
      "responses": [
        {
          "_id": "607f1f77bcf86cd799439013",
          "content": "Merci!",
          "author": { "_id": "507f1f77bcf86cd799439011", "username": "john_doe" },
          "responses": []
        }
      ],
      "createdAt": "2025-12-23T10:30:00Z"
    }
  ]
}
```

#### POST `/api/articles/:articleId/comments`
Créer un commentaire. **Authentification requise**

**Body:**
```json
{
  "content": "Excellent article!",
  "comment": null  // ID du commentaire parent si réponse
}
```

**Response (201):** Commentaire créé

#### PUT `/api/articles/:articleId/comments/:commentId`
Modifier un commentaire. **Authentification requise, auteur seulement**

**Body:**
```json
{
  "content": "Excellent article! [MODIFIÉ]"
}
```

**Response (200):** Commentaire modifié

#### DELETE `/api/articles/:articleId/comments/:commentId`
Supprimer un commentaire. **Authentification requise, auteur seulement**

**Response (204):** Pas de contenu

### Utilisateurs (`/api/users`)

#### GET `/api/users/:userId`
Récupérer les informations d'un utilisateur.

**Response (200):**
```json
{
  "success": true,
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "username": "john_doe",
    "email": "john@example.com",
    "bio": "Développeur passionné",
    "avatar": "https://..."
  }
}
```

#### PUT `/api/users/:userId`
Modifier le profil. **Authentification requise, propriétaire seulement**

**Body:**
```json
{
  "username": "john_doe",
  "bio": "Développeur et designer",
  "avatar": "base64_image_or_url"
}
```

**Response (200):** Profil modifié

#### PATCH `/api/users/:userId/password`
Changer le mot de passe. **Authentification requise, propriétaire seulement**

**Body:**
```json
{
  "currentPassword": "oldpass123",
  "newPassword": "newpass123"
}
```

**Response (200):** Mot de passe changé

## Structure du projet

```
backend/
├── src/
│   ├── server.js              # Point d'entrée
│   ├── config/
│   │   ├── database.js        # Connexion MongoDB
│   │   ├── cloudinary.js      # Configuration Cloudinary
│   │   └── email.js           # Configuration Nodemailer
│   ├── controller/
│   │   ├── articleController.js
│   │   ├── commentController.js
│   │   ├── authController.js
│   │   └── userController.js
│   ├── middleware/
│   │   ├── auth.js            # JWT et protection des routes
│   │   └── security.js        # CORS, rate limiting
│   ├── models/
│   │   ├── Article.js
│   │   ├── Comment.js
│   │   └── User.js
│   ├── routes/
│   │   ├── article.js
│   │   ├── comment.js
│   │   ├── auth.js
│   │   └── user.js
│   ├── utils/
│   │   └── AppError.js        # Gestion des erreurs
│   └── __tests__/             # Tests Jest
├── .env                       # Variables d'environnement
├── package.json
└── README.md
```

## Authentification

L'API utilise JWT (JSON Web Tokens) pour l'authentification.

**Token dans les headers:**
```
Authorization: Bearer eyJhbGc...
```

**Routes protégées:**
- `POST /api/articles` - Créer un article
- `PUT /api/articles/:id` - Modifier un article
- `DELETE /api/articles/:id` - Supprimer un article
- `PATCH /api/articles/:id/publish` - Publier
- `PATCH /api/articles/:id/unpublish` - Dépublier
- `POST /api/articles/:articleId/comments` - Créer un commentaire
- Toutes les routes `/api/users`

## Gestion des erreurs

Toutes les réponses d'erreur retournent:

```json
{
  "success": false,
  "message": "Description de l'erreur",
  "errors": ["Liste", "des", "erreurs"]
}
```

**Codes HTTP courants:**
- `200` - Succès
- `201` - Créé
- `204` - Pas de contenu (suppression)
- `400` - Mauvaise requête
- `401` - Non authentifié
- `403` - Non autorisé
- `404` - Non trouvé
- `500` - Erreur serveur

## Dépendances principales

- **express** - Framework web
- **mongoose** - ODM MongoDB
- **jsonwebtoken** - JWT tokens
- **bcryptjs** - Hash de mots de passe
- **cloudinary** - Service d'upload d'images
- **nodemailer** - Envoi d'emails
- **multer** - Upload de fichiers
- **jest** - Framework de test

## Production

Pour déployer en production:

1. **Configurer les variables d'environnement** appropriées
2. **Utiliser une base de données MongoDB** gérée (MongoDB Atlas)
3. **Mettre en place HTTPS** avec un reverse proxy (Nginx)
4. **Ajouter un rate limiter** pour les API publiques
5. **Configurer CORS** correctement
6. **Utiliser des tokens JWT** avec expiration courte
7. **Monitoring** des erreurs et logs

