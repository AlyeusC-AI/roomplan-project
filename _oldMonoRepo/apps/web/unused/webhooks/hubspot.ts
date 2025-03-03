// import { NextApiRequest, NextApiResponse } from 'next'
// import getRawBody from 'raw-body'

// export const config = {
//   api: {
//     bodyParser: false,
//   },
// }

// async function handler(req: NextApiRequest, res: NextApiResponse) {
//   if (req.method !== 'POST') {
//     res.setHeader('Allow', 'POST')
//     res.status(405).end('Method Not Allowed')
//     return
//   }
//   // process the hubspot webhook and obtain the ticket properties
//   const rawBody = await getRawBody(req)
//   const body = JSON.parse(rawBody.toString())
//   console.log('body', body)
//   // todo: complete roofing request on our DB

//   // Return a 200 response to acknowledge receipt of the event
//   res.status(200).send('Sucess')
//   return
// }

// export default handler
