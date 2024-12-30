import getOAuthToken from './getOAuthToken'

const getPropertyData = async () => {
  const token = await getOAuthToken()
  try {
    const urlSearchParams = new URLSearchParams()
    urlSearchParams.set('streetAddress', '412 Howard Road')
    urlSearchParams.set('city', 'Gladwyne')
    urlSearchParams.set('state', 'PA')
    urlSearchParams.set('zipCode', '19035')
    console.log('Token', token)
    console.log('Params', urlSearchParams.toString())
    const res = await fetch(
      `https://property.corelogicapi.com/v2/properties/search?${urlSearchParams.toString()}`,
      {
        method: 'GET',
        headers: {
          'content-type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      }
    )
    if (res.ok) {
      //   const json = await res.text()
      //   const body = await res.
      const json = await res.json()
      console.log(json)
    } else {
      console.log(res)
    }
    return null
  } catch (error) {
    console.error(error)
  }
}

export default getPropertyData
