import axios from "axios";

const API = axios.create({
  baseURL: "https://whatsapp-clone-backend-xytk.onrender.com/api/v1" || "http://localhost:8000/api/v1",
  withCredentials: true
});

// Optional: response error parsing
API.interceptors.response.use(
  (res) => res,
  (err) => {
    const message =
      err?.response?.data?.message ||
      err?.response?.data?.error ||
      err.message ||
      "Request failed";
    return Promise.reject(new Error(message));
  }
);

export default API;
