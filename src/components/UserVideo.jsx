import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";
import "../dashboard/Article.css";
import Navbar from "./components/Navbar";

const API = "https://fixer-backend-7mng.onrender.com/api/diy-videos";

export default function UserVideo() {
  const { id } = useParams();

  const [video, setVideo] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadVideo = async () => {
      try {
        const { data } = await axios.get(`${API}/${id}`);
        setVideo(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadVideo();
  }, [id]);

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

        <Link to="/knowledgebase" className="back-btn">
          ← Back to Videos
        </Link>
      </div>
    );
  }

  return (
<div>
  <Navbar />
      <div className="article-page">

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
