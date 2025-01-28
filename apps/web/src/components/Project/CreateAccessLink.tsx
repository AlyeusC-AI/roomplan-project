import { useState } from "react";
import Modal from "@components/DesignSystem/Modal";
import { AccessLinkExpiration } from "@servicegeek/db";
import { useRouter } from "next/router";
import { Clipboard, Share } from "lucide-react";
import { Button } from "@components/ui/button";
import { useParams } from "next/navigation";

const expirationOptions = {
  [AccessLinkExpiration.ONE_HOUR]: "1 Hour",
  [AccessLinkExpiration.ONE_DAY]: "1 Day",
  [AccessLinkExpiration.SEVEN_DAYS]: "7 Days",
  [AccessLinkExpiration.FOURTEEN_DAYS]: "14 Days",
  [AccessLinkExpiration.THIRTY_DAYS]: "30 Days",
  [AccessLinkExpiration.NEVER]: "never",
};

const CreateAccessLink = () => {
  const [isCreating, setIsCreating] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [didCopy, setDidCopy] = useState(false);

  const [selectedOption, setSelectedOption] = useState(
    AccessLinkExpiration.SEVEN_DAYS
  );
  const [accessLinkId, setAccessLinkId] = useState("");
  const { id } = useParams<{ id: string }>();

  const onClick = () => {
    setIsCreating(true);
  };

  const onClose = () => {
    setAccessLinkId("");
    setDidCopy(false);
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
    `https://www.servicegeek.app/secure-view/${accessLinkId}`;

  const onCopyClick = () => {
    navigator.clipboard.writeText(getLinkUrl());
    setDidCopy(true);
  };
  return (
    <>
      <Button className='sm:w-full md:w-auto' onClick={() => onClick()}>
        <Share className='h-6' />
      </Button>
      <Modal open={isCreating} setOpen={onClose}>
        {() => (
          <div>
            {accessLinkId ? (
              <div>
                <h3 className='text-lg font-medium leading-6 text-gray-900'>
                  Link Created
                </h3>
                <p className='my-2'>
                  Click the link below to copy it to your clipboard
                </p>
                <div
                  onClick={() => onCopyClick()}
                  className='flex cursor-pointer items-center justify-between rounded-sm border border-gray-300 text-sm shadow-sm hover:bg-gray-300 hover:shadow-md'
                >
                  <div className='w-5/6 truncate p-3'>{getLinkUrl()}</div>
                  <div className='flex items-center justify-center border-l border-gray-300 p-3'>
                    <Clipboard className='h-6' />
                  </div>
                </div>
                {/* {didCopy && (
                  <Alert title='Copied to clipboard!' type='success' />
                )} */}
              </div>
            ) : (
              <div>
                <h3 className='text-lg font-medium leading-6 text-gray-900'>
                  Create Access Link
                </h3>
                <p className='my-2'>
                  To create a secure link to share with anyone, select an
                  expiration date for your link and copy the generated link.
                  Once a link expires the contents will no longer be accessible.
                </p>
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
                      className='rounded-md shadow-md'
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
              </div>
            )}
          </div>
        )}
      </Modal>
    </>
  );
};

export default CreateAccessLink;
