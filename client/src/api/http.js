import axios from "axios";

export const http = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
  timeout: 60000
});

http.interceptors.request.use((config) => {
  const token = localStorage.getItem("kisanbandhu_token");
  config.headers["Cache-Control"] = "no-store";
  config.headers.Pragma = "no-cache";
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
