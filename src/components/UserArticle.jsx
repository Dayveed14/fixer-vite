import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";
import "../dashboard/Article.css";
import Navbar from "./components/Navbar";

const API = "https://fixer-backend-7mng.onrender.com/api/articles";

export default function UserArticle() {
  const { id } = useParams();

  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadArticle = async () => {
      try {
        const { data } = await axios.get(`${API}/${id}`);
        setArticle(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadArticle();
  }, [id]);

  if (loading) {
    return (
      <div className="article-page">
        <h2>Loading article...</h2>
      </div>
    );
  }

  if (!article) {
    return (
      <div className="article-page">
        <h2>Article not found.</h2>

        <Link to="/knowledgebase" className="back-btn">
          ← Back to Articles
        </Link>
      </div>
    );
  }

  return (
<div>
  <Navbar />
      <div className="article-page">

      <div className="article-container">

        <img
          src={`http://localhost:4000/uploads/articles/${article.hero_image}`}
          alt={article.title}
          className="hero-image"
        />

        <div className="article-content">

          <span className="article-category">
            {article.category}
          </span>

          <h1>{article.title}</h1>

          <div className="article-meta">
            <span>
              {new Date(article.created_at).toLocaleDateString()}
            </span>

            <span>{article.views} Views</span>
          </div>

          <div
            className="article-body"
            dangerouslySetInnerHTML={{
              __html: article.content,
            }}
          />

        </div>

      </div>

    </div>
</div>

  );
}