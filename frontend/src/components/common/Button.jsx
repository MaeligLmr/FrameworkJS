/**
 * Button — composant bouton polyvalent
 * 
 * Props :
 * - type : type HTML (button, submit)
 * - icon : nom d'icône Font Awesome (ex: 'trash')
 * - light : style clair (fond blanc, bordure)
 * - noBorders : style lien (sans fond ni bordure)
 * - danger : style d'action destructive (rouge)
 * - tab : style onglet (bordure inférieure)
 * - active : état actif pour onglet
 * - full : largeur 100%
 * - discrete : style discret (texte gris)
 * - rounded : bouton rond (icône centrée)
 */
const Button = ({ children, 
  onClick, 
  type = 'button', 
  icon, 
  light = false, 
  noBorders = false, 
  danger = false, 
  disabled = false, 
  tab = false, 
  active = false, 
  full = false,
discrete=false,
rounded=false }) => {
  let baseClasses = 'cursor-pointer transition-all disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap';
  
  // Variante tab (onglets avec bordure inférieure)
  if (tab) {
    baseClasses += ' px-4 py-2';
    if (active) {
      baseClasses += ' border-b-[#4062BB] border-b-2';
    } else {
      baseClasses += ' text-gray-700 hover:border-b-gray-300 border-b-2 border-transparent';
    }
  } else if (!noBorders && !light && !danger && !discrete) {
    baseClasses += ' p-2 text-white bg-[#4062BB] hover:bg-[#2A407A]';
  }
  
  // Variante light (bouton blanc avec bordure)
  if (light) {
    baseClasses += ' p-2 bg-white border border-[#4062BB] text-[#4062BB] hover:bg-[#F1F3F9]';
  }
  
  // Variante noBorders (bouton sans bordure ni fond)
  if (noBorders && !light && !danger && !discrete) {
    baseClasses += ' p-2 text-[#4062BB] hover:text-[#2A407A] hover:bg-gray-100';
  }

  // Variante discret (texte simple avec hover léger)
  if (discrete) {
    baseClasses += ' p-2 text-gray-500 hover:text-gray-900';
  }

  if (noBorders && danger) {
    baseClasses += ' p-2 text-red-600 hover:text-red-800 hover:bg-gray-100';
  }

  if (light && danger) {
    baseClasses += ' p-2 bg-white border border-red-600 text-red-600 hover:bg-red-50';
  }
  
  // Variante danger (rouge)
  if (danger && !tab && !noBorders && !light) {
    baseClasses += ' text-white bg-red-600 hover:bg-red-700 p-2';
  }
  
  // Ajouter flex si icon est présent
  if (icon) {
    baseClasses += ' flex items-center gap-2';
  }

  if (full) {
    baseClasses += ' w-full';
  }

  if (rounded) {
    baseClasses += ' rounded-full h-10 w-10 flex items-center justify-center';
  } else if (!tab) {
    baseClasses += ' rounded-lg';
  }
  return (
    <button type={type} onClick={onClick} className={baseClasses} disabled={disabled}>
      {icon && <i className={`fas fa-${icon}`}></i>}
      {children}
    </button>
  );
};

export default Button;