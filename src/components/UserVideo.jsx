import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";
import "../dashboard/Article.css";
import Navbar from "./components/Navbar";
import SEO from "./SEO";
import { SITE_URL } from "../config/seo";

const API = "https://fixer-backend-7mng.onrender.com/api/diy-videos";

function excerptFrom(html, maxLen = 160) {
  if (!html) return undefined;
  const text = html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
  if (text.length <= maxLen) return text;
  return text.slice(0, maxLen - 1).trimEnd() + "…";
}

export default function UserVideo() {
  const { slug } = useParams();

  const [video, setVideo] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadVideo = async () => {
      try {
        const { data } = await axios.get(`${API}/${slug}`);
        setVideo(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadVideo();
  }, [slug]);

  if (loading) {
    return (
      <div className="article-page">
        <h2>Loading video...</h2>
      </div>
    );
  }

  if (!video) {
    return (
      <div className="article-page">
        <h2>Video not found.</h2>

        <Link to="/blog" className="back-btn">
          ← Back to Videos
        </Link>
      </div>
    );
  }

  const description = excerptFrom(video.content);

  return (
<div>
  <SEO
    title={video.title}
    description={description}
    path={`/uservideo/${video.slug}`}
    image={video.thumbnail_url}
    type="video.other"
    structuredData={{
      "@context": "https://schema.org",
      "@type": "VideoObject",
      name: video.title,
      description,
      thumbnailUrl: video.thumbnail_url ? [video.thumbnail_url] : undefined,
      uploadDate: video.created_at,
      contentUrl: video.video_url,
      publisher: {
        "@type": "Organization",
        name: "Fixer",
        logo: { "@type": "ImageObject", url: `${SITE_URL}/logo.png` },
      },
    }}
  />
  <Navbar />
      <div className="article-page">
        <Link to="/" className="back-btn">
          ← Back to Videos
        </Link>
      <div className="article-container">

        <video
          src={video.video_url}
          poster={video.thumbnail_url}
          className="hero-image"
          controls
          playsInline
        />

        <div className="article-content">

          <span className="article-category">
            {video.category}
          </span>

          <h1>{video.title}</h1>

          <div className="article-meta">
            <span>
              {new Date(video.created_at).toLocaleDateString()}
            </span>

            <span>{video.views} Views</span>
          </div>

          <div
            className="article-body"
            dangerouslySetInnerHTML={{
              __html: video.content,
            }}
          />

        </div>

      </div>

    </div>
</div>

  );
}
