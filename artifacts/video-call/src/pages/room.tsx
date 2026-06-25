import { useEffect, useRef, useState } from "react";
import { useParams, useLocation } from "wouter";
import { 
  useGetRoom, 
  useGetMessages, 
  useMarkMessagesRead, 
  getGetMessagesQueryKey 
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { useWebRTC } from "@/hooks/use-webrtc";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { 
  Mic, MicOff, PhoneOff, Copy, Check, Users, MessageSquare, Heart
} from "lucide-react";
import { FILTERS, STICKERS } from "@/lib/constants";
import { useStickers } from "@/hooks/use-stickers";
import { DraggableSticker } from "@/components/draggable-sticker";
import { ReactionBurst } from "@/components/reaction-burst";

export default function Room() {
  const params = useParams();
  const roomId = params.roomId!;
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [copied, setCopied] = useState(false);

  const [activeFilter, setActiveFilter] = useState("none");
  const { stickers, addSticker, updateSticker, removeSticker } = useStickers();

  const [showMessages, setShowMessages] = useState(false);

  const { data: room, isLoading } = useGetRoom(roomId, {
    query: { enabled: !!roomId, queryKey: ["getRoom", roomId] }
  });

  const { data: messages = [] } = useGetMessages(roomId, {
    query: { enabled: !!roomId, refetchInterval: 15000 }
  });

  const markReadMutation = useMarkMessagesRead();

  const unreadCount = messages.filter(m => !m.readAt).length;

  useEffect(() => {
    if (showMessages && unreadCount > 0) {
      markReadMutation.mutate({ params: { roomId } }, {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getGetMessagesQueryKey(roomId) });
        }
      });
    }
  }, [showMessages, unreadCount, roomId, markReadMutation, queryClient]);

  const {
    localStream,
    remoteStream,
    peerJoined,
    isMuted,
    toggleMute,
    endCall,
    isEnded
  } = useWebRTC({ roomId, role: "host" });

  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (localVideoRef.current && localStream) {
      localVideoRef.current.srcObject = localStream;
    }
  }, [localStream]);

  useEffect(() => {
    if (remoteVideoRef.current && remoteStream) {
      remoteVideoRef.current.srcObject = remoteStream;
    }
  }, [remoteStream]);

  const joinUrl = `${window.location.origin}/join/${roomId}`;

  const copyLink = () => {
    navigator.clipboard.writeText(joinUrl);
    setCopied(true);
    toast({
      title: "Link Copied!",
      description: "Send this to the child to join the call.",
    });
    setTimeout(() => setCopied(false), 2000);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center text-slate-500">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-4"></div>
        <p>Loading room...</p>
      </div>
    );
  }

  if (!room || isEnded) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
        <div className="bg-white p-8 rounded-2xl shadow-sm text-center max-w-sm w-full">
          <div className="bg-slate-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <PhoneOff className="w-8 h-8 text-slate-500" />
          </div>
          <h2 className="text-xl font-semibold text-slate-800 mb-2">Call Ended</h2>
          <Button onClick={() => setLocation("/")} className="mt-4 w-full" variant="outline">
            Start a new call
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col overflow-hidden">
      <header className="p-4 flex items-center justify-between bg-slate-900/50 border-b border-white/10 text-white z-10 shrink-0">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center">
            <Users className="w-4 h-4 text-primary" />
          </div>
          <div>
            <h1 className="font-medium text-sm text-slate-200">KidCall Room</h1>
            <p className="text-xs text-slate-400">Host: {room.hostName}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {!peerJoined && (
            <Button 
              onClick={copyLink}
              variant="secondary" 
              size="sm"
              className="bg-white text-slate-900 hover:bg-slate-200 shadow-sm"
            >
              {copied ? <Check className="w-4 h-4 mr-2" /> : <Copy className="w-4 h-4 mr-2" />}
              {copied ? "Copied" : "Copy Invite Link"}
            </Button>
          )}
          <Button 
            onClick={() => setShowMessages(!showMessages)}
            variant="secondary" 
            size="sm"
            className="bg-slate-800 text-white hover:bg-slate-700 relative border-white/10"
          >
            <MessageSquare className="w-4 h-4 mr-2" />
            Messages
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold w-4 h-4 flex items-center justify-center rounded-full">
                {unreadCount}
              </span>
            )}
          </Button>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        {/* Main Call Area */}
        <main className="flex-1 relative flex flex-col items-center justify-center p-4">
          {/* Remote Video (Child) */}
          {remoteStream ? (
            <div className="relative w-full h-full max-w-5xl max-h-[70vh] rounded-2xl overflow-hidden shadow-2xl bg-black">
              <video
                ref={remoteVideoRef}
                autoPlay
                playsInline
                className="w-full h-full object-cover"
              />
            </div>
          ) : (
            <div className="text-center space-y-6">
              <div className="w-24 h-24 rounded-full bg-slate-800 flex items-center justify-center mx-auto animate-pulse">
                <Users className="w-10 h-10 text-slate-500" />
              </div>
              <div>
                <h2 className="text-2xl font-medium text-white mb-2">Waiting for child to join...</h2>
                <p className="text-slate-400 mb-6">Send them the link to get started.</p>
                <Button onClick={copyLink} size="lg" className="rounded-full px-8 bg-primary hover:bg-primary/90 text-white">
                  {copied ? <Check className="w-5 h-5 mr-2" /> : <Copy className="w-5 h-5 mr-2" />}
                  {copied ? "Link Copied!" : "Copy Invite Link"}
                </Button>
              </div>
            </div>
          )}

          {/* Local Video (Host) with Filters and Stickers */}
          <div className={`absolute bottom-24 left-4 md:bottom-8 md:left-8 transition-all duration-500 ${!remoteStream ? "opacity-0 translate-y-4 pointer-events-none" : "opacity-100 translate-y-0"}`}>
            <div className="relative w-32 h-48 md:w-48 md:h-64 rounded-xl overflow-hidden shadow-2xl border-2 border-white/20 bg-slate-800 group">
              <video
                ref={localVideoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover scale-x-[-1]"
                style={{ filter: activeFilter }}
              />
              
              {/* Stickers Overlay */}
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

            </div>
            
            {/* Host Camera Tools - Appear near local video */}
            <div className={`mt-4 bg-slate-900/80 backdrop-blur rounded-xl p-2 border border-white/10 transition-opacity ${remoteStream ? 'opacity-100' : 'opacity-0'}`}>
              <div className="flex gap-2 mb-2 overflow-x-auto pb-1 max-w-[200px] scrollbar-hide">
                {FILTERS.map((f) => (
                  <button
                    key={f.name}
                    onClick={() => setActiveFilter(f.value)}
                    className={`shrink-0 w-8 h-8 rounded-full border-2 overflow-hidden ${activeFilter === f.value ? 'border-primary' : 'border-transparent'}`}
                    title={f.name}
                  >
                    <div className="w-full h-full bg-slate-500" style={{ filter: f.value }} />
                  </button>
                ))}
              </div>
              <div className="flex gap-1 overflow-x-auto pb-1 max-w-[200px] scrollbar-hide">
                {STICKERS.slice(0, 8).map((emoji) => (
                  <button
                    key={emoji}
                    onClick={() => addSticker(emoji)}
                    className="shrink-0 w-8 h-8 flex items-center justify-center text-xl hover:bg-white/10 rounded"
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>
          </div>
          
          {/* Reaction Burst Button */}
          {remoteStream && (
            <div className="absolute bottom-24 right-4 md:bottom-8 md:right-8">
              <ReactionBurst>
                <Button size="icon" className="w-14 h-14 rounded-full shadow-lg bg-pink-500 hover:bg-pink-600 text-white border-2 border-white/20">
                  <Heart className="w-6 h-6 fill-current" />
                </Button>
              </ReactionBurst>
            </div>
          )}
        </main>

        {/* Messages Sidebar */}
        {showMessages && (
          <aside className="w-80 bg-slate-900 border-l border-white/10 flex flex-col shrink-0">
            <div className="p-4 border-b border-white/10">
              <h2 className="text-lg font-medium text-slate-200 flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-primary" />
                Inbox
              </h2>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.length === 0 ? (
                <div className="text-center text-slate-500 text-sm mt-10">
                  No messages yet &mdash; share the link with your child!
                </div>
              ) : (
                messages.map((msg) => (
                  <div key={msg.id} className="bg-slate-800 rounded-2xl rounded-tl-sm p-3 shadow-sm border border-slate-700">
                    <div className="text-xs text-primary font-medium mb-1">
                      {msg.senderName}
                    </div>
                    <div className="text-slate-200 text-sm break-words whitespace-pre-wrap">
                      {msg.content}
                    </div>
                    <div className="text-[10px] text-slate-500 mt-2 text-right">
                      {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                ))
              )}
            </div>
          </aside>
        )}
      </div>

      {/* Controls */}
      <footer className="p-4 bg-gradient-to-t from-slate-950 to-transparent flex justify-center gap-4 shrink-0 relative z-10">
        <Button
          onClick={toggleMute}
          size="icon"
          variant={isMuted ? "destructive" : "secondary"}
          className={`h-12 w-12 rounded-full shadow-lg ${!isMuted && "bg-slate-800 text-white hover:bg-slate-700 border-white/10"}`}
        >
          {isMuted ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
        </Button>
        <Button
          onClick={endCall}
          size="icon"
          variant="destructive"
          className="h-12 w-12 rounded-full shadow-lg"
        >
          <PhoneOff className="h-5 w-5" />
        </Button>
      </footer>
    </div>
  );
}
