export function getCategoryColor(category) {
  const colors = {
    'Cinéma & Séries': 'bg-red-100 text-red-800',
    'Musique': 'bg-purple-100 text-purple-800',
    'Comics, Manga': 'bg-pink-100 text-pink-800',
    'Internet': 'bg-blue-100 text-[#2F4889]'
  };
  return colors[category] || 'bg-gray-100 text-gray-800';
}

export default { getCategoryColor };