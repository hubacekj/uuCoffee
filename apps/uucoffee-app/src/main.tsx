import * as React from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import App from "./app";
import Detail from './detail/detail.js';
import List from './list/list.js';

import "./index.css";

const el = document.getElementById("root");

if (el) {
  const root = createRoot(el);

  root.render(
    <React.StrictMode>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<App />} >
            <Route path="" element={<List/>} />
            <Route path="detail/:id" element={<Detail />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </React.StrictMode>
  );
} else {
  throw new Error("Could not find root element");
}
