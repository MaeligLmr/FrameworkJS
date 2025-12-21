import Input from '../common/Input';
import Button from '../common/Button';
import Loader from '../common/Loader';
import Select from 'react-select';

const CATEGORIES = [
  { value: 'Cinéma & Séries', label: 'Cinéma & Séries' },
  { value: 'Musique', label: 'Musique' },
  { value: 'Comics, Manga', label: 'Comics, Manga' },
  { value: 'Internet', label: 'Internet' }
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
          styles={{
            control: (base, state) => ({
              ...base,
              borderRadius: '0.5rem',
              minHeight: '40px',
              borderColor: state.isFocused ? '#4062BB' : base.borderColor,
              boxShadow: state.isFocused ? '0 0 0 1px #4062BB' : base.boxShadow,
              '&:hover': {
                borderColor: state.isFocused ? '#4062BB' : base.borderColor
              }
            }),
            option: (base, state) => ({
              ...base,
              backgroundColor: state.isSelected ? '#4062BB' : state.isFocused ? '#E8EFFF' : base.backgroundColor,
              color: state.isSelected ? 'white' : state.isFocused ? '#4062BB' : base.color,
              cursor: 'pointer',
              '&:hover': {
                backgroundColor: state.isSelected ? '#4062BB' : '#E8EFFF',
                color: state.isSelected ? 'white' : '#4062BB'
              }
            })
          }}
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Contenu <span className="text-red-500">*</span></label>
        <textarea name="content" defaultValue={initialValues.content || ''} required className="w-full border rounded-lg px-3 py-2 h-48 border-gray-300 bg-white focus:border-[#4062BB] focus:outline-none focus:ring-1 focus:ring-[#4062BB] transition-all" />
      </div>

      <div>
        <Input type="file" name="image" accept="image/*" label="Image" fileName={initialValues.imageName} />
      </div>

      <div className="flex flex-col-reverse md:flex-row gap-4">
        {loading ? (
          <Loader />
        ) : (
          <>
            <Button 
              type="button" 
              onClick={handleSubmitDraft} 
              light
              full
            >
              Enregistrer en brouillon
            </Button>
            <Button 
              type="submit" 
              full
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
