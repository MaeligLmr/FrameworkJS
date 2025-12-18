import jwt from 'jsonwebtoken';
import { jest } from '@jest/globals';
import { AppError } from '../utils/AppError.js';
import User from '../models/User.js';

let createToken;
let protect;

describe('auth middleware', () => {
  beforeAll(async () => {
    process.env.JWT_SECRET = 'test-secret';
    const authModule = await import('../middleware/auth.js');
    createToken = authModule.createToken;
    protect = authModule.protect;
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  test('createToken signe et encode les données utilisateur', () => {
    const token = createToken({ id: 'user-123', email: 'user@example.com' }, '1h');
    const decoded = jwt.verify(token, 'test-secret');
    expect(decoded.id).toBe('user-123');
    expect(decoded.email).toBe('user@example.com');
  });

  test('protect attache user et appelle next pour un token valide', async () => {
    const token = jwt.sign({ id: 'abc123', email: 'a@test.com' }, 'test-secret', { expiresIn: '1h' });
    const req = { headers: { authorization: `Bearer ${token}` } };
    const res = {};
    const next = jest.fn();
    jest.spyOn(User, 'findById').mockResolvedValue({ _id: 'abc123' });

    await protect(req, res, next);

    expect(User.findById).toHaveBeenCalledWith('abc123');
    expect(req.user).toEqual({ _id: 'abc123' });
    expect(next).toHaveBeenCalledTimes(1);
    expect(next).toHaveBeenCalledWith();
  });

  test('protect renvoie une erreur si le token est manquant', async () => {
    const req = { headers: {} };
    const res = {};
    const next = jest.fn();

    await protect(req, res, next);

    expect(next).toHaveBeenCalledWith(expect.any(AppError));
    const error = next.mock.calls[0][0];
    expect(error.statusCode).toBe(401);
  });

  test('protect renvoie une erreur si le token est expiré', async () => {
    const expiredToken = jwt.sign({ id: 'abc123', email: 'a@test.com' }, 'test-secret', { expiresIn: '-1s' });
    const req = { headers: { authorization: `Bearer ${expiredToken}` } };
    const res = {};
    const next = jest.fn();

    await protect(req, res, next);

    expect(next).toHaveBeenCalledWith(expect.any(AppError));
    const error = next.mock.calls[0][0];
    expect(error.message).toBe('TokenExpiredError');
    expect(error.statusCode).toBe(401);
  });

  test('protect renvoie une erreur si signature invalide', async () => {
    const badToken = 'invalid.token.value';
    const req = { headers: { authorization: `Bearer ${badToken}` } };
    const res = {};
    const next = jest.fn();

    await protect(req, res, next);

    expect(next).toHaveBeenCalledWith(expect.any(AppError));
    const error = next.mock.calls[0][0];
    expect(error.statusCode).toBe(401);
  });

  test('protect renvoie une erreur si utilisateur introuvable', async () => {
    const token = jwt.sign({ id: 'ghost', email: 'g@test.com' }, 'test-secret', { expiresIn: '1h' });
    const req = { headers: { authorization: `Bearer ${token}` } };
    const res = {};
    const next = jest.fn();
    jest.spyOn(User, 'findById').mockResolvedValue(null);

    await protect(req, res, next);

    expect(next).toHaveBeenCalledWith(expect.any(AppError));
    const error = next.mock.calls[0][0];
    expect(error.statusCode).toBe(401);
  });
});

describe('AppError utilitaire', () => {
  test('toJSON renvoie le format attendu', () => {
    const err = new AppError('Erreur test', 400, ['detail']);
    const json = err.toJSON();
    expect(json).toEqual({
      success: false,
      message: 'Erreur test',
      errors: ['detail'],
      statusCode: 400
    });
  });

  test('toJSON gère les erreurs optionnelles', () => {
    const err = new AppError('Autre erreur', 500);
    const json = err.toJSON();
    expect(json).toEqual({
      success: false,
      message: 'Autre erreur',
      errors: [],
      statusCode: 500
    });
  });

  test('from wrappe un Error générique et préserve le stack', () => {
    const base = new Error('Oups');
    const err = AppError.from(base, 500);
    expect(err).toBeInstanceOf(AppError);
    expect(err.message).toBe('Oups');
    expect(err.statusCode).toBe(500);
    expect(err.errors).toEqual(['Oups']);
    expect(err.stack).toBeTruthy();
  });

  test('from retourne la même instance si déjà AppError', () => {
    const original = new AppError('Déjà AppError', 418);
    const returned = AppError.from(original);
    expect(returned).toBe(original);
  });
});
