import axios from "axios";
import { toast } from "react-toastify";

const API = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

API.interceptors.request.use(
  (config) => {
    console.log(`------------------------${config.data}`);

    if (typeof window !== "undefined") {
      const token = localStorage.getItem("token");

      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }

    return config;
  },
  (error) => Promise.reject(error),
);

API.interceptors.response.use(
  (response) => response,
  (error) => {
    const message = error?.response?.data?.message;

    if (
      message === "Your account is inactive. Please contact support." ||
      message === "Token expired. Please login again." ||
      error?.response?.status === 401
    ) {
      if (typeof window !== "undefined") {
        localStorage.removeItem("token");
        if (window.location.pathname !== "/login") {
          window.location.href = "/login";
        }
      }
    }
    toast.error(message);

    return Promise.reject(error);
  },
);

export { API };
