const NAME = 'Bathroom Remodel'
const TEMPLATE_ID = 'BATHROOM_REMODEL'

const bathroomRemodel = {
  name: NAME,
  id: TEMPLATE_ID,
  isApplicable: (roomName: string) =>
    NAME.toLowerCase().indexOf(roomName.toLowerCase()) >= 0,
  description: 'Common items used during bathroom remodels',
  items: [
    { category: 'FNH', selection: 'LSROD', description: 'Shower curtain rod' },
    { category: 'PLM', selection: 'TSFAU', description: 'Tub/shower faucet' },
    {
      category: 'TIL',
      selection: 'SWR<',
      description: 'Tile shower - up to 60 SF',
    },
    { category: 'CLN', selection: 'TUB+', description: 'Clean tub - Heavy' },
    { category: 'PNT', selection: 'TUB', description: 'Refinish bathtub' },
    { category: 'CAB', selection: 'MC', description: 'Medicine cabinet' },
    {
      category: 'PLM',
      selection: 'PTRAP',
      description: 'P-trap assembly - ABS (plastic)',
    },
    {
      category: 'CAB',
      selection: 'VPE',
      description: 'Vanity with porcelain or engineered stone top',
    },
    {
      category: 'PLM',
      selection: 'PTRAPR',
      description: 'P-trap assembly - Detach & reset',
    },
    { category: 'TIL', selection: 'B', description: 'Ceramic tile base' },
    { category: 'TIL', selection: 'AV', description: 'Ceramic/porcelain tile' },
    {
      category: 'TBA',
      selection: 'MIRRS',
      description: 'Bathroom mirror - Detach & reset',
    },
    { category: 'FNH', selection: 'BAC', description: 'Bath accessory' },
    {
      category: 'PLM',
      selection: 'SUP',
      description: 'Plumbing fixture supply line',
    },
    {
      category: 'MBL',
      selection: 'THRC',
      description: 'Threshold - cultured marble',
    },
    { category: 'TIL', selection: 'SEA', description: 'Tile/stone sealer' },
    {
      category: 'ELE',
      selection: 'BFA',
      description: 'Bathroom ventilation fan',
    },
  ],
}

export default bathroomRemodel
