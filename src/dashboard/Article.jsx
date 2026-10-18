import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../api/client";
import { toRichHtml } from "../utils/richText";
import CoverImage from "../components/decor/CoverImage";
import "./Article.css";

const API = "/api/articles";

export default function Article() {
  const { slug } = useParams();

  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadArticle = async () => {
      try {
        const { data } = await api.get(`${API}/manage/${encodeURIComponent(slug)}`);
        setArticle(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadArticle();
  }, [slug]);

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

        <Link to="/adminarticles" className="back-btn">
          ← Back to Articles
        </Link>
      </div>
    );
  }

  return (
    <div className="article-page">
      <div className="article-container">
        <CoverImage
            src={article.hero_image}
            alt={article.image_alt || article.title}
            className="hero-image"
            coverClassName="article-cover"
            category={article.category}
            title={article.title}
          />

        <div className="article-content">
          <span className="article-category">{article.category}</span>

          <h1>{article.title}</h1>

          <div className="article-meta">
            <span>{new Date(article.created_at).toLocaleDateString()}</span>

            <span>{article.views} Views</span>
          </div>

          <div
            className="article-body"
            dangerouslySetInnerHTML={{
              __html: toRichHtml(article.content),
            }}
          />
        </div>
      </div>
    </div>
  );
}
