import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import Routes from "./Routes/Routes";
// import * as ServiceWorker from "./ServiceWorker";
import { AuthProvider } from "./Stores/AuthContext";

const root = ReactDOM.createRoot(
  document.getElementById("root") as HTMLElement
);

root.render(
  <React.StrictMode>
      <AuthProvider>
        <Routes />
      </AuthProvider>
  </React.StrictMode>
);


// ServiceWorker.register();

