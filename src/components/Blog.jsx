import { useState } from "react";
import "./css/StaticPage.css";
import Navbar from "./components/Navbar";

const CATEGORIES = ["All", "Phones", "Laptops", "PC", "Gaming", "Tips & Tricks"];

const POSTS = [
  { id: 1, title: "The Mobile Lifeline: Advanced Smartphone Thermal Management", category: "Phones", author: "Dave Edwin", date: "Mar 20, 2026", readTime: "10 min read", image: "https://images.unsplash.com/photo-1598300042247-d088f8ab3a91?w=600&q=80", excerpt: "Managing heat is the single most important thing you can do to extend your smartphone's lifespan. Here's how to do it properly." },
  { id: 2, title: "Complete Guide to PC Repair: Common Issues and Solutions", category: "PC", author: "Dave Edwin", date: "Mar 15, 2026", readTime: "12 min read", image: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=600&q=80", excerpt: "From boot failures to overheating, this guide covers the most common PC problems and exactly how to solve them yourself." },
  { id: 3, title: "Essential Phone Maintenance Tips for Longer Device Life", category: "Phones", author: "Sola Bello", date: "Mar 10, 2026", readTime: "7 min read", image: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=600&q=80", excerpt: "Simple habits that dramatically extend how long your phone lasts — and most people skip all of them." },
  { id: 4, title: "Upgrading RAM and Storage: A Comprehensive Guide", category: "Laptops", author: "Emeka Nwosu", date: "Mar 5, 2026", readTime: "9 min read", image: "https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea?w=600&q=80", excerpt: "The cheapest way to breathe new life into an old laptop. Here's everything you need to know before buying RAM." },
  { id: 5, title: "How to Fix PS5 Controller Drift — Full Teardown Guide", category: "Gaming", author: "Temi Adeyemi", date: "Feb 28, 2026", readTime: "15 min read", image: "https://images.unsplash.com/photo-1593642632559-0c6d3fc62b89?w=600&q=80", excerpt: "Controller drift is frustrating but totally fixable at home. This step-by-step teardown shows you exactly how." },
  { id: 6, title: "10 Signs Your Laptop Battery Needs Replacing", category: "Tips & Tricks", author: "Dave Edwin", date: "Feb 20, 2026", readTime: "5 min read", image: "https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=600&q=80", excerpt: "Don't wait until your laptop dies mid-presentation. These warning signs tell you a battery replacement is overdue." },
];

export default function Blog() {
  const [activeCategory, setActiveCategory] = useState("All");
  const [search, setSearch] = useState("");

  const filtered = POSTS.filter(p => {
    const matchCat = activeCategory === "All" || p.category === activeCategory;
    const matchSearch = p.title.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  return (
    <div className="static-page">
<Navbar />
      <section className="static-hero">
        <p className="static-hero__eyebrow">Blog</p>
        <h1 className="static-hero__title">Repair tips, guides &amp; device knowledge</h1>
        <p className="static-hero__sub">Expert articles written and verified by our technician team.</p>

        <div className="blog-search">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/>
          </svg>
          <input
            className="blog-search__input"
            type="text"
            placeholder="Search articles..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
      </section>

      <section className="static-section">
        <div className="static-section__inner">
          <div className="blog-categories">
            {CATEGORIES.map(c => (
              <button
                key={c}
                className={`blog-cat-btn ${activeCategory === c ? "active" : ""}`}
                onClick={() => setActiveCategory(c)}
              >
                {c}
              </button>
            ))}
          </div>

          {filtered.length === 0 ? (
            <p className="blog-empty">No articles found. Try a different search or category.</p>
          ) : (
            <div className="blog-grid">
              {filtered.map(post => (
                <article className="blog-card" key={post.id}>
                  <div className="blog-card__img-wrap">
                    <img src={post.image} alt={post.title} className="blog-card__img" />
                    <span className="blog-card__category">{post.category}</span>
                  </div>
                  <div className="blog-card__body">
                    <h3 className="blog-card__title">{post.title}</h3>
                    <p className="blog-card__excerpt">{post.excerpt}</p>
                    <div className="blog-card__meta">
                      <span>{post.author}</span>
                      <span className="blog-card__dot">·</span>
                      <span>{post.date}</span>
                      <span className="blog-card__dot">·</span>
                      <span>{post.readTime}</span>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>

    </div>
  );
}
