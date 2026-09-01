import axios from "axios";
import { toast } from "react-toastify";

const API = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

API.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

API.interceptors.response.use(
  (response) => {
    // Handle APIs that return HTTP 200 but wrap error statuses inside response body
    if (response.data && response.data.statusCode && response.data.statusCode >= 400) {
      const message = response.data.message || "An error occurred";
      toast.error(message);
      
      const customError = new Error(message);
      customError.response = response;
      customError.isToastShown = true;
      return Promise.reject(customError);
    }
    return response;
  },
  (error) => {
    // Handle standard HTTP error responses (e.g., status codes 400, 401, 500, etc.)
    const errorData = error.response?.data;
    const message = errorData?.message || errorData?.data || error.message || "An unexpected error occurred";
    
    toast.error(message);
    error.isToastShown = true;
    
    return Promise.reject(error);
  }
);

export { API };

