import { useEffect, useState } from "react";

import "./css/StaticPage.css";
import Navbar from "./components/Navbar";
import SEO from "./SEO";
import { Link } from "react-router-dom";

const CATEGORIES = [
  "All",
  "Laptops",
  "PC",
];

export default function Blog() {
  const [activeCategory, setActiveCategory] = useState("All");
  const [search, setSearch] = useState("");
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchArticles = async () => {
      try {
        setLoading(true);
        setError("");
        const response = await fetch(
          `${import.meta.env.VITE_API_BASE_URL}/api/articles/published`
        );

        if (!response.ok) {
          throw new Error("Failed to fetch articles");
        }

        const data = await response.json();

        setPosts(data);
      } catch (err) {
        console.error("Error fetching articles:", err);
        setError("Unable to load articles. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchArticles();
  }, []);

  const filtered = posts.filter((post) => {
    const matchCat =
      activeCategory === "All" ||
      post.category === activeCategory;

    const matchSearch =
      post.title?.toLowerCase().includes(search.toLowerCase());

    return matchCat && matchSearch;
  });

  return (
    <div className="static-page">

      <SEO
        title="Repair Tips, Guides & Device Knowledge"
        description="Expert-verified articles on phone, laptop, PC and gaming device repair, maintenance, and troubleshooting from the Fixer technician team."
        path="/blog"
      />

      <Navbar />

      <section className="static-hero">

        <h1 className="static-hero__title">
          Repair tips, guides &amp; device knowledge
        </h1>

        <p className="static-hero__sub">
          Expert articles written and verified by our technician team.
        </p>

        <div className="blog-search">

          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <circle cx="11" cy="11" r="8" />
            <path d="M21 21l-4.35-4.35" />
          </svg>

          <input
            className="blog-search__input"
            type="text"
            placeholder="Search articles..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

        </div>

      </section>

      <section className="static-section">

        <div className="static-section__inner">

          <div className="blog-categories">

            {CATEGORIES.map((category) => (
              <button
                key={category}
                className={`blog-cat-btn ${
                  activeCategory === category ? "active" : ""
                }`}
                onClick={() => setActiveCategory(category)}
              >
                {category}
              </button>
            ))}

          </div>

          {loading ? (

            <p className="blog-empty">
              Loading articles...
            </p>

          ) : error ? (

            <p className="blog-empty">
              {error}
            </p>

          ) : filtered.length === 0 ? (

            <p className="blog-empty">
              No articles found. Try a different search or category.
            </p>

          ) : (

            <div className="blog-grid">

              {filtered.map((post) => (

                <Link to={`/userarticle/${post.slug}`} key={post.slug}>
                  <article
                  className="blog-card"
                  key={post.id}
                >

                  <div className="blog-card__img-wrap">

                    <img
                      src={post.hero_image}
                      alt={post.image_alt || post.title}
                      className="blog-card__img"
                    />

                    <span className="blog-card__category">
                      {post.category}
                    </span>

                  </div>

                  <div className="blog-card__body">

                    <h3 className="blog-card__title">
                      {post.title}
                    </h3>

                    <p className="blog-card__excerpt">
                      {post.excerpt}
                    </p>

                    <div className="blog-card__meta">

                      <span>
                        {post.author}
                      </span>

                      <span className="blog-card__dot">
                        ·
                      </span>

                      <span>
                        {new Date(
                          post.created_at
                        ).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </span>

                    </div>

                  </div>

                </article>
                </Link>

              ))}

            </div>

          )}

        </div>

      </section>

    </div>
  );
}