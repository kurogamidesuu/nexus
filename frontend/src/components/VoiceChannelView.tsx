import { useEffect, useRef, useState } from "react";
import { useWebSocket } from "../hooks/useWebSocket";
import { useWebRTC } from "../hooks/useWebRTC";
import { useAuth } from "../context/AuthContext";
import styles from "./VoiceChannelView.module.css";

const AudioPlayer = ({
  stream,
  muted = false,
}: {
  stream: MediaStream;
  muted?: boolean;
}) => {
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    if (audioRef.current && stream) {
      audioRef.current.srcObject = stream;
    }
  }, [stream]);

  return <audio ref={audioRef} autoPlay muted={muted} />;
};

interface VoiceChannelProps {
  channelId: string;
  channelName: string;
}

const VoiceChannelView = ({ channelId, channelName }: VoiceChannelProps) => {
  const { user } = useAuth();
  const [isConnected, setIsConnected] = useState(false);

  const { connect, disconnect: wsDisconnect, ws } = useWebSocket(channelId);
  const {
    localStream,
    remoteStreams,
    startMicrophone,
    stopMicrophone,
    createPeerConnection,
    sendSignal,
  } = useWebRTC(channelId, ws.current);

  useEffect(() => {
    connect();
    return () => wsDisconnect();
  }, [connect, wsDisconnect]);

  useEffect(() => {
    const handleVoiceJoin = async (event: Event) => {
      const customEvent = event as CustomEvent;
      const { action, sender_id } = customEvent.detail;

      if (action === "voice_join" && sender_id !== user?.id) {
        try {
          const pc = createPeerConnection(sender_id);
          const offer = await pc.createOffer();
          await pc.setLocalDescription(offer);
          sendSignal("webrtc_offer", sender_id, offer);
        } catch (err) {
          console.error("Failed to create offer", err);
        }
      }
    };

    window.addEventListener("webrtcSignal", handleVoiceJoin);
    return () => window.removeEventListener("webrtcSignal", handleVoiceJoin);
  }, [createPeerConnection, sendSignal, user]);

  const handleJoinVoice = async () => {
    const stream = await startMicrophone();
    if (stream) {
      setIsConnected(true);
      if (ws.current?.readyState === WebSocket.OPEN) {
        ws.current.send(
          JSON.stringify({
            action: "voice_join",
            sender_id: user?.id,
            channel_id: channelId,
          }),
        );

        window.dispatchEvent(
          new CustomEvent("webrtcSignal", {
            detail: { action: "voice_join", sender_id: user?.id },
          }),
        );
      }
    }
  };

  const handleLeaveVoice = () => {
    stopMicrophone();
    setIsConnected(false);
  };

  useEffect(() => {
    return () => stopMicrophone();
  }, []);

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h2 className={styles.title}>🔊 {channelName}</h2>
        <p className={styles.subtitle}>Real-Time Voice Infrastructure</p>
      </header>

      <div className={styles.grid}>
        <div
          className={`${styles.userCard} ${localStream ? styles.localCard : ""}`}
        >
          <div className={styles.avatar} />
          <span>{user?.username} (You)</span>
          {localStream && (
            <span className={`${styles.statusText} ${styles.statusActive}`}>
              Mic Active
            </span>
          )}
        </div>

        {Object.entries(remoteStreams).map(([peerId, stream]) => (
          <div
            key={peerId}
            className={`${styles.userCard} ${styles.remoteCard}`}
          >
            <div className={styles.avatar} />
            <span>User {peerId.slice(-4)}</span>
            <span className={`${styles.statusText} ${styles.statusListening}`}>
              Listening
            </span>
            <AudioPlayer stream={stream} />
          </div>
        ))}
      </div>

      <div className={styles.controls}>
        {!isConnected ? (
          <button
            onClick={handleJoinVoice}
            className={`${styles.actionButton} ${styles.btnJoin}`}
          >
            Join Voice
          </button>
        ) : (
          <button
            onClick={handleLeaveVoice}
            className={`${styles.actionButton} ${styles.btnLeave}`}
          >
            Disconnect
          </button>
        )}
      </div>
    </div>
  );
};

export default VoiceChannelView;
