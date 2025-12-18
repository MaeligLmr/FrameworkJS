import Input from '../common/Input';
import Button from '../common/Button';
import Loader from '../common/Loader';
import Select from 'react-select';

const CATEGORIES = [
  { value: 'Cinéma & Séries', label: 'Cinéma & Séries' },
  { value: 'Musique', label: 'Musique' },
  { value: 'Jeux vidéo', label: 'Jeux vidéo' },
  { value: 'Comics, Manga & Animation', label: 'Comics, Manga & Animation' },
  { value: 'Culture Internet & Tendances', label: 'Culture Internet & Tendances' }
];

/**
 * Uncontrolled ArticleForm
 * Props:
 * - initialValues: { title, category, excerpt, content, published }
 * - onSubmit: async function(payload, isDraft) => void
 * - loading: boolean
 * - errors: array|string
 */
const ArticleForm = ({ initialValues = {}, onSubmit, loading = false, errors = [] }) => {
  const handleSubmit = async (e) => {
    e.preventDefault();
    const form = e.target;
    const file = form.image?.files?.[0];
    console.log(form)
    const payload = {
      title: form.title.value,
      category: form.category.value,
      content: form.content.value,
      image: file || undefined,
      published: true
    };
    if (typeof onSubmit === 'function') await onSubmit(payload);
  };

  const handleSubmitDraft = async (e) => {
    e.preventDefault();
    const form = e.currentTarget?.form;
    if (!form) return;
    const file = form.image?.files?.[0];
    const payload = {
      title: form.title.value,
      category: form.category.value,
      content: form.content.value,
      image: file || undefined,
      published: false
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
        <Input name="title" defaultValue={initialValues.title || ''} label="Titre" required />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Catégorie <span className="text-red-500">*</span></label>
        <Select
          name="category"
          options={CATEGORIES}
          defaultValue={CATEGORIES.find(cat => cat.value === initialValues.category) || null}
          required
          className='rounded-lg'
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Contenu <span className="text-red-500">*</span></label>
        <textarea name="content" defaultValue={initialValues.content || ''} required className="w-full border rounded-lg px-3 py-2 h-48 border-gray-300" />
      </div>

      <div>
        <Input type="file" name="image" accept="image/*" label="Image" fileName={initialValues.imageName} />
      </div>

      <div className="flex gap-2">
        {loading ? (
          <Loader />
        ) : (
          <>
            <Button 
              type="button" 
              onClick={handleSubmitDraft} 
              className="flex-1 bg-gray-600 text-white py-2 rounded-lg hover:bg-gray-700"
            >
              Enregistrer en brouillon
            </Button>
            <Button 
              type="submit" 
              className="flex-1 bg-green-600 text-white py-2 rounded-lg hover:bg-green-700"
            >
              {initialValues.title ? 'Mettre à jour' : 'Publier'}
            </Button>
          </>
        )}
      </div>
    </form>
  );
};

export default ArticleForm;
