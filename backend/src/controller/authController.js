const User = require('../models/User');
const AppError = require('../utils/AppError');

exports.signup = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;
    const user = await User.create({ name, email, password });
    const token = exports.createToken(user);
    res.status(201).json({ status: 'success', token, data: { user: { id: user._id, name: user.name, email: user.email } } });
  } catch (err) {
    next(err);
  }
};

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return next(new AppError('Veuillez fournir email et mot de passe', 400));
    }
    const user = await User.findOne({ email }).select('+password');
    if (!user || !(await user.comparePassword(password))) {
      return next(new AppError('Email ou mot de passe incorrect', 401));
    }
    const token = signToken(user._id);
    res.status(200).json({ status: 'success', token });
  } catch (err) {
    next(err);
  }
};

exports.logout = (req, res) => {
  res.status(200).json({ status: 'success', message: 'Déconnexion réussie' });
};
