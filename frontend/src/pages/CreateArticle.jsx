import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ArticleForm from '../components/articles/ArticleForm';
import articleService from '../services/articleService';
import useAuth from '../hooks/useAuth';

export const CreateArticle = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState([]);

  const handleSubmit = async (payload) => {
    setError([]);
    try {
      setLoading(true);
      const body = { ...payload };
      if (user?._id) body.author = user._id;
      const res = await articleService.createArticle(body);
      const saved = res?.data || res;
      const id = saved?._id || saved?.id || res?.data?._id;
      if (id) navigate(`/articles/${id}`);
      else navigate('/');
    } catch (err) {
      // try to extract validation errors array
      setError(err?.errors || err?.message ? [err.message || JSON.stringify(err)] : [JSON.stringify(err)]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="p-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-semibold mb-4">Créer un article</h1>
      <ArticleForm initialValues={{}} onSubmit={handleSubmit} loading={loading} errors={error} />
    </main>
  );
};

export default CreateArticle;