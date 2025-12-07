const PopupConfirm = ({ message, onConfirm, onCancel, confirmText }) => {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/50">
      <div className="bg-white relative rounded-lg p-6 max-w-sm mx-auto">
        <button onClick={onCancel} className="text-black rounded-full p-1 hover:bg-gray-50 absolute top-2 right-2 align-middle w-8 h-8"><i className="fas fa-times"></i></button>
        <p className="my-6">{message}</p>
        <div className="flex justify-end">
          <button onClick={onCancel} className="mr-2 px-4 py-2 bg-gray-300 hover:bg-gray-400 rounded">Annuler</button>
          <button onClick={onConfirm} className={"px-4 py-2 text-white rounded " + (confirmText == "Supprimer" ? "bg-red-600 hover:bg-red-700" : "bg-blue-600 hover:bg-blue-700")}>{confirmText}</button>
        </div>
      </div>
    </div>
  );
};
export default PopupConfirm;