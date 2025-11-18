import React from "react";
import { createRoot } from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import App from "./App";
import Inicio from "./pages/Home";
import NuevaPartida2J from "./pages/NewGame2P";
import PartidasFinalizadas2J from "./pages/Finalized2P";
//import Estadisticas from "./paginas/Estadisticas";

const router = createBrowserRouter([
  { path:"/", element:<App/>, children:[
    { index:true, element:<Inicio/> },
    { path:"new-2p", element:<NuevaPartida2J/> },
    { path:"finalized-2p", element:<PartidasFinalizadas2J/> },
    //{ path:"/stats", element:<Estadisticas/> },
  ] }
]);

createRoot(document.getElementById("root")).render(
  <React.StrictMode><RouterProvider router={router} /></React.StrictMode>
);
