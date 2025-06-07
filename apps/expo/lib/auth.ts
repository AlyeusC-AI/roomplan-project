import AsyncStorage from "@react-native-async-storage/async-storage";
import { setTokenStorage, type TokenStorage } from "@service-geek/api-client";

const TOKEN_KEY = "@auth_token";

const expoTokenStorage: TokenStorage = {
  setToken: async (token: string) => {
    await AsyncStorage.setItem(TOKEN_KEY, token);
  },
  getToken: async () => {
    return AsyncStorage.getItem(TOKEN_KEY);
  },
  clearToken: async () => {
    await AsyncStorage.removeItem(TOKEN_KEY);
  },
};

// Set the platform-specific token storage
setTokenStorage(expoTokenStorage);
