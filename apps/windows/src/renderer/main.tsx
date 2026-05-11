import React from "react";
import ReactDOM from "react-dom/client";
import App from "../../../web/src/app/App";
import "@figma/astraui/styles.css";
import "../../../web/src/styles/tailwind.css";
import "../../../web/src/styles/fonts.css";
import "../../../web/src/styles/theme.css";
import "./styles.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
