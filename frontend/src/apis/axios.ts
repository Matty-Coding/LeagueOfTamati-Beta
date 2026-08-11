import axios from "axios";

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true,
  headers: {
    // dev tunnels
    // "X-Tunnel-Skip-AntiPhishing-Warning": "true",

    // ngrok
    "ngrok-skip-browser-warning": "true",

    // "Content-Type": "application/json",
  },
});
