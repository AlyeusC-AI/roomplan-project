"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ChevronLeft, Save, Loader2 } from "lucide-react";
import { useCreateRoom } from "@service-geek/api-client";
import { toast } from "sonner";
import Link from "next/link";

export default function CreateRoomPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [roomName, setRoomName] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  const createRoomMutation = useCreateRoom();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!roomName.trim()) {
      toast.error("Room name is required");
      return;
    }

    setIsCreating(true);

    try {
      await createRoomMutation.mutateAsync({
        name: roomName.trim(),
        projectId: id as string,
      });

      toast.success("Room created successfully");
      router.push(`/projects/${id}/rooms`);
    } catch (error) {
      console.error("Error creating room:", error);
      toast.error("Failed to create room. Please try again.");
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className='space-y-6'>
      {/* Header */}
      <div className='flex items-center gap-4'>
        <Button variant='ghost' size='sm' asChild>
          <Link href={`/projects/${id}/rooms`}>
            <ChevronLeft className='mr-2 h-4 w-4' />
            Back
          </Link>
        </Button>
        <div>
          <h1 className='text-2xl font-bold tracking-tight'>Create New Room</h1>
          <p className='text-muted-foreground'>
            Add a new room to this project
          </p>
        </div>
      </div>

      {/* Form */}
      <Card className='max-w-md'>
        <CardHeader>
          <CardTitle>Room Details</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className='space-y-4'>
            <div className='space-y-2'>
              <Label htmlFor='roomName'>Room Name</Label>
              <Input
                id='roomName'
                value={roomName}
                onChange={(e) => setRoomName(e.target.value)}
                placeholder='e.g., Living Room, Kitchen, Master Bedroom'
                required
              />
            </div>

            <div className='flex gap-2 pt-4'>
              <Button
                type='submit'
                disabled={isCreating || !roomName.trim()}
                className='flex-1'
              >
                {isCreating ? (
                  <>
                    <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                    Creating...
                  </>
                ) : (
                  <>
                    <Save className='mr-2 h-4 w-4' />
                    Create Room
                  </>
                )}
              </Button>
              <Button
                type='button'
                variant='outline'
                onClick={() => router.push(`/projects/${id}/rooms`)}
                disabled={isCreating}
              >
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
