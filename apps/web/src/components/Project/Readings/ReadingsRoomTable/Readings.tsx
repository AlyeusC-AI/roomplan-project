import DatePicker from 'react-datepicker'
import AutoSaveTextInput from '@components/DesignSystem/TextInput/AutoSaveTextInput'
import { RoomDataWithoutInferences } from '@servicegeek/db/queries/project/getProjectDetections'
import { trpc } from '@utils/trpc'
import produce from 'immer'
import { useRouter } from 'next/router'

import GenericRoomReadings from './GenericRoomReadings'

import 'react-datepicker/dist/react-datepicker.css'

type OnSaveData = {
  humidity?: string
  temperature?: string
  moistureContentWall?: string
  moistureContentFloor?: string
  date?: string
  equipmentUsed?: string[]
}

const Readings = ({ room }: { room: RoomDataWithoutInferences }) => {
  const trpcContext = trpc.useContext()
  const router = useRouter()
  const readings =
    trpcContext.readings.getAll
      .getData({
        projectPublicId: router.query.id as string,
      })
      ?.filter((reading) => reading.room.publicId === room.publicId) || []

  const updateReading = trpc.readings.updateReading.useMutation({
    async onMutate({
      projectPublicId,
      temperature,
      date,
      humidity,
      moistureContentFloor,
      moistureContentWall,
      readingPublicId,
    }) {
      await trpcContext.readings.getAll.cancel()
      const prevData = trpcContext.readings.getAll.getData()
      trpcContext.readings.getAll.setData({ projectPublicId }, (old) =>
        produce(old, (draft) => {
          if (!draft) return
          const roomIndex = old?.findIndex(
            (p) => p.publicId === readingPublicId
          )
          if (roomIndex !== undefined && roomIndex >= 0) {
            draft[roomIndex] = {
              ...draft[roomIndex],
              ...(temperature && { temperature }),
              ...(date && { date: new Date(date) }),
              ...(humidity && { humidity }),
              ...(moistureContentFloor && { moistureContentFloor }),
              ...(moistureContentWall && { moistureContentWall }),
            }
          }
        })
      )
      return { prevData }
    },
    onError(err, { projectPublicId }, ctx) {
      // If the mutation fails, use the context-value from onMutate
      if (ctx?.prevData)
        trpcContext.readings.getAll.setData({ projectPublicId }, ctx.prevData)
    },
    onSettled() {
      trpcContext.readings.getAll.invalidate()
    },
  })

  const onSave = async (readingId: string, data: OnSaveData) => {
    updateReading.mutate({
      projectPublicId: router.query.id as string,
      roomPublicId: room.publicId,
      readingPublicId: readingId,
      temperature: data.temperature,
      humidity: data.humidity,
      moistureContentWall: data.moistureContentWall,
      moistureContentFloor: data.moistureContentFloor,
      date: data.date,
    })
  }
  return (
    <div>
      {readings.map((r) => (
        <div key={r.publicId} className="mt-6 border-l-2 border-gray-500 pl-4">
          <h3>Date</h3>
          <DatePicker
            className="mb-4 block rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            selected={new Date(r.date)}
            onChange={(date: Date) =>
              onSave(r.publicId, { date: date.toISOString() })
            }
          />
          <div className="grid grid-cols-2 gap-6">
            <AutoSaveTextInput
              className="col-span-1"
              defaultValue={r.temperature || ''}
              onSave={(temperature) => onSave(r.publicId, { temperature })}
              name="temperature"
              title="Temperature"
              units="&#8457;"
              ignoreInvalid
            />
            <AutoSaveTextInput
              className="col-span-1"
              defaultValue={r.humidity || ''}
              onSave={(humidity) => onSave(r.publicId, { humidity })}
              name="relative-humidity"
              title="Relative Humidity"
              units="RH"
              ignoreInvalid
            />
            <div>
              <label
                htmlFor="gpp"
                className="block text-sm font-medium text-gray-700"
              >
                Grains Per Pound
              </label>
              <div className={'relative mt-1 rounded-md shadow-sm'}>
                <div
                  id="gpp"
                  className="block w-full rounded-md border-gray-300 bg-gray-300 p-2 pr-12 text-sm text-black focus:border-blue-500 focus:ring-blue-500"
                  placeholder=""
                  aria-describedby={`total-sqft-units`}
                >
                  {r.gpp || '--'}
                </div>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                  <span
                    className={'text-black sm:text-sm'}
                    id={`total-sqft-units`}
                  >
                    gpp
                  </span>
                </div>
              </div>
            </div>
            <AutoSaveTextInput
              className="col-span-1"
              defaultValue={r.moistureContentWall || ''}
              onSave={(moistureContentWall) =>
                onSave(r.publicId, { moistureContentWall })
              }
              name="moisture-wall"
              title="Moisture Content (Wall)"
              units="%"
              placeholder="Moisture Content Percentage"
              ignoreInvalid
            />
            <AutoSaveTextInput
              className="col-span-1"
              defaultValue={r.moistureContentFloor || ''}
              onSave={(moistureContentFloor) =>
                onSave(r.publicId, { moistureContentFloor })
              }
              name="moisture-wall"
              title="Moisture Content (Floor)"
              units="%"
              placeholder="Moisture Content Percentage"
              ignoreInvalid
            />
          </div>
          <GenericRoomReadings room={room} reading={r} />
        </div>
      ))}
      {readings.length === 0 && (
        <div className="mt-4 ml-2 flex items-center justify-start">
          <div className="max-w-[35%] border-l-2 border-l-gray-400 px-2">
            <h5 className="text-lg font-semibold">No reading data</h5>
            <p className="text-gray-500">
              Click &quot;Add Reading&quot; to record temperature, humidity, and
              dehumidifer readings.
            </p>
          </div>
        </div>
      )}
    </div>
  )
}

export default Readings
