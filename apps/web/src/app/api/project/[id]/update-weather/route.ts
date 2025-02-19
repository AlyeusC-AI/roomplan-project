import { supabaseServiceRole } from "@lib/supabase/admin";
import { user } from "@lib/supabase/get-user";
import { NextRequest, NextResponse } from "next/server";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const [supabase, authUser] = user(req);
  if (!authUser) {
    console.error("Session does not exist.");
    return NextResponse.json({ status: "failed" }, { status: 500 });
  }
  const id = (await params).id;

  const project = await supabaseServiceRole
    .from("Project")
    .select("*")
    .eq("publicId", id)
    .single();

  const weatherRes = await fetch(
    `https://api.openweathermap.org/data/2.5/weather?lat=${project.data?.lat}&lon=${project.data?.lng}&units=imperial&appid=${process.env.OPEN_WEATHER_API_KEY}`
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
  const weatherData = {
    humidity: `${humidity}`,
    temperature: `${temp}`,
    forecast,
    wind: `${wind?.speed}`,
    lastTimeWeatherFetched: new Date().toISOString(),
  };

  await supabase
    .from("Project")
    .update({ ...weatherData })
    .eq("publicId", id);

  try {
    return NextResponse.json(
      {
        status: "ok",
        weatherData: weatherData,
      },
      { status: 200 }
    );
  } catch (err) {
    console.error(err);
    return NextResponse.json({ status: "failed" }, { status: 500 });
  }
}
