import { useState } from "react";
import "../css/DIYSection.css";

const ARTICLES = [
  { id:1, title:"The Mobile Lifeline: Advanced Smartphone Thermal Management", author:"Dave Edwin", date:"Mar 20", readTime:"10 Mins Read", tag:"Phones", image:"https://images.unsplash.com/photo-1598300042247-d088f8ab3a91?w=700&q=80", avatar:"https://i.pravatar.cc/30?img=33" },
  { id:2, title:"Complete Guide to PC Repair: Common Issues and Solutions", author:"Dave Edwin", date:"Mar 20", readTime:"10 Mins Read", tag:"PC", image:"https://images.unsplash.com/photo-1518770660439-4636190af475?w=300&q=80", avatar:"https://i.pravatar.cc/26?img=33" },
  { id:3, title:"Essential Phone Maintenance Tips for Longer Device Life", author:"Dave Edwin", date:"Mar 20", readTime:"10 Mins Read", tag:"Phones", image:"https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=300&q=80", avatar:"https://i.pravatar.cc/26?img=33" },
  { id:4, title:"Upgrading RAM and Storage: A Comprehensive Guide", author:"Dave Edwin", date:"Mar 20", readTime:"8 Mins Read", tag:"PC", image:"https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea?w=300&q=80", avatar:"https://i.pravatar.cc/26?img=33" },
];

const VIDEOS = [
  { id:1, title:"How to Replace a Laptop Screen in 10 Minutes", author:"Tech with Tunde", date:"Apr 5", readTime:"12:40", tag:"Laptops", image:"https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=700&q=80", avatar:"https://i.pravatar.cc/30?img=11" },
  { id:2, title:"Fix PS5 Controller Drift — Full Teardown", author:"GadgetGuru", date:"Mar 29", readTime:"8:15", tag:"Gaming", image:"https://images.unsplash.com/photo-1593642632559-0c6d3fc62b89?w=300&q=80", avatar:"https://i.pravatar.cc/26?img=22" },
  { id:3, title:"iPhone Battery Replacement — Step by Step", author:"Dave Edwin", date:"Mar 18", readTime:"15:00", tag:"Phones", image:"https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=300&q=80", avatar:"https://i.pravatar.cc/26?img=33" },
  { id:4, title:"Deep Clean Your PC: Dust, Thermal Paste & More", author:"FixIt Lab", date:"Feb 28", readTime:"20:05", tag:"PC", image:"https://images.unsplash.com/photo-1555617117-08e6e8a7fb43?w=300&q=80", avatar:"https://i.pravatar.cc/26?img=44" },
];

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

export default function DIYSection() {
  const [tab, setTab] = useState("articles");
  const items = tab === "articles" ? ARTICLES : VIDEOS;
  const featured = items[0];
  const related  = items.slice(1);

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
          <div className="diy__featured">
            <div className="diy__featured-img-wrap">
              <img src={featured.image} alt={featured.title} className="diy__featured-img" />
              {tab === "videos" && <div className="diy__play-btn"><IconPlay /></div>}
              <span className="diy__tag">{featured.tag}</span>
            </div>
            <h3 className="diy__featured-title">{featured.title}</h3>
            <div className="diy__meta">
              <img src={featured.avatar} alt="" className="diy__avatar" />
              <span className="diy__author">{featured.author}</span>
              <span className="diy__dot">·</span>
              <span className="diy__date">{featured.date} · {featured.readTime}</span>
            </div>
          </div>

          <div className="diy__related">
            <p className="diy__related-label">Related {tab}</p>
            {related.map(item => (
              <div className="diy__related-item" key={item.id}>
                <div className="diy__related-img-wrap">
                  <img src={item.image} alt={item.title} className="diy__related-img" />
                  {tab === "videos" && <div className="diy__play-btn diy__play-btn--sm"><svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg></div>}
                </div>
                <div>
                  <h4 className="diy__related-title">{item.title}</h4>
                  <div className="diy__meta diy__meta--sm">
                    <img src={item.avatar} alt="" className="diy__avatar diy__avatar--sm" />
                    <span className="diy__author">{item.author}</span>
                    <span className="diy__dot">·</span>
                    <span className="diy__date">{item.date} · {item.readTime}</span>
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
