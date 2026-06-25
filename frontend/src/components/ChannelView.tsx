import { useEffect, useRef, useState, type FormEvent } from "react";
import styles from "./ChannelView.module.css";
import { useWebSocket } from "../hooks/useWebSocket";
import { channelService } from "../api/channels";

interface ChannelViewProps {
  channelId: string;
  channelName: string;
}

const ChannelView = ({ channelId, channelName }: ChannelViewProps) => {
  const [inputValue, setInputValue] = useState("");
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);

  const { messages, setMessages, connect, disconnect, sendMessage } =
    useWebSocket(channelId);
  const feedRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let isMounted = true;

    const loadHistoryAndConnect = async () => {
      setIsLoadingHistory(true);
      try {
        const history = await channelService.getMessages(channelId);
        if (isMounted) {
          setMessages(history);
        }
      } catch (error) {
        console.error("Failed to load history:", error);
      } finally {
        if (isMounted) {
          setIsLoadingHistory(false);
          connect();
        }
      }
    };

    loadHistoryAndConnect();

    return () => {
      isMounted = false;
      disconnect();
    };
  }, [channelId, connect, disconnect, setMessages]);

  useEffect(() => {
    if (feedRef.current) {
      feedRef.current.scrollTop = feedRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    sendMessage(inputValue);
    setInputValue("");
  };

  if (isLoadingHistory) {
    return (
      <div
        className={styles.container}
        style={{ justifyContent: "center", alignItems: "center" }}
      >
        <h3 style={{ color: "var(--text-muted)" }}>Loading history...</h3>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {/* Header */}
      <header className={styles.header}>
        <span className={styles.hash}>#</span>
        <span className={styles.channelName}>{channelName}</span>{" "}
      </header>

      {/* Message Feed */}
      <div className={styles.messageFeed} ref={feedRef}>
        {messages.map((msg, index) => (
          <div key={index} className={styles.message}>
            <div className={styles.messageHeader}>
              <span className={styles.sender}>{msg.sender}</span>
              <span className={styles.timestamp}>
                {new Date(msg.created_at).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            </div>
            <div className={styles.content}>{msg.content}</div>
          </div>
        ))}
      </div>

      {/* Input */}
      <div className={styles.inputWrapper}>
        <form onSubmit={handleSubmit} className={styles.inputForm}>
          <input
            type="text"
            className={styles.input}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder={`Message #${channelName}`}
            autoComplete="off"
            autoCorrect="off"
          />
        </form>
      </div>
    </div>
  );
};

export default ChannelView;
