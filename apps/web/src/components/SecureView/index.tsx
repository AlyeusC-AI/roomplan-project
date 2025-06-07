import Address from "@components/DesignSystem/Address";

import SecureRoomImages from "./SecureRoomImages";

const SecureView = ({ noAccess }: { noAccess: boolean }) => {
  const inferences = inferencesStore((state) => state.inferences);
  const projectInfo = projectStore((state) => state.project);

  if (noAccess) {
    return (
      <div className='flex h-full flex-col items-center justify-center'>
        <h1 className='max-w-lg py-6 text-3xl font-bold'>Access Denied</h1>
        <p className='max-w-lg text-center'>
          Either you do not have access to view this project or the link has
          expired. Please ask the project manager to send you a new link.
        </p>
      </div>
    );
  }
  return (
    <div>
      <h1 className='mb-6 text-4xl'>RestoreGeek Secure View</h1>
      <div className='grid grid-cols-2 border border-gray-200 shadow-sm'>
        <div className='col-span-2 p-3'>
          <h4 className='text-lg font-medium'>Project Information</h4>
          <p>Details about the project shared with you.</p>
        </div>
        <div className='col-span-1 bg-gray-100 p-3'>Client Name </div>
        <div className='col-span-1 bg-gray-100 p-3'>
          {projectInfo?.clientName ?? ""}
        </div>
        <div className='col-span-1 p-3'>Client Address </div>
        <div className='col-span-1 p-3'>
          <Address address={projectInfo?.location ?? ""} />
        </div>
        <div className='col-span-1 bg-gray-100 p-3'>Adjuster Name </div>
        <div className='col-span-1 bg-gray-100 p-3'>
          {projectInfo?.adjusterName ?? ""}
        </div>
        <div className='col-span-1 p-3'>Adjuster Email </div>
        <div className='col-span-1 p-3'>{projectInfo?.adjusterEmail ?? ""}</div>
      </div>
      <h2 className='my-6 text-3xl'>Rooms</h2>
      {inferences?.map((roomData) => (
        <SecureRoomImages key={roomData.publicId} roomData={roomData} />
      ))}
    </div>
  );
};
export default SecureView;
