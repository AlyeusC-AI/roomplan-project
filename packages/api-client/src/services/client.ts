import axios from "axios";
import { useAuthStore } from "./storage";

interface ClientConfig {
  getToken: () => Promise<string | null>;
  baseURL?: string;
}

export const baseURL =
  process.env.NEXT_PUBLIC_API_URL ||
  process.env.API_URL ||
  process.env.EXPO_PUBLIC_API_URL ||
  // "http://localhost:3000";
  "https://api.restoregeek.io";

export const createClient = (config: ClientConfig) => {
  const instance = axios.create({
    baseURL: config.baseURL || baseURL,

    // "http://localhost:3000",
  });

  instance.interceptors.request.use(async (axiosConfig) => {
    const token = await config.getToken();
    if (token) {
      axiosConfig.headers.Authorization = `Bearer ${token}`;
    }
    return axiosConfig;
  });

  instance.interceptors.response.use(
    (response) => response,
    (error) => {
      console.log("🚀 ~axios error:", error.response.data.message);
      // if (error.response.status === 401) {
      //   useAuthStore.getState().logout();
      // }
      return Promise.reject(error);
    }
  );
  return instance;
};

export const apiClient = createClient({
  getToken: async () => useAuthStore.getState().token,
});
