import React from "react";
import ReactDOM from "react-dom/client";
import "./main.css";
import { QueryClient, QueryClientProvider } from "react-query";
import App from "./App";

const client = new QueryClient();
const root = ReactDOM.createRoot(document.getElementById("root"));

root.render(
  <React.StrictMode>
    <QueryClientProvider client={client}>
      <App />
    </QueryClientProvider>
  </React.StrictMode>
);
