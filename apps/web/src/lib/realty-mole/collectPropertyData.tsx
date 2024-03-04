export type PropertyData = {
  addressLine1: string
  city: string
  state: string
  zipCode: string
  formattedAddress: string
  assessorID: string
  bedrooms: number
  county: string
  legalDescription: string
  squareFootage: number
  subdivision: string
  yearBuilt: number
  bathrooms: number
  lotSize: number
  propertyType: number
  lastSaleDate: string
  features?: {
    architectureType: string
    cooling: boolean
    coolingType: string
    exteriorType: string
    floorCount: number
    foundationType: string
    garage: boolean
    garageType: string
    garageSpaces: number
    heating: boolean
    heatingType: string
    pool: boolean
    roofType: string
    roomCount: number
    unitCount: number
  }
  taxAssessment?: {
    [year: string]: {
      value: number
      land: number
      improvements: number
    }
  }
  propertyTaxes?: {
    [year: string]: {
      total: number
    }
  }
  owner?: {
    names: string[]
    mailingAddress: {
      id: string
      addressLine1: string
      city: string
      state: string
      zipCode: string
    }
  }
  id: string
  longitude: number
  latitude: number
}

const collectPropertyData = async (address: string) => {
  try {
    const urlSearchParams = new URLSearchParams()
    urlSearchParams.set('address', address)
    const res = await fetch(
      `https://realty-mole-property-api.p.rapidapi.com/properties?${urlSearchParams.toString()}`,
      {
        method: 'GET',
        headers: {
          'X-RapidAPI-Key': process.env.X_RapidAPI_Key || '',
          'X-RapidAPI-Host': process.env.X_RapidAPI_Host || '',
        },
      }
    )
    if (res.ok) {
      const json = await res.json()
      if (json.length > 0) {
        const property = json[0] as PropertyData
        return property
      }
    }
  } catch (error) {
    console.error(error)
  }
  return null
}

export default collectPropertyData
