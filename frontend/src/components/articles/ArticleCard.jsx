import { Link } from "react-router-dom";

export const ArticleCard = ({ article }) => {
  const getCategoryColor = (category) => {
    const colors = {
      'Technologie': 'bg-blue-100 text-blue-800',
      'Santé': 'bg-green-100 text-green-800',
      'Finance': 'bg-yellow-100 text-yellow-800',
      'Éducation': 'bg-purple-100 text-purple-800',
      'Divertissement': 'bg-pink-100 text-pink-800'
    };
    return colors[category] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className={`border rounded-lg p-4 hover:shadow-lg transition-shadow ${!article.published ? 'bg-gray-50 border-gray-300' : ''}`}>
      <Link to={`/articles/${article._id}`}>
        {!article.published && (
          <div className="mb-2">
            <span className="px-3 py-1 rounded-full text-xs font-medium bg-gray-600 text-white">
              <i className="fas fa-file-alt mr-1"></i>
              Brouillon
            </span>
          </div>
        )}
        
        {article.imageUrl && (
          <img 
            src={article.imageUrl} 
            alt={article.title} 
            className="w-full h-48 object-cover rounded-lg mb-4"
          />
        )}
        
        <div className="flex items-center gap-2 mb-2">
          <span className={`px-3 py-1 rounded-full text-xs font-medium ${getCategoryColor(article.category)}`}>
            {article.category}
          </span>
          <span className="text-sm text-gray-500 flex items-center gap-1">
            <i className="fas fa-eye"></i>
            {article.views || 0} vues
          </span>
        </div>

        <h2 className="text-xl font-semibold mb-2 hover:text-blue-600 transition-colors">
          {article.title}
        </h2>
        
        <p className="text-gray-600 text-sm mb-3 line-clamp-2">
          {article.summary}
        </p>
        
        <div className="text-sm text-gray-500">
          Par <span className="font-medium">{article.author?.username || 'Anonyme'}</span> le {new Date(article.publishedAt || article.createdAt || article.date || article.updatedAt).toLocaleDateString('fr-FR')}
        </div>
      </Link>
    </div>
  );
}