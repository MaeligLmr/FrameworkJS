import { jest } from '@jest/globals';

const mockUserModel = {
  findById: jest.fn(),
  findByIdAndUpdate: jest.fn()
};

await jest.unstable_mockModule('../models/User.js', () => ({
  __esModule: true,
  default: mockUserModel
}));

const { getUserProfile, updateUserProfile, changePassword } = await import('../controller/userController.js');
const { AppError } = await import('../utils/AppError.js');

const createRes = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

describe('userController', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('getUserProfile renvoie le profil lorsque l utilisateur est trouvé', async () => {
    const req = { user: { _id: 'u1' } };
    const res = createRes();
    const next = jest.fn();
    mockUserModel.findById.mockReturnValue({
      select: jest.fn().mockResolvedValue({ _id: 'u1', username: 'john' })
    });

    await getUserProfile(req, res, next);

    expect(mockUserModel.findById).toHaveBeenCalledWith('u1');
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ success: true, data: { _id: 'u1', username: 'john' } });
    expect(next).not.toHaveBeenCalled();
  });

  test('getUserProfile passe une AppError si non authentifié', async () => {
    const req = { user: null };
    const res = createRes();
    const next = jest.fn();

    await getUserProfile(req, res, next);

    expect(next).toHaveBeenCalledWith(expect.any(AppError));
    const err = next.mock.calls[0][0];
    expect(err.statusCode).toBe(401);
  });

  test('changePassword échoue si les mots de passe ne correspondent pas', async () => {
    const req = { user: { _id: 'u1' }, body: { currentPassword: 'old', newPassword: 'abc', confirmPassword: 'xyz' } };
    const res = createRes();
    const next = jest.fn();

    await changePassword(req, res, next);

    expect(next).toHaveBeenCalledWith(expect.any(AppError));
    const err = next.mock.calls[0][0];
    expect(err.statusCode).toBe(400);
  });

  test('changePassword met à jour le mot de passe quand les données sont valides', async () => {
    const userDoc = {
      comparePassword: jest.fn().mockResolvedValue(true),
      save: jest.fn()
    };
    mockUserModel.findById.mockResolvedValue(userDoc);
    const req = { user: { _id: 'u1' }, body: { currentPassword: 'old', newPassword: 'newpass', confirmPassword: 'newpass' } };
    const res = createRes();
    const next = jest.fn();

    await changePassword(req, res, next);

    expect(mockUserModel.findById).toHaveBeenCalledWith('u1');
    expect(userDoc.comparePassword).toHaveBeenCalledWith('old');
    expect(userDoc.save).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ success: true, message: 'Mot de passe changé avec succès' });
  });

  test('updateUserProfile met à jour et renvoie le profil', async () => {
    const req = { user: { _id: 'u1' }, body: { username: 'newName' } };
    const res = createRes();
    const next = jest.fn();
    mockUserModel.findById.mockResolvedValue({ _id: 'u1' });
    mockUserModel.findByIdAndUpdate.mockReturnValue({
      select: jest.fn().mockResolvedValue({ _id: 'u1', username: 'newName' })
    });

    await updateUserProfile(req, res, next);

    expect(mockUserModel.findById).toHaveBeenCalledWith('u1');
    expect(mockUserModel.findByIdAndUpdate).toHaveBeenCalledWith('u1', { username: 'newName' }, { new: true, runValidators: true });
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ success: true, message: 'Profil mis à jour avec succès', data: { _id: 'u1', username: 'newName' } });
  });
});
