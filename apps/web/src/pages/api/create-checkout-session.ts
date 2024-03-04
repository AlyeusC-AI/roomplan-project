import { getStripePriceFromClientID } from '@lib/stripe/getStripePriceFromClientID'
import createCustomer from '@restorationx/db/queries/customers/createCustomer'
import getCustomer from '@restorationx/db/queries/customers/getCustomer'
import getUser from '@restorationx/db/queries/user/getUser'
import { createServerSupabaseClient } from '@supabase/auth-helpers-nextjs'
import { NextApiRequest, NextApiResponse } from 'next'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    // It is not working with this ApiVersion below 
    // apiVersion: '2020-08-27',
    apiVersion: '2022-08-01',
})

const handlePost = async (req: NextApiRequest, res: NextApiResponse) => {
    try {
        const { priceId } = req.body
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

        const identishotUser = await getUser(user.id)
        if (!identishotUser) {
            res.redirect('/register')
            return
        }
        if (!identishotUser.org?.organizationId) {
            res.redirect('/projects')
            return
        }
        const teamMembers = identishotUser.org.organization.users
        const customer = await getCustomer(identishotUser.org.organizationId)
        let customerId = customer ? customer.customerId : null
        if (!customerId) {
            customerId = await createCustomer(
                identishotUser.org.organizationId,
                identishotUser.email
            )
        }

        // Create Checkout Sessions from body params.
        const params: Stripe.Checkout.SessionCreateParams = {
            mode: 'subscription',
            success_url: `${req.headers.origin}/projects?alert=checkout_success&session_id={CHECKOUT_SESSION_ID}`,
            customer: customerId,
            cancel_url: `${req.headers.origin}/pricing`,
            client_reference_id: `${identishotUser.org.organizationId}`,
            line_items: [
                {
                    price: stripePriceId,
                    quantity: teamMembers.length,
                },
            ],
            billing_address_collection: 'required',
            payment_method_types: ['card', 'us_bank_account'],
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
