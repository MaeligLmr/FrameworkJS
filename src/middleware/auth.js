const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

// /c:/Users/maeli/Documents/2025-2026-M1/FrameworkJS/src/middeware/auth.js
// Authentification JWT + utilitaires de mot de passe

const JWT_SECRET = process.env.JWT_SECRET || 'change_this_secret';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '1h';
const BCRYPT_SALT_ROUNDS = parseInt(process.env.BCRYPT_SALT_ROUNDS, 10) || 10;

/**
 * Crée un token JWT à partir d'un objet utilisateur.
 * On recommande de passer un objet minimal (id, email) pour éviter de stocker des données sensibles.
 * @param {Object} user - objet contenant au minimum id et email 
 * @param {String} [expiresIn] - durée d'expiration (ex: '1h', '7d')
 * @returns {String} token
 */
function createToken(user, expiresIn = JWT_EXPIRES_IN) {
    const payload = {
        id: user.id,
        email: user.email,
    };
    return jwt.sign(payload, JWT_SECRET, { expiresIn });
}

/**
 * Middleware Express pour vérifier le token JWT.
 * Récupère le token depuis l'en-tête Authorization: Bearer <token> ou depuis req.cookies.token si disponible.
 * Attache l'objet décodé sur req.user.
 */
function authenticateToken(req, res, next) {
    try {
        const authHeader = req.headers && (req.headers.authorization || req.headers.Authorization);
        let token = null;

        if (authHeader && authHeader.startsWith('Bearer ')) {
            token = authHeader.slice(7).trim();
        } else if (req.cookies && req.cookies.token) {
            token = req.cookies.token;
        }

        if (!token) {
            return res.status(401).json({ error: 'Token manquant' });
        }

        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded;
        next();
    } catch (err) {
        return res.status(401).json({ error: 'Token invalide ou expiré' });
    }
}


/**
 * Hash d'un mot de passe (pour enregistrement)
 * @param {String} password
 * @returns {Promise<String>} hash
 */
async function hashPassword(password) {
    return await bcrypt.hash(password, BCRYPT_SALT_ROUNDS);
}

/**
 * Compare mot de passe en clair et hash stocké
 * @param {String} password
 * @param {String} hash
 * @returns {Promise<Boolean>}
 */
async function comparePassword(password, hash) {
    return await bcrypt.compare(password, hash);
}

module.exports = {
    createToken,
    authenticateToken,
    hashPassword,
    comparePassword,
};