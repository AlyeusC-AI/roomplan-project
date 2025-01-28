import createInference from "@servicegeek/db/queries/inference/createInference";
import getSubcriptionStatus from "@servicegeek/db/queries/organization/getSubscriptionStatus";
import addImageToProject from "@servicegeek/db/queries/project/addImageToProject";
import getOrCreateRoom, {
  getRoomById,
} from "@servicegeek/db/queries/room/getOrCreateRoom";
import { default as getRestorationXUser } from "@servicegeek/db/queries/user/getUser";
import {
  AUTOMATIC_ROOM_DETECTION,
  UNKNOWN_ROOM,
} from "@lib/image-processing/constants";
import { supabaseServiceRole } from "@lib/supabase/admin";
import { SubscriptionStatus } from "@servicegeek/db";
import formidable, { File } from "formidable";
import { v4 as uuidv4 } from "uuid";
import { createClient } from "@lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";
const fs = require("fs").promises;

export const config = {
  api: {
    bodyParser: false,
  },
};

const handleUpload = async (req: NextRequest) => {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (!user || !session?.access_token) {
    console.error("Session does not exist.");
    return NextResponse.json({ status: "failed" }, { status: 500 });
  }

  const subscriptionStatus = await getSubcriptionStatus(user.id);
  if (subscriptionStatus === SubscriptionStatus.past_due) {
    console.error("Past due");
    return NextResponse.json({ status: "trial_expired" }, { status: 500 });
  }

  const queryId = req.nextUrl.searchParams.get("id");

  if (Array.isArray(queryId) || !queryId) {
    return NextResponse.json({ status: "missing query id" }, { status: 500 });
  }

  let roomId = req.nextUrl.searchParams.get("roomId");

  if (Array.isArray(roomId) || !roomId) {
    roomId = AUTOMATIC_ROOM_DETECTION;
  }

  // /* Get files using formidable */
  const file = await new Promise<File>((resolve, reject) => {
    const form = new formidable.IncomingForm();
    let f: File;
    form.on("file", function (field, file) {
      f = file;
    });
    form.on("end", () => resolve(f));
    form.on("error", (err) => reject(err));
  }).catch((e) => {
    console.error("Failed to parse file");
    console.error(e);
  });

  if (!file) {
    console.error("No file");
    return NextResponse.json("failed", { status: 500 });
  }

  try {
    const fsdata = await fs.readFile(file.filepath);
    const imageBuffer = Buffer.from(fsdata);

    const servicegeekUser = await getRestorationXUser(user.id);
    const supabasePath = `${
      servicegeekUser?.org?.organization.publicId
    }/${queryId}/${uuidv4()}_${file.originalFilename}`;

    const { data, error } = await supabaseServiceRole.storage
      .from("project-images")
      .upload(supabasePath, imageBuffer, {
        cacheControl: "3600",
        // @ts-expect-error
        contentType: file.mimetype,
        upsert: false,
      });

    if (error || !data?.path) {
      console.error(error);
      return NextResponse.json("failed", { status: 500 });
    }

    const image = await addImageToProject(
      user.id,
      queryId,
      encodeURIComponent(data?.path)
    );

    if (!image) {
      return NextResponse.json("no image", { status: 500 });
    }

    let roomName;

    try {
      if (roomId) {
        const room = await getRoomById(image.projectId, roomId);
        roomName = room?.name;
      } else {
        roomName === UNKNOWN_ROOM;
      }
    } catch (e) {
      console.error("Error detecting room");
      roomName = UNKNOWN_ROOM;
    }

    if (!roomName) {
      roomName = UNKNOWN_ROOM;
    }

    const { room: inferenceRoom, didCreateRoom } = await getOrCreateRoom(
      image.projectId,
      roomName
    );

    if (!inferenceRoom) {
      return NextResponse.json("failed to add to room", { status: 500 });
    }

    const inference = await createInference(image.publicId, inferenceRoom.id);

    if (!inference) {
      return NextResponse.json("failed to create inference", { status: 500 });
    }

    // const detectionsWithInferenceId = detections.map((d) => ({
    //   ...d,
    //   roomId: inference.roomId,
    //   inferenceId: inference.id,
    //   projectId: image.projectId,
    // }))

    // await prisma.detection.createMany({
    //   data: detectionsWithInferenceId,
    //   skipDuplicates: true,
    // })

    // await queueInference(inference.id)
    const { data: signedurl } = await supabaseServiceRole.storage
      .from("project-images")
      .createSignedUrl(decodeURIComponent(inference.imageKey!), 1800);

    return NextResponse.json(
      {
        status: "ok",
        data: {
          signedUrl: signedurl?.signedUrl,
          imageKey: inference.imageKey,
          publicId: inference.publicId,
          createdAt: inference.createdAt.toISOString(),
          roomId: inferenceRoom.publicId,
          roomName: inferenceRoom.name,
          didCreateRoom,
          imagePublicId: image.publicId,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json("failed", { status: 500 });
  }
};

export default handleUpload;
