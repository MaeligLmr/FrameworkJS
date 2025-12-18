import jwt from 'jsonwebtoken';
import {AppError} from '../utils/AppError.js';
import User from '../models/User.js';

const JWT_SECRET = process.env.JWT_SECRET || 'change_this_secret';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '1h';

/**
 * Crée un token JWT à partir d'un objet utilisateur.
 * On recommande de passer un objet minimal (id, email) pour éviter de stocker des données sensibles.
 * @param {Object} user - objet contenant au minimum id et email 
 * @param {String} [expiresIn] - durée d'expiration (ex: '1h', '7d')
 * @returns {String} token
 */
export const createToken = (user, expiresIn = JWT_EXPIRES_IN) => {
    const payload = {
        id: user.id,
        email: user.email,
    };
  const token = jwt.sign(payload, JWT_SECRET, { expiresIn });
  return token;
}



export const protect = async (req, res, next) => {
  try {
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }
    if (!token) {
      return next(new AppError('Vous n\'êtes pas connecté', 401));
    }
    const decoded = jwt.verify(token, JWT_SECRET);
    const currentUser = await User.findById(decoded.id);
    if (!currentUser) {
      return next(new AppError('L\'utilisateur n\'existe plus', 401));
    }
    req.user = { _id: currentUser._id };
    next();
  } catch (err) {
    if (err?.name === 'TokenExpiredError') {
      return next(new AppError('TokenExpiredError', 401));
    }
    if (err?.name === 'JsonWebTokenError') {
      return next(new AppError('Token invalide', 401));
    }
    next(err);
  }
};
