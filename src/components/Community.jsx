import "./css/StaticPage.css";
import Navbar from "./components/Navbar";

const THREADS = [
  { id: 1, title: "MacBook Pro 2021 won't charge after water spill — tried everything", category: "Laptops", author: "Chisom A.", replies: 14, views: 203, time: "2 hours ago", solved: true },
  { id: 2, title: "Best thermal paste for gaming laptops in 2026?", category: "Tips & Tricks", author: "Kemi F.", replies: 8, views: 91, time: "5 hours ago", solved: false },
  { id: 3, title: "iPhone 15 screen replacement — is it worth DIY?", category: "Phones", author: "Rotimi D.", replies: 22, views: 410, time: "Yesterday", solved: true },
  { id: 4, title: "PS5 disc drive making loud grinding noise", category: "Gaming", author: "Uche O.", replies: 6, views: 73, time: "Yesterday", solved: false },
  { id: 5, title: "Recommended tools for a basic repair toolkit?", category: "Tips & Tricks", author: "Amina S.", replies: 31, views: 560, time: "2 days ago", solved: true },
];

const CATEGORIES = [
  { icon: "📱", name: "Phones", count: 234 },
  { icon: "💻", name: "Laptops", count: 189 },
  { icon: "🖥️", name: "PC & Desktop", count: 142 },
  { icon: "🎮", name: "Gaming", count: 97 },
  { icon: "⌚", name: "Wearables", count: 54 },
  { icon: "💡", name: "Tips & Tricks", count: 311 },
];

export default function Community() {
  return (
    <div className="static-page">
<Navbar />
      <section className="static-hero static-hero--blue">
        <p className="static-hero__eyebrow">Community</p>
        <h1 className="static-hero__title">Ask questions. Share fixes. Help others.</h1>
        <p className="static-hero__sub">
          Join thousands of users and technicians sharing real repair knowledge. No question is too basic.
        </p>
        <button className="static-hero__btn">Start a discussion</button>
      </section>

      <section className="static-section">
        <div className="static-section__inner community-layout">

          {/* Left — threads */}
          <div className="community-threads">
            <div className="community-threads__header">
              <h2>Recent Discussions</h2>
              <select className="community-filter">
                <option>Latest</option>
                <option>Most viewed</option>
                <option>Unsolved</option>
              </select>
            </div>

            {THREADS.map(t => (
              <div className="community-thread" key={t.id}>
                <div className="community-thread__main">
                  <div className="community-thread__top">
                    <span className="community-thread__cat">{t.category}</span>
                    {t.solved && <span className="community-thread__solved">✓ Solved</span>}
                  </div>
                  <h3 className="community-thread__title">{t.title}</h3>
                  <div className="community-thread__meta">
                    <span>by {t.author}</span>
                    <span className="community-dot">·</span>
                    <span>{t.time}</span>
                  </div>
                </div>
                <div className="community-thread__stats">
                  <div><strong>{t.replies}</strong><span>replies</span></div>
                  <div><strong>{t.views}</strong><span>views</span></div>
                </div>
              </div>
            ))}
          </div>

          {/* Right — sidebar */}
          <div className="community-sidebar">
            <div className="community-sidebar__card">
              <h3>Browse by category</h3>
              <ul className="community-cats">
                {CATEGORIES.map(c => (
                  <li key={c.name}>
                    <a href="#" className="community-cat">
                      <span>{c.icon} {c.name}</span>
                      <span className="community-cat__count">{c.count}</span>
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            <div className="community-sidebar__card community-sidebar__card--blue">
              <h3>Ready to contribute?</h3>
              <p>Share your repair knowledge and help someone fix their device today.</p>
              <button>Post a thread</button>
            </div>
          </div>

        </div>
      </section>

    </div>
  );
}
