import axios from "axios";
import { userStore } from "./state/user";

const api = axios.create({
  baseURL: process.env.EXPO_PUBLIC_BASE_URL,
});

api.interceptors.request.use((config) => {
  console.log(
    "🚀 ~ process.env.EXPO_PUBLIC_BASE_UR:",
    process.env.EXPO_PUBLIC_BASE_URL
  );
  const user = userStore.getState();

  if (user.session?.access_token) {
    config.headers["auth-token"] = user.session.access_token;
  }
  return config;
});

export { api };
