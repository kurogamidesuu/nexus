import { useCallback, useEffect, useRef, useState } from "react";
import { getAccessToken } from "../api/client";

export interface MessagePayload {
  id: string;
  sender: string;
  channel_id: string;
  content: string;
  created_at: string;
}

export const useWebSocket = (channelId: string) => {
  const ws = useRef<WebSocket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [messages, setMessages] = useState<MessagePayload[]>([]);

  const connect = useCallback(() => {
    const token = getAccessToken();
    if (!token) {
      console.error("No access token available for WebSocket connection.");
      return;
    }

    ws.current = new WebSocket(`ws://localhost:8000/api/v1/ws?token=${token}`);

    ws.current.onopen = () => {
      setIsConnected(true);
      ws.current?.send(
        JSON.stringify({
          action: "subscribe",
          channel_id: channelId,
        }),
      );
    };

    ws.current.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.action === "presence") {
          const presenceEvent = new CustomEvent("presenceUpdate", {
            detail: data,
          });
          window.dispatchEvent(presenceEvent);
          return;
        }

        if (data.action && data.action.startsWith("webrtc_")) {
          const signalEvent = new CustomEvent("webrtcSignal", { detail: data });
          window.dispatchEvent(signalEvent);
          return;
        }
        setMessages((prev) => [...prev, data]);
      } catch (error) {
        console.error("Failed to parse websocket message", error);
      }
    };

    ws.current.onclose = () => {
      setIsConnected(false);
      console.log("Disconnected from Gateway");
    };
  }, [channelId]);

  const disconnect = useCallback(() => {
    if (ws.current) {
      ws.current.close();
    }
  }, []);

  const sendMessage = useCallback(
    (content: string) => {
      if (ws.current && ws.current.readyState === WebSocket.OPEN) {
        ws.current.send(
          JSON.stringify({
            action: "message",
            channel_id: channelId,
            content: content,
          }),
        );
      }
    },
    [channelId],
  );

  useEffect(() => {
    return () => {
      disconnect();
    };
  }, [disconnect]);

  return {
    ws,
    isConnected,
    messages,
    setMessages,
    connect,
    disconnect,
    sendMessage,
  };
};
