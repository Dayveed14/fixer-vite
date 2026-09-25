import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import "./AdminArticles.css";

const API = "https://fixer-backend-7mng.onrender.com/api/diy-videos";

export default function AdminVideos() {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");

  const load = async () => {
    try {
      setLoading(true);

      const { data } = await axios.get(API);

      setVideos(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const filtered = useMemo(
    () =>
      videos.filter(
        (v) =>
          (status === "all" || v.status === status) &&
          ((v.title || "").toLowerCase().includes(search.toLowerCase()) ||
            (v.category || "").toLowerCase().includes(search.toLowerCase())),
      ),
    [videos, search, status],
  );

  const del = async (id) => {
    if (window.confirm("Delete video?")) {
      await axios.delete(`${API}/${id}`);
      load();
    }
  };

  return (
    <div className="admin-articles">
      <div className="admin-articles-header">
        <div>
          <h1>DIY Videos</h1>
          <p>Manage DIY tutorial videos.</p>
        </div>

        <Link to="/adminvideos/new" className="new-article-btn">
          + New Video
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
          className="form-select">
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
                <th>Thumbnail</th>
                <th>Title</th>
                <th>Category</th>
                <th>Views</th>
                <th>Status</th>
                <th>Created</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {filtered.map((v) => (
                <tr key={v.id}>
                  <td>
                    <img
                      className="article-image"
                      src={v.thumbnail_url}
                      alt={v.title}
                    />
                  </td>

                  <td>
                    <span className="article-title"> {v.title} </span>
                  </td>

                  <td>{v.category}</td>

                  <td>{v.views}</td>

                  <td>
                    <span className={`article-status ${v.status}`}>
                      {v.status}
                    </span>
                  </td>

                  <td>{new Date(v.created_at).toLocaleDateString()}</td>

                  <td>
                    <div className="article-actions">
                      <Link className="article-view" to={`/uservideo/${v.id}`}>
                        View
                      </Link>

                      <Link
                        className="article-edit"
                        to={`/admin/editvideo/${v.id}`}>
                        Edit
                      </Link>

                      <button
                        className="article-delete"
                        onClick={() => del(v.id)}>
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
