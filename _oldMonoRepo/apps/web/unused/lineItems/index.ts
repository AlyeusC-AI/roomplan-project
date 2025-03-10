import { createClient } from '@lib/supabase/server'
import { prisma } from '@servicegeek/db'

import { NextApiRequest, NextApiResponse } from 'next'

const handleGet = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    const supabaseClient = await createClient()

    const {
      data: { user },
    } = await supabaseClient.auth.getUser()
    if (!user) {
      console.error('Session does not exist.')
      res.status(500).json({ status: 'failed' })
      return
    }
    const category = req.query.category
    if (Array.isArray(category) || !category) {
      res
        .status(400)
        .json({ status: 'failed', reason: 'invalid query param category' })
      return
    }
    const categories = await prisma.itemCategory.findFirst({
      where: {
        xactimateKey: category,
      },
    })
    const lineItems = await prisma.lineItem.findMany({
      where: {
        itemCategoryId: categories?.id,
      },
      select: {
        xactimateCategory: {
          select: {
            xactimateKey: true,
          },
        },
        xactimateCode: true,
        xactimateDescription: true,
      },
    })
    if (!lineItems) {
      res
        .status(400)
        .json({ status: 'failed', reason: 'could not fetch categories' })
      return
    }
    res.status(200).json({
      status: 'ok',
      lineItems: lineItems,
    })
    return
  } catch (err) {
    console.error('err', err)
    res.status(500).json({ status: 'failed' })
    return
  }
}

export default async function ProtectedRoute(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === 'GET') await handleGet(req, res)
  else res.status(405).json({ Error: `Operation ${req.method} not allowed` })
  return
}
