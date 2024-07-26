import React from "react";
import { createRoot } from "react-dom/client";

import App from "./App";
import "./styles/index.css";
import "./i18n";
import AppLoader from "./components/loading/app-loader";

const container = document.getElementById("root") as HTMLElement;
const root = createRoot(container);

root.render(
  <React.StrictMode>
    <React.Suspense fallback={<AppLoader />}>
      <App />
    </React.Suspense>
  </React.StrictMode>
);
