import axios from "axios";
import { useAuthStore } from "./storage";

interface ClientConfig {
  getToken: () => Promise<string | null>;
  baseURL?: string;
}

export const createClient = (config: ClientConfig) => {
  const instance = axios.create({
    baseURL:
      config.baseURL ||
      process.env.NEXT_PUBLIC_API_URL ||
      "http://localhost:3000",
  });

  instance.interceptors.request.use(async (axiosConfig) => {
    const token = await config.getToken();
    if (token) {
      axiosConfig.headers.Authorization = `Bearer ${token}`;
    }
    return axiosConfig;
  });

  return instance;
};

export const apiClient = createClient({
  getToken: async () => useAuthStore.getState().token,
});
