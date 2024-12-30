const requeueInference = async (inferenceId: number) => {
  console.log('Requeueing inference ID - ', inferenceId)
  const qstashRes = await fetch(
    `${process.env.QSTASH_PUBLISH_URL}${process.env.IDENTISHOT_DETECTION_PROCESSING_URL}`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.QSTASH_AUTHORIZATION_TOKEN}`,
        'Upstash-Delay': '3m',
      },
      body: JSON.stringify({
        inferenceId: inferenceId,
      }),
    }
  )
  if (!qstashRes.ok) {
    console.error(qstashRes)
  }
}

export default requeueInference
