import { Metadata } from 'next'
import Calendar from '../../app/(logged-in)/calender/main'

export const metadata: Metadata = {
  title: 'Calender',
}

export default function Component() {
  return <Calendar />
}
