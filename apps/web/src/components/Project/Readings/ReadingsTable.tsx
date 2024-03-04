import EmptyState from '@components/DesignSystem/EmptyState'
import { useRecoilState } from 'recoil'
import roomState from '@atoms/roomState'

import ReadingsRoomTable from './ReadingsRoomTable'

export default function ReadingsTable() {
  const [rooms, setRooms] = useRecoilState(roomState)

  return (
    <div className=" space-y-6 divide-y-2">
      {rooms.length === 0 ? (
        <EmptyState
          imagePath={'/images/empty.svg'}
          title={'No Rooms Added'}
          description={
            'Get started by adding rooms. Humidity, temperature, and gpp data can be associated with each room'
          }
        />
      ) : (
        <>
          {rooms.map((room) => (
            <ReadingsRoomTable
              key={room.publicId}
              room={room}
              setRooms={setRooms}
            />
          ))}
        </>
      )}
    </div>
  )
}
