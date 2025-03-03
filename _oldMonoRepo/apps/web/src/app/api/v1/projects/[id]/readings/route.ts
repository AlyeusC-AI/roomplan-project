import { supabaseServiceRole } from "@lib/supabase/admin";
import { user } from "@lib/supabase/get-user";
import { NextRequest, NextResponse } from "next/server";

// const calculateGpp = async (temperature: string, relativeHumidity: string) => {
//   const temperatureMeasurement = "Fahrenheit";
//   const pressure = 1;
//   const pressureMeasurement = "atmosphere";
//   const precision = 2;

//   const response = await fetch("https://www.aqua-calc.com/calculate/humidity", {
//     method: "POST",
//     headers: {
//       "Content-Type": "application/x-www-form-urlencoded",
//     },
//     body: `temperature=${temperature}&temperature-measurement=${temperatureMeasurement}&relative-humidity=${relativeHumidity}&pressure=${pressure}&pressure-measurement=${pressureMeasurement}&precision=${precision}&calculate=Calculate`,
//   });
//   const text = await response.text();
//   const root = parse(text);
//   console.log(root.querySelectorAll(".black_on_white"));
//   return root.querySelectorAll(".black_on_white.math>p>strong")[1].innerText;
// };

export async function PATCH(req: NextRequest) {
  await user(req);

  const { readingData, readingId, type } = await req.json();
  try {
    // if (readingData.humidity && readingData.temperature) {
    //   const gpp = await calculateGpp(
    //     readingData.temperature,
    //     readingData.humidity
    //   );
    //   readingData.gpp = parseFloat(gpp).toFixed(2);
    // }

    const result = await supabaseServiceRole
      .from(type === "generic" ? "GenericRoomReading" : "RoomReading")
      .update(readingData)
      .eq("publicId", readingId);

    if (result.error) {
      console.error(result.error);
    }

    return NextResponse.json({ status: "ok" }, { status: 200 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ status: "failed" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  await user(req);

  const { type, data } = await req.json();

  try {
    const result = await supabaseServiceRole
      .from(type === "generic" ? "GenericRoomReading" : "RoomReading")
      .insert(data)
      .select("*")
      .single();

    return NextResponse.json(
      { status: "ok", reading: result.data },
      { status: 200 }
    );
  } catch (err) {
    console.error(err);
    return NextResponse.json({ status: "failed" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  await user(req);

  try {
    const { type, readingId } = await req.json();

    const res = await supabaseServiceRole
      .from(type === "generic" ? "GenericRoomReading" : "RoomReading")
      .update({
        isDeleted: true,
      })
      .eq("publicId", readingId)
      .select("id")
      .single();

    if (type != "generic") {
      await supabaseServiceRole
        .from("GenericRoomReading")
        .update({
          isDeleted: true,
        })
        .eq("roomReadingId", res.data!.id);
    }

    return NextResponse.json({ status: "ok" }, { status: 200 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ status: "failed" }, { status: 500 });
  }
}
