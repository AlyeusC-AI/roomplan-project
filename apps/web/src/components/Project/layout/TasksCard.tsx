import { Button } from "@components/ui/button";
import { ListTodo, Edit2 } from "lucide-react";

export default function TasksCard() {
  return (
    <div className="flex flex-col bg-background shadow-sm">
      <div className='flex flex-row items-center justify-between pb-2'>
        <div className='flex items-center gap-2 text-base font-semibold'>
          <ListTodo className='h-5 w-5 text-yellow-600' /> Tasks
        </div>
        <Button variant='ghost' size='icon'>
          <Edit2 className='h-4 w-4 text-gray-400' />
        </Button>
      </div>
      <div className='p-4 pt-2'>
        <div className='flex items-center gap-2 text-sm'>
          <span className='rounded-full border px-2 py-0.5 text-xs'>tasks</span>
        </div>
        <Button variant='outline' size='sm' className='mt-2 w-full'>
          + New Task
        </Button>
      </div>
    </div>
  );
}
