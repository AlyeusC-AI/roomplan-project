import { Dispatch, SetStateAction, useState } from "react";
import { TertiaryButton } from "@components/components/button";
import { TrashIcon } from "lucide-react";
import useAmplitudeTrack from "@utils/hooks/useAmplitudeTrack";

const RemoveTeamMember = ({
  isAdmin,
  id,
  email,
  removeTeamMember,
  setEmailStatus,
}: {
  isAdmin: boolean;
  id: string;
  email: string;
  removeTeamMember: (id: string) => void;
  setEmailStatus: Dispatch<
    SetStateAction<{
      ok: boolean;
      message: string;
    } | null>
  >;
}) => {
  const [loadingDelete, setLoadingDelete] = useState(false);
  const { track } = useAmplitudeTrack();
  const removeMember = async (id: string, memberEmail: string) => {
    setLoadingDelete(true);
    try {
      const res = await fetch(`/api/organization/member/${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        track("Remove Organization Team Member");
        removeTeamMember(memberEmail);
        setEmailStatus({
          ok: true,
          message: `Removed ${memberEmail} from the organization.`,
        });
      } else {
        setEmailStatus({
          ok: false,
          message: `Could not remove ${memberEmail}. Please try again.`,
        });
      }
    } catch (error) {
      setEmailStatus({
        ok: false,
        message: `Could not remove ${memberEmail}. Please try again.`,
      });
    }
    setLoadingDelete(false);
  };

  if (isAdmin) return null;
  return (
    <TertiaryButton
      loading={loadingDelete}
      variant='danger'
      onClick={() => removeMember(id, email)}
    >
      <TrashIcon className='h-6' />
    </TertiaryButton>
  );
};

export default RemoveTeamMember;
