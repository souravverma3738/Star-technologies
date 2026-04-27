import axios from "axios";

export const API_BASE = "http://127.0.0.1:8000/api";
export const api = axios.create({
  baseURL: API_BASE,
  headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use((cfg) => {
  const token = localStorage.getItem("st_admin_token");
  if (token) cfg.headers.Authorization = `Bearer ${token}`;
  return cfg;
});
