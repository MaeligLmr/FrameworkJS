import Button from '../common/Button';
import Loader from '../common/Loader';

/**
 * CommentForm - uncontrolled form for posting or editing a comment
 * Props:
 * - initialValue: initial comment text (for editing)
 * - onSubmit: async function(text) => void
 * - loading: boolean
 * - error: string or array
 * - onCancel: function to call on cancel
 */
const CommentForm = ({ initialValue = '', onSubmit, loading = false, error = null, onCancel }) => {
  const handleSubmit = async (e) => {
    e.preventDefault();
    const text = e.target.text.value.trim();
    if (!text) return;
    if (typeof onSubmit === 'function') await onSubmit(text);
  };

  return (
    <div className="p-4">
      {error && (
        <div className="mb-2 p-2 border border-red-600 bg-red-100 text-red-700">
          {Array.isArray(error) ? error[0] : error}
        </div>
      )}
      <form onSubmit={handleSubmit} className="space-y-2">
        <textarea
          name="text"
          defaultValue={initialValue}
          required
          placeholder="Ajouter un commentaire..."
          className="w-full border rounded-lg px-3 py-2 border-gray-300 bg-white focus:border-[#4062BB] focus:outline-none focus:ring-1 focus:ring-[#4062BB] transition-all"
        />
        <div className="flex justify-end gap-2">
          {onCancel && <Button type="button" onClick={onCancel} light>Annuler</Button>}
          {loading ? <Loader /> : <Button type="submit">Envoyer</Button>}
        </div>
      </form>
    </div>
  );
};

export default CommentForm;
