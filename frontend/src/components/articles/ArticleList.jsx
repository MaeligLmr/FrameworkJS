import { ArticleCard } from "./ArticleCard";

const ArticleList = ({ articles }) => {
  return (
    <ul className="space-y-4">
      {articles.map((article) => (
        <li key={article._id || article.id} className="">
          <ArticleCard article={article} />
        </li>
      ))}
    </ul>
  );
};

export default ArticleList;
