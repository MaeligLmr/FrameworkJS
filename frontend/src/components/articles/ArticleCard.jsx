import { Link } from "react-router-dom";

export const ArticleCard = ({ article }) => {
  return (
    <div className="border rounded-lg p-4">
        <Link to={`/articles/${article._id}`}>
        <h2 className="text-xl font-semibold mb-2">{article.title}</h2>
        <div className="text-sm text-gray-500 mt-2">
            Par {article.author?.username || article.author || 'Anonyme'} le {new Date(article.publishedAt || article.createdAt || article.date || article.updatedAt).toLocaleDateString()}
        </div>
        </Link>
    </div>
  );
}