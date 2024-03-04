import { useId, useMemo } from 'react'
import Select from 'react-select/creatable'
import AutoSaveTextInput from '@components/DesignSystem/TextInput/AutoSaveTextInput'
import { RoomDataWithoutInferences } from '@restorationx/db/queries/project/getProjectDetections'
import clsx from 'clsx'
import produce from 'immer'
import { useRouter } from 'next/router'
import { useRecoilState } from 'recoil'
import roomState from '@atoms/roomState'

type DimensionData = {
  length?: string
  width?: string
  height?: string
  totalSqft?: string
  windows?: number
  doors?: number
  equipmentUsed?: string[]
}

const defaultEquipmentType = ['Fan', 'Dehumidifier', 'Air Scrubber']

export default function Dimensions({
  room,
}: {
  room: RoomDataWithoutInferences
}) {
  const router = useRouter()
  const [, setRooms] = useRecoilState(roomState)
  const reactSelectId = useId()

  const saveDimension = async (data: DimensionData) => {
    try {
      const d = data
      if (data.length) {
        d.totalSqft = (
          parseFloat(data.length || '1') * parseFloat(room.width || '1')
        ).toString()
      }
      if (data.width) {
        d.totalSqft = (
          parseFloat(data.width || '1') * parseFloat(room.length || '1')
        ).toString()
      }
      const res = await fetch(
        `/api/project/${router.query.id}/room-dimension`,
        {
          method: 'PATCH',
          body: JSON.stringify({
            roomId: room.publicId,
            roomDimensionData: d,
          }),
        }
      )

      if (res.ok) {
        setRooms((prevRooms) => {
          const nextState = produce(prevRooms, (draft) => {
            const roomIndex = prevRooms.findIndex(
              (r) => r.publicId === room.publicId
            )
            draft[roomIndex] = { ...prevRooms[roomIndex], ...d }
            console.log(d)
            return draft
          })
          return nextState
        })
      }
    } catch (e) {
      console.error(e)
    }
  }

  const equipmentOptions = useMemo(
    () =>
      defaultEquipmentType.map((e) => ({
        label: e,
        value: e,
      })) as { label: string; value: string }[],
    []
  )

  return (
    <div className="mt-4">
      <h2 className="text-lg font-medium">Dimensions & Details</h2>
      <div className="grid grid-cols-3 gap-x-2 gap-y-2">
        <AutoSaveTextInput
          className="col-span-1"
          placeholder=""
          defaultValue={room.length || ''}
          onSave={(length) => saveDimension({ length })}
          name="roomLength"
          type="number"
          title="Length"
          units="feet"
          ignoreInvalid
        />
        <AutoSaveTextInput
          className="col-span-1"
          placeholder=""
          defaultValue={room.width || ''}
          onSave={(width) => saveDimension({ width })}
          name="roomWidth"
          type="number"
          title="Width"
          units="feet"
          ignoreInvalid
        />
        <AutoSaveTextInput
          className="col-span-1"
          placeholder=""
          defaultValue={room.height || ''}
          onSave={(height) => saveDimension({ height })}
          name="roomHeight"
          type="number"
          title="Height"
          units="feet"
          ignoreInvalid
        />
        <div>
          <label
            htmlFor="total-sqft"
            className="block text-sm font-medium text-gray-700"
          >
            Total Sqft
          </label>
          <div className={clsx(' relative mt-1 rounded-md shadow-sm')}>
            <input
              type="text"
              name="total-sqft"
              id="total-sqft"
              className={clsx(
                'block w-full rounded-md border-gray-300 bg-gray-300 pr-12 text-sm text-black focus:border-blue-500 focus:ring-blue-500'
              )}
              placeholder=""
              aria-describedby={`total-sqft-units`}
              value={(!room.width && !room.length
                ? 0
                : parseFloat(room.width || '1') * parseFloat(room.length || '1')
              ).toString()}
              disabled
            />
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
              <span
                className={clsx('text-black sm:text-sm')}
                id={`total-sqft-units`}
              >
                sqft
              </span>
            </div>
          </div>
        </div>
        <AutoSaveTextInput
          className="col-span-1"
          placeholder="--"
          defaultValue={room.doors?.toString() || ''}
          type="number"
          onSave={(doors) => saveDimension({ doors: parseInt(doors, 10) })}
          name="roomDoors"
          title="# Doors"
          ignoreInvalid
        />
        <AutoSaveTextInput
          className="col-span-1"
          placeholder="--"
          defaultValue={room.windows?.toString() || ''}
          type="number"
          onSave={(windows) =>
            saveDimension({ windows: parseInt(windows, 10) })
          }
          name="roomWindows"
          title="# Windows"
          ignoreInvalid
        />
        <div>
          <label
            htmlFor="equipment-used"
            className="block text-sm font-medium text-gray-700"
          >
            Equipment Used
          </label>
          <div className={'relative mt-1 rounded-md shadow-sm'}>
            <Select
              id="equipment-used"
              instanceId={reactSelectId}
              options={equipmentOptions}
              isMulti
              defaultValue={room.equipmentUsed?.map((e) => ({
                label: e,
                value: e,
              }))}
              onChange={(newValue) =>
                saveDimension({
                  equipmentUsed: newValue.map((v) => v.value),
                })
              }
              styles={{ menu: (base) => ({ ...base, zIndex: 9999 }) }}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
