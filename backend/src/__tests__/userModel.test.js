import { jest } from '@jest/globals';

// Mock bcrypt compare to control outcomes
await jest.unstable_mockModule('bcryptjs', () => ({
  __esModule: true,
  default: {
    genSalt: jest.fn().mockResolvedValue('salt'),
    hash: jest.fn().mockResolvedValue('hashed'),
    compare: jest.fn((cand, hash) => Promise.resolve(cand === 'right'))
  }
}));

const User = (await import('../models/User.js')).default;

describe('User model methods', () => {
  test('comparePassword retourne true/false selon bcrypt.compare', async () => {
    const user = new User({
      username: 'u', firstname: 'f', lastname: 'l', email: 'u@test.com', password: 'hashed-password'
    });
    await expect(user.comparePassword('right')).resolves.toBe(true);
    await expect(user.comparePassword('wrong')).resolves.toBe(false);
  });
});
