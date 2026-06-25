import type { ChannelResponse } from "./channels";
import { apiClient } from "./client";

export interface GuildPayload {
  id: string;
  name: string;
  owner_id: string;
}

export const guildService = {
  createGuild: async (name: string): Promise<GuildPayload> => {
    const res = await apiClient.post("/guilds", { name });
    return res.data;
  },

  getMyGuilds: async (): Promise<GuildPayload[]> => {
    const res = await apiClient.get("/guilds/me");
    return res.data;
  },

  getGuildChannels: async (guildId: string): Promise<ChannelResponse[]> => {
    const res = await apiClient.get(`/guilds/${guildId}/channels`);
    return res.data;
  },

  createInvite: async (guildId: string): Promise<{ code: string }> => {
    const res = await apiClient.post(`/guilds/${guildId}/invites`);
    return res.data;
  },

  joinGuild: async (code: string): Promise<GuildPayload> => {
    const res = await apiClient.post(`/guilds/join/${code}`);
    return res.data;
  },
};
