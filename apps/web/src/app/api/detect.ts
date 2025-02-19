import { NextApiRequest, NextApiResponse } from "next";

export type DetectionObject = {
  xmin: number;
  ymin: number;
  xmax: number;
  ymax: number;
  confidence: number;
  name: string;
  class: number;
};

const handlePost = async (req: NextApiRequest, res: NextApiResponse) => {
  // const servicegeekToken = req.headers['x-servicegeek-detection-token']

  // if (!process.env.X_IDENTISHOT_DETECTION_TOKEN) {
  //   res.status(500).send('Invalid API token.')
  //   return
  // }
  // if (servicegeekToken !== process.env.X_IDENTISHOT_DETECTION_TOKEN) {
  //   res.status(500).send('Invalid API token')
  //   return
  // }
  // const { record } = req.body
  // if (!record) {
  //   res.status(500).send('Invalid shape')
  //   return
  // }
  // const { imageKey, projectId, imageId, roomId, id } = record
  // if (!imageKey || !projectId || !imageId || !roomId || !id) {
  //   res.status(500).send('Invalid shape')
  //   return
  // }

  // const { data: upData, error: upError } = await supabaseServiceRole.storage
  //   .from('project-images')
  //   .createSignedUrl(
  //     decodeURIComponent(imageKey).slice('project-images/'.length),
  //     3600
  //   )

  // if (upError || !upData) {
  //   console.error(upError)
  //   console.error(upData)
  //   res.status(500).send('Failed')
  //   return
  // }

  // const { signedURL } = upData
  // try {
  //   const response = await fetch(
  //     `${process.env.IDENTISHOT_DETECT_API}/detect`,
  //     {
  //       method: 'POST',
  //       body: JSON.stringify({
  //         image: signedURL,
  //       }),
  //       headers: {
  //         Authorization: process.env.ECS_API_KEY || '',
  //         'RestoreGeek-jwt': '',
  //         'Content-Type': 'application/json',
  //       },
  //     }
  //   )

  //   if (response.ok) {
  //     const json = (await response.json()) as DetectionObject[]

  //     const inference = await prisma.inference.findFirst({ where: { id: id } })
  //     if (!inference) {
  //       console.log('No inference.')
  //       res.status(500).send('No Inference')
  //       return
  //     }
  //     const promises: Promise<any>[] = []

  //     json.forEach((prediction) => {
  //       promises.push(createYoloDetection(inference.publicId, prediction))
  //     })
  //     await Promise.allSettled(promises)
  //   }
  return res.status(200).send("OK");
  // } catch (error) {
  //   console.error(error)
  //   return res.status(500).send('Failed')
  // }
};

export default async function Route(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "POST") await handlePost(req, res);
  else res.status(405).json({ Error: `Operation ${req.method} not allowed` });
  return;
}
