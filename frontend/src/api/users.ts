import { apiClient } from "./client";

export const userService = {
  getPresence: async (): Promise<string[]> => {
    const res = await apiClient.get("/users/presence");
    return res.data;
  },
};
