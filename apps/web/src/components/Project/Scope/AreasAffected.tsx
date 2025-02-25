import { Checkbox } from "@components/ui/checkbox";

export default function AreasAffected({
  affectedAreas,
  setAffectedAreas,
}: {
  affectedAreas: AreaAffected[];
  setAffectedAreas: (s: AreaAffectedType, setChecked: boolean) => void;
}) {
  return (
    <fieldset className='col-span-1 rounded-xl border border-border/10 bg-gradient-to-b from-background/80 to-background p-6 shadow-lg ring-1 ring-background/5 backdrop-blur-xl transition-all duration-300 hover:shadow-xl'>
      <div className='space-y-6'>
        <div className='flex items-center gap-2'>
          <div className='h-8 w-1 rounded-full bg-gradient-to-b from-primary/80 to-primary/40' />
          <h2 className='bg-gradient-to-br from-foreground to-foreground/80 bg-clip-text text-xl font-semibold text-transparent'>
            Areas Affected
          </h2>
        </div>

        <div className='space-y-5'>
          {[
            { id: "walls", type: "wall", label: "Walls" },
            { id: "ceilings", type: "ceiling", label: "Ceilings" },
            { id: "floors", type: "floor", label: "Floors" },
          ].map(({ id, type, label }) => (
            <div
              key={id}
              className='group relative flex items-center gap-3 rounded-lg p-2 transition-all duration-200 hover:bg-foreground/5'
            >
              <div className='flex h-5 items-center'>
                <Checkbox
                  id={id}
                  aria-describedby={`${id}-description`}
                  name={id}
                  checked={
                    !!affectedAreas.find((a) => a.type === type && !a.isDeleted)
                  }
                  onCheckedChange={(e) =>
                    setAffectedAreas(type as AreaAffectedType, !e)
                  }
                  className='h-5 w-5 rounded-md border-primary/20 transition-all duration-200 data-[state=checked]:scale-100 data-[state=checked]:animate-in data-[state=checked]:fade-in-0'
                />
              </div>
              <div className='flex-1'>
                <label
                  htmlFor={id}
                  className='font-medium text-foreground/80 transition-colors duration-200 group-hover:text-foreground'
                >
                  {label}
                </label>
              </div>
            </div>
          ))}
        </div>
      </div>
    </fieldset>
  );
}
