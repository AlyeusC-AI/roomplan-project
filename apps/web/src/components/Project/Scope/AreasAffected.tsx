import { Checkbox } from "@components/ui/checkbox";

export default function AreasAffected({
  affectedAreas,
  setAffectedAreas,
}: {
  affectedAreas: AreaAffected[];
  setAffectedAreas: (s: AreaAffectedType, setChecked: boolean) => void;
}) {
  return (
    <fieldset className='col-span-1 space-y-2'>
      <h2 className='text-lg font-medium'>Areas Affected</h2>
      <div className='relative flex items-start'>
        <div className='flex h-5 items-center'>
          <Checkbox
            id='walls'
            aria-describedby='walls-description'
            name='walls'
            checked={
              affectedAreas.find((a) => a.type === "wall" && !a.isDeleted) !=
              null
            }
            onCheckedChange={(e) => setAffectedAreas("wall", !e)}
          />
        </div>
        <div className='ml-3 text-sm'>
          <label htmlFor='walls' className='font-medium text-foreground'>
            Walls
          </label>
        </div>
      </div>
      <div className='relative flex items-start'>
        <div className='flex h-5 items-center'>
          <Checkbox
            id='ceilings'
            aria-describedby='ceilings-description'
            name='ceilings'
            checked={
              !!affectedAreas.find((a) => a.type === "ceiling" && !a.isDeleted)
            }
            onCheckedChange={(e) => setAffectedAreas("ceiling", !e)}
          />
        </div>
        <div className='ml-3 text-sm'>
          <label htmlFor='ceilings' className='font-medium text-foreground'>
            Ceilings
          </label>
        </div>
      </div>
      <div className='relative flex items-start'>
        <div className='flex h-5 items-center'>
          <Checkbox
            id='floors'
            aria-describedby='floors-description'
            name='floors'
            checked={
              !!affectedAreas.find((a) => a.type === "floor" && !a.isDeleted)
            }
            className='size-4 rounded border-gray-300 text-primary focus:ring-blue-500'
            onCheckedChange={(e) => setAffectedAreas("floor", !e)}
          />
        </div>
        <div className='ml-3 text-sm'>
          <label htmlFor='floors' className='font-medium text-foreground'>
            Floors
          </label>
        </div>
      </div>
    </fieldset>
  );
}
