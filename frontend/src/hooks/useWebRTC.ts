import { useCallback, useEffect, useRef, useState } from "react";
import { useAuth } from "../context/AuthContext";

interface SignalMessage {
  action: "webrtc_offer" | "webrtc_answer" | "webrtc_ice_candidate";
  sender_id: string;
  target_user_id: string;
  data: any;
}

export const useWebRTC = (
  channelId: string | null,
  webSocket: WebSocket | null,
) => {
  const { user } = useAuth();

  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStreams, setRemoteStreams] = useState<
    Record<string, MediaStream>
  >({});

  const peerConnections = useRef<Record<string, RTCPeerConnection>>({});

  const rtcConfig: RTCConfiguration = {
    iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
  };

  const sendSignal = useCallback(
    (action: string, targetId: string, data: any) => {
      if (webSocket?.readyState === WebSocket.OPEN && user) {
        webSocket.send(
          JSON.stringify({
            action,
            sender_id: user.id,
            target_user_id: targetId,
            channel_id: channelId,
            data,
          }),
        );
      }
    },
    [webSocket, user, channelId],
  );

  const createPeerConnection = useCallback(
    (targetUserId: string) => {
      const pc = new RTCPeerConnection(rtcConfig);
      peerConnections.current[targetUserId] = pc;

      if (localStream) {
        localStream
          .getTracks()
          .forEach((track) => pc.addTrack(track, localStream));
      }

      pc.ontrack = (event) => {
        setRemoteStreams((prev) => ({
          ...prev,
          [targetUserId]: event.streams[0],
        }));
      };

      pc.onicecandidate = (event) => {
        if (event.candidate) {
          sendSignal("webrtc_ice_candidate", targetUserId, event.candidate);
        }
      };

      pc.onconnectionstatechange = () => {
        if (
          pc.connectionState === "disconnected" ||
          pc.connectionState === "failed"
        ) {
          setRemoteStreams((prev) => {
            const newState = { ...prev };
            delete newState[targetUserId];
            return newState;
          });
          delete peerConnections.current[targetUserId];
        }
      };

      return pc;
    },
    [localStream, sendSignal],
  );

  useEffect(() => {
    const handleSignal = async (event: Event) => {
      const customEvent = event as CustomEvent<SignalMessage>;
      const { action, sender_id, data } = customEvent.detail;

      if (!action.startsWith("webrtc_")) return;

      try {
        let pc = peerConnections.current[sender_id];

        if (action === "webrtc_offer") {
          if (!pc) pc = createPeerConnection(sender_id);
          await pc.setRemoteDescription(new RTCSessionDescription(data));

          const answer = await pc.createAnswer();
          await pc.setLocalDescription(answer);
          sendSignal("webrtc_answer", sender_id, answer);
        } else if (action === "webrtc_answer") {
          if (pc)
            await pc.setRemoteDescription(new RTCSessionDescription(data));
        } else if (action === "webrtc_ice_candidate") {
          if (pc) await pc.addIceCandidate(new RTCIceCandidate(data));
        }
      } catch (error) {
        console.error("WebRTC Error:", error);
      }
    };

    window.addEventListener("webrtcSignal", handleSignal);
    return () => window.removeEventListener("webrtcSignal", handleSignal);
  }, [createPeerConnection, sendSignal]);

  const startMicrophone = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: false,
      });
      setLocalStream(stream);
      return stream;
    } catch (error) {
      console.error("Microphone permission denied", error);
      alert("Nexus needs microphone access to join voice channels!");
      return null;
    }
  };

  const stopMicrophone = () => {
    if (localStream) {
      localStream.getTracks().forEach((track) => track.stop());
      setLocalStream(null);
    }
    Object.values(peerConnections.current).forEach((pc) => pc.close());
    peerConnections.current = {};
    setRemoteStreams({});
  };

  return {
    localStream,
    remoteStreams,
    startMicrophone,
    stopMicrophone,
    createPeerConnection,
    sendSignal,
  };
};
