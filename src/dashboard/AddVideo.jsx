import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./AddArticle.css";
import { Editor } from "@tinymce/tinymce-react";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "https://fixer-backend-7mng.onrender.com";

const AddVideo = () => {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);

  const [video, setVideo] = useState(null);

  const [form, setForm] = useState({
    title: "",
    slug: "",
    category: "",
    excerpt: "",
    content: "",
    status: "draft",
    tags: "",
  });

  const createSlug = (text) =>
    text
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, "")
      .replace(/\s+/g, "-");

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "title") {
      setForm((prev) => ({
        ...prev,
        title: value,
        slug: createSlug(value),
      }));
    } else {
      setForm((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const submit = async (e) => {
    e.preventDefault();

    if (!video) {
      alert("Please select a video file.");
      return;
    }

    let user = null;
    try {
      user = JSON.parse(localStorage.getItem("user"));
    } catch {
      user = null;
    }

    if (!user?.id) {
      alert("Your session has expired. Please log in again.");
      navigate("/login");
      return;
    }

    try {
      setLoading(true);

      const data = new FormData();

      Object.entries(form).forEach(([key, value]) => {
        data.append(key, value);
      });

      data.append("video", video);
      data.append("author_id", user.id);
      data.append("featured", 1);

      await axios.post(
        `${API_BASE_URL}/api/diy-videos`,
        data,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      alert("Video created successfully.");

      navigate("/adminvideos");
    } catch (err) {
      console.error(err);
      alert("Unable to create video.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="add-article">

      <div className="page-header">
        <div>
          <h1>New DIY Video</h1>
          <p>Upload a new DIY tutorial video.</p>
        </div>
      </div>

      <form
        className="article-form"
        onSubmit={submit}
      >

        <div className="form-group">
          <label>Video File</label>

          <input
            type="file"
            accept="video/*"
            onChange={(e) =>
              setVideo(e.target.files[0])
            }
          />
        </div>

        <div className="form-group">
          <label>Title</label>

          <input
            type="text"
            name="title"
            value={form.title}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label>Slug</label>

          <input
            type="text"
            name="slug"
            value={form.slug}
            readOnly
          />
        </div>

        <div className="form-group">
          <label>Tags</label>

          <input
            type="text"
            name="tags"
            value={form.tags}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label>Category</label>

          <select
            name="category"
            value={form.category}
            onChange={handleChange}
            required
          >
            <option value="">
              Select Category
            </option>

            <option value="Hardware">
              Hardware
            </option>

            <option value="Software">
              Software
            </option>

            <option value="Networking">
              Networking
            </option>

            <option value="Security">
              Security
            </option>

            <option value="Maintenance">
              Maintenance
            </option>

          </select>
        </div>

        <div className="form-group">
          <label>Excerpt</label>

                        <Editor
                apiKey={import.meta.env.VITE_TINYMCE_API_KEY}
                value={form.excerpt}
                onEditorChange={(excerpt) =>
                  setForm((prev) => ({
                    ...prev,
                    excerpt,
                  }))
                }
              />
        </div>

        <div className="form-group">
          <label>Video Description / Instructions</label>

                  <Editor
          apiKey={import.meta.env.VITE_TINYMCE_API_KEY}
          value={form.content}
          onEditorChange={(content) =>
            setForm((prev) => ({
              ...prev,
              content,
            }))
          }
        />
        </div>

        <div className="form-group">
          <label>Status</label>

          <select
            name="status"
            value={form.status}
            onChange={handleChange}
          >
            <option value="draft">
              Draft
            </option>

            <option value="published">
              Published
            </option>
          </select>
        </div>

        <div className="article-buttons">

          <button
            type="button"
            className="cancel-btn"
            onClick={() =>
              navigate("/adminvideos")
            }
          >
            Cancel
          </button>

          <button
            type="submit"
            className="save-btn"
            disabled={loading}
          >
            {loading
              ? "Uploading..."
              : "Publish Video"}
          </button>

        </div>

      </form>

    </div>
  );
};

export default AddVideo;
