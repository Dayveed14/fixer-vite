import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import api, { getStoredUser } from "../api/client";
import { toRichHtml } from "../utils/richText";
import CoverImage from "./decor/CoverImage";
import ReadingProgress from "./decor/ReadingProgress";
import "../dashboard/Article.css";
import Navbar from "./components/Navbar";
import SEO from "./SEO";
import { SITE_URL } from "../config/seo";

const API = "/api/articles";

// The API doesn't return a dedicated excerpt/meta_description field yet
// (see article.content below) — until it does, this strips the HTML body
// down to a plain-text snippet for the meta description and OG tags.
function excerptFrom(html, maxLen = 160) {
  if (!html) return undefined;
  const text = html
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  if (text.length <= maxLen) return text;
  return text.slice(0, maxLen - 1).trimEnd() + "…";
}

export default function UserArticle() {
  const { slug } = useParams();

  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadArticle = async () => {
      try {
        let data;
        try {
          ({ data } = await api.get(`${API}/${encodeURIComponent(slug)}`));
        } catch (publicError) {
          // Drafts aren't public. Admins can still preview them here.
          if (publicError.status !== 404 || getStoredUser()?.role !== "admin") throw publicError;
          ({ data } = await api.get(`/api/articles/manage/${encodeURIComponent(slug)}`));
        }
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
        <SEO title="Article not found" path="/blog" noindex />
        <h2>Article not found.</h2>

        <Link to="/blog" className="back-btn">
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
        path={`/userarticle/${article.slug}`}
        // Admin previews of drafts must never be indexed.
        noindex={Boolean(article.status) && article.status !== "published"}
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
          mainEntityOfPage: `${SITE_URL}/userarticle/${article.slug}`,
          articleSection: article.category,
          description,
        }}
      />
      <Navbar />
      <ReadingProgress />
      <div className="article-page">
        <Link to="/blog" className="back-btn">
          ← Back to Articles
        </Link>

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
    </div>
  );
}
