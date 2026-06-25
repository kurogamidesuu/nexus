import { useState } from "react";
import { useAuth } from "./context/AuthContext";
import Login from "./components/Login";
import ChannelView from "./components/ChannelView";
import GuildSidebar from "./components/GuildSidebar";

function App() {
  const { user, isLoading, logout } = useAuth();

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
          {/* Servers */}
          <GuildSidebar
            activeGuildId={activeGuildId}
            onSelectGuild={(id) => {
              setActiveGuildId(id);
              setActiveChannelId(null);
            }}
          />

          {/* Channels */}
          <div
            style={{
              width: "240px",
              backgroundColor: "var(--background-secondary)",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              padding: "16px",
            }}
          >
            <div>
              <h3
                style={{
                  fontSize: "14px",
                  color: "var(--text-muted)",
                  textTransform: "uppercase",
                  marginBottom: "16px",
                }}
              >
                {activeGuildId ? "Server Channels" : "Direct Messages"}
              </h3>

              <div
                style={{
                  backgroundColor: "var(--background-tertiary)",
                  padding: "10px",
                  borderRadius: "4px",
                  color: "var(--text-normal)",
                  cursor: "pointer",
                }}
              >
                # general
              </div>
            </div>

            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                backgroundColor: "var(--background-tertiary)",
                padding: "10px",
                borderRadius: "4px",
              }}
            >
              <span
                style={{
                  fontWeight: "bold",
                  fontSize: "14px",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                {user.username}
              </span>
              <button
                onClick={logout}
                style={{
                  backgroundColor: "var(--status-danger)",
                  color: "white",
                  border: "none",
                  borderRadius: "3px",
                  padding: "4px 8px",
                  cursor: "pointer",
                  fontSize: "12px",
                  fontWeight: "bold",
                }}
              >
                Log Out
              </button>
            </div>
          </div>

          {/* Main Content Area */}
          <div style={{ flex: 1 }}>
            {activeGuildId ? (
              <ChannelView channelId="general" />
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
                <h2>Select a server to start chatting</h2>
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
