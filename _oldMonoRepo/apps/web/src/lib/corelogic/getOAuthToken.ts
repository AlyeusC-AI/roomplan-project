//property.corelogicapi.com/v2/properties/search
import { btoa } from "buffer";

const getOAuthToken = async () => {
  // https://property.corelogicapi.com/v2/properties/search
  // https://developer.corelogic.com/#/api-docs/spatial-api/Residential%20Replacement%20Cost
  //     curl -u {username}:{password} --location --request POST 'https://api-prod.corelogic.com/oauth/token?grant_type=client_credentials'
  // --data-raw ''
  const username = "Z2WwGoLmcVwYeBvj3fwz9WS8Ne7j3qPs";
  const password = "wN3tO6SitHFKWNT0";
  try {
    const auth = btoa(`${username}:${password}`);
    const res = await fetch(
      "https://api-prod.corelogic.com/oauth/token?grant_type=client_credentials",
      {
        method: "POST",
        headers: {
          Authorization: `Basic ${auth}`,
        },
      }
    );
    if (res.ok) {
      const json = await res.json();
      return json.access_token;
    }
    return null;
  } catch (error) {
    console.error(error);
  }
};

export default getOAuthToken;
