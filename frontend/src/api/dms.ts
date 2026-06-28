import { apiClient } from "./client";

export interface DMChannelResponse {
  id: string;
  recipient_id: string;
  recipient_username: string;
}

export const dmService = {
  getMyDMs: async (): Promise<DMChannelResponse[]> => {
    const res = await apiClient.get("/dms");
    return res.data;
  },

  getOrCreateDM: async (recipientId: string): Promise<DMChannelResponse> => {
    const res = await apiClient.post(`/dms/${recipientId}`);
    return res.data;
  },
};
