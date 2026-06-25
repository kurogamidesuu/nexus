import { useEffect, useState } from "react";
import { guildService } from "../api/guilds";
import type { ChannelResponse } from "../api/channels";
import { useAuth } from "../context/AuthContext";
import styles from "./ChannelSidebar.module.css";

interface Props {
  activeGuildId: string | null;
  activeChannelId: string | null;
  onSelectChannel: (id: string) => void;
}

const ChannelSidebar = ({
  activeGuildId,
  activeChannelId,
  onSelectChannel,
}: Props) => {
  const { user, logout } = useAuth();
  const [channels, setChannels] = useState<ChannelResponse[]>([]);

  useEffect(() => {
    const fetchChannels = async () => {
      if (!activeGuildId) {
        setChannels([]);
        return;
      }
      try {
        const data = await guildService.getGuildChannels(activeGuildId);
        setChannels(data);

        if (data.length > 0 && !activeChannelId) {
          onSelectChannel(data[0].id);
        }
      } catch (error) {
        console.error("Failed to fetch channels", error);
      }
    };

    fetchChannels();
  }, [activeGuildId, activeChannelId, onSelectChannel]);

  return (
    <div className={styles.sidebar}>
      <div className={styles.header}>
        {activeGuildId ? "Server Channels" : "Direct Messages"}
      </div>

      <div className={styles.channelList}>
        {channels.map((channel) => (
          <div
            key={channel.id}
            className={`${styles.channelItem} ${activeChannelId === channel.id ? styles.active : ""}`}
            onClick={() => onSelectChannel(channel.id)}
          >
            <span className={styles.hash}>#</span>
            {channel.name}
          </div>
        ))}

        {!activeGuildId && (
          <div
            style={{
              color: "var(--text-muted)",
              fontSize: "14px",
              padding: "8px",
              textAlign: "center",
            }}
          >
            Friends list coming soon...
          </div>
        )}
      </div>

      <div className={styles.footer}>
        <span className={styles.username}>{user?.username}</span>
        <button className={styles.logoutButton} onClick={logout}>
          Log Out
        </button>
      </div>
    </div>
  );
};

export default ChannelSidebar;
