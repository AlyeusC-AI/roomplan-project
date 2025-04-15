import { useState } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";
import RoomReadingCell from "./room-reading-cell";

const Readings = ({ room }: { room: RoomWithReadings }) => {
  const [expandedReadings, setExpandedReadings] = useState<Set<string>>(new Set());

  const toggleReading = (publicId: string) => {
    setExpandedReadings((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(publicId)) {
        newSet.delete(publicId);
      } else {
        newSet.add(publicId);
      }
      return newSet;
    });
  };

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
    <div className="space-y-2">
      {room.RoomReading?.sort((a, b) =>
        new Date(a.createdAt) > new Date(b.createdAt) ? -1 : 1
      ).map((r) => {
        const isExpanded = expandedReadings.has(r.publicId);
        return (
          <div
            key={r.publicId}
            className="rounded-lg border border-gray-200 bg-white shadow-sm transition-all duration-200 hover:shadow-md dark:border-gray-700 dark:bg-gray-800"
          >
            <button
              onClick={() => toggleReading(r.publicId)}
              className="flex w-full items-center justify-between p-3 hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              <span className="font-medium dark:text-white">
                {new Date(r.date).toLocaleDateString()}
              </span>
              {isExpanded ? (
                <ChevronDown className="h-4 w-4 dark:text-gray-400" />
              ) : (
                <ChevronRight className="h-4 w-4 dark:text-gray-400" />
              )}
            </button>
            <div
              className={`overflow-hidden transition-all duration-200 ${
                isExpanded ? "max-h-[1000px] opacity-100" : "max-h-0 opacity-0"
              }`}
            >
              <div className="p-4 pt-0">
                <RoomReadingCell r={r} room={room} />
              </div>
            </div>
          </div>
        );
      })}
      {room.RoomReading.length === 0 && (
        <div className="flex items-center justify-center rounded-lg border border-dashed border-gray-300 bg-gray-50 p-8 dark:border-gray-700 dark:bg-gray-900">
          <div className="text-center">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">No reading data</h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Click "Add Reading" to record temperature, humidity, and dehumidifer readings.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Readings;
