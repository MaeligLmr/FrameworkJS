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
discrete=false }) => {
  let baseClasses = 'cursor-pointer transition-all disabled:opacity-50 disabled:cursor-not-allowed';
  
  // Variante tab (onglets avec bordure inférieure)
  if (tab) {
    baseClasses += ' px-4 py-2';
    if (active) {
      baseClasses += ' border-b-[#4062BB] border-b-2';
    } else {
      baseClasses += ' text-gray-700 hover:border-b-gray-300 border-b-2 border-transparent';
    }
  } else if (!noBorders && !light && !danger && !discrete) {
    baseClasses += ' p-2 rounded-lg text-white bg-[#4062BB] hover:bg-[#2A407A]';
  }
  
  // Variante light (bouton blanc avec bordure)
  if (light) {
    baseClasses += ' p-2 rounded-lg bg-white border border-[#4062BB] text-[#4062BB] hover:bg-[#F1F3F9]';
  }
  
  // Variante noBorders (bouton sans bordure ni fond)
  if (noBorders && !light && !danger && !discrete) {
    baseClasses += ' p-2 rounded-lg text-[#4062BB] hover:text-[#2A407A] hover:bg-gray-100';
  }

  // Variante discret (texte simple avec hover léger)
  if (discrete) {
    baseClasses += ' p-2 text-gray-500 hover:text-gray-900';
  }

  if (noBorders && danger) {
    baseClasses += ' p-2 rounded-lg text-red-600 hover:text-red-800 hover:bg-gray-100';
  }
  
  // Variante danger (rouge)
  if (danger && !tab && !noBorders) {
    baseClasses += ' text-red-600 hover:bg-gray-100 border border-red-600 rounded-lg p-2';
  }
  
  // Ajouter flex si icon est présent
  if (icon) {
    baseClasses += ' flex items-center gap-2';
  }

  if (full) {
    baseClasses += ' w-full';
  }
  return (
    <button type={type} onClick={onClick} className={baseClasses} disabled={disabled}>
      {icon && <i className={`fas fa-${icon}`}></i>}
      {children}
    </button>
  );
};

export default Button;