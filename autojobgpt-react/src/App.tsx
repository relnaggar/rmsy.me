import React from "react";
import "bootstrap/dist/js/bootstrap.min.js";
import { createBrowserRouter, RouterProvider } from "react-router-dom";

import "./App.scss";
import { routesConfig, routesBasename }  from "./routes/routesConfig";


const router = createBrowserRouter(routesConfig, {
  basename: routesBasename,
});

const App = (): React.JSX.Element => {
  return <RouterProvider router={router} />
};

export default App;