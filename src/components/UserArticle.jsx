import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";
import "../dashboard/Article.css";
import Navbar from "./components/Navbar";
import SEO from "./SEO";
import { SITE_URL } from "../config/seo";

const API = "https://fixer-backend-7mng.onrender.com/api/articles";

// The API doesn't return a dedicated excerpt/meta_description field yet
// (see article.content below) — until it does, this strips the HTML body
// down to a plain-text snippet for the meta description and OG tags.
function excerptFrom(html, maxLen = 160) {
  if (!html) return undefined;
  const text = html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
  if (text.length <= maxLen) return text;
  return text.slice(0, maxLen - 1).trimEnd() + "…";
}

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

  const description = excerptFrom(article.content);

  return (
<div>
  <SEO
    title={article.title}
    description={description}
    path={`/userarticle/${article.id}`}
    image={article.hero_image}
    type="article"
    structuredData={{
      "@context": "https://schema.org",
      "@type": "Article",
      headline: article.title,
      image: article.hero_image ? [article.hero_image] : undefined,
      datePublished: article.created_at,
      dateModified: article.updated_at || article.created_at,
      author: { "@type": "Organization", name: "Fixer" },
      publisher: {
        "@type": "Organization",
        name: "Fixer",
        logo: { "@type": "ImageObject", url: `${SITE_URL}/logo.png` },
      },
      mainEntityOfPage: `${SITE_URL}/userarticle/${article.id}`,
      articleSection: article.category,
      description,
    }}
  />
  <Navbar />
      <div className="article-page">

      <div className="article-container">

        <img
          src={article.hero_image}
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