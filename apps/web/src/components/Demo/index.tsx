import { InlineWidget, useCalendlyEventListener } from 'react-calendly'

export function Calender() {
  useCalendlyEventListener({
    onProfilePageViewed: () => console.log('onProfilePageViewed'),
    onDateAndTimeSelected: () => console.log('onDateAndTimeSelected'),
    onEventTypeViewed: () => console.log('onEventTypeViewed'),
    onEventScheduled: async (e) => {
      const options = {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization:
            'Bearer eyJraWQiOiIxY2UxZTEzNjE3ZGNmNzY2YjNjZWJjY2Y4ZGM1YmFmYThhNjVlNjg0MDIzZjdjMzJiZTgzNDliMjM4MDEzNWI0IiwidHlwIjoiUEFUIiwiYWxnIjoiRVMyNTYifQ.eyJpc3MiOiJodHRwczovL2F1dGguY2FsZW5kbHkuY29tIiwiaWF0IjoxNjc0MzY1MDA5LCJqdGkiOiI1Y2JkZTJjNi04ZGYwLTRhNDEtYjY3Yi02ZDcyOTU1M2E3MDEiLCJ1c2VyX3V1aWQiOiJiY2Q1NmRkMS0wNTI5LTQ3MGEtYWMxNi1kMWY5NzVjNGIxODgifQ.TIwYyBZNbE2_xwlSTzyq2uPvEG5I3yDioRmGCbMJO710uevZdDxtQLDTToqrwDlb77Rx5sFTU1bgPoEXDFWrCA',
        },
      }

      const inviteeInfo = await fetch(e.data.payload.invitee.uri, options)

      const inviteResult = await inviteeInfo.json()

      const eventInfo = await fetch(e.data.payload.event.uri, options)

      const eventResult = await eventInfo.json()
      debugger
      const res = await fetch(
        'https://hooks.slack.com/services/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',
        {
          method: 'POST',
          body: JSON.stringify({
            blocks: [
              {
                type: 'section',
                text: {
                  type: 'mrkdwn',
                  text: 'New Demo request',
                },
              },
              {
                type: 'section',
                text: {
                  type: 'mrkdwn',
                  text: `• email: ${inviteResult.resource?.email} \n • name: ${
                    inviteResult.resource?.name
                  } \n • event: ${
                    eventResult.resource?.name
                  } \n • event start: ${new Date(
                    eventResult.resource?.start_time
                  )
                    .toLocaleTimeString()
                    .replace(/([\d]+:[\d]{2})(:[\d]{2})(.*)/, '$1$3')} \n`,
                },
              },
            ],
          }),
        }
      )

      console.log('new demo request alert sent')
    },
  })
  return (
    <div className="bg-white">
      <div className="mx-auto max-w-7xl  px-4  sm:px-6 lg:px-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            Book a Demo
          </h1>
          <InlineWidget url="https://calendly.com/matt-1268" />
        </div>
      </div>
    </div>
  )
}
