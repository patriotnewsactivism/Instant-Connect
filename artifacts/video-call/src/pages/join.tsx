import { useEffect, useRef, useState } from "react";
import { useParams, useLocation } from "wouter";
import { 
  useGetRoom, 
  useSendMessage,
  useGetMessages,
  getGetMessagesQueryKey
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { useWebRTC } from "@/hooks/use-webrtc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Mic, MicOff, PhoneOff, Star, Camera, Video as VideoIcon, Send, Heart
} from "lucide-react";
import { FILTERS, STICKERS } from "@/lib/constants";
import { useStickers } from "@/hooks/use-stickers";
import { DraggableSticker } from "@/components/draggable-sticker";
import { ReactionBurst } from "@/components/reaction-burst";

export default function Join() {
  const params = useParams();
  const roomId = params.roomId!;
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const [hasStarted, setHasStarted] = useState(false);
  
  const [mode, setMode] = useState<"call" | "message">("call");
  
  const [activeFilter, setActiveFilter] = useState("none");
  const { stickers, addSticker, updateSticker, removeSticker } = useStickers();

  const [childName, setChildName] = useState("");
  const [isNameSet, setIsNameSet] = useState(false);
  const [messageContent, setMessageContent] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    const savedName = localStorage.getItem(`kidcall_child_name_${roomId}`);
    if (savedName) {
      setChildName(savedName);
      setIsNameSet(true);
    }
  }, [roomId]);

  const { data: room, isLoading, isError } = useGetRoom(roomId, {
    query: { enabled: !!roomId, queryKey: ["getRoom", roomId], retry: false }
  });

  const { data: messages = [] } = useGetMessages(roomId, {
    query: { enabled: !!roomId && mode === "message" }
  });

  const sendMessageMutation = useSendMessage();

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageContent.trim() || !childName.trim()) return;

    if (!isNameSet) {
      localStorage.setItem(`kidcall_child_name_${roomId}`, childName.trim());
      setIsNameSet(true);
    }

    setIsSending(true);
    sendMessageMutation.mutate(
      { 
        params: { roomId },
        data: { senderName: childName.trim(), content: messageContent.trim(), type: "text" } 
      },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getGetMessagesQueryKey(roomId) });
          setMessageContent("");
          setShowSuccess(true);
          setTimeout(() => setShowSuccess(false), 3000);
        },
        onSettled: () => setIsSending(false)
      }
    );
  };

  const {
    localStream,
    remoteStream,
    error,
    isMuted,
    toggleMute,
    endCall,
    isEnded
  } = useWebRTC({ roomId, role: "guest" });

  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    document.documentElement.classList.add("child-theme");
    return () => {
      document.documentElement.classList.remove("child-theme");
    };
  }, []);

  useEffect(() => {
    if (localVideoRef.current && localStream) {
      localVideoRef.current.srcObject = localStream;
    }
  }, [localStream, hasStarted, mode]);

  useEffect(() => {
    if (remoteVideoRef.current && remoteStream) {
      remoteVideoRef.current.srcObject = remoteStream;
    }
  }, [remoteStream, hasStarted, mode]);

  if (isLoading) {
    return (
      <div className="min-h-[100dvh] bg-[hsl(var(--background))] flex flex-col items-center justify-center p-4">
        <div className="text-4xl animate-bounce mb-4">🌟</div>
        <p className="text-xl font-bold text-primary">Getting ready...</p>
      </div>
    );
  }

  if (isError || !room) {
    return (
      <div className="min-h-[100dvh] bg-[hsl(var(--background))] flex flex-col items-center justify-center p-4 text-center">
        <div className="text-6xl mb-6">Oops! 🙈</div>
        <h1 className="text-3xl font-extrabold text-slate-800 mb-4">We couldn't find that call.</h1>
        <p className="text-lg text-slate-600">Maybe the link is wrong?</p>
      </div>
    );
  }

  if (error && mode === "call") {
    return (
      <div className="min-h-[100dvh] bg-[hsl(var(--background))] flex flex-col items-center justify-center p-4 text-center">
        <div className="bg-white p-8 rounded-[2rem] shadow-xl max-w-md w-full">
          <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <Camera className="w-10 h-10 text-primary" />
          </div>
          <h1 className="text-2xl font-black text-foreground mb-4">We need your camera! 📸</h1>
          <p className="text-lg text-slate-600 mb-6 font-medium">Please tap "Allow" when the browser asks, so we can see your smiling face!</p>
          <Button onClick={() => window.location.reload()} className="w-full h-16 text-xl rounded-2xl bg-primary hover:bg-primary/90 text-white shadow-md">
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  if (isEnded) {
    return (
      <div className="min-h-[100dvh] bg-[hsl(var(--background))] flex flex-col items-center justify-center p-4 text-center">
        <div className="text-6xl mb-6">👋</div>
        <h1 className="text-4xl font-black text-foreground mb-4">Bye bye!</h1>
        <p className="text-xl font-medium text-slate-600">The call has ended.</p>
      </div>
    );
  }

  if (!hasStarted) {
    return (
      <div className="min-h-[100dvh] bg-[hsl(var(--background))] flex flex-col items-center justify-center p-6 text-center overflow-hidden relative">
        <div className="absolute top-10 left-10 text-4xl animate-bounce" style={{ animationDelay: '0s' }}>⭐</div>
        <div className="absolute bottom-20 right-10 text-5xl animate-bounce" style={{ animationDelay: '0.2s' }}>🎈</div>
        <div className="absolute top-1/4 right-20 text-3xl animate-bounce" style={{ animationDelay: '0.4s' }}>🚀</div>
        
        <div className="z-10 bg-white/80 backdrop-blur-xl p-8 rounded-[3rem] shadow-2xl border-4 border-white max-w-sm w-full">
          <h1 className="text-4xl font-black text-foreground mb-2">Hello there!</h1>
          <p className="text-xl font-bold text-primary mb-8">{room.hostName} is waiting.</p>
          
          <div className="space-y-4">
            <Button 
              onClick={() => { setMode("call"); setHasStarted(true); }} 
              className="w-full h-20 text-2xl font-black rounded-3xl bg-primary hover:bg-primary/90 text-white shadow-xl hover:scale-105 transition-transform active:scale-95 flex items-center justify-center gap-3"
            >
              <span>Join Call!</span>
              <VideoIcon className="w-8 h-8 fill-current" />
            </Button>
            
            <Button 
              onClick={() => { setMode("message"); setHasStarted(true); }} 
              variant="outline"
              className="w-full h-16 text-xl font-bold rounded-2xl border-4 border-primary text-primary hover:bg-primary/10 shadow-md hover:scale-105 transition-transform active:scale-95 flex items-center justify-center gap-3"
            >
              <span>Send a Message</span>
              <Send className="w-6 h-6" />
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[100dvh] bg-[hsl(var(--background))] flex flex-col relative overflow-hidden">
      
      {/* Mode Switcher */}
      <div className="absolute top-4 right-4 z-30 flex bg-white/80 backdrop-blur-md rounded-full p-1 shadow-lg border-2 border-white">
        <button 
          onClick={() => setMode("call")}
          className={`px-4 py-2 rounded-full font-bold text-sm transition-colors flex items-center gap-2 ${mode === "call" ? "bg-primary text-white" : "text-slate-500 hover:text-primary"}`}
        >
          <VideoIcon className="w-4 h-4" />
          Call
        </button>
        <button 
          onClick={() => setMode("message")}
          className={`px-4 py-2 rounded-full font-bold text-sm transition-colors flex items-center gap-2 ${mode === "message" ? "bg-primary text-white" : "text-slate-500 hover:text-primary"}`}
        >
          <Send className="w-4 h-4" />
          Message
        </button>
      </div>

      {mode === "message" && (
        <div className="absolute inset-0 z-20 bg-[hsl(var(--background))] flex flex-col pt-20 px-4 pb-4 overflow-y-auto">
          <div className="max-w-md w-full mx-auto space-y-6">
            <div className="bg-white rounded-[2rem] p-6 shadow-xl border-4 border-primary/20">
              <h2 className="text-2xl font-black text-foreground mb-4 flex items-center gap-2">
                <span className="text-3xl">💌</span> Send a note to {room.hostName}!
              </h2>
              
              <form onSubmit={handleSendMessage} className="space-y-4">
                {!isNameSet && (
                  <div className="space-y-2">
                    <label className="font-bold text-slate-700 text-sm">What's your name?</label>
                    <Input 
                      value={childName}
                      onChange={(e) => setChildName(e.target.value)}
                      placeholder="My name is..."
                      className="h-14 rounded-2xl text-lg font-bold border-2 border-slate-200 focus-visible:ring-primary focus-visible:border-primary"
                    />
                  </div>
                )}
                
                <div className="space-y-2">
                  <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide py-1">
                    {STICKERS.map(emoji => (
                      <button
                        key={emoji}
                        type="button"
                        onClick={() => setMessageContent(prev => prev + emoji)}
                        className="shrink-0 w-12 h-12 flex items-center justify-center text-3xl bg-slate-50 rounded-xl hover:bg-slate-100 hover:scale-110 transition-transform active:scale-95 shadow-sm border border-slate-200"
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                  
                  <Input 
                    value={messageContent}
                    onChange={(e) => setMessageContent(e.target.value)}
                    placeholder="Type a message..."
                    className="h-16 rounded-2xl text-xl border-2 border-slate-200 focus-visible:ring-primary focus-visible:border-primary px-4"
                  />
                </div>
                
                <Button 
                  type="submit" 
                  disabled={!messageContent.trim() || (!isNameSet && !childName.trim()) || isSending}
                  className="w-full h-16 text-xl font-black rounded-2xl bg-primary hover:bg-primary/90 text-white shadow-lg active:scale-95 transition-transform"
                >
                  {isSending ? "Sending..." : "Send it! 🚀"}
                </Button>
                
                {showSuccess && (
                  <div className="text-center font-bold text-emerald-500 animate-bounce pt-2">
                    Your message is on its way! 💌
                  </div>
                )}
              </form>
            </div>

            {messages.length > 0 && (
              <div className="bg-white/60 backdrop-blur rounded-[2rem] p-6 shadow-sm border-2 border-white">
                <h3 className="font-bold text-slate-500 mb-4 text-sm uppercase tracking-wider">Your recent messages</h3>
                <div className="space-y-3">
                  {messages.filter(m => m.senderName === childName).slice(0, 5).map(msg => (
                    <div key={msg.id} className="bg-primary/10 rounded-2xl rounded-tr-sm p-4 relative">
                      <div className="text-foreground font-medium text-lg pr-12">
                        {msg.content}
                      </div>
                      <div className="absolute right-4 top-4 text-xs font-bold text-slate-400">
                        {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Remote Video (Host / Parent) */}
      <div className={`absolute inset-0 z-0 bg-slate-900 transition-opacity ${mode === "call" ? "opacity-100" : "opacity-0 pointer-events-none"}`}>
        {remoteStream ? (
          <video
            ref={remoteVideoRef}
            autoPlay
            playsInline
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center flex-col gap-6 p-6 text-center bg-gradient-to-br from-primary to-orange-400">
            <div className="text-8xl animate-bounce">👀</div>
            <h2 className="text-4xl font-black text-white drop-shadow-md">Looking for {room.hostName}...</h2>
          </div>
        )}
      </div>

      {/* Local Video (Child) - Prominent PIP with features */}
      <div className={`absolute top-6 left-6 z-10 transition-all duration-500 ${mode === "call" ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-10 pointer-events-none"}`}>
        <div className="relative w-40 h-56 md:w-56 md:h-80 rounded-[2rem] overflow-hidden shadow-2xl border-4 border-white bg-slate-800 rotate-2 hover:rotate-0 transition-transform">
          <video
            ref={localVideoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-full object-cover scale-x-[-1]"
            style={{ filter: activeFilter }}
          />
          
          <div className="absolute inset-0 overflow-hidden pointer-events-auto">
            {stickers.map((sticker) => (
              <DraggableSticker
                key={sticker.id}
                emoji={sticker.emoji}
                initialX={sticker.x}
                initialY={sticker.y}
                onMove={(x, y) => updateSticker(sticker.id, x, y)}
                onRemove={() => removeSticker(sticker.id)}
              />
            ))}
          </div>

          <div className="absolute bottom-2 left-0 right-0 text-center pointer-events-none">
            <span className="bg-white/80 backdrop-blur text-foreground text-sm font-bold px-3 py-1 rounded-full shadow-sm">You!</span>
          </div>
        </div>

        {/* Fun Tools */}
        <div className="mt-4 bg-white/90 backdrop-blur-md rounded-[1.5rem] p-3 shadow-xl border-2 border-white w-40 md:w-56 pointer-events-auto">
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            {FILTERS.map((f) => (
              <button
                key={f.name}
                onClick={() => setActiveFilter(f.value)}
                className={`shrink-0 w-10 h-10 rounded-full border-4 overflow-hidden shadow-sm transition-transform active:scale-95 ${activeFilter === f.value ? 'border-primary scale-110' : 'border-white hover:border-slate-200'}`}
                title={f.name}
              >
                <div className="w-full h-full bg-gradient-to-br from-pink-400 to-orange-400" style={{ filter: f.value }} />
              </button>
            ))}
          </div>
          <div className="flex gap-2 overflow-x-auto pb-1 mt-2 scrollbar-hide">
            {STICKERS.slice(0, 10).map((emoji) => (
              <button
                key={emoji}
                onClick={() => addSticker(emoji)}
                className="shrink-0 w-10 h-10 flex items-center justify-center text-2xl bg-slate-100 hover:bg-slate-200 rounded-xl shadow-sm transition-transform active:scale-95"
              >
                {emoji}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className={`absolute bottom-8 left-0 right-0 z-20 flex justify-center gap-6 px-4 transition-opacity ${mode === "call" ? "opacity-100" : "opacity-0 pointer-events-none"}`}>
        <Button
          onClick={toggleMute}
          size="icon"
          className={`h-20 w-20 rounded-[2rem] shadow-xl border-4 transition-transform active:scale-95 ${
            isMuted 
              ? "bg-slate-200 border-white text-slate-500 hover:bg-slate-300" 
              : "bg-white border-white text-primary hover:bg-slate-50"
          }`}
        >
          {isMuted ? <MicOff className="h-8 w-8 text-red-500" /> : <Mic className="h-8 w-8" />}
        </Button>
        
        <ReactionBurst>
          <Button
            size="icon"
            className="h-20 w-20 rounded-[2rem] shadow-xl border-4 border-white bg-pink-500 hover:bg-pink-600 text-white transition-transform active:scale-95"
          >
            <Heart className="h-8 w-8 fill-current" />
          </Button>
        </ReactionBurst>

        <Button
          onClick={endCall}
          size="icon"
          className="h-20 w-20 rounded-[2rem] shadow-xl border-4 border-white bg-red-500 hover:bg-red-600 text-white transition-transform active:scale-95"
        >
          <PhoneOff className="h-8 w-8" />
        </Button>
      </div>
    </div>
  );
}
