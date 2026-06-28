import { useEffect, useState } from "react";
import { guildService } from "../api/guilds";
import { dmService, type DMChannelResponse } from "../api/dms";
import type { ChannelResponse } from "../api/channels";
import { useAuth } from "../context/AuthContext";
import styles from "./ChannelSidebar.module.css";

interface Props {
  activeGuildId: string | null;
  activeChannelId: string | null;
  onSelectChannel: (id: string, name: string) => void;
}

const ChannelSidebar = ({
  activeGuildId,
  activeChannelId,
  onSelectChannel,
}: Props) => {
  const { user, logout } = useAuth();

  const [channels, setChannels] = useState<ChannelResponse[]>([]);
  const [dms, setDms] = useState<DMChannelResponse[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (activeGuildId) {
          const data = await guildService.getGuildChannels(activeGuildId);
          setChannels(data);
          if (data.length > 0) {
            onSelectChannel(data[0].id, data[0].name);
          }
        } else {
          const data = await dmService.getMyDMs();
          setDms(data);
          if (data.length > 0) {
            onSelectChannel(data[0].id, data[0].recipient_username);
          } else {
            onSelectChannel("", "");
          }
        }
      } catch (error) {
        console.error("Failed to fetch sidebar data:", error);
      }
    };

    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeGuildId]);

  const handleGenerateInvite = async () => {
    if (!activeGuildId) return;
    try {
      const response = await guildService.createInvite(activeGuildId);
      prompt("Share this invite code with your friends:", response.code);
    } catch {
      alert("Error generating invite link.");
    }
  };

  const handleStartDM = async () => {
    const recipientId = prompt(
      "Enter the User ID of the person you want to message:",
    );
    if (!recipientId || !recipientId.trim()) return;

    try {
      const newDm = await dmService.getOrCreateDM(recipientId.trim());

      setDms((prev) => {
        if (!prev.find((dm) => dm.id === newDm.id)) {
          return [...prev, newDm];
        }
        return prev;
      });

      onSelectChannel(newDm.id, newDm.recipient_username);
    } catch (error: unknown) {
      if (error instanceof Error) {
        const errorMsg = error.message || "Failed to start conversation.";
        alert(errorMsg);
      }
    }
  };

  const actionButtonStyle = {
    background: "transparent",
    border: "none",
    color: "var(--text-muted)",
    cursor: "pointer",
    fontSize: "18px",
    padding: "0 4px",
    fontWeight: "bold",
  };

  return (
    <div className={styles.sidebar}>
      <div
        className={styles.header}
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <span>{activeGuildId ? "Server Channels" : "Direct Messages"}</span>

        {activeGuildId ? (
          <button
            onClick={handleGenerateInvite}
            style={actionButtonStyle}
            title="Create Invite"
          >
            +
          </button>
        ) : (
          <button
            onClick={handleStartDM}
            style={actionButtonStyle}
            title="Start Conversation"
          >
            +
          </button>
        )}
      </div>

      <div className={styles.channelList}>
        {/* Server Channels */}
        {activeGuildId &&
          channels.map((channel) => (
            <div
              key={channel.id}
              className={`${styles.channelItem} ${activeChannelId === channel.id ? styles.active : ""}`}
              onClick={() => onSelectChannel(channel.id, channel.name)}
            >
              <span className={styles.hash}>#</span>
              {channel.name}
            </div>
          ))}

        {/* Direct Messages */}
        {!activeGuildId &&
          dms.map((dm) => (
            <div
              key={dm.id}
              className={`${styles.channelItem} ${activeChannelId === dm.id ? styles.active : ""}`}
              onClick={() => onSelectChannel(dm.id, dm.recipient_username)}
            >
              <span className={styles.hash}>@</span>
              {dm.recipient_username}
            </div>
          ))}

        {!activeGuildId && dms.length === 0 && (
          <div
            style={{
              color: "var(--text-muted)",
              fontSize: "12px",
              padding: "16px",
              textAlign: "center",
            }}
          >
            No active conversations. Click + to start one!
          </div>
        )}
      </div>

      <div className={styles.footer}>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <span className={styles.username}>{user?.username}</span>
          <span style={{ fontSize: "10px", color: "var(--text-muted)" }}>
            ID: {user?.id}
          </span>
        </div>
        <button className={styles.logoutButton} onClick={logout}>
          Log Out
        </button>
      </div>
    </div>
  );
};

export default ChannelSidebar;
