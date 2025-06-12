import React, { useState, useEffect } from "react";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";

const PAGES = [
  { slug: "home", label: "Home" },
  { slug: "about", label: "About" },
  { slug: "services", label: "Services" },
  { slug: "contact", label: "Contact" },
];
const FIELD_NAME = "hero_title";

export default function PageRichTextEditor() {
  const [page, setPage] = useState("home");
  const [content, setContent] = useState("");
  const [status, setStatus] = useState("");

  // Fetch content for the selected page
  useEffect(() => {
    fetch(`/wp-json/violet/v1/rich-content?page=${encodeURIComponent(page)}`)
      .then((res) => res.json())
      .then((data) => setContent(data[FIELD_NAME]?.content || ""))
      .catch(() => setContent(""));
  }, [page]);

  // Save content for the selected page
  const handleSave = async () => {
    setStatus("Saving...");
    const res = await fetch("/wp-json/violet/v1/rich-content/save", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-WP-Nonce": (window as any).VioletRichTextConfig?.nonce || "",
      },
      body: JSON.stringify({
        page,
        field_name: FIELD_NAME,
        content,
        format: "rich",
        editor: "quill",
      }),
    });
    const data = await res.json();
    setStatus(data.success ? "Saved!" : "Save failed: " + (data.message || "Unknown error"));
  };

  return (
    <div style={{ maxWidth: 600, margin: "40px auto", fontFamily: "sans-serif" }}>
      <h2>Page-by-Page Rich Text Editor</h2>
      <label>
        Page:{" "}
        <select value={page} onChange={(e) => setPage(e.target.value)}>
          {PAGES.map((p) => (
            <option key={p.slug} value={p.slug}>
              {p.label}
            </option>
          ))}
        </select>
      </label>
      <div style={{ margin: "20px 0" }}>
        <ReactQuill value={content} onChange={setContent} />
      </div>
      <button onClick={handleSave} style={{ padding: "10px 24px", fontSize: 16 }}>
        💾 Save
      </button>
      <span style={{ marginLeft: 20, color: status === "Saved!" ? "green" : "red" }}>
        {status}
      </span>
    </div>
  );
} 