import axios from "axios";

// backend base url - saari requests yaha jayengi
const api = axios.create({
  baseURL: "http://localhost:5000/api",
});

// har request se pehle token laga do (agar hai to)
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// agar protected request pe token expire/invalid ho gaya (401) to login clear karke Home pe bhej do
// lekin login/register khud 401 de sakte hain (galat password) — waha redirect nahi karna
api.interceptors.response.use(
  (res) => res,
  (err) => {
    const url = err.config?.url || "";
    const isAuthRoute =
      url.includes("/user/login") || url.includes("/user/register");

    if (err.response && err.response.status === 401 && !isAuthRoute) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/";
    }
    return Promise.reject(err);
  }
);

export default api;
