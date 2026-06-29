import { useState } from "react";
import { useAuth } from "./context/AuthContext";
import Login from "./components/Login";
import ChannelView from "./components/ChannelView";
import VoiceChannelView from "./components/VoiceChannelView";
import GuildSidebar from "./components/GuildSidebar";
import ChannelSidebar from "./components/ChannelSidebar";
import styles from "./App.module.css";

function App() {
  const { user, isLoading } = useAuth();

  const [activeGuildId, setActiveGuildId] = useState<string | null>(null);
  const [activeChannelId, setActiveChannelId] = useState<string | null>(null);
  const [activeChannelName, setActiveChannelName] = useState<string>("");
  const [activeChannelType, setActiveChannelType] = useState<number>(0);

  const handleSelectChannel = (id: string, name: string, type: number) => {
    setActiveChannelId(id);
    setActiveChannelName(name);
    setActiveChannelType(type);
  };

  if (isLoading) {
    return (
      <div className={styles.loader}>
        <h2>Loading Nexus...</h2>
      </div>
    );
  }

  return (
    <div className={styles.appWrapper}>
      {user ? (
        <div className={styles.mainLayout}>
          {/* 1. Servers */}
          <GuildSidebar
            activeGuildId={activeGuildId}
            onSelectGuild={(id) => {
              setActiveGuildId(id);
              setActiveChannelId(null);
              setActiveChannelName("");
            }}
          />

          {/* 2. Channels & DMs */}
          <ChannelSidebar
            activeGuildId={activeGuildId}
            activeChannelId={activeChannelId}
            onSelectChannel={handleSelectChannel}
          />

          {/* 3. The Main Content Area */}
          <div className={styles.contentArea}>
            {activeChannelId ? (
              activeChannelType === 2 ? (
                <VoiceChannelView
                  channelId={activeChannelId}
                  channelName={activeChannelName}
                  key={`voice-${activeChannelId}`}
                />
              ) : (
                <ChannelView
                  channelId={activeChannelId}
                  channelName={activeChannelName}
                  key={`text-${activeChannelId}`}
                />
              )
            ) : (
              <div className={styles.placeholder}>
                <h2>Select a server and channel to start chatting</h2>
              </div>
            )}
          </div>
        </div>
      ) : (
        <Login />
      )}
    </div>
  );
}

export default App;
