import Button from './Button';

const PopupForm = ({ title, onClose, children, isOpen }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50" onClick={onClose}>
      <div className="bg-white relative rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className='absolute top-2 right-2'>
        <Button 
          onClick={onClose} 
          noBorders
          type="button"
          icon='times'
        >
        </Button></div>
        {title && <h2 className="text-2xl font-bold mb-4">{title}</h2>}
        {children}
      </div>
    </div>
  );
};

export default PopupForm;
