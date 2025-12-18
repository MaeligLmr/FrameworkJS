import { jest } from '@jest/globals';

// Helper to setup mocks and import the module fresh
async function loadWithMulterBehavior(errorForImage = null, errorForAvatar = null) {
  await jest.unstable_mockModule('multer', () => ({
    __esModule: true,
    default: () => ({
      single: (fieldName) => (req, res, cb) => {
        const err = fieldName === 'avatar' ? errorForAvatar : errorForImage;
        cb(err);
      }
    })
  }));
  await jest.unstable_mockModule('multer-storage-cloudinary', () => ({
    __esModule: true,
    CloudinaryStorage: class {}
  }));
  await jest.unstable_mockModule('cloudinary', () => ({
    __esModule: true,
    v2: { config: jest.fn() }
  }));
  const mod = await import('../config/cloudinary.js');
  return mod;
}

const createRes = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

describe('config/cloudinary upload wrappers', () => {
  beforeEach(() => {
    jest.resetModules();
    jest.clearAllMocks();
  });

  test('uploadImage success path calls next()', async () => {
    const { uploadImage } = await loadWithMulterBehavior(null, null);
    const mw = uploadImage('image');
    const req = {};
    const res = createRes();
    const next = jest.fn();

    await mw(req, res, next);

    expect(next).toHaveBeenCalled();
    expect(res.status).not.toHaveBeenCalled();
  });

  test('uploadAvatarImage error path returns 400', async () => {
    const { uploadAvatarImage } = await loadWithMulterBehavior(null, new Error('multer avatar error'));
    const mw = uploadAvatarImage('avatar');
    const req = {};
    const res = createRes();
    const next = jest.fn();

    await mw(req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalled();
    expect(next).not.toHaveBeenCalled();
  });
});
