import { Dispatch, SetStateAction } from "react";
import { PhotoViews } from "@servicegeek/db";
import { trpc } from "@utils/trpc";

import FilterLabel from "./FilterLabel";
import { Button } from "@components/ui/button";
import { ChevronDown, Grid2X2, List } from "lucide-react";

export default function ViewPicker({
  photoView,
  setPhotoView,
}: {
  photoView: PhotoViews;
  setPhotoView: Dispatch<SetStateAction<PhotoViews>>;
}) {
  const utils = trpc.useContext();
  const setPhotoViewMutation = trpc.photoView.setPhotoView.useMutation({
    async onMutate({ view }) {
      await utils.photoView.getPhotoView.cancel();
      const prevData = utils.photoView.getPhotoView.getData();
      utils.photoView.getPhotoView.setData(undefined, { photoView: view });
      return { prevData, view };
    },
    onError(err, _, ctx) {
      if (ctx?.prevData)
        utils.photoView.getPhotoView.setData(undefined, ctx.prevData);
    },
    onSettled() {
      utils.photoView.getPhotoView.invalidate();
    },
  });
  const isGridView = photoView === PhotoViews.photoGridView;

  const onClick = () => {
    const newPhotoView =
      photoView === PhotoViews.photoGridView
        ? PhotoViews.photoListView
        : PhotoViews.photoGridView;
    setPhotoViewMutation.mutate({
      view:
        photoView === PhotoViews.photoGridView
          ? PhotoViews.photoListView
          : PhotoViews.photoGridView,
    });
    setPhotoView(newPhotoView);
  };

  return (
    <div className='flex flex-col'>
      <FilterLabel>Switch View</FilterLabel>
      <Button onClick={onClick}>
        {!isGridView ? (
          <>
            <Grid2X2 className='mr-2 size-5' />
            Grid View
          </>
        ) : (
          <>
            <List className='mr-2 size-5' />
            List View
          </>
        )}
        <ChevronDown className='ml-2 size-4' />
      </Button>
    </div>
  );
}
