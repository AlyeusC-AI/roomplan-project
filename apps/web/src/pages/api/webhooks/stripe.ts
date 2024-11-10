import { prisma } from '@servicegeek/db'
import upsertPriceRecord from '@servicegeek/db/queries/prices/upsertPriceRecord'
import upsertProductRecord from '@servicegeek/db/queries/products/upsertProductRecord'
import manageSubscriptionStatusChange from '@servicegeek/db/queries/subscriptions/manageSubscriptionStatusChange'
import sendRoofPaymentSlackMsg from '@utils/sendRoofPaymentSlackMsg'
import { buffer } from 'micro'
import { NextApiRequest, NextApiResponse } from 'next'
import getRawBody from 'raw-body'
import Stripe from 'stripe'

export const config = {
  api: {
    bodyParser: false,
  },
}

// @ts-expect-error
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2020-08-27',
})

const relevantEvents = new Set([
  'product.created',
  'product.updated',
  'price.created',
  'price.updated',
  'checkout.session.completed',
  'customer.subscription.created',
  'customer.subscription.updated',
  'customer.subscription.deleted',
])

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET

async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST')
    res.status(405).end('Method Not Allowed')
    return
  }
  let event
  const sig = req.headers['stripe-signature']
  if (!sig) {
    res.status(400).send(`Webhook Error`)
    return
  }
  if (!webhookSecret) {
    res.status(400).send(`Webhook Error`)
    return
  }
  try {
    const buf = await buffer(req)
    event = stripe.webhooks.constructEvent(buf.toString(), sig, webhookSecret)
  } catch (err) {
    try {
      const rawBody = await getRawBody(req)
      event = stripe.webhooks.constructEvent(rawBody, sig, webhookSecret)
    } catch (e) {
      console.error(err)
      console.log(err)
      res.status(400).send(`Webhook Error`)
      return
    }
  }

  if (relevantEvents.has(event.type)) {
    try {
      switch (event.type) {
        case 'product.created':
        case 'product.updated':
          await upsertProductRecord(event.data.object as Stripe.Product)
          break
        case 'price.created':
        case 'price.updated':
          await upsertPriceRecord(event.data.object as Stripe.Price)
          break
        case 'customer.subscription.created':
        case 'customer.subscription.updated':
        case 'customer.subscription.deleted':
          const subscription = event.data.object as Stripe.Subscription
          await manageSubscriptionStatusChange(
            subscription.id,
            subscription.customer as string,
            event.type === 'customer.subscription.created'
          )
          break
        case 'checkout.session.completed':
          const checkoutSession = event.data.object as Stripe.Checkout.Session
          console.log('checkoutSession.mode', checkoutSession)
          if (checkoutSession.mode === 'subscription') {
            const subscriptionId = checkoutSession.subscription
            await manageSubscriptionStatusChange(
              subscriptionId as string,
              checkoutSession.customer as string,
              true
            )
          } else if (checkoutSession.mode === 'payment') {
            try {
              const projectId = checkoutSession.metadata
                ? checkoutSession.metadata.projectId
                : ''
              const client_address = checkoutSession.metadata
                ? checkoutSession.metadata.client_address
                : ''
              const customer_name = checkoutSession.metadata
                ? checkoutSession.metadata.customer_name
                : ''
              const subscription_status = checkoutSession.metadata
                ? checkoutSession.metadata.subscription_status
                : ''
              const customer_email = checkoutSession.metadata
                ? checkoutSession.metadata.customer_email
                : ''
              const support_email = checkoutSession.metadata
                ? checkoutSession.metadata.support_email
                : ''
              await sendRoofPaymentSlackMsg(
                projectId,
                client_address,
                customer_name,
                subscription_status,
                customer_email,
                support_email
              )
              if (!projectId) {
                console.error('no project id')
                return
              }
              const project = await prisma.project.findFirst({
                where: { publicId: projectId },
              })
              if (project) {
                await prisma.pendingRoofReports.create({
                  data: {
                    projectId: project.id,
                  },
                })
              } else {
                console.error('no project')
              }
            } catch (e) {
              console.error(e)
            }
          }
          break
        default:
          throw new Error('Unhandled relevant event!')
      }
    } catch (error) {
      console.log(error)
      return res
        .status(400)
        .send('Webhook error: "Webhook handler failed. View logs."')
    }
  }

  // Return a 200 response to acknowledge receipt of the event
  res.status(200).send('Sucess')
  return
}

export default handler
