const PopupForm = ({ title, onClose, children, isOpen }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50" onClick={onClose}>
      <div className="bg-white relative rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <button 
          onClick={onClose} 
          className="text-black rounded-full p-1 hover:bg-gray-50 absolute top-2 right-2 align-middle w-8 h-8"
          type="button"
        >
          <i className="fas fa-times"></i>
        </button>
        {title && <h2 className="text-2xl font-bold mb-4">{title}</h2>}
        {children}
      </div>
    </div>
  );
};

export default PopupForm;
