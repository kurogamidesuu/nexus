import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import styles from "./Login.module.css";

const Login = () => {
  const { login, register } = useAuth();

  const [isLoginMode, setIsLoginMode] = useState(true);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: SubmitEvent) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      if (isLoginMode) {
        await login({ username, password });
      } else {
        await register({ username, email, password });
      }
    } catch (err: any) {
      setError(
        err.response?.data?.detail ||
          "An error occurred during authentication.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={styles.wrapper}>
      <div className={styles.formCard}>
        <h2 className={styles.title}>
          {isLoginMode ? "Welcome Back" : "Create an Account"}
        </h2>

        {error && <div className={styles.errorBanner}>{error}</div>}

        <form onSubmit={handleSubmit}>
          {!isLoginMode && (
            <div className={styles.inputGroup}>
              <label className={styles.label}>Email</label>
              <input
                type="email"
                className={styles.input}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required={!isLoginMode}
              />
            </div>
          )}

          <div className={styles.inputGroup}>
            <label className={styles.label}>Username</label>
            <input
              type="text"
              className={styles.input}
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>

          <div className={styles.inputGroup}>
            <label className={styles.label}>Password</label>
            <input
              type="password"
              className={styles.input}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            className={styles.submitButton}
            disabled={isSubmitting}
          >
            {isSubmitting
              ? "Processing..."
              : isLoginMode
                ? "Log In"
                : "Register"}
          </button>
        </form>

        <p className={styles.footerText}>
          {isLoginMode ? "Need an account? " : "Already have an account? "}
          <span
            onClick={() => {
              setIsLoginMode(!isLoginMode);
              setError("");
            }}
            className={styles.toggleModeLink}
          >
            {isLoginMode ? "Register" : "Log In"}
          </span>
        </p>
      </div>
    </div>
  );
};

export default Login;
