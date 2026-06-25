import { useEffect, useState } from "react";
import { guildService, type GuildPayload } from "../api/guilds";
import styles from "./GuildSidebar.module.css";
import axios from "axios";

interface GuildSidebarProps {
  activeGuildId: string | null;
  onSelectGuild: (id: string | null) => void;
}

const GuildSidebar = ({ activeGuildId, onSelectGuild }: GuildSidebarProps) => {
  const [guilds, setGuilds] = useState<GuildPayload[]>([]);

  useEffect(() => {
    const fetchGuilds = async () => {
      try {
        const data = await guildService.getMyGuilds();
        setGuilds(data);

        if (data.length > 0 && !activeGuildId) {
          onSelectGuild(data[0].id);
        }
      } catch (error) {
        console.error("Failed to fetch guilds:", error);
      }
    };

    fetchGuilds();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleServerAction = async () => {
    const action = prompt(
      "Type 'create' to set up a new server, or 'join' to enter an invite link/code:",
    );
    if (!action) return;

    const sanitizedAction = action.trim().toLowerCase();

    if (sanitizedAction === "create") {
      const name = prompt("Enter a name for your new server:");
      if (name && name.trim()) {
        try {
          const newGuild = await guildService.createGuild(name);
          setGuilds((prev) => [...prev, newGuild]);
          onSelectGuild(newGuild.id);
        } catch {
          alert("Failed to create server.");
        }
      }
    } else if (sanitizedAction === "join") {
      const inviteInput = prompt("Paste your invite code or link:");
      if (inviteInput && inviteInput.trim()) {
        try {
          const code =
            inviteInput.split("/").pop()?.trim() || inviteInput.trim();

          const joinedGuild = await guildService.joinGuild(code);
          setGuilds((prev) => [...prev, joinedGuild]);
          onSelectGuild(joinedGuild.id);
        } catch (error: unknown) {
          if (axios.isAxiosError(error)) {
            alert(
              error.response?.data?.detail ??
                "Failed to join server using this code.",
            );
          } else {
            alert("An unexpected error occurred.");
          }
        }
      }
    }
  };

  return (
    <div className={styles.sidebar}>
      {/* DM section */}
      <div
        className={`${styles.guildIcon} ${!activeGuildId ? styles.active : ""}`}
        onClick={() => onSelectGuild(null)}
      >
        DM
      </div>

      <div className={styles.separator} />

      {/* Guilds List */}
      {guilds.map((guild) => (
        <div
          key={guild.id}
          className={`${styles.guildIcon} ${activeGuildId === guild.id ? styles.active : ""}`}
          onClick={() => onSelectGuild(guild.id)}
          title={guild.name}
        >
          {guild.name.charAt(0).toUpperCase()}
        </div>
      ))}

      <div className={styles.separator} />

      <div
        className={`${styles.guildIcon} ${styles.addServer}`}
        onClick={handleServerAction}
        title="Add or Join a Server"
      >
        +
      </div>
    </div>
  );
};

export default GuildSidebar;
