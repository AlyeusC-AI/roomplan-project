import { GroupByViews } from "@servicegeek/db";
import { trpc } from "@utils/trpc";

import FilterLabel from "./FilterLabel";
import { Button } from "@components/ui/button";
import { Calendar, ChevronDown, Home } from "lucide-react";

export default function GroupByPicker() {
  const utils = trpc.useUtils();
  const groupView = trpc.groupView.getGroupView.useQuery();
  const setPhotoView = trpc.groupView.setGroupView.useMutation({
    async onMutate({ view }) {
      await utils.groupView.getGroupView.cancel();
      const prevData = utils.groupView.getGroupView.getData();
      utils.groupView.getGroupView.setData(undefined, { groupView: view });
      return { prevData, view };
    },
    onError(err, _, ctx) {
      if (ctx?.prevData)
        utils.groupView.getGroupView.setData(undefined, ctx.prevData);
    },
    onSettled() {
      utils.groupView.getGroupView.invalidate();
    },
  });
  const isRoomView = groupView.data?.groupView === GroupByViews.roomView;

  const onClick = () => {
    setPhotoView.mutate({
      view:
        groupView.data?.groupView === GroupByViews.roomView
          ? GroupByViews.dateView
          : GroupByViews.roomView,
    });
  };

  return (
    <div className='flex flex-col'>
      <FilterLabel>Group By</FilterLabel>
      <Button onClick={onClick}>
        {!isRoomView ? (
          <>
            <Calendar className='mr-2 size-5' />
            Date
          </>
        ) : (
          <>
            <Home className='mr-2 size-5' />
            Room
          </>
        )}
        <ChevronDown className='ml-2 size-4' />
      </Button>
    </div>
  );
}
