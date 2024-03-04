const NAME = 'Kitchen Remodel'
const TEMPLATE_ID = 'KITCHEN_REMODEL'

const kitchenRemodel = {
  name: NAME,
  id: TEMPLATE_ID,
  isApplicable: (roomName: string) =>
    NAME.toLowerCase().indexOf(roomName.toLowerCase()) >= 0,
  description: 'Common items used during kitchen remodels',
  items: [
    {
      category: 'CAB',
      selection: 'SP4"',
      description: 'backsplash for flat laid countertop',
    },
    {
      category: 'CAB',
      selection: 'M',
      description: 'Add on for undermount sink cutout & polish - single basin',
    },
    {
      category: 'FCT',
      selection: 'DIAGA',
      description: 'Add-on for diagonal tile installation',
    },
    {
      category: 'TIL',
      selection: 'CTTL',
      description: 'Add-on for tile backsplash installation',
    },
    {
      category: 'PLM',
      selection: 'STO',
      description: 'Angle stop valve',
    },
    {
      category: 'APP',
      selection: 'OVBI',
      description: 'Built-in double oven',
    },
    {
      category: 'APP',
      selection: 'OVB',
      description: 'Built-in oven',
    },
    {
      category: 'WTR',
      selection: 'ABLD',
      description: 'Cabinet - lower (base) unit w/shoring - Detach',
    },
    {
      category: 'CAB',
      selection: 'KNP',
      description: 'Cabinet knobs or pulls - Detach & reset',
    },
    {
      category: 'CAB',
      selection: 'PLY',
      description: 'Cabinet panels - side, end, or back',
    },
    {
      category: 'CAB',
      selection: 'PLY+',
      description: 'Cabinet panels - side, end, or back - High grade',
    },
    {
      category: 'CAB',
      selection: 'FH',
      description: 'Cabinetry - full height unit',
    },
    {
      category: 'CAB',
      selection: 'FHR',
      description: 'Cabinetry - full height unit - Detach & reset',
    },
    {
      category: 'CAB',
      selection: 'LOW',
      description: 'Cabinetry - lower (base) units',
    },
    {
      category: 'CAB',
      selection: 'UP',
      description: 'Cabinetry - upper (wall) units',
    },
  ],
}

export default kitchenRemodel
