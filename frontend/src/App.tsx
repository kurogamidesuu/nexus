import ChannelView from "./components/ChannelView";
import Login from "./components/Login";
import { useAuth } from "./context/AuthContext";

function App() {
  const { user, isLoading, logout } = useAuth();

  if (isLoading) {
    return (
      <div
        style={{
          display: "flex",
          height: "100vh",
          justifyContent: "center",
          alignItems: "center",
          gap: "1em",
          backgroundColor: "#1e1e1e",
          color: "white",
        }}
      >
        <div
          className="loader"
          style={{
            height: "25px",
            width: "25px",
            background: "transparent",
            border: "3px solid white",
            borderRadius: "100%",
          }}
        />
        <h3>Loading Nexus...</h3>
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
        <div
          style={{
            display: "flex",
            height: "100vh",
          }}
        >
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
                Nexus App
              </h3>
              <div
                style={{
                  backgroundColor: "var(--background-tertiary)",
                  padding: "10px",
                  borderRadius: "4px",
                  color: "var(--text-normal)",
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
              <span style={{ fontWeight: "bold" }}>{user.username}</span>
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
                }}
              >
                Logout
              </button>
            </div>
          </div>

          <ChannelView channelId="general" />
        </div>
      ) : (
        <Login />
      )}
    </div>
  );
}

export default App;
