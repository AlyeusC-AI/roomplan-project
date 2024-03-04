import createInvitation from '@restorationx/db/queries/organization/createInvitation'
import deleteInvitation from '@restorationx/db/queries/organization/deleteInvitation'
import getUser from '@restorationx/db/queries/user/getUser'
import { prisma } from '@restorationx/db'

import { getStripePriceFromClientID } from '@lib/stripe/getStripePriceFromClientID'
import { supabaseServiceRole } from '@lib/supabase/supabaseServiceRoleClient'
import { SubscriptionStatus } from '@restorationx/db'
import { createServerSupabaseClient } from '@supabase/auth-helpers-nextjs'
import { NextApiRequest, NextApiResponse } from 'next'
import Stripe from 'stripe'
import validator from 'validator'

// @ts-expect-error
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2020-08-27',
})

const handlePost = async (req: NextApiRequest, res: NextApiResponse) => {
  const supabase = createServerSupabaseClient({
    req,
    res,
  })
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    console.error('Session does not exist.')
    res.status(500).json({ status: 'failed' })
    return
  }

  const identishotUser = await getUser(user.id)

  const org = identishotUser?.org?.organization
  if (!org?.id) {
    console.error('err', 'no org')
    res.status(500).json({ status: 'failed' })
    return
  }
  const currentTeamMembers = org.users

  const body = JSON.parse(req.body)

  if (!validator.isEmail(body.email)) {
    console.error('Invalid email.')
    res.status(500).json({ status: 'failed', message: 'invalid-email' })
    return
  }

  if (!process.env.SUPABASE_SERVICE_ROLE_JWT) {
    console.error('No service role key')
    res.status(500).json({ status: 'failed', message: 'no-service-role' })
    return
  }
  try {
    const invitation = await createInvitation(user.id, body.email)
    if (invitation.failed) {
      if (invitation.reason === 'existing-invite')
        res.status(500).json({ status: 'failed', message: 'existing-invite' })
      else if (invitation.reason === 'existing-member')
        res.status(500).json({ status: 'failed', message: 'existing-member' })
      else res.status(500).json({ status: 'failed' })
      return
    } else {
      const { data: u, error } =
        await supabaseServiceRole.auth.admin.inviteUserByEmail(body.email, {
          data: {
            orgId: invitation.orgId,
            inviteId: invitation.inviteId,
            isSupportUser: false,
            firstName: '',
            lastName: '',
          },
        })
      if (process.env.NODE_ENV === 'production') {
        await fetch(
          'https://hooks.slack.com/services/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',
          {
            method: 'POST',
            body: JSON.stringify({
              blocks: [
                {
                  type: 'section',
                  text: {
                    type: 'mrkdwn',
                    text: 'New user invite :wave:',
                  },
                },
                {
                  type: 'section',
                  text: {
                    type: 'mrkdwn',
                    text: `• email: ${body.email} • platform: web \n`,
                  },
                },
              ],
            }),
          }
        )
      }
      const subscription = await prisma.subscriptions.findFirst({
        where: {
          organizationId: org.id,
          status: SubscriptionStatus.active,
        },
      })
      if (subscription) {
        const subItems = await stripe.subscriptionItems.list({
          subscription: subscription.id,
        })
        await stripe.subscriptions.update(subscription.id, {
          items: [
            {
              id: subItems.data[0].id,
              price: getStripePriceFromClientID('basic'),
              quantity: currentTeamMembers.length + 1,
            },
          ],
        })
      }
      if (error) {
        console.log(error)
      } else {
        res.status(200).json({ status: 'ok', userId: u?.user.id })
        return
      }
    }
  } catch (err) {
    console.error(err)
    res.status(500).json({ status: 'failed' })
    return
  }
}

const handleDelete = async (req: NextApiRequest, res: NextApiResponse) => {
  const supabase = createServerSupabaseClient({
    req,
    res,
  })
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    console.error('Session does not exist.')
    res.status(500).json({ status: 'failed' })
    return
  }
  const body = JSON.parse(req.body)

  if (!validator.isEmail(body.email)) {
    console.error('Invalid email.')
    res.status(500).json({ status: 'failed', message: 'invalid-email' })
    return
  }
  try {
    const invitation = await deleteInvitation(user.id, body.email)
    // @ts-expect-error error handling
    if (invitation.failed) {
      res.status(500).json({ status: 'failed' })
      return
    }
  } catch (err) {
    console.error(err)
    res.status(500).json({ status: 'failed' })
    return
  }
  res.status(200).json({ status: 'ok' })
}

export default async function ProtectedRoute(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === 'POST') await handlePost(req, res)
  else if (req.method === 'DELETE') await handleDelete(req, res)
  else res.status(405).json({ Error: `Operation ${req.method} not allowed` })
  return
}
