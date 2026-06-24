import { apiClient, setAccessToken } from "./client";

interface loginCredentials {
  usernamae: string;
  password: string;
}

interface userDataInterface extends loginCredentials {
  email: string;
}

export const authService = {
  register: async (userData: userDataInterface) => {
    const res = await apiClient.post("/users/register", userData);
    return res.data;
  },

  login: async (credentials: loginCredentials) => {
    const formData = new URLSearchParams();
    formData.append("username", credentials.usernamae);
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
};
