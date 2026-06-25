import type { MessagePayload } from "../hooks/useWebsocket";
import { apiClient } from "./client";

export interface ChannelResponse {
  id: string;
  guild_id: string;
  name: string;
  created_at: string;
}

interface responseSchema {
  id: "string";
  channel_id: "string";
  user_id: "string";
  content: "string";
  created_at: "2026-06-25T11:30:50.576Z";
  sender: {
    username: "string";
  };
}

export const channelService = {
  getMessages: async (
    channelId: string,
    limit: number = 50,
  ): Promise<MessagePayload[]> => {
    const res = await apiClient.get(
      `/channels/${channelId}/messages?limit=${limit}`,
    );

    return res.data.map((msg: responseSchema) => ({
      id: msg.id,
      sender: msg.sender.username,
      channel_id: msg.channel_id,
      content: msg.content,
      created_at: msg.created_at,
    }));
  },
};
