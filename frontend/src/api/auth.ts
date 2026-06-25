import { apiClient, setAccessToken } from "./client";

export interface loginCredentialsInterface {
  username: string;
  password: string;
}

export interface userDataInterface extends loginCredentialsInterface {
  email: string;
}

export const authService = {
  register: async (userData: userDataInterface) => {
    const res = await apiClient.post("/users/register", userData);
    return res.data;
  },

  login: async (credentials: loginCredentialsInterface) => {
    const formData = new URLSearchParams();
    formData.append("username", credentials.username);
    formData.append("password", credentials.password);

    const res = await apiClient.post("/users/login", formData, {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
    });

    if (res.data.access_token) {
      setAccessToken(res.data.access_token);
    }

    return res.data;
  },

  getMe: async () => {
    const res = await apiClient.get("/users/me");
    return res.data;
  },

  logout: async () => {
    await apiClient.post("/users/logout");
    setAccessToken(null);
  },
};
