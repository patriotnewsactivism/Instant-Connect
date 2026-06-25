import { useState, useEffect, useRef, useCallback } from "react";

type Role = "host" | "guest";

interface UseWebRTCOptions {
  roomId: string;
  role: Role;
  onRemoteTrack?: (stream: MediaStream) => void;
}

export function useWebRTC({ roomId, role }: UseWebRTCOptions) {
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [peerJoined, setPeerJoined] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isEnded, setIsEnded] = useState(false);

  const pcRef = useRef<RTCPeerConnection | null>(null);
  const wsRef = useRef<WebSocket | null>(null);

  const startMedia = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });
      setLocalStream(stream);
      return stream;
    } catch (err: any) {
      setError(err.message || "Could not access camera/microphone");
      return null;
    }
  }, []);

  const createPeerConnection = useCallback((stream: MediaStream) => {
    const pc = new RTCPeerConnection({
      iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
    });

    pc.onicecandidate = (event) => {
      if (event.candidate && wsRef.current?.readyState === WebSocket.OPEN) {
        wsRef.current.send(
          JSON.stringify({ type: "ice-candidate", candidate: event.candidate })
        );
      }
    };

    pc.ontrack = (event) => {
      if (event.streams && event.streams[0]) {
        setRemoteStream(event.streams[0]);
      }
    };

    stream.getTracks().forEach((track) => {
      pc.addTrack(track, stream);
    });

    pcRef.current = pc;
    return pc;
  }, []);

  useEffect(() => {
    if (isEnded) return;

    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const wsUrl = `${protocol}//${window.location.host}/ws`;
    
    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;

    ws.onopen = async () => {
      ws.send(JSON.stringify({ type: "join", roomId, role }));
      const stream = await startMedia();
      if (!stream) return;
    };

    ws.onmessage = async (event) => {
      try {
        const msg = JSON.parse(event.data);

        if (msg.type === "peer-joined") {
          setPeerJoined(true);
          if (role === "host") {
            const stream = localStream || await startMedia();
            if (stream && !pcRef.current) {
              const pc = createPeerConnection(stream);
              const offer = await pc.createOffer();
              await pc.setLocalDescription(offer);
              ws.send(JSON.stringify({ type: "offer", sdp: offer }));
            }
          }
        }

        if (msg.type === "offer" && role === "guest") {
          setPeerJoined(true);
          const stream = localStream || await startMedia();
          if (stream) {
            const pc = pcRef.current || createPeerConnection(stream);
            await pc.setRemoteDescription(new RTCSessionDescription(msg.sdp));
            const answer = await pc.createAnswer();
            await pc.setLocalDescription(answer);
            ws.send(JSON.stringify({ type: "answer", sdp: answer }));
          }
        }

        if (msg.type === "answer" && role === "host") {
          if (pcRef.current) {
            await pcRef.current.setRemoteDescription(
              new RTCSessionDescription(msg.sdp)
            );
          }
        }

        if (msg.type === "ice-candidate") {
          if (pcRef.current) {
            await pcRef.current.addIceCandidate(
              new RTCIceCandidate(msg.candidate)
            );
          }
        }

        if (msg.type === "peer-left") {
          setPeerJoined(false);
          setRemoteStream(null);
          if (pcRef.current) {
            pcRef.current.close();
            pcRef.current = null;
          }
        }
      } catch (err) {
        console.error("WS message error", err);
      }
    };

    return () => {
      ws.close();
    };
  }, [roomId, role, startMedia, createPeerConnection, localStream, isEnded]);

  const toggleMute = () => {
    if (localStream) {
      localStream.getAudioTracks().forEach((track) => {
        track.enabled = !track.enabled;
      });
      setIsMuted(!localStream.getAudioTracks()[0]?.enabled);
    }
  };

  const endCall = () => {
    setIsEnded(true);
    if (localStream) {
      localStream.getTracks().forEach((t) => t.stop());
      setLocalStream(null);
    }
    if (pcRef.current) {
      pcRef.current.close();
      pcRef.current = null;
    }
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
    setRemoteStream(null);
  };

  return {
    localStream,
    remoteStream,
    error,
    peerJoined,
    isMuted,
    toggleMute,
    endCall,
    isEnded
  };
}
