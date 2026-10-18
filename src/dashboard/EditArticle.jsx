import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api, { TIMEOUTS } from "../api/client";
import "./ArticleForm.css";

const API = "/api/articles";

export default function EditArticle() {
  const { slug } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    title: "",
    slug: "",
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
    let active = true;

    const loadArticle = async () => {
      try {
        const { data } = await api.get(
          `${API}/${encodeURIComponent(slug)}`
        );

        if (!active) return;

        setForm({
          title: data.title ?? "",
          slug: data.slug ?? slug ?? "",
          category: data.category ?? "",
          content: data.content ?? "",
          status: data.status ?? "draft",
          excerpt: data.excerpt ?? "",
          image_alt: data.image_alt ?? "",
          tags: data.tags ?? "",
        });

        // hero_image is already a full Cloudinary URL.
        setPreview(data.hero_image ?? "");
      } catch (err) {
        if (!active) return;

        console.error("Failed to load article:", err);
        alert("Unable to load article.");
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    loadArticle();

    return () => {
      active = false;
    };
  }, [slug]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleImage = (e) => {
    const file = e.target.files?.[0];

    if (!file) return;

    setImage(file);

    // Revoke the previous local preview URL, if applicable.
    setPreview((previous) => {
      if (previous.startsWith("blob:")) {
        URL.revokeObjectURL(previous);
      }

      return URL.createObjectURL(file);
    });
  };

  useEffect(() => {
    return () => {
      if (preview.startsWith("blob:")) {
        URL.revokeObjectURL(preview);
      }
    };
  }, [preview]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.content.trim()) {
      alert("Please enter the article content.");
      return;
    }

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

      await api.put(
        `${API}/${encodeURIComponent(slug)}`,
        formData,
        { timeout: TIMEOUTS.upload }
      );

      alert("Article updated successfully.");

      navigate("/adminarticles");
    } catch (err) {
      console.error("Failed to update article:", err);

      alert(
        err.response?.data?.message ||
          "Failed to update article. Please try again."
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <h2 style={{ padding: 30 }}>Loading article...</h2>;
  }

  return (
    <div className="article-form-page">
      <div className="article-form-card">
        <h2>Edit Article</h2>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="title">Title</label>

            <input
              id="title"
              type="text"
              name="title"
              value={form.title}
              onChange={handleChange}
              maxLength={255}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="slug">Slug</label>

            <input
              id="slug"
              type="text"
              name="slug"
              value={form.slug}
              readOnly
            />

            <small>
              The existing article URL is preserved when editing.
            </small>
          </div>

          <div className="form-group">
            <label htmlFor="tags">Tags</label>

            <input
              id="tags"
              type="text"
              name="tags"
              value={form.tags}
              onChange={handleChange}
              placeholder="e.g. laptop repair, Windows, troubleshooting"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="category">Category</label>

            <select
              id="category"
              name="category"
              value={form.category}
              onChange={handleChange}
              required
            >
              <option value="">Select Category</option>
              <option value="Hardware">Hardware</option>
              <option value="Software">Software</option>
              <option value="Networking">Networking</option>
              <option value="Security">Security</option>
              <option value="Maintenance">Maintenance</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="status">Status</label>

            <select
              id="status"
              name="status"
              value={form.status}
              onChange={handleChange}
            >
              <option value="draft">Draft</option>
              <option value="published">Published</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="excerpt">Article Excerpt</label>

            <textarea
              id="excerpt"
              name="excerpt"
              value={form.excerpt}
              onChange={handleChange}
              placeholder="Write a short summary of the article..."
              rows={4}
              maxLength={1000}
            />

            <small>
              {form.excerpt.length}/1000 characters
            </small>
          </div>

          <div className="form-group">
            <label htmlFor="content">Article Content</label>

            <textarea
              id="content"
              name="content"
              value={form.content}
              onChange={handleChange}
              placeholder={
                "Edit your article here...\n\n" +
                "Use blank lines to separate paragraphs."
              }
              rows={16}
              required
            />

            <small>
              {form.content.length} characters ·{" "}
              {form.content.trim()
                ? form.content.trim().split(/\s+/).length
                : 0}{" "}
              words
            </small>
          </div>

          <div className="form-group">
            <label htmlFor="hero_image">Hero Image</label>

            <input
              id="hero_image"
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              onChange={handleImage}
            />

            <small>
              Leave empty to keep the current image.
            </small>
          </div>

          {preview && (
            <div className="image-preview">
              <img
                src={preview}
                alt={form.image_alt || "Article hero image preview"}
              />
            </div>
          )}

          <div className="form-group">
            <label htmlFor="image_alt">Image Description</label>

            <input
              id="image_alt"
              type="text"
              name="image_alt"
              value={form.image_alt}
              onChange={handleChange}
              placeholder="Describe the image for accessibility"
              required
            />
          </div>

          <button
            type="submit"
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