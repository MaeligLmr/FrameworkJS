import Input from '../common/Input';
import { Button } from '../common/Button';
import Loader from '../common/Loader';

const CATEGORIES = ['Technologie', 'Santé', 'Finance', 'Éducation', 'Divertissement'];

/**
 * Uncontrolled ArticleForm
 * Props:
 * - initialValues: { title, category, excerpt, content }
 * - onSubmit: async function(payload) => void
 * - loading: boolean
 * - errors: array|string
 */
const ArticleForm = ({ initialValues = {}, onSubmit, loading = false, errors = [] }) => {
  const handleSubmit = async (e) => {
    e.preventDefault();
    const form = e.target;
    const file = form.image?.files?.[0];
    const payload = {
      title: form.title.value,
      category: form.category.value,
      content: form.content.value,
      image: file || undefined,
    };
    if (typeof onSubmit === 'function') await onSubmit(payload);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {Array.isArray(errors) && errors.length > 0 && (
        <div>
          {errors.map((err, i) => (
            <div key={i} className="mb-2 p-2 border border-red-600 bg-red-100 text-red-700">{err}</div>
          ))}
        </div>
      )}

      <div>
        <label className="block text-sm font-medium mb-1">Titre</label>
        <Input name="title" defaultValue={initialValues.title || ''} required className="w-full border rounded px-3 py-2" />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Catégorie</label>
        <select name="category" defaultValue={initialValues.category || ''} required className="w-full border rounded px-3 py-2">
          <option value="">-- Choisir --</option>
          {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Contenu</label>
        <textarea name="content" defaultValue={initialValues.content || ''} required className="w-full border rounded px-3 py-2 h-48" />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Image</label>
        <input type="file" name="image" accept="image/*" className="w-full" />
      </div>

      <div>
        {loading ? <Loader /> : <Button type="submit" className="w-full bg-green-600 text-white py-2 rounded">{initialValues.title ? 'Mettre à jour' : 'Publier'}</Button>}
      </div>
    </form>
  );
};

export default ArticleForm;
