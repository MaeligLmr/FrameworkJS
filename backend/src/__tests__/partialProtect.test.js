import { jest } from '@jest/globals';

const UserMock = {
  findById: jest.fn()
};

await jest.unstable_mockModule('../models/User.js', () => ({
  __esModule: true,
  default: UserMock
}));

// Mock jwt
const jwtMock = {
  verify: jest.fn(),
  sign: jest.fn()
};

await jest.unstable_mockModule('jsonwebtoken', () => ({
  __esModule: true,
  default: jwtMock,
  ...jwtMock
}));

const { partialProtect } = await import('../middleware/auth.js');

const createReq = (headers = {}) => ({
  headers,
  user: null
});

const createRes = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

const createNext = () => jest.fn();

describe('partialProtect middleware', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('permet l\'accès sans token', async () => {
    const req = createReq();
    const res = createRes();
    const next = createNext();

    await partialProtect(req, res, next);

    expect(next).toHaveBeenCalledWith();
    expect(req.user).toBeNull();
  });

  test('ajoute req.user si token valide', async () => {
    const mockUser = { _id: 'user123', email: 'test@test.com' };
    jwtMock.verify.mockReturnValue({ id: 'user123', email: 'test@test.com' });
    UserMock.findById.mockResolvedValue(mockUser);

    const req = createReq({ authorization: 'Bearer valid_token' });
    const res = createRes();
    const next = createNext();

    await partialProtect(req, res, next);

    expect(jwtMock.verify).toHaveBeenCalledWith('valid_token', expect.any(String));
    expect(UserMock.findById).toHaveBeenCalledWith('user123');
    expect(req.user).toEqual({ _id: 'user123' });
    expect(next).toHaveBeenCalledWith();
  });

  test('ne crash pas si token invalide', async () => {
    jwtMock.verify.mockImplementation(() => {
      const err = new Error('invalid token');
      err.name = 'JsonWebTokenError';
      throw err;
    });

    const req = createReq({ authorization: 'Bearer invalid_token' });
    const res = createRes();
    const next = createNext();

    await partialProtect(req, res, next);

    expect(next).toHaveBeenCalled();
    expect(next.mock.calls[0][0]).toBeDefined();
    expect(next.mock.calls[0][0].message).toBe('Token invalide');
  });

  test('ne crash pas si token expiré', async () => {
    jwtMock.verify.mockImplementation(() => {
      const err = new Error('token expired');
      err.name = 'TokenExpiredError';
      throw err;
    });

    const req = createReq({ authorization: 'Bearer expired_token' });
    const res = createRes();
    const next = createNext();

    await partialProtect(req, res, next);

    expect(next).toHaveBeenCalled();
    expect(next.mock.calls[0][0]).toBeDefined();
    expect(next.mock.calls[0][0].message).toBe('TokenExpiredError');
  });

  test('ne définit pas req.user si utilisateur introuvable', async () => {
    jwtMock.verify.mockReturnValue({ id: 'unknown_user', email: 'test@test.com' });
    UserMock.findById.mockResolvedValue(null);

    const req = createReq({ authorization: 'Bearer valid_token' });
    const res = createRes();
    const next = createNext();

    await partialProtect(req, res, next);

    expect(UserMock.findById).toHaveBeenCalledWith('unknown_user');
    expect(req.user).toBeNull();
    expect(next).toHaveBeenCalledWith();
  });
});
