import React from "react";
import ReactDOM from "react-dom/client";

const root = document.getElementById("root");

if (root) {
  ReactDOM.createRoot(root).render(
    <div style={{ fontSize: "2rem", padding: "2rem" }}>
      ✅ main.tsx から直接描画成功！
    </div>
  );
} else {
  console.error("❌ root element not found!");
}
