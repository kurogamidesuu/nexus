import { useEffect, useState } from "react";
import { guildService, type GuildPayload } from "../api/guilds";
import styles from "./GuildSidebar.module.css";

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
  }, [activeGuildId, onSelectGuild]);

  const handleCreateGuild = async () => {
    const name = prompt("Enter a name for your new server:");
    if (name && name.trim()) {
      try {
        const newGuild = await guildService.createGuild(name);
        setGuilds([...guilds, newGuild]);
        onSelectGuild(newGuild.id);
      } catch {
        alert("Failed to create server.");
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
        onClick={handleCreateGuild}
        title="Add a Server"
      >
        +
      </div>
    </div>
  );
};

export default GuildSidebar;
