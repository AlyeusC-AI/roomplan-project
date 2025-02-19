import { useState } from "react";
import { Clipboard, Share } from "lucide-react";
import { Button, buttonVariants } from "@components/ui/button";
import { useParams } from "next/navigation";
import { LoadingPlaceholder, LoadingSpinner } from "@components/ui/spinner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
} from "@components/ui/dialog";
import { toast } from "sonner";

declare global {
  type AccessLinkExpiration =
    | "1-hour"
    | "1-day"
    | "7-days"
    | "14-days"
    | "30-days"
    | "never";
}

const expirationOptions: Record<AccessLinkExpiration, string> = {
  "1-hour": "1 Hour",
  "1-day": "1 Day",
  "7-days": "7 Days",
  "14-days": "14 Days",
  "30-days": "30 Days",
  never: "never",
};

const CreateAccessLink = () => {
  const [isCreating, setIsCreating] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const [selectedOption, setSelectedOption] = useState<AccessLinkExpiration>("7-days");
  const [accessLinkId, setAccessLinkId] = useState("");
  const { id } = useParams<{ id: string }>();

  const onClick = () => {
    setIsCreating(true);
  };

  const onClose = () => {
    setAccessLinkId("");
    setIsCreating(false);
  };

  const onCreateLink = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/project/${id}/create-access-link`, {
        method: "POST",
        body: JSON.stringify({
          expiresAt: selectedOption,
        }),
      });
      if (res.ok) {
        const json = await res.json();
        setAccessLinkId(json.linkId);
      }
    } catch (error) {
      console.error(error);
    }
    setIsLoading(false);
  };

  const getLinkUrl = () =>
    `https://www.restoregeek.app/secure-view/${accessLinkId}`;

  const onCopyClick = () => {
    navigator.clipboard.writeText(getLinkUrl());
    toast.success("Link copied to clipboard");
  };
  return (
    <>
      <Button
        variant='outline'
        className='sm:w-full md:w-auto'
        onClick={() => onClick()}
      >
        {isCreating ? <LoadingSpinner /> : <Share className='h-6' />}
      </Button>
      <Dialog open={accessLinkId.length > 0} onOpenChange={onClose}>
        <DialogContent>
          <div>
            {accessLinkId ? (
              <div>
                <DialogHeader>Link Created</DialogHeader>
                <DialogDescription>
                  Click the link below to copy it to your clipboard
                </DialogDescription>
                <div
                  onClick={() => onCopyClick()}
                  className={buttonVariants({
                    variant: "outline",
                    className: "mt-3 w-full",
                  })}
                >
                  <div className='w-5/6 truncate p-3'>{getLinkUrl()}</div>
                  <div className='justify-centerhover:border-none flex w-10 items-center p-3'>
                    <Clipboard className='h-6' />
                  </div>
                </div>
              </div>
            ) : (
              <div>
                {isLoading ? (
                  <LoadingPlaceholder />
                ) : (
                  <>
                    <DialogHeader>Create Access Link</DialogHeader>
                    <DialogDescription>
                      To create a secure link to share with anyone, select an
                      expiration date for your link and copy the generated link.
                      Once a link expires the contents will no longer be
                      accessible.
                    </DialogDescription>
                    <p className='my-2'>
                      {" "}
                      Viewers with a link will be able to view:
                    </p>
                    <ol className='list-disc pl-8'>
                      <li>Client Name & Address</li>
                      <li>Adjuster Name & Email</li>
                      <li>All photos</li>
                    </ol>
                    <div className='flex items-end justify-between'>
                      <div>
                        <p className='mr-4 mt-4 font-medium'>Expires at:</p>
                        <select
                          defaultValue={selectedOption}
                          className='rounded-md p-3 shadow-md'
                          onChange={(e) =>
                            setSelectedOption(
                              e.target.value as AccessLinkExpiration
                            )
                          }
                        >
                          {Object.keys(expirationOptions).map((v) => (
                            <option key={v} value={v}>
                              {expirationOptions[v as AccessLinkExpiration]}
                            </option>
                          ))}
                        </select>
                      </div>
                      <Button onClick={onCreateLink}>Create Link</Button>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default CreateAccessLink;
