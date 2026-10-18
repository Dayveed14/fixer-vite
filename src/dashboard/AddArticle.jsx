import { useState } from "react";
import api, { TIMEOUTS } from "../api/client";
import { useNavigate } from "react-router-dom";
import "./AddArticle.css";

const AddArticle = () => {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [image, setImage] = useState(null);

  const [form, setForm] = useState({
    title: "",
    slug: "",
    category: "",
    excerpt: "",
    content: "",
    status: "draft",
    tags: "",
    image_alt: "",
  });

  const createSlug = (text) =>
    text
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-");

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

    try {
      setLoading(true);

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

      if (!form.content.trim()) {
        alert("Please enter the article content.");
        return;
      }

      const data = new FormData();

      Object.entries(form).forEach(([key, value]) => {
        data.append(key, value);
      });

      if (image) {
        data.append("hero_image", image);
      }

      data.append("author_id", user.id);
      data.append("featured", 1);

      await api.post("/api/articles", data, {
        timeout: TIMEOUTS.upload,
      });

      alert("Article created successfully.");
      navigate("/adminarticles");
    } catch (err) {
      console.error("Article creation error:", err);

      alert(
        err.response?.data?.message ||
          "Unable to create article. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="add-article">
      <div className="page-header">
        <div>
          <h1>New Article</h1>
          <p>Create a knowledge base article or blog post.</p>
        </div>
      </div>

      <form className="article-form" onSubmit={submit}>
        <div className="form-group">
          <label htmlFor="hero_image">Hero Image</label>

          <input
            id="hero_image"
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            onChange={(e) => setImage(e.target.files?.[0] || null)}
          />

          {image && (
            <small>
              Selected: {image.name} (
              {(image.size / 1024).toFixed(1)} KB)
            </small>
          )}
        </div>

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

        <div className="form-group">
          <label htmlFor="title">Title</label>

          <input
            id="title"
            type="text"
            name="title"
            value={form.title}
            onChange={handleChange}
            placeholder="Enter article title"
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
            This URL-friendly slug is generated automatically from the title.
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
              "Write your full article here...\n\n" +
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

        <div className="article-buttons">
          <button
            type="button"
            className="cancel-btn"
            onClick={() => navigate("/adminarticles")}
            disabled={loading}
          >
            Cancel
          </button>

          <button
            type="submit"
            className="save-btn"
            disabled={loading}
          >
            {loading
              ? "Saving..."
              : form.status === "published"
                ? "Publish Article"
                : "Save Draft"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddArticle;