import { Card, CardContent, CardHeader, CardTitle } from "@components/ui/card";
import { Badge } from "@components/ui/badge";
import { MessageCircle } from "lucide-react";

export default function ProjectConversationCard() {
  return (
    <Card>
      <CardHeader className='flex flex-row items-center justify-between pb-2'>
        <CardTitle className='flex items-center gap-2 text-base'>
          <MessageCircle className='h-5 w-5 text-gray-600' /> Project
          Conversation
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className='max-h-32 space-y-2 overflow-y-auto'>
          {/* Mock messages */}
          <div className='flex items-start gap-2'>
            <Badge variant='secondary'>DA</Badge>
            <div>
              <div className='text-xs text-gray-500'>David Alii</div>
              <div className='text-sm'>ok why are we adding this there</div>
              <div className='text-xs text-gray-400'>06/12/2025, 7:19 PM</div>
            </div>
          </div>
          <div className='flex items-start gap-2'>
            <Badge variant='secondary'>DA</Badge>
            <div>
              <div className='text-xs text-gray-500'>David Alii</div>
              <div className='text-sm'>Ok wait</div>
              <div className='text-xs text-gray-400'>06/12/2025, 8:20 PM</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
