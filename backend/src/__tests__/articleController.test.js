import { jest } from '@jest/globals';

const ArticleMock = jest.fn();
ArticleMock.findById = jest.fn();
ArticleMock.find = jest.fn();
ArticleMock.countDocuments = jest.fn();
ArticleMock.findByIdAndUpdate = jest.fn();
ArticleMock.findByIdAndDelete = jest.fn();

await jest.unstable_mockModule('../models/Article.js', () => ({
  __esModule: true,
  default: ArticleMock
}));

const {
  createArticle,
  getArticleById,
  getAllArticles,
  publishArticle,
  deleteArticle
} = await import('../controller/articleController.js');

const createRes = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

describe('articleController', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('createArticle retourne 201 et le message de publication', async () => {
    ArticleMock.mockImplementation((data) => ({
      ...data,
      save: jest.fn().mockResolvedValue({ ...data, _id: 'a1', published: true })
    }));

    const req = { body: { title: 'Titre', content: 'Contenu suffisant pour valider', category: 'Science', published: true }, user: { _id: 'u1' } };
    const res = createRes();

    await createArticle(req, res);

    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({ success: true, message: 'Article publié avec succès', data: expect.objectContaining({ _id: 'a1', title: 'Titre' }) });
  });

  test('getArticleById refuse l accès si brouillon et utilisateur différent', async () => {
    ArticleMock.findById.mockResolvedValue({
      _id: 'a1',
      published: false,
      author: { _id: 'other' },
      incrementViews: jest.fn()
    });
    const req = { params: { id: 'a1' }, user: { id: 'u1' } };
    const res = createRes();

    await getArticleById(req, res);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({ message: "Accès refusé. Cet article n'est pas publié." });
  });

  test('getAllArticles retourne 403 si showDrafts sans user', async () => {
    const req = { query: { showDrafts: 'true' }, user: null };
    const res = createRes();

    await getAllArticles(req, res);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({ message: 'Accès refusé. Authentification requise pour voir vos brouillons.' });
  });

  test('publishArticle publie et renvoie l article', async () => {
    const updated = { _id: 'a1', published: true };
    ArticleMock.findById.mockResolvedValue({ publish: jest.fn().mockResolvedValue(updated) });
    const req = { params: { id: 'a1' } };
    const res = createRes();

    await publishArticle(req, res);

    expect(ArticleMock.findById).toHaveBeenCalledWith('a1');
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(updated);
  });

  test('deleteArticle renvoie 200 si suppression', async () => {
    ArticleMock.findByIdAndDelete.mockResolvedValue({ _id: 'a1' });
    const req = { params: { id: 'a1' } };
    const res = createRes();

    await deleteArticle(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ message: 'Article supprimé avec succès' });
  });

  test('unpublishArticle dépublie et renvoie l article', async () => {
    const updated = { _id: 'a1', published: false };
    ArticleMock.findById.mockResolvedValue({ unpublish: jest.fn().mockResolvedValue(updated) });
    const req = { params: { id: 'a1' } };
    const res = createRes();

    const { unpublishArticle } = await import('../controller/articleController.js');
    await unpublishArticle(req, res);

    expect(ArticleMock.findById).toHaveBeenCalledWith('a1');
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(updated);
  });

  test('updateArticle met à jour image et extension', async () => {
    const updatedDoc = { _id: 'a1', imageUrl: 'path', imageName: 'pic.png', imageExtension: 'png', save: jest.fn() };
    ArticleMock.findByIdAndUpdate.mockResolvedValue(updatedDoc);
    const req = { params: { id: 'a1' }, body: { title: 't' }, file: { path: 'path', originalname: 'pic.png' } };
    const res = createRes();

    const { updateArticle } = await import('../controller/articleController.js');
    await updateArticle(req, res);

    expect(ArticleMock.findByIdAndUpdate).toHaveBeenCalledWith('a1', expect.objectContaining({ imageUrl: 'path', imageName: 'pic.png', imageExtension: 'png' }), { new: true, runValidators: true });
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(updatedDoc);
  });

  test('getArticleById renvoie 404 quand non trouvé', async () => {
    ArticleMock.findById.mockResolvedValue(null);
    const req = { params: { id: 'missing' } };
    const res = createRes();

    await getArticleById(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ message: 'Article non trouvé' });
  });

  test('updateArticle renvoie 404 quand non trouvé', async () => {
    ArticleMock.findByIdAndUpdate.mockResolvedValue(null);
    const req = { params: { id: 'missing' }, body: { title: 't' } };
    const res = createRes();

    const { updateArticle } = await import('../controller/articleController.js');
    await updateArticle(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ message: 'Article non trouvé' });
  });
});
