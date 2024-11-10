import createCustomer from '@servicegeek/db/queries/customers/createCustomer'
import getCustomer from '@servicegeek/db/queries/customers/getCustomer'
import getUser from '@servicegeek/db/queries/user/getUser'
import { getStripePriceFromClientID } from '@lib/stripe/getStripePriceFromClientID'
import { createServerSupabaseClient } from '@supabase/auth-helpers-nextjs'
import { NextApiRequest, NextApiResponse } from 'next'
import Stripe from 'stripe'

// @ts-expect-error
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2020-08-27',
})

const handlePost = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    const {
      priceId,
      projectId,
      client_address,
      customer_name,
      subscription_status,
      support_email,
      customer_email,
    } = req.body
    const stripePriceId = getStripePriceFromClientID(priceId)
    const supabaseClient = createServerSupabaseClient({
      req,
      res,
    })
    const {
      data: { user },
      error,
    } = await supabaseClient.auth.getUser()

    if (!user || error || !stripePriceId) {
      res.status(500).json({
        statusCode: 500,
        message: 'Could not create checkout session.',
      })
      return
    }

    const servicegeekUser = await getUser(user.id)
    if (!servicegeekUser) {
      res.redirect('/register')
      return
    }
    if (!servicegeekUser.org?.organizationId) {
      res.redirect('/projects')
      return
    }
    const teamMembers = servicegeekUser.org.organization.users
    const customer = await getCustomer(servicegeekUser.org.organizationId)
    let customerId = customer ? customer.customerId : null
    if (!customerId) {
      customerId = await createCustomer(
        servicegeekUser.org.organizationId,
        servicegeekUser.email
      )
    }
    // Create Checkout Sessions from body params.
    const params: Stripe.Checkout.SessionCreateParams = {
      mode: 'payment',
      success_url: `${req.headers.origin}/projects/${projectId}/files?alert=roof_report_ordered`,
      customer: customerId,
      client_reference_id: `${servicegeekUser.org.organizationId}`,
      line_items: [
        {
          price: stripePriceId,
          quantity: 1,
        },
      ],
      billing_address_collection: 'required',
      payment_method_types: ['card', 'us_bank_account'],
      metadata: {
        projectId,
        client_address,
        customer_name,
        subscription_status,
        support_email,
        customer_email,
      },
      allow_promotion_codes: true,
    }
    const checkoutSession: Stripe.Checkout.Session =
      await stripe.checkout.sessions.create(params)
    if (checkoutSession.url) {
      res.redirect(303, checkoutSession.url)
      return
    }
    res
      .status(500)
      .json({ statusCode: 500, message: 'Could not create checkout session' })
  } catch (err) {
    console.log(err)
    res
      .status(500)
      .json({ statusCode: 500, message: 'Could not create checkout session' })
  }
}

export default async function ProtectedRoute(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === 'POST') await handlePost(req, res)
  else res.status(405).json({ Error: `Operation ${req.method} not allowed` })
  return
}
