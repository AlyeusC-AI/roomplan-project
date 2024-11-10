const sendRoofPaymentSlackMsg = async (
  projectId?: string,
  client_address?: string,
  customer_name?: string,
  subscription_status?: string,
  customer_email?: string,
  support_email?: string
) => {
  try {
    const dev = process.env.NODE_ENV !== 'production'

    const server = dev ? 'http://localhost:3002' : 'https://www.servicegeek.app'
    // invoke post request to /api/tickets to create a new ticket
    console.log('sending to hubspot')
    const hubspotRequestBody = {
      project: projectId,
      client_address: client_address,
      customer_name: customer_name,
      subscription_status: subscription_status,
      report_type: 'esx',
      customer_email: customer_email,
      support_email: support_email,
    }
    console.log('request body to send', hubspotRequestBody)
    const res = await fetch(`${server}/api/tickets/create`, {
      method: 'POST',
      body: JSON.stringify(hubspotRequestBody),
    })
    if (res.ok) {
      console.log('hubspot completed!')
      console.log(res.body)
      console.log('Request sent')
    }
  } catch (e) {
    console.log('hubspot failed', e)
  }
  try {
    const res = await fetch(
      'https://hooks.slack.com/services/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',
      {
        method: 'POST',
        body: JSON.stringify({
          blocks: [
            {
              type: 'header',
              text: {
                type: 'plain_text',
                text: 'ChaChing! $15 roof report ordered :moneybag:',
                emoji: true,
              },
            },
            {
              type: 'section',
              fields: [
                {
                  type: 'mrkdwn',
                  text: `*Project ID:*\n${projectId}`,
                },
                {
                  type: 'mrkdwn',
                  text: `*Link:*\nhttps://www.servicegeek.app/projects/${projectId}/roofing`,
                },
              ],
            },
          ],
        }),
      }
    )
  } catch (e) {
    console.error('could not send slack message!')
  }
}

export default sendRoofPaymentSlackMsg
