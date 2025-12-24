/**
 * ArticleCard — Carte d'article
 * Affiche image, catégorie, vues, titre, résumé et auteur.
 * Indique visuellement l'état brouillon.
 */
import { Link } from "react-router-dom";
import { getCategoryColor } from "../../utils/helpers";
import Avatar from "../profile/avatar";

export const ArticleCard = ({ article }) => {

  return (
    <div className={`border rounded-lg p-4 border-[#2F4889] bg-white hover:bg-[#f1f3f9e0] ${!article.published ? 'bg-gray-100' : ''}`}>
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

        <h2 className="text-xl font-semibold mb-2 hover:text-[#4062BB] transition-colors">
          {article.title}
        </h2>
        
        <p className="text-gray-600 text-sm mb-3 line-clamp-2">
          {article.summary}
        </p>
        
        <div className="text-sm text-gray-500 flex gap-2 items-center">
         <Avatar user={article.author} dimensions={6} hoverDisabled={true} showName={true}/> le {new Date(article.publishedAt || article.createdAt || article.date || article.updatedAt).toLocaleDateString('fr-FR')}
        </div>
      </Link>
    </div>
  );
}