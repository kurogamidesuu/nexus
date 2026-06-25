import { useState } from "react";
import { useAuth } from "./context/AuthContext";
import Login from "./components/Login";
import ChannelView from "./components/ChannelView";
import GuildSidebar from "./components/GuildSidebar";
import ChannelSidebar from "./components/ChannelSidebar";

function App() {
  const { user, isLoading } = useAuth();

  const [activeGuildId, setActiveGuildId] = useState<string | null>(null);
  const [activeChannelId, setActiveChannelId] = useState<string | null>(null);

  if (isLoading) {
    return (
      <div
        style={{
          display: "flex",
          height: "100vh",
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "#1e1e1e",
          color: "white",
        }}
      >
        <h2>Loading Nexus...</h2>
      </div>
    );
  }

  return (
    <div
      style={{
        height: "100vh",
        width: "100vw",
        backgroundColor: "var(--background-primary)",
        color: "white",
      }}
    >
      {user ? (
        <div style={{ display: "flex", height: "100%" }}>
          {/* 1. Servers */}
          <GuildSidebar
            activeGuildId={activeGuildId}
            onSelectGuild={(id) => {
              setActiveGuildId(id);
              setActiveChannelId(null);
            }}
          />

          {/* Channels */}
          <ChannelSidebar
            activeGuildId={activeGuildId}
            activeChannelId={activeChannelId}
            onSelectChannel={setActiveChannelId}
          />

          {/* 3. The Main Content Area */}
          <div style={{ flex: 1 }}>
            {activeChannelId ? (
              <ChannelView channelId={activeChannelId} key={activeChannelId} />
            ) : (
              <div
                style={{
                  display: "flex",
                  height: "100%",
                  justifyContent: "center",
                  alignItems: "center",
                  color: "var(--text-muted)",
                }}
              >
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
