const NAME = 'Drywall Repair'
const TEMPLATE_ID = 'DRYWALL_REPAIR'

const drywallDamage = {
  name: NAME,
  id: TEMPLATE_ID,
  isApplicable: (roomName: string) => true,
  description: 'Common items used when repairing drywall',
  items: [
    {
      category: 'DRY',
      selection: '1/2',
      description: '1/2 drywall - hung, taped, floated, ready for paint',
    },
    {
      category: 'DRY',
      selection: '5/8',
      description: '5/8 drywall - hung, taped, floated, ready for paint',
    },
    {
      category: 'PNT',
      selection: 'OPSP',
      description: 'Seal & paint door or window opening (per side)',
    },
    {
      category: 'PNT',
      selection: 'DORSP',
      description: 'Seal & paint door slab only (per side)',
    },
    {
      category: 'PNT',
      selection: 'B1',
      description: 'Seal & paint baseboard - two coats',
    },
    {
      category: 'CLN',
      selection: 'FINALRI',
      description: 'Final cleaning - construction - Residential',
    },
    { category: 'CLN', selection: 'S', description: 'Clean stud wall' },
    {
      category: 'PNT',
      selection: 'MASK',
      description: 'Mask the floor per square foot - plastic and tape - 4 mil',
    },
  ],
}

export default drywallDamage
