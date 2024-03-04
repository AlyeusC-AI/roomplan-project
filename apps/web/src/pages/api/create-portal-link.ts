import getCustomer from '@restorationx/db/queries/customers/getCustomer'
import getUser from '@restorationx/db/queries/user/getUser'
import { createServerSupabaseClient } from '@supabase/auth-helpers-nextjs'
import { NextApiRequest, NextApiResponse } from 'next'
import Stripe from 'stripe'

// @ts-expect-error
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2020-08-27',
})

const createPortalLink = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method === 'POST') {
    try {
      const supabase = createServerSupabaseClient({
        req,
        res,
      })
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) throw Error('Could not get user')

      const identishotUser = await getUser(user.id)
      if (!identishotUser) {
        res.redirect('/register')
        return
      }
      if (!identishotUser.org?.organizationId) {
        res.redirect('/projects')
        return
      }

      const customer = await getCustomer(identishotUser.org.organizationId)

      if (!customer) throw Error('Could not get customer')
      const { url } = await stripe.billingPortal.sessions.create({
        customer: customer.customerId,
        return_url: `https://www.restorationx.app/settings/billing`,
      })

      return res.status(200).json({ url })
    } catch (err: any) {
      console.log(err)
      res.status(500).json({ error: { statusCode: 500, message: err.message } })
    }
  } else {
    res.setHeader('Allow', 'POST')
    res.status(405).end('Method Not Allowed')
  }
}

export default createPortalLink
