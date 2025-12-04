import User from '../models/User.js';
import { AppError } from '../utils/AppError.js';
import { createToken } from '../middleware/auth.js';
export const signup = async (req, res, next) => {
  try {
    const { username, email, password } = req.body;
    const user = await User.create({ username, email, password });
    const token = createToken(user);
    res.status(201).json({ status: 'success', token, data: { user: { id: user._id, username: user.username, email: user.email } } });
  } catch (err) {
    next(err);
  }
};

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return next(new AppError('Veuillez fournir email et mot de passe', 400));
    }
    const user = await User.findOne({ email }).select('+password');
    if (!user || !(await user.comparePassword(password))) {
      return next(new AppError('Email ou mot de passe incorrect', 401));
    }
    const token = createToken(user);
    res.status(200).json({ status: 'success', token });
  } catch (err) {
    next(err);
  }
};

export const logout = (req, res) => {
  res.status(200).json({ status: 'success', message: 'Déconnexion réussie' });
};
