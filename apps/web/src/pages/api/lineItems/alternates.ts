import { prisma } from '@restorationx/db'

import { createServerSupabaseClient } from '@supabase/auth-helpers-nextjs'
import { NextApiRequest, NextApiResponse } from 'next'

const handleGet = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    const supabaseClient = createServerSupabaseClient({
      req,
      res,
    })
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
    const code = req.query.code
    if (Array.isArray(code) || !code) {
      res
        .status(400)
        .json({ status: 'failed', reason: 'invalid query param code' })
      return
    }
    const itemCategory = await prisma.itemCategory.findFirst({
      where: {
        xactimateKey: category,
      },
    })
    if (!itemCategory) {
      res.status(400).json({ status: 'failed', reason: 'invalid category' })
      return
    }
    const lineItem = await prisma.lineItem.findFirst({
      where: {
        itemCategoryId: itemCategory.id,
        xactimateCode: code,
      },
      select: {
        alternateItem: true,
      },
    })
    if (!lineItem) {
      const lineItems = await prisma.lineItem.findMany({
        where: {
          itemCategoryId: itemCategory?.id,
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
      res.status(200).json({
        status: 'ok',
        lineItems,
      })
      return
    }

    if (lineItem.alternateItem.length === 0) {
      res.status(200).json({
        status: 'ok',
        lineItems: [],
      })
      return
    }

    const alternates = await prisma.alternateItem.findMany({
      where: {
        alternateId: lineItem.alternateItem[0].alternateId,
      },
      select: {
        lineItem: {
          select: {
            xactimateCode: true,
            xactimateDescription: true,
            unit: true,
            itemCategoryId: true,
            xactimateCategory: {
              select: {
                xactimateKey: true,
              },
            },
          },
        },
      },
    })
    const formattedAlts = alternates.map((m) => ({
      ...m.lineItem,
    }))

    const removeDups = formattedAlts.filter((alt) => {
      const count = formattedAlts.filter(
        (f) =>
          f.xactimateCategory.xactimateKey ===
            alt.xactimateCategory.xactimateKey &&
          f.xactimateCode === alt.xactimateCode
      ).length
      if (count > 1) return false
      return true
    })
    res.status(200).json({
      status: 'ok',
      lineItems: removeDups,
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
