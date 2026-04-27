import axios from "axios";

const API_BASE = process.env.REACT_APP_BACKEND_URL;
export const api = axios.create({
  baseURL: API_BASE,
  headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use((cfg) => {
  const token = localStorage.getItem("st_admin_token");
  if (token) cfg.headers.Authorization = `Bearer ${token}`;
  return cfg;
});
