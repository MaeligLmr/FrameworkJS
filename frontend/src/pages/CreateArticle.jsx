import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ArticleForm from '../components/articles/ArticleForm';
import articleService from '../services/articleService';
import Button from '../components/common/Button';

export const CreateArticle = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState([]);

  const handleSubmit = async (payload) => {
    setError([]);
    try {
      setLoading(true);
      const body = { ...payload };
      const res = await articleService.createArticle(body);
      const saved = res?.data || res;
      const id = saved?._id || saved?.id || res?.data?._id;
      if (id) navigate(`/articles/${id}`);
      else navigate('/');
    } catch (err) {
      // try to extract validation errors array
      setError(err?.errors);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="p-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-semibold mb-4">Créer un article</h1>
      <Button onClick={() => navigate(-1)} className="text-sm text-blue-600">← Retour</Button>

      <ArticleForm initialValues={{}} onSubmit={handleSubmit} loading={loading} errors={error} />
    </main>
  );
};

export default CreateArticle;