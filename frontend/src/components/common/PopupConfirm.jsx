/**
 * PopupConfirm — modale de confirmation
 * Affiche un message et deux actions (Annuler / Confirmer), avec option danger.
 * 
 * Props :
 * - message : texte à afficher
 * - onConfirm / onCancel : callbacks des actions
 * - confirmText : libellé du bouton confirmer
 * - danger : applique le style dangereux au bouton confirmer
 */
import Button from './Button';

const PopupConfirm = ({ message, onConfirm, onCancel, confirmText, danger=false }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white relative rounded-lg p-6 max-w-sm mx-auto">
        <div className="absolute top-2 right-2">
        <Button 
        onClick={onCancel} 
        noBorders 
        icon='times'
        rounded>
        </Button>
        </div>
        <p className="my-6">{message}</p>
        <div className="flex justify-end gap-2">
          <Button onClick={onCancel} light>Annuler</Button>
          <Button onClick={onConfirm} danger={danger}>{confirmText}</Button>
        </div>
      </div>
    </div>
  );
};
export default PopupConfirm;