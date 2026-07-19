import "../css/DIYSection.css";
import { useState, useEffect } from "react";
import axios from "axios";
import { Link } from "react-router-dom";

const IconBook = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
    <path d="M4 19.5A2.5 2.5 0 016.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z"/>
  </svg>
);
const IconVideo = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
    <polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2" ry="2"/>
  </svg>
);
const IconPlay = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg>
);
const DEFAULT_AVATAR =
  "https://i.pravatar.cc/40?img=15";

export default function DIYSection() {
  const [tab, setTab] = useState("articles");
  const [articles, setArticles] = useState([]);
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);

  // Refetch whenever the active tab changes
  useEffect(() => {
    let cancelled = false;

    const getData = async () => {
      setLoading(true);
      try {
        const endpoint =
          tab === "articles"
            ? "https://fixer-backend-7mng.onrender.com/api/articles/published"
            : "https://fixer-backend-7mng.onrender.com/api/videos/published";

        const response = await axios.get(endpoint);

        if (!cancelled) {
          if (tab === "articles") {
            setArticles(response.data);
          } else {
            setVideos(response.data);
          }
        }
      } catch (err) {
        console.log(err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    getData();

    return () => {
      cancelled = true;
    };
  }, [tab]);

  const items = tab === "articles" ? articles : videos;
  const featured = items[0];
  const related = items.slice(1);

  if (loading) {
    return <p>Loading resources...</p>;
  }

  if (items.length === 0) {
    return (
      <section className="diy">
        <h2>No {tab === "articles" ? "Articles" : "Videos"} Yet</h2>
      </section>
    );
  }

  return (
    <section className="diy">
      <div className="diy__inner">
        <div className="diy__top">
          <div>
            <h2 className="diy__title">DIY Tutorial Videos &amp; Articles</h2>
            <p className="diy__sub">Fix your gadgets yourself with quick guides, videos, and expert tips—save money, solve issues, and extend device life easily.</p>
          </div>
          <div className="diy__tabs">
            <button className={`diy__tab ${tab === "articles" ? "active" : ""}`} onClick={() => setTab("articles")} title="Articles"><IconBook /></button>
            <button className={`diy__tab ${tab === "videos"   ? "active" : ""}`} onClick={() => setTab("videos")}   title="Videos"><IconVideo /></button>
          </div>
        </div>

        <div className="diy__layout">
          <Link to={`/userarticle/${featured.id}`}className="diy__featured">
            <div className="diy__featured-img-wrap">
              <img src={`https://fixer-backend-7mng.onrender.com/uploads/articles/${featured.hero_image}`} alt={featured.title} />
              {tab === "videos" && <div className="diy__play-btn"><IconPlay /></div>}
              <span className="diy__tag">{featured.category}</span>
            </div>
            <h3 className="diy__featured-title">{featured.title}</h3>
            <div className="diy__meta">
              <img src={DEFAULT_AVATAR} alt={featured.first_name} className="diy__avatar" />
              <span className="diy__author">{featured.first_name} {featured.last_name}</span>
              <span className="diy__dot">·</span>
              <span className="diy__date">
                {new Date(featured.created_at).toLocaleDateString()}
              </span>
            </div>
          </Link>
          <div className="diy__related">
            <p className="diy__related-label">Related {tab}</p>
            {related.map(item => (
              <div className="diy__related-item" key={item.id}>
                <div className="diy__related-img-wrap">
                  <img src={`https://fixer-backend-7mng.onrender.com/uploads/articles/${item.hero_image}`} alt={item.title} className="diy__related-img" />
                  {tab === "videos" && <div className="diy__play-btn diy__play-btn--sm"><svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg></div>}
                </div>
                <div>
                  <Link to={`/userarticle/${item.id}`} className="diy__related-title">{item.title}</Link>
                  <div className="diy__meta diy__meta--sm">
                    <img src={item.avatar} alt="" className="diy__avatar diy__avatar--sm" />
                    <span className="diy__author">{item.first_name + " " + item.last_name}</span>
                    <span className="diy__dot">·</span>
                    <span className="diy__date">
                      {new Date(item.created_at).toLocaleDateString()} · {item.readTime}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
