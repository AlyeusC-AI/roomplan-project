# Setup

1. `vercel login`
2. `vercel link`
3. `vercel env pull`
4. `pnpm dev:generate`
5. `pnpm install`
6. `pnpm dev`
   -> Webapp is available at http://localhost:3002
   -> Mobile app will open in simulator

# Directory Stucture

## Apps

Each folder in here maps to an "app".

- Expo: This is our mobile app
- Web: This is the main app

## Packages

Each folder in here maps to a _reusable_ "package"

- Api: This holds all of our app trpc routers. You can think of each one of these as different "endpoints" we can call from our application.
- Config: Shared config settings
- DB: Prisma database config

# Database

We use `prisma` to manage our schema and push database updates.

## Development DB Updates

1. After making a change in the prisma schema, you'll need to update the generated typescript client: `yarn dev:generate`
2. Next, to update the database, run `yarn dev:push`.

## Production DB Updates

1. Navigate into the db folder `cd packages/db`
2. Run `yarn prod:push`. This will update the prod db. CAREFUL.

# Technology Stack

1. Next.js: The framework this is all built upon
2. Typescript: The language everything is written in
3. TRPC: What we use for most of our data fetching
4. Tailwind: What we use for styling
5. Stripe: What we use for payment processing
6. Supabase: What we use for our database

# Payments

1. We use stripe for processing payments.
2. Locally, you'll need to listen to stripe webhooks test payment pipelines.
3. Install the cli brew install stripe/stripe-cli/stripe
4. Run the webhook listener `yarn stripe:listen`
5. Copy the env var it outputs in .env and override `STRIPE_WEBHOOK_SECRET`

## Adding new plans

1. When a plan is added in stripe, we need to respond to webhooks emitted to update our database. Make update in Stripe -> API ingests data and updates database
2. To ensure this happens correctly locally, make sure you are running your local stripe listener when making updates in TEST mode. If you are not, that's ok. you can always startup the stripe listener, make a change to whatever you added, and everything will be updated retroactively.

# Advice

This code base is very large. With a lot of moving pieces. Understanding the whole system isn't impossible but isn't worth the time. Instead, focus on understanding individual components. By "component" I literally mean a single react component. For example, a button, then a form, etc. Start at the component level and work your way up until you can understand how an entire page renders. Once you understand how a single page works (how it's data is fetched, how data is mutated) you'll understand how most pages work.

The next step from understanding a page is understanding related pages. For example you may understand the account settings page, but what about organization settings, and other settings pages.

At this point you'll have a solid understanding of how to interact with Next.js, trpc, and prisma. From there it's good to start working on how to change things - how to add new trpc endpoints, how to use prisma to update the database, etc.
