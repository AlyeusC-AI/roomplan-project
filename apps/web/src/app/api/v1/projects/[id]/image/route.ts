// import createInference from "@servicegeek/db/queries/inference/createInference";
// import getSubcriptionStatus from "@servicegeek/db/queries/organization/getSubscriptionStatus";
// import addImageToProject from "@servicegeek/db/queries/project/addImageToProject";
// import getOrCreateRoom, {
//   getRoomById,
// } from "@servicegeek/db/queries/room/getOrCreateRoom";
// import { default as getRestorationXUser } from "@servicegeek/db/queries/user/getUser";
// import {
//   AUTOMATIC_ROOM_DETECTION,
//   UNKNOWN_ROOM,
// } from "@lib/image-processing/constants";
// import queueInference from "@lib/qstash/queueInference";
// import { supabaseServiceRole } from "@lib/supabase/admin";
// import { SubscriptionStatus } from "@servicegeek/db";
// import formidable, { File } from "formidable";
// import { v4 as uuidv4 } from "uuid";
// import { createClient } from "@lib/supabase/server";
// import { NextRequest, NextResponse } from "next/server";
// import { promises } from "fs";

// export const config = {
//   api: {
//     bodyParser: false,
//   },
// };

// export async function POST(
//   req: NextRequest,
//   { params }: { params: Promise<{ id: string }> }
// ) {
//   const jwt = req.headers.get("auth-token");
//   if (!jwt || Array.isArray(jwt)) {
//     console.error("missing");
//     return NextResponse.json({ status: "Missing token" }, { status: 400 });
//   }
//   const supabase = await createClient();

//   const {
//     data: { user },
//   } = await supabase.auth.getUser(jwt);

//   if (!user) {
//     console.error("Session does not exist.");
//     return NextResponse.json(
//       { status: "Session does not exist" },
//       { status: 403 }
//     );
//   }

//   const subscriptionStatus = await getSubcriptionStatus(user.id);
//   if (subscriptionStatus === SubscriptionStatus.past_due) {
//     return NextResponse.json({ status: "trial_expired" }, { status: 403 });
//   }

//   const queryId = req.nextUrl.searchParams.get("id");

//   if (Array.isArray(queryId) || !queryId) {
//     console.error("missing");
//     return NextResponse.json({ status: "missing query id" }, { status: 400 });
//   }

//   let roomId = (await params).id;

//   if (Array.isArray(roomId) || !queryId) {
//     roomId = AUTOMATIC_ROOM_DETECTION;
//   }

//   // /* Get files using formidable */
//   const file = await new Promise<File>((resolve, reject) => {
//     const form = new formidable.IncomingForm();
//     let f: File;
//     form.on("file", function (field, fi) {
//       f = fi;
//       console.log("parsed", fi.size);
//     });
//     form.on("end", () => resolve(f));
//     form.on("error", (err) => reject(err));
//   }).catch((e) => {
//     console.error("Failed to parse file");
//     console.error(e);
//   });

//   if (!file) {
//     console.error("No file");
//     return NextResponse.json({ status: "No file" }, { status: 400 });
//   }
//   if (file.size === 0) {
//     console.error("Empty file");
//     return NextResponse.json({ status: "Empty file" }, { status: 400 });
//   }

//   console.log("file size", file.size);

//   try {
//     console.log("size", file.size);
//     const fsdata = await promises.readFile(file.filepath);
//     const imageBuffer = Buffer.from(fsdata);

//     console.log("imageBuffer", imageBuffer);

//     const servicegeekUser = await getRestorationXUser(user.id);
//     console.log(file.mimetype);
//     let ext = ".png";
//     if (
//       (file.mimetype ? file.mimetype : "").indexOf(".jpg") >= 0 ||
//       (file.mimetype ? file.mimetype : "").indexOf(".jpeg") >= 0
//     ) {
//       ext = ".jpg";
//     }
//     const supabasePath = `${
//       servicegeekUser?.org?.organization.publicId
//     }/${queryId}/${uuidv4()}_${
//       file.originalFilename ? file.originalFilename : ext
//     }`;

//     const { data, error } = await supabaseServiceRole.storage
//       .from("project-images")
//       .upload(supabasePath, imageBuffer, {
//         cacheControl: "3600",
//         // @ts-expect-error
//         contentType: file.mimetype,
//         upsert: false,
//       });

//     console.log("upload data", data);
//     if (error || !data?.path) {
//       console.error(error);
//       return NextResponse.json({ status: "failed" }, { status: 500 });
//     }

//     const image = await addImageToProject(
//       user.id,
//       queryId,
//       encodeURIComponent(data?.path)
//     );

//     if (!image) {
//       return NextResponse.json({ status: "failed" }, { status: 500 });
//     }

//     let roomName;
//     try {
//       if (roomId !== AUTOMATIC_ROOM_DETECTION && roomId) {
//         const room = await getRoomById(image.projectId, roomId);
//         roomName = room?.name;
//       }
//     } catch {
//       console.error("Error detecting room");
//       roomName = UNKNOWN_ROOM;
//     }
//     if (!roomName) {
//       roomName = UNKNOWN_ROOM;
//     }

//     const { room: inferenceRoom, didCreateRoom } = await getOrCreateRoom(
//       image.projectId,
//       roomName
//     );

//     if (!inferenceRoom) {
//       return NextResponse.json(
//         { status: "failed to add to room" },
//         { status: 500 }
//       );
//     }

//     const inference = await createInference(image.publicId, inferenceRoom.id);

//     if (!inference) {
//       return NextResponse.json({ status: "failed" }, { status: 500 });
//     }
//     await queueInference(inference.id);

//     return NextResponse.json({
//       status: "ok",
//       data: {
//         imageKey: inference.imageKey,
//         publicId: inference.publicId,
//         roomId: inferenceRoom.publicId,
//         roomName: inferenceRoom.name,
//         didCreateRoom,
//       },
//     });
//   } catch (error) {
//     console.error(error);
//     return NextResponse.json({ status: "failed" }, { status: 500 });
//   }
// }
