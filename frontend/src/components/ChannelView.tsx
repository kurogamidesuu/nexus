import {
  useEffect,
  useRef,
  useState,
  type FormEvent,
  type ChangeEvent,
} from "react";
import styles from "./ChannelView.module.css";
import { useWebSocket } from "../hooks/useWebSocket";
import { channelService } from "../api/channels";
import { uploadService } from "../api/uploads";

interface ChannelViewProps {
  channelId: string;
  channelName: string;
}

const ChannelView = ({ channelId, channelName }: ChannelViewProps) => {
  const [inputValue, setInputValue] = useState("");
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);
  const [isUploading, setIsUploading] = useState(false);

  const { messages, setMessages, connect, disconnect, sendMessage } =
    useWebSocket(channelId);
  const feedRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    let isMounted = true;

    const loadHistoryAndConnect = async () => {
      setIsLoadingHistory(true);
      try {
        const history = await channelService.getMessages(channelId);
        if (isMounted) setMessages(history);
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

  const handleFileUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const { upload_url, public_url } = await uploadService.getPresignedUrl(
        file.name,
        file.type,
      );

      await uploadService.uploadFileToCloud(upload_url, file);

      sendMessage(public_url);
    } catch (error) {
      alert("Failed to upload file. Check console for details.");
      console.error(error);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const isImageUrl = (url: string) => {
    return (
      url.startsWith("http") && url.match(/\.(jpeg|jpg|gif|png|webp)$/i) != null
    );
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
      <header className={styles.header}>
        <span className={styles.hash}>#</span>
        <span className={styles.channelName}>{channelName}</span>
      </header>

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
            <div className={styles.content}>
              {isImageUrl(msg.content) ? (
                <img
                  src={msg.content}
                  alt="Uploaded attachment"
                  style={{
                    maxWidth: "400px",
                    maxHeight: "300px",
                    borderRadius: "8px",
                    marginTop: "8px",
                  }}
                />
              ) : (
                msg.content
              )}
            </div>
          </div>
        ))}
      </div>

      <div className={styles.inputWrapper}>
        <form
          onSubmit={handleSubmit}
          className={styles.inputForm}
          style={{ display: "flex", alignItems: "center", gap: "8px" }}
        >
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            style={{ display: "none" }}
            accept="image/*"
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            style={{
              background: "var(--background-tertiary)",
              border: "none",
              color: "var(--text-normal)",
              width: "40px",
              height: "40px",
              borderRadius: "50%",
              cursor: isUploading ? "wait" : "pointer",
              fontSize: "20px",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            {isUploading ? "uploading..." : "+"}
          </button>

          <input
            type="text"
            className={styles.input}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder={`Message #${channelName}`}
            autoComplete="off"
            style={{ flex: 1 }}
          />
        </form>
      </div>
    </div>
  );
};

export default ChannelView;
