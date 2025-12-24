/**
 * ArticleList — Liste d'articles avec Masonry
 * Affiche les cartes `ArticleCard` dans une grille responsive en colonnes.
 */
import { ArticleCard } from "./ArticleCard";
import Masonry from "react-masonry-css";

const ArticleList = ({ articles }) => {
  return (
    <Masonry
  breakpointCols={{ default: 3, 768: 2, 640: 1 }}
  className="flex gap-4"
  columnClassName="flex flex-col gap-4"
>
  {articles.map(article => (
    <ArticleCard key={article._id} article={article} />
  ))}
</Masonry>
  );
};

export default ArticleList;
