import React from "react";
import { getArticleById } from "../api/article";
import { useParams } from "react-router-dom";
import ArticleViewPage from "../components/ArticleViewPage.jsx";

const Article = () => {
  const [article, setArticle] = React.useState(null);
  const { id: article_id } = useParams();

  React.useEffect(() => {
    const fetchArticle = async () => {
      console.log("Fetching article", article_id);
      try {
        const response = await getArticleById(article_id);
        setArticle(response.data.article);
        console.log(response.data.article);
      } catch (error) {
        console.error("Failed to fetch article:", error);
      }
    };

    if (article_id) fetchArticle();
  }, [article_id]);

  return article ? (
    <ArticleViewPage article={article} />
  ) : (
    <div className="text-center p-10 text-secondary">Article not found</div>
  );
};

export default Article;
