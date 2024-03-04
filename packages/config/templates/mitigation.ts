const NAME = 'Mitigation'
const TEMPLATE_ID = 'BASIC_MITIGATION'

const mitigation = {
  name: NAME,
  id: TEMPLATE_ID,
  isApplicable: (roomName: string) => true,
  description: 'Typical mitigation items',
  items: [
    {
      category: 'PLA',
      selection: 'WLA',
      description: 'Tear off plaster on wood lath',
    },
    {
      category: 'WTR',
      selection: 'FC',
      description: 'Tear out wet non-salvageable carpet, cut/bag - Cat 3 water',
    },
    {
      category: 'WTR',
      selection: 'TR',
      description: 'Tear out trim and bag for disposal - up to Cat 3',
    },
    {
      category: 'WTR',
      selection: 'DR',
      description: 'Tear out wet drywall, cleanup, bag for disposal',
    },
    {
      category: 'WTR',
      selection: 'I',
      description: 'Tear out and bag wet insulation',
    },
    {
      category: 'WTR',
      selection: 'UL',
      description: 'Tear out non-sal underlayment & bag for disposal',
    },
    {
      category: 'WTR',
      selection: 'DR',
      description: 'Air mover axial fan (per 24 hour period) - No monitoring',
    },
    {
      category: 'WTR',
      selection: 'DRY',
      description:
        'Axial fan air mover - 1 HP (per 24 hr period)-No monitoring.',
    },
    {
      category: 'WTR',
      selection: 'DH',
      description: 'Dehumidifier (per 24 hour period) - Large - No monitoring',
    },
    {
      category: 'WTR',
      selection: 'DHM',
      description: 'Dehumidifier (per 24 hour period) - XLarge - No monitoring',
    },
    {
      category: 'WTR',
      selection: 'DHM',
      description:
        'Dehumidifier (per 24 hr period) -Large-Desiccant-No monitoring',
    },
    {
      category: 'WTR',
      selection: 'GR',
      description: 'Apply plant-based anti-microbial agent to the surface area',
    },
    {
      category: 'WTR',
      selection: 'G',
      description: 'Apply anti-microbial agent to the surface area',
    },
    // {
    //   category: 'WTR',
    //   selection: 'G',
    //   description: 'Apply anti-microbial agent to more than the floor',
    // },
    // {
    //   category: 'WTR',
    //   selection: 'G',
    //   description: 'Apply anti-microbial agent to more than the walls',
    // },
    {
      category: 'PNT',
      selection: 'UL',
      description: 'Seal underlayment for odor control',
    },
  ],
}

export default mitigation
