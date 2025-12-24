# Frontend - ZENTRA

Application React moderne pour la plateforme de blog MERN.

## Démarrage

### Installation

```bash
npm install
```

### Variables d'environnement

Créer un fichier `.env` à la racine du dossier frontend:

```env
VITE_API_URL=http://localhost:3000
```

### Développement

```bash
npm run dev
```

L'application s'ouvre sur `http://localhost:5173`


## Structure du projet

```
frontend/
├── src/
│   ├── main.jsx                # Point d'entrée React
│   ├── App.jsx                 # Composant principal
│   ├── index.css              # Styles globaux (Tailwind)
│   │
│   ├── components/            # Composants réutilisables
│   │   ├── articles/
│   │   │   ├── ArticleCard.jsx      # Carte article (liste)
│   │   │   ├── ArticleForm.jsx      # Formulaire créer/éditer
│   │   │   └── ArticleList.jsx      # Liste d'articles avec pagination
│   │   ├── auth/
│   │   │   ├── LoginForm.jsx        # Formulaire connexion
│   │   │   ├── RegisterForm.jsx     # Formulaire inscription
│   │   │   └── RequireAuth.jsx      # Garde de route
│   │   ├── comments/
│   │   │   ├── CommentCard.jsx      # Commentaire individuel
│   │   │   ├── CommentForm.jsx      # Formulaire commentaire
│   │   │   └── CommentList.jsx      # Liste commentaires imbriquées
│   │   ├── common/
│   │   │   ├── Button.jsx           # Bouton réutilisable
│   │   │   ├── Input.jsx            # Input réutilisable
│   │   │   ├── Loader.jsx           # Spinner de chargement
│   │   │   ├── PopupConfirm.jsx     # Modal confirmation
│   │   │   └── PopupForm.jsx        # Modal formulaire
│   │   ├── layout/
│   │   │   ├── Header.jsx           # En-tête
│   │   │   ├── Navbar.jsx           # Navigation principale
│   │   │   └── Footer.jsx           # Pied de page
│   │   └── profile/
│   │       ├── Avatar.jsx           # Avatar utilisateur
│   │       ├── PasswordForm.jsx     # Changement mot de passe
│   │       └── ProfileForm.jsx      # Édition profil
│   │
│   ├── pages/                 # Pages principales (routes)
│   │   ├── Home.jsx
│   │   ├── ArticleDetail.jsx
│   │   ├── CreateArticle.jsx
│   │   ├── Login.jsx
│   │   ├── Register.jsx
│   │   ├── Profile.jsx
│   │   ├── ForgotPassword.jsx
│   │   └── ResetPassword.jsx
│   │
│   ├── context/              # Context API
│   │   ├── AuthContext.jsx        # State authentification
│   │   └── AuthProvider.jsx       # Provider authentification
│   │
│   ├── hooks/                # Hooks personnalisés
│   │   └── useAuth.js             # Hook pour accéder au contexte auth
│   │
│   ├── services/             # Appels API
│   │   ├── api.js                 # Configuration Axios
│   │   ├── articleService.js      # API articles
│   │   ├── authService.js         # API authentification
│   │   ├── commentService.js      # API commentaires
│   │   └── userService.js         # API utilisateurs
│   │
│   └── utils/                # Utilitaires
│       └── helpers.js             # Fonctions utilitaires
│
├── public/                   # Assets statiques
├── index.html               # HTML d'entrée
├── vite.config.js           # Configuration Vite
├── eslint.config.js         # Configuration ESLint
├── package.json
├── tailwind.config.js        # Configuration Tailwind CSS
└── README.md
```

## Composants principaux

### Button
Bouton réutilisable avec plusieurs variantes.

**Props:**
```jsx
<Button
  onClick={() => {}}              // Callback
  disabled={false}                // État désactivé
  loading={false}                 // État chargement
  icon="paper-plane"              // Icône FontAwesome
  light={false}                   // Style clair
  outlined={false}                // Style contourné
  danger={false}                  // Style danger (rouge)
  tab={false}                     // Style onglet
  noBorders={false}               // Sans bordures
  rounded={false}                 // Coins arrondis
  full={false}                    // Largeur 100%
  active={false}                  // État actif
>
  Cliquez-moi
</Button>
```

### Input
Input réutilisable avec validation.

**Props:**
```jsx
<Input
  type="text"
  placeholder="Entrez..."
  value={value}
  onChange={(e) => setValue(e.target.value)}
  error={errorMessage}
  disabled={false}
/>
```

### PopupConfirm
Modal de confirmation pour actions destructives.

**Props:**
```jsx
<PopupConfirm
  message="Êtes-vous sûr?"
  confirmText="Confirmer"
  onConfirm={() => {}}
  onCancel={() => {}}
/>
```

### CommentList et CommentCard
Affichage hiérarchique des commentaires avec support des réponses imbriquées.

**Fonctionnalité:**
- Les commentaires de niveau 0 affichent leurs réponses comme liste imbriquée
- Les réponses à des réponses (niveau 2+) s'affichent inline au même niveau que les réponses de niveau 1
- Indicateur `> nom_auteur` pour montrer à qui répond un commentaire profond
- Support complet de la création, édition et suppression de commentaires

## Flux d'authentification

1. **Inscription/Connexion** → Obtenir JWT token
2. **Token stocké** → localStorage `token`
3. **AuthProvider** → Vérifie le token au démarrage
4. **useAuth hook** → Accéder à `user`, `isLoading`, `login()`, `logout()`
5. **RequireAuth** → Protéger les routes privées

## Appels API

### Utiliser les services

```javascript
import articleService from '../services/articleService';

// Récupérer les articles
const articles = await articleService.fetchArticles({ 
  search: 'react', 
  category: 'Tech',
  page: 1 
});

// Créer un article
const newArticle = await articleService.createArticle({
  title: 'Mon Article',
  content: '...',
  category: 'Tech',
  image: File
});
```

### Configuration API (api.js)

```javascript
// Automatiquement ajoute le token JWT aux headers
// Gère les erreurs et logs
api.request(endpoint, options)
```

## Thème et styles

**Tailwind CSS 4.1:**
- Configuration personnalisée des couleurs
- Classes utilitaires pour responsive design

**Couleurs principales:**
- Primaire: `#4062BB`
- Hover primaire: `#2F4889`
- Fond léger: `#F1F3F9`
- Hover fond: `#E8EFFF`

**Responsive:**
- Mobile-first
- Breakpoints: `sm`, `md`, `lg`, `xl`, `2xl`

## Optimisations et bonnes pratiques

### Performance
- Code splitting avec React Router
- Images optimisées (Cloudinary)
- Lazy loading des routes
- Memoization des composants (React.memo)

### État
- Context API pour authentification globale
- Props drilling pour l'état local
- Pas de Redux (simplifié pour ce projet)

### Sécurité
- JWT tokens dans localStorage
- CORS configuré
- Validation côté client
- Protection des routes avec RequireAuth

## Dépendances principales

- **react** 19.2.0 - Bibliothèque UI
- **react-router-dom** 7.10.0 - Routage
- **vite** 7.2.4 - Bundler
- **tailwindcss** 4.1.17 - Styles CSS
- **axios** 1.13.2 - Appels HTTP
- **@fortawesome/fontawesome-free** - Icônes
- **react-masonry-css** - Layout masonry
- **react-select** - Select customisé

## Workflow de développement

### Créer un nouveau composant

1. Créer le fichier dans `src/components/`
2. Exporter depuis un index si nécessaire
3. Importer dans le composant parent
4. Styliser avec Tailwind CSS

### Ajouter une nouvelle route

1. Créer le fichier page dans `src/pages/`
2. Ajouter la route dans `App.jsx`
3. Protéger avec `<RequireAuth>` si nécessaire

### Appeler une API

1. Ajouter la fonction dans `src/services/`
2. Importer et utiliser dans le composant
3. Gérer loading/error states

## Conventions de code

### Nommage des fichiers
- Composants: **PascalCase** (ArticleCard.jsx)
- Services/utils: **camelCase** (articleService.js)
- Pages: **PascalCase** (ArticleDetail.jsx)


