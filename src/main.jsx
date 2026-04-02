import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { installApiClient } from "./util/apiClient";
import { installSessionStorageBridge } from "./store/session-store";

installApiClient({
  baseUrl: import.meta.env.VITE_BASE_URL || "",
});
installSessionStorageBridge();

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
