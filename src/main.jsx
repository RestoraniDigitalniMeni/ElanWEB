// main.jsx

import React from "react";

import ReactDOM from "react-dom/client";

import App from "./App";

import "./index.css";

// =====================================================
// REGISTER SERVICE WORKER
// =====================================================

if ("serviceWorker" in navigator) {
  window.addEventListener("load", async () => {
    try {
      const registration =
        await navigator.serviceWorker.register(
          "/firebase-messaging-sw.js"
        );

      console.log(
        "Service Worker registered:",
        registration
      );
    } catch (e) {
      console.log("SW ERROR", e);
    }
  });
}

ReactDOM.createRoot(
  document.getElementById("root")
).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);