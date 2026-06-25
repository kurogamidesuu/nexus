import { useEffect, useRef, useState, type FormEvent } from "react";
import styles from "./ChannelView.module.css";
import { useWebSocket } from "../hooks/useWebsocket";

interface ChannelViewProps {
  channelId: string;
}

const ChannelView = ({ channelId }: ChannelViewProps) => {
  const [inputValue, setInputValue] = useState("");
  const { messages, connect, disconnect, sendMessage } =
    useWebSocket(channelId);
  const feedRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    connect();
    return () => {
      disconnect();
    };
  }, [connect, disconnect]);

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

  return (
    <div className={styles.container}>
      {/* Header */}
      <header className={styles.header}>
        <span className={styles.hash}>#</span>
        <span className={styles.channelName}>{channelId}</span>
      </header>

      {/* The Message Feed */}
      <div className={styles.messageFeed} ref={feedRef}>
        {messages.map((msg, index) => (
          // Message Box
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
            placeholder={`Message #${channelId}`}
            autoComplete="off"
            autoCorrect="off"
          />
        </form>
      </div>
    </div>
  );
};

export default ChannelView;
