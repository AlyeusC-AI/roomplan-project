import createInference from '@servicegeek/db/queries/inference/createInference'
import getSubcriptionStatus from '@servicegeek/db/queries/organization/getSubscriptionStatus'
import addImageToProject from '@servicegeek/db/queries/project/addImageToProject'
import getOrCreateRoom, {
  getRoomById,
} from '@servicegeek/db/queries/room/getOrCreateRoom'
import { default as getRestorationXUser } from '@servicegeek/db/queries/user/getUser'
import {
  AUTOMATIC_ROOM_DETECTION,
  UNKNOWN_ROOM,
} from '@lib/image-processing/constants'
import { supabaseServiceRole } from '@lib/supabase/supabaseServiceRoleClient'
import { SubscriptionStatus } from '@servicegeek/db'
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

const handleUpload = async (req: NextApiRequest, res: NextApiResponse) => {
  const supabaseClient = createServerSupabaseClient({
    req,
    res,
  })
  const {
    data: { user },
  } = await supabaseClient.auth.getUser()
  const {
    data: { session },
  } = await supabaseClient.auth.getSession()
  if (!user || !session?.access_token) {
    console.error('Session does not exist.')
    res.status(500).json({ status: 'failed' })
    return
  }

  const subscriptionStatus = await getSubcriptionStatus(user.id)
  if (subscriptionStatus === SubscriptionStatus.past_due) {
    console.error('Past due')
    res.status(500).json({ status: 'trial_expired' })
    return
  }

  const queryId = req.query.id

  if (Array.isArray(queryId) || !queryId) {
    res.status(500).json({ status: 'missing query id' })
    return queryId
  }

  let roomId = req.query.roomId

  if (Array.isArray(roomId) || !roomId) {
    roomId = AUTOMATIC_ROOM_DETECTION
  }

  // /* Get files using formidable */
  const file = await new Promise<File>((resolve, reject) => {
    const form = new formidable.IncomingForm()
    let f: File
    form.on('file', function (field, file) {
      f = file
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

  try {
    const fsdata = await fs.readFile(file.filepath)
    const imageBuffer = Buffer.from(fsdata)

    const servicegeekUser = await getRestorationXUser(user.id)
    const supabasePath = `${servicegeekUser?.org?.organization.publicId}/${
      req.query.id
    }/${uuidv4()}_${file.originalFilename}`

    const { data, error } = await supabaseServiceRole.storage
      .from('project-images')
      .upload(supabasePath, imageBuffer, {
        cacheControl: '3600',
        // @ts-expect-error
        contentType: file.mimetype,
        upsert: false,
      })

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
      if (roomId) {
        let room = await getRoomById(image.projectId, roomId)
        roomName = room?.name
      } else {
        roomName === UNKNOWN_ROOM
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

    // const detectionsWithInferenceId = detections.map((d) => ({
    //   ...d,
    //   roomId: inference.roomId,
    //   inferenceId: inference.id,
    //   projectId: image.projectId,
    // }))

    // await prisma.detection.createMany({
    //   data: detectionsWithInferenceId,
    //   skipDuplicates: true,
    // })

    // await queueInference(inference.id)
    const { data: signedurl } = await supabaseServiceRole.storage
      .from('project-images')
      .createSignedUrl(decodeURIComponent(inference.imageKey!), 1800)

    return res.status(200).json({
      status: 'ok',
      data: {
        signedUrl: signedurl?.signedUrl,
        imageKey: inference.imageKey,
        publicId: inference.publicId,
        createdAt: inference.createdAt.toISOString(),
        roomId: inferenceRoom.publicId,
        roomName: inferenceRoom.name,
        didCreateRoom,
        imagePublicId: image.publicId,
      },
    })
  } catch (error) {
    console.error(error)
    return res.status(500).send('Failed')
  }
}

export default handleUpload
