import { useState } from "react";
import { Button } from "@components/ui/button";
import { TrashIcon } from "lucide-react";
import { useRemoveMember } from "@service-geek/api-client";
import { toast } from "sonner";

const RemoveTeamMember = ({
  isAdmin,
  id,
  email,
  orgId,
}: {
  isAdmin: boolean;
  id: string;
  email: string;
  orgId: string;
}) => {
  const [loadingDelete, setLoadingDelete] = useState(false);
  const removeMember = useRemoveMember();

  const handleRemove = async () => {
    setLoadingDelete(true);
    try {
      await removeMember.mutateAsync({
        orgId,
        memberId: id,
      });
      toast.success(`Removed ${email} from the organization.`);
    } catch (error) {
      console.error(error);
      toast.error(`Could not remove ${email}. Please try again.`);
    } finally {
      setLoadingDelete(false);
    }
  };

  if (isAdmin) return null;
  return (
    <Button
      variant='ghost'
      size='icon'
      onClick={handleRemove}
      disabled={loadingDelete}
      className='text-destructive hover:text-destructive/90'
    >
      <TrashIcon className='h-4 w-4' />
    </Button>
  );
};

export default RemoveTeamMember;
