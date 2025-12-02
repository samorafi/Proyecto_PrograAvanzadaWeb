// src/main.jsx
import React from "react";
import { createRoot } from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";

import App from "./App";
import Home from "./pages/Home";
import NewGame2P from "./pages/NewGame2P";
import Finalized2P from "./pages/Finalized2P";
import RegisterPlayer from "./pages/RegisterPlayer";
import NewGame4P from "./pages/NewGame4P";
import Finalized4P from "./pages/Finalized4P"; 
import Stats from "./pages/Stats";


const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      { index: true, element: <Home /> },

      // Registrar jugador
      { path: "registrar", element: <RegisterPlayer /> },

      // ==== 2 jugadores ====
      { path: "new-2p", element: <NewGame2P /> },
      { path: "finalized-2p", element: <Finalized2P /> },

      // ==== 4 jugadores (nuevo) ====
      { path: "new-4p", element: <NewGame4P /> },
      { path: "finalized-4p", element: <Finalized4P /> },

      // ==== Stats ====
      { path: "stats", element: <Stats /> },
    ],
  },
]);

createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);