import { prisma } from "../..";

export const getLatLng = async (address: string) => {
  const res = await fetch(
    `https://maps.googleapis.com/maps/api/geocode/json?key=${process.env.GOOGLE_GEOCODING_API_KEY}&address=${address}`
  );
  if (!res.ok) {
    console.error(res);
    return null;
  }
  const json = await res.json();
  const { results } = json;
  if (results.length < 1) {
    return null;
  }
  const { geometry } = json.results[0];
  const { location } = geometry;
  const { lat, lng } = location;
  return { lat, lng };
};

export const getWeatherData = async (
  lat: string | number,
  lng: string | number
) => {
  const weatherRes = await fetch(
    `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lng}&units=imperial&appid=${process.env.OPEN_WEATHER_API_KEY}`
  );
  if (!weatherRes.ok) {
    console.log(weatherRes);
    return;
  }
  const weatherJson = await weatherRes.json();
  const {
    main: { temp, humidity },
    weather,
    wind,
  } = weatherJson;

  let forecast = "";
  if (weather.length > 0) {
    forecast = weather[0].main;
  }
  return {
    humidity: `${humidity}`,
    temperature: `${temp}`,
    forecast,
    wind: `${wind?.speed}`,
    lastTimeWeatherFetched: new Date().toISOString(),
  };
};

const getProjectForOrg = async (publicId: string, organizationId: number) => {
  return prisma.project.findFirst({
    where: { publicId, organizationId },
  });
};

export default getProjectForOrg;
