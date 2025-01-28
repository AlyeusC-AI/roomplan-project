import { createClient } from "@lib/supabase/server";
import getCustomer from "@servicegeek/db/queries/customers/getCustomer";
import getUser from "@servicegeek/db/queries/user/getUser";
import { NextApiRequest, NextApiResponse } from "next";
import Stripe from "stripe";

// @ts-expect-error
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2020-08-27",
});

const createPortalLink = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method === "POST") {
    try {
      const supabaseClient = await createClient();

      const {
        data: { user },
      } = await supabaseClient.auth.getUser();

      if (!user) throw Error("Could not get user");

      const servicegeekUser = await getUser(user.id);
      if (!servicegeekUser) {
        res.redirect("/register");
        return;
      }
      if (!servicegeekUser.org?.organizationId) {
        res.redirect("/projects");
        return;
      }

      const customer = await getCustomer(servicegeekUser.org.organizationId);

      if (!customer) throw Error("Could not get customer");
      const { url } = await stripe.billingPortal.sessions.create({
        customer: customer.customerId,
        return_url: `https://www.servicegeek.app/settings/billing`,
      });

      return res.status(200).json({ url });
    } catch (err: any) {
      console.log(err);
      res
        .status(500)
        .json({ error: { statusCode: 500, message: err.message } });
    }
  } else {
    res.setHeader("Allow", "POST");
    res.status(405).end("Method Not Allowed");
  }
};

export default createPortalLink;
