import { useState } from "react";
import { useLocation } from "wouter";
import { useCreateRoom } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Video, ShieldCheck } from "lucide-react";

export default function Home() {
  const [, setLocation] = useLocation();
  const [hostName, setHostName] = useState("");
  const createRoom = useCreateRoom();

  const handleStartCall = (e: React.FormEvent) => {
    e.preventDefault();
    if (!hostName.trim()) return;

    createRoom.mutate(
      { data: { hostName: hostName.trim() } },
      {
        onSuccess: (room) => {
          setLocation(`/room/${room.id}`);
        },
      }
    );
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="flex justify-center mb-8">
          <div className="bg-primary/10 p-4 rounded-full">
            <Video className="w-10 h-10 text-primary" />
          </div>
        </div>
        
        <Card className="shadow-lg border-0">
          <CardHeader className="text-center space-y-2">
            <CardTitle className="text-2xl font-bold tracking-tight text-slate-900">
              Start a new call
            </CardTitle>
            <CardDescription className="text-base">
              Create a secure, child-friendly video room.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleStartCall} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-sm font-medium text-slate-700">
                  Your Name
                </Label>
                <Input
                  id="name"
                  placeholder="e.g. Mom, Dad, Grandma"
                  value={hostName}
                  onChange={(e) => setHostName(e.target.value)}
                  className="h-12 px-4 text-lg bg-slate-50 border-slate-200 focus-visible:ring-primary"
                  autoFocus
                />
              </div>

              <Button
                type="submit"
                className="w-full h-12 text-lg font-medium shadow-sm transition-all"
                disabled={!hostName.trim() || createRoom.isPending}
              >
                {createRoom.isPending ? "Creating Room..." : "Start Call"}
              </Button>
            </form>
            
            <div className="mt-8 flex items-center justify-center gap-2 text-sm text-slate-500">
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
              <span>Private & secure connection</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
