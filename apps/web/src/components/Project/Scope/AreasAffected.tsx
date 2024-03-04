import { RoomAffectedArea } from '@restorationx/db/queries/project/getProjectDetections'
import { AreaAffectedType } from '@restorationx/db'

export default function AreasAffected({
  affectedAreas,
  setAffectedAreas,
}: {
  affectedAreas: RoomAffectedArea[]
  setAffectedAreas: (s: AreaAffectedType, setChecked: boolean) => void
}) {
  return (
    <fieldset className="col-span-1 space-y-2">
      <h2 className="text-lg font-medium">Areas Affected</h2>
      <div className="relative flex items-start">
        <div className="flex h-5 items-center">
          <input
            id="walls"
            aria-describedby="walls-description"
            name="walls"
            type="checkbox"
            checked={
              !!affectedAreas.find((a) => a.type === 'wall' && !a.isDeleted)
            }
            className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-blue-500"
            onChange={(e) => setAffectedAreas('wall', !e.target.checked)}
          />
        </div>
        <div className="ml-3 text-sm">
          <label htmlFor="walls" className="font-medium text-gray-700">
            Walls
          </label>
        </div>
      </div>
      <div className="relative flex items-start">
        <div className="flex h-5 items-center">
          <input
            id="ceilings"
            aria-describedby="ceilings-description"
            name="ceilings"
            type="checkbox"
            checked={
              !!affectedAreas.find((a) => a.type === 'ceiling' && !a.isDeleted)
            }
            className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-blue-500"
            onChange={(e) => setAffectedAreas('ceiling', !e.target.checked)}
          />
        </div>
        <div className="ml-3 text-sm">
          <label htmlFor="ceilings" className="font-medium text-gray-700">
            Ceilings
          </label>
        </div>
      </div>
      <div className="relative flex items-start">
        <div className="flex h-5 items-center">
          <input
            id="floors"
            aria-describedby="floors-description"
            name="floors"
            type="checkbox"
            checked={
              !!affectedAreas.find((a) => a.type === 'floor' && !a.isDeleted)
            }
            className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-blue-500"
            onChange={(e) => setAffectedAreas('floor', !e.target.checked)}
          />
        </div>
        <div className="ml-3 text-sm">
          <label htmlFor="floors" className="font-medium text-gray-700">
            Floors
          </label>
        </div>
      </div>
    </fieldset>
  )
}
