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
        backgroundColor: "#1e1e1e",
        color: "white",
      }}
    >
      {user ? (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            height: "100vh",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <h1>Welcome back, {user.username}!</h1>
          <button
            onClick={logout}
            style={{
              padding: "10px 20px",
              marginTop: "20px",
              backgroundColor: "#ed4245",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
            }}
          >
            Log Out
          </button>
        </div>
      ) : (
        <Login />
      )}
    </div>
  );
}

export default App;
