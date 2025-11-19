// src/main.jsx
import React from "react";
import { createRoot } from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import App from "./App";
import Home from "./pages/Home";
import NewGame2P from "./pages/NewGame2P";
import Finalized2P from "./pages/Finalized2P";
import RegisterPlayer from "./pages/RegisterPlayer";

const router = createBrowserRouter([
  { path: "/", element: <App />, children: [
    { index: true, element: <Home /> },
    { path: "registrar", element: <RegisterPlayer /> },
    { path: "new-2p", element: <NewGame2P /> },
    { path: "finalizadas", element: <Finalized2P /> },
  ]},
]);

createRoot(document.getElementById("root")).render(
  <React.StrictMode><RouterProvider router={router} /></React.StrictMode>
);
