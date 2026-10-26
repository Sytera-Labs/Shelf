import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { ShelfApp } from "@/components/shelf-app";
import "@/styles.css";

const root = document.getElementById("root");
if (root) {
  createRoot(root).render(
    <StrictMode>
      <ShelfApp />
    </StrictMode>,
  );
}
