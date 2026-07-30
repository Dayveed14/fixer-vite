import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import "./AdminArticles.css";

const API = "http://localhost:4000/api/articles";

export default function AdminArticles() {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");

  const load = async () => {
    try {
      setLoading(true);

      const { data } = await axios.get(API);

      setArticles(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const filtered = useMemo(
    () =>
      articles.filter(
        (a) =>
          (status === "all" || a.status === status) &&
          (
            (a.title || "").toLowerCase().includes(search.toLowerCase()) ||
            (a.category || "").toLowerCase().includes(search.toLowerCase())
          )
      ),
    [articles, search, status]
  );

  const del = async (id) => {
    if (window.confirm("Delete article?")) {
      await axios.delete(`${API}/${id}`);
      load();
    }
  };

  return (
    <div className="admin-articles">
      <div className="admin-articles-header">
          <div>
              <h1>Articles</h1>
              <p>Manage knowledge base articles and blog posts.</p>
          </div>

          <Link
              to="/dashboard/admin/articles/new"
              className="new-article-btn"
          >
              + New Article
          </Link>
      </div>

      <div className="admin-articles-filters">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search"
          className="form-control"
        />

        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="form-select"
        >
          <option value="all">All</option>
          <option value="published">Published</option>
          <option value="draft">Draft</option>
        </select>
      </div>

      {loading ? (
        <p>Loading...</p>
      ) : (
        <div className="admin-table-wrapper">

          <table className="admin-table">

          <thead>
            <tr>
              <th>Image</th>
              <th>Title</th>
              <th>Category</th>
              <th>Views</th>
              <th>Status</th>
              <th>Created</th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>
            {filtered.map((a) => (
              <tr key={a.id}>
                <td>
                 <img className="article-image" src={`http://localhost:4000/uploads/articles/${a.hero_image}`} alt={a.title}/>
                </td>

                <td><span className="article-title"> {a.title} </span></td>

                <td>{a.category}</td>

                <td>{a.views}</td>

                <td><span className={`article-status ${a.status}`}>{a.status}</span></td>

                <td>
                  {new Date(a.created_at).toLocaleDateString()}
                </td>

                <td>

                  <div className="article-actions">

                      <Link
                          className="article-view"
                          to={`/article/${a.id}`}
                      >
                          View
                      </Link>

                      <Link
                          className="article-edit"
                          to={`/admin/editarticle/${a.id}`}
                      >
                          Edit
                      </Link>

                      <button
                          className="article-delete"
                          onClick={() => del(a.id)}
                      >
                          Delete
                      </button>

                  </div>

                </td>
              </tr>
            ))}
          </tbody>
        </table>

      </div>
      )}
    </div>
  );
}