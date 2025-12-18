import { jest } from '@jest/globals';

const ArticleMock = { findById: jest.fn() };
const CommentMock = {
  create: jest.fn(),
  countDocuments: jest.fn(),
  find: jest.fn(),
  findApprovedByArticle: jest.fn(),
  findByIdAndUpdate: jest.fn(),
  findByIdAndDelete: jest.fn()
};

await jest.unstable_mockModule('../models/Article.js', () => ({
  __esModule: true,
  default: ArticleMock
}));
await jest.unstable_mockModule('../models/Comment.js', () => ({
  __esModule: true,
  default: CommentMock
}));

const {
  createComment,
  getCommentsByArticle,
  getApprovedComments,
  updateComment,
  deleteComment
} = await import('../controller/commentController.js');
const { AppError } = await import('../utils/AppError.js');

const createRes = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

describe('commentController', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('createComment crée un commentaire quand article publié', async () => {
    ArticleMock.findById.mockResolvedValue({ _id: 'a1', published: true });
    CommentMock.create.mockResolvedValue({ _id: 'c1', content: 'Hello' });
    const req = { params: { articleId: 'a1' }, body: { content: 'Hello' }, user: { _id: 'u1' } };
    const res = createRes();
    const next = jest.fn();

    await createComment(req, res, next);

    expect(CommentMock.create).toHaveBeenCalledWith({
      content: 'Hello',
      author: 'u1',
      article: 'a1',
      comment: null
    });
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({ success: true, data: { _id: 'c1', content: 'Hello' } });
    expect(next).not.toHaveBeenCalled();
  });

  test('createComment refuse si article non publié', async () => {
    ArticleMock.findById.mockResolvedValue({ _id: 'a1', published: false });
    const req = { params: { articleId: 'a1' }, body: { content: 'Hello' }, user: { _id: 'u1' } };
    const res = createRes();
    const next = jest.fn();

    await createComment(req, res, next);

    expect(next).toHaveBeenCalledWith(expect.any(AppError));
    const err = next.mock.calls[0][0];
    expect(err.statusCode).toBe(403);
  });

  test('getCommentsByArticle retourne les commentaires peuplés', async () => {
    ArticleMock.findById.mockResolvedValue({ _id: 'a1' });
    const comments = [
      { _id: 'c1', populateResponses: jest.fn().mockResolvedValue() },
      { _id: 'c2', populateResponses: jest.fn().mockResolvedValue() }
    ];
    CommentMock.find.mockReturnValue({ sort: jest.fn().mockResolvedValue(comments) });
    const req = { params: { articleId: 'a1' } };
    const res = createRes();
    const next = jest.fn();

    await getCommentsByArticle(req, res, next);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ success: true, count: 2, data: comments });
  });

  test('getApprovedComments renvoie seulement approuvés', async () => {
    ArticleMock.findById.mockResolvedValue({ _id: 'a1' });
    CommentMock.findApprovedByArticle.mockResolvedValue([{ _id: 'c1', approved: true }]);
    const req = { params: { articleId: 'a1' } };
    const res = createRes();
    const next = jest.fn();

    await getApprovedComments(req, res, next);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ success: true, count: 1, data: [{ _id: 'c1', approved: true }] });
  });

  test('updateComment met à jour le commentaire', async () => {
    CommentMock.findByIdAndUpdate.mockResolvedValue({ _id: 'c1', content: 'upd' });
    const req = { params: { commentId: 'c1' }, body: { content: 'upd' } };
    const res = createRes();
    const next = jest.fn();

    await updateComment(req, res, next);

    expect(CommentMock.findByIdAndUpdate).toHaveBeenCalledWith('c1', { content: 'upd' }, { new: true, runValidators: true });
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ success: true, data: { _id: 'c1', content: 'upd' } });
  });

  test('deleteComment retourne 204 quand suppression', async () => {
    CommentMock.findByIdAndDelete.mockResolvedValue({ _id: 'c1' });
    const req = { params: { commentId: 'c1' } };
    const res = createRes();
    const next = jest.fn();

    await deleteComment(req, res, next);

    expect(res.status).toHaveBeenCalledWith(204);
    expect(res.json).toHaveBeenCalledWith({ success: true, data: null });
  });

  test('getCommentsByArticle appelle next 404 quand article manquant', async () => {
    ArticleMock.findById.mockResolvedValue(null);
    const req = { params: { articleId: 'missing' } };
    const res = createRes();
    const next = jest.fn();

    await getCommentsByArticle(req, res, next);

    expect(next).toHaveBeenCalled();
    const err = next.mock.calls[0][0];
    expect(err.statusCode).toBe(404);
  });

  test('deleteComment appelle next 404 quand commentaire manquant', async () => {
    CommentMock.findByIdAndDelete.mockResolvedValue(null);
    const req = { params: { commentId: 'missing' } };
    const res = createRes();
    const next = jest.fn();

    await deleteComment(req, res, next);

    expect(next).toHaveBeenCalled();
    const err = next.mock.calls[0][0];
    expect(err.statusCode).toBe(404);
  });
});
