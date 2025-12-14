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
    <div className="mt-4 p-4 border border-gray-200 rounded bg-gray-50">
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
          className="w-full border rounded px-3 py-2 h-24"
        />
        <div className="flex justify-end gap-2">
          {onCancel && <Button type="button" onClick={onCancel} className="px-3 py-1 bg-gray-400 text-white rounded">Annuler</Button>}
          {loading ? <Loader /> : <Button type="submit" className="px-3 py-1 bg-blue-600 text-white rounded">Envoyer</Button>}
        </div>
      </form>
    </div>
  );
};

export default CommentForm;
