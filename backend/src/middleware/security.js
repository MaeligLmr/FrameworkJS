const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');

const securityMiddlewares = (app) => {
  app.use(helmet());
  app.use(mongoSanitize());
  app.use(xss());
  app.use(rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: 'Too many requests from this IP, please try again later.'
  }));
};

module.exports = securityMiddlewares;