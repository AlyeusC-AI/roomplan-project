import axios from "axios";
import { toast } from "sonner";
import { useAuthStore } from "@/store/auth";

const baseURL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

export const axiosInstance = axios.create({
  baseURL,
  headers: {
    "Content-Type": "application/json",
  },
});

axiosInstance.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().token;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    const message =
      error.response?.data?.message || error.message || "An error occurred";
    toast.error(message);

    if (error.response?.status === 401) {
      useAuthStore.getState().clearToken();
    }

    return Promise.reject(error);
  }
);
