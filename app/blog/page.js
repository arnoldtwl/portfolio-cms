// app/blog/page.js
"use client";
import { useState, useEffect } from "react";
import "./styles.css";

export default function BlogPage() {
  const [posts, setPosts] = useState([]);
  const [title, setTitle] = useState("");
  const [authorName, setAuthorName] = useState("");
  const [summary, setSummary] = useState("");
  const [content, setContent] = useState("");
  const [formatType, setFormatType] = useState("article");
  const [mediaUrl, setMediaUrl] = useState("");
  const [mediaType, setMediaType] = useState("");
  const [editingPost, setEditingPost] = useState(null);
  const [errors, setErrors] = useState([]);
  const [message, setMessage] = useState("");

  const formatTypes = ["article", "video", "audio", "poetry"];
  const mediaTypes = ["", "video", "audio"];

  useEffect(() => {
    fetchPosts();
  }, []);

  async function fetchPosts() {
    try {
      const response = await fetch("/api/blog");
      if (!response.ok) {
        throw new Error("Failed to fetch posts");
      }
      const data = await response.json();
      setPosts(data);
    } catch (error) {
      setErrors([error.message]);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setErrors([]);
    setMessage("");

    const postData = {
      title,
      author_name: authorName,
      summary,
      content,
      format_type: formatType,
      media_url: mediaUrl,
      media_type: mediaType,
    };

    const url = "/api/blog";
    const method = editingPost ? "PUT" : "POST";
    if (editingPost) {
      postData.post_id = editingPost.post_id;
    }

    try {
      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(postData),
      });

      const result = await response.json();

      if (!response.ok) {
        if (result.errors) {
          setErrors(result.errors);
        } else {
          throw new Error(result.error || "An error occurred");
        }
      } else {
        setMessage(result.message);
        clearForm();
        fetchPosts();
      }
    } catch (error) {
      setErrors([error.message]);
    }
  }

  async function deletePost(postId) {
    try {
      const response = await fetch("/api/blog", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ post_id: postId }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to delete post");
      }

      setMessage(result.message);
      fetchPosts();
    } catch (error) {
      setErrors([error.message]);
    }
  }

  function clearForm() {
    setTitle("");
    setAuthorName("");
    setSummary("");
    setContent("");
    setFormatType("article");
    setMediaUrl("");
    setMediaType("");
    setEditingPost(null);
    setErrors([]);
    setMessage("");
  }

  function handleEdit(post) {
    setEditingPost(post);
    setTitle(post.title);
    setAuthorName(post.author_name);
    setSummary(post.summary);
    setContent(post.content);
    setFormatType(post.format_type);
    setMediaUrl(post.media_url || "");
    setMediaType(post.media_type || "");
    setErrors([]);
    setMessage("");
  }

  return (
    <div className="container">
      <h1>Blog Management</h1>

      {errors.length > 0 && (
        <div className="error-messages">
          {errors.map((error, index) => (
            <p key={index} className="error">
              {error}
            </p>
          ))}
        </div>
      )}

      {message && <p className="success-message">{message}</p>}

      <form onSubmit={handleSubmit}>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Title"
          required
        />
        <input
          type="text"
          value={authorName}
          onChange={(e) => setAuthorName(e.target.value)}
          placeholder="Author Name"
          required
        />
        <input
          type="text"
          value={summary}
          onChange={(e) => setSummary(e.target.value)}
          placeholder="Summary"
          required
        />
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Content"
          required
        ></textarea>
        <select
          value={formatType}
          onChange={(e) => setFormatType(e.target.value)}
          required
        >
          {formatTypes.map((type) => (
            <option key={type} value={type}>
              {type.charAt(0).toUpperCase() + type.slice(1)}
            </option>
          ))}
        </select>
        <input
          type="text"
          value={mediaUrl}
          onChange={(e) => setMediaUrl(e.target.value)}
          placeholder="Media URL"
        />
        <select
          value={mediaType}
          onChange={(e) => setMediaType(e.target.value)}
        >
          {mediaTypes.map((type) => (
            <option key={type} value={type}>
              {type ? type.charAt(0).toUpperCase() + type.slice(1) : "None"}
            </option>
          ))}
        </select>
        <button type="submit">
          {editingPost ? "Update Post" : "Add Post"}
        </button>
        {editingPost && (
          <button type="button" onClick={clearForm}>
            Cancel Edit
          </button>
        )}
      </form>

      <h2>Posts</h2>
      <ul>
        {posts.map((post) => (
          <li key={post.post_id}>
            {post.title} by {post.author_name} - {post.format_type}
            {post.media_type && ` (${post.media_type})`}
            <button onClick={() => handleEdit(post)}>Edit</button>
            <button onClick={() => deletePost(post.post_id)}>Delete</button>
          </li>
        ))}
      </ul>
    </div>
  );
}
