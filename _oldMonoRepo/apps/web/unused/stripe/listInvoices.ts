import Stripe from 'stripe'

// @ts-expect-error
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2020-08-27',
})

const listInvoices = async (customerId: string) => {
  return await stripe.invoices.list({
    customer: customerId,
  })
}

export default listInvoices
