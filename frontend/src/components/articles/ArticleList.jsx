import { ArticleCard } from "./ArticleCard";

const ArticleList = ({ articles }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {articles.map((article) => (
        <div key={article._id || article.id}>
          <ArticleCard article={article} />
        </div>
      ))}
    </div>
  );
};

export default ArticleList;
