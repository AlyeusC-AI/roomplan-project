import { Rekognition } from '@aws-sdk/client-rekognition'
import createInference from '@restorationx/db/queries/inference/createInference'
import getSubcriptionStatus from '@restorationx/db/queries/organization/getSubscriptionStatus'
import addImageToProject from '@restorationx/db/queries/project/addImageToProject'
import getOrCreateRoom, {
  getRoomById,
} from '@restorationx/db/queries/room/getOrCreateRoom'
import { default as getRestorationXUser } from '@restorationx/db/queries/user/getUser'
import {
  AUTOMATIC_ROOM_DETECTION,
  UNKNOWN_ROOM,
} from '@lib/image-processing/constants'
import queueInference from '@lib/qstash/queueInference'
import { supabaseServiceRole } from '@lib/supabase/supabaseServiceRoleClient'
import { SubscriptionStatus } from '@restorationx/db'
import { createServerSupabaseClient } from '@supabase/auth-helpers-nextjs'
import formidable, { File } from 'formidable'
import { NextApiRequest, NextApiResponse } from 'next'
import { v4 as uuidv4 } from 'uuid'
const fs = require('fs').promises

export const config = {
  api: {
    bodyParser: false,
  },
}

const rekognition = new Rekognition({
  region: 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_REKOGNITION_ACCESS_KEY || '',
    secretAccessKey: process.env.AWS_REKOGNITION_SECRET_ACCESS_KEY || '',
  },
})

const handlePost = async (req: NextApiRequest, res: NextApiResponse) => {
  const supabaseClient = createServerSupabaseClient({
    req,
    res,
  })
  const jwt = req.headers['auth-token']
  if (!jwt || Array.isArray(jwt)) {
    console.error('missing')

    res.status(500).json({ status: 'Missing token' })
    return
  }
  const supabase = createServerSupabaseClient({
    req,
    res,
  })

  const {
    data: { user },
  } = await supabase.auth.getUser(jwt)

  if (!user) {
    console.error('Session does not exist.')
    res.status(500).json({ status: 'failed' })
    return
  }

  const subscriptionStatus = await getSubcriptionStatus(user.id)
  if (subscriptionStatus === SubscriptionStatus.past_due) {
    res.status(500).json({ status: 'trial_expired' })
    return
  }

  const queryId = req.query.id

  if (Array.isArray(queryId) || !queryId) {
    console.error('missing')
    res.status(500).json({ status: 'missing query id' })
    return queryId
  }

  let roomId = req.query.roomId

  if (Array.isArray(roomId) || !queryId) {
    roomId = AUTOMATIC_ROOM_DETECTION
  }

  // /* Get files using formidable */
  const file = await new Promise<File>((resolve, reject) => {
    const form = new formidable.IncomingForm()
    let f: File
    form.on('file', function (field, fi) {
      f = fi
      console.log('parsed', fi.size)
    })
    form.on('end', () => resolve(f))
    form.on('error', (err) => reject(err))
    form.parse(req, () => {
      //
    })
  }).catch((e) => {
    console.error('Failed to parse file')
    console.error(e)
  })

  if (!file) {
    console.error('No file')
    return res.status(500).send('Failed')
  }
  if (file.size === 0) {
    console.error('Empty file')
    return res.status(500).send('Failed')
  }

  console.log('file size', file.size)

  try {
    console.log('size', file.size)
    const fsdata = await fs.readFile(file.filepath)
    const imageBuffer = Buffer.from(fsdata)

    console.log('imageBuffer', imageBuffer)

    const identishotUser = await getRestorationXUser(user.id)
    console.log(file.mimetype)
    let ext = '.png'
    if (
      (file.mimetype ? file.mimetype : '').indexOf('.jpg') >= 0 ||
      (file.mimetype ? file.mimetype : '').indexOf('.jpeg') >= 0
    ) {
      ext = '.jpg'
    }
    const supabasePath = `${identishotUser?.org?.organization.publicId}/${
      req.query.id
    }/${uuidv4()}_${file.originalFilename ? file.originalFilename : ext}`

    const { data, error } = await supabaseServiceRole.storage
      .from('project-images')
      .upload(supabasePath, imageBuffer, {
        cacheControl: '3600',
        // @ts-expect-error
        contentType: file.mimetype,
        upsert: false,
      })

    console.log('upload data', data)
    if (error || !data?.path) {
      console.error(error)
      res.status(500).send('Failed')
      return
    }

    const image = await addImageToProject(
      user.id,
      queryId,
      encodeURIComponent(data?.path)
    )

    if (!image) {
      res.status(500).send('No Image')
      return
    }

    let roomName
    try {
      if (roomId !== AUTOMATIC_ROOM_DETECTION && roomId) {
        let room = await getRoomById(image.projectId, roomId)
        roomName = room?.name
      }
    } catch (e) {
      console.error('Error detecting room')
      roomName = UNKNOWN_ROOM
    }
    if (!roomName) {
      roomName = UNKNOWN_ROOM
    }

    const { room: inferenceRoom, didCreateRoom } = await getOrCreateRoom(
      image.projectId,
      roomName
    )

    if (!inferenceRoom) {
      res.status(500).send('failed to add to room')
      return
    }

    const inference = await createInference(image.publicId, inferenceRoom.id)

    if (!inference) {
      res.status(500).send('Could not create inference')
      return
    }
    await queueInference(inference.id)

    return res.status(200).json({
      status: 'ok',
      data: {
        imageKey: inference.imageKey,
        publicId: inference.publicId,
        roomId: inferenceRoom.publicId,
        roomName: inferenceRoom.name,
        didCreateRoom,
      },
    })
  } catch (error) {
    console.error(error)
    return res.status(500).send('Failed')
  }
}

export default async function ProtectedRoute(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === 'POST') return await handlePost(req, res)
  else
    return res
      .status(405)
      .json({ Error: `Operation ${req.method} not allowed` })
}
