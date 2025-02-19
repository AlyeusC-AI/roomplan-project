import RoomReadingCell from "./room-reading-cell";

const Readings = ({ room }: { room: RoomWithReadings }) => {
  // const updateReading = trpc.readings.updateReading.useMutation({
  //   async onMutate({
  //     projectPublicId,
  //     temperature,
  //     date,
  //     humidity,
  //     moistureContentFloor,
  //     moistureContentWall,
  //     readingPublicId,
  //   }) {
  //     await trpcContext.readings.getAll.cancel();
  //     const prevData = trpcContext.readings.getAll.getData();
  //     trpcContext.readings.getAll.setData({ projectPublicId }, (old) =>
  //       produce(old, (draft) => {
  //         if (!draft) return;
  //         const roomIndex = old?.findIndex(
  //           (p) => p.publicId === readingPublicId
  //         );
  //         if (roomIndex !== undefined && roomIndex >= 0) {
  //           draft[roomIndex] = {
  //             ...draft[roomIndex],
  //             ...(temperature && { temperature }),
  //             ...(date && { date: new Date(date) }),
  //             ...(humidity && { humidity }),
  //             ...(moistureContentFloor && { moistureContentFloor }),
  //             ...(moistureContentWall && { moistureContentWall }),
  //           };
  //         }
  //       })
  //     );
  //     return { prevData };
  //   },
  //   onError(err, { projectPublicId }, ctx) {
  //     // If the mutation fails, use the context-value from onMutate
  //     if (ctx?.prevData)
  //       trpcContext.readings.getAll.setData({ projectPublicId }, ctx.prevData);
  //   },
  //   onSettled() {
  //     trpcContext.readings.getAll.invalidate();
  //   },
  // });
  return (
    <div>
      {room.RoomReading.sort((a, b) =>
        new Date(a.createdAt) > new Date(b.createdAt) ? -1 : 1
      ).map((r) => (
        <RoomReadingCell key={r.publicId} r={r} room={room} />
      ))}
      {room.RoomReading.length === 0 && (
        <div className='ml-2 mt-4 flex items-center justify-start'>
          <div>
            <h3 className='text-lg font-medium'>No reading data</h3>
            <p className='text-sm text-muted-foreground'>
              Click &quot;Add Reading&quot; to record temperature, humidity, and
              dehumidifer readings.
            </p>
          </div>
          {/* <div className='max-w-[35%] border-l-2 border-l-gray-400 px-2'>
            <h5 className='text-lg font-semibold'>No reading data</h5>
            <p className='text-gray-500'>
              Click &quot;Add Reading&quot; to record temperature, humidity, and
              dehumidifer readings.
            </p>
          </div> */}
        </div>
      )}
    </div>
  );
};

export default Readings;
