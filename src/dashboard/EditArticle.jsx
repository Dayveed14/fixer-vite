import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import "./ArticleForm.css";
import { Editor } from "@tinymce/tinymce-react";

const API = "http://localhost:4000/api/articles";

export default function EditArticle() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    title: "",
    category: "",
    content: "",
    status: "draft",
    excerpt: "",
    image_alt: "",
    tags: "",
  });

  const [preview, setPreview] = useState("");
  const [image, setImage] = useState(null);

  useEffect(() => {
    loadArticle();
  }, []);

  const loadArticle = async () => {
    try {
      const { data } = await axios.get(`${API}/${id}`);

      setForm({
        title: data.title,
        category: data.category,
        content: data.content,
        status: data.status,
        excerpt: data.excerpt,
        image_alt: data.image_alt,
        tags: data.tags,
      });

      setPreview(
        `http://localhost:4000/uploads/articles/${data.hero_image}`
      );
    } catch (err) {
      console.error(err);
      alert("Unable to load article.");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleImage = (e) => {
    const file = e.target.files[0];

    if (!file) return;

    setImage(file);
    setPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setSaving(true);

    try {
      const formData = new FormData();

      formData.append("title", form.title);
      formData.append("category", form.category);
      formData.append("content", form.content);
      formData.append("status", form.status);
      formData.append("excerpt", form.excerpt);
      formData.append("image_alt", form.image_alt);
      formData.append("tags", form.tags);

      if (image) {
        formData.append("hero_image", image);
      }

      await axios.put(`${API}/${id}`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      alert("Article updated successfully.");

      navigate("/adminarticles");
    } catch (err) {
      console.error(err);
      alert("Failed to update article.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <h2 style={{ padding: 30 }}>Loading...</h2>;
  }

  return (
    <div className="article-form-page">

      <div className="article-form-card">

        <h2>Edit Article</h2>

        <form onSubmit={handleSubmit}>

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
            <label>Status</label>

            <select
              name="status"
              value={form.status}
              onChange={handleChange}
            >
              <option value="draft">Draft</option>
              <option value="published">Published</option>
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
            <label>Content</label>

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
            <label>Hero Image</label>

            <input
              type="file"
              accept="image/*"
              onChange={handleImage}
            />
          </div>

          {preview && (
            <div className="image-preview">
              <img src={preview} alt="Preview" />
            </div>
          )}

          <div className="form-group">
          <label>Image Description</label>

          <input
            type="text"
            name="image_alt"
            value={form.image_alt}
            onChange={handleChange}
            required
          />
        </div>

          <button
            className="submit-btn"
            disabled={saving}
          >
            {saving ? "Updating..." : "Update Article"}
          </button>

        </form>

      </div>

    </div>
  );
}