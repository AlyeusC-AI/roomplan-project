import { SubscriptionStatus } from "@restorationx/db";
import createInference from "@restorationx/db/queries/inference/createInference";
import { getSubcriptionStatusFromOrganizationId } from "@restorationx/db/queries/organization/getSubscriptionStatus";
import { addImageToProjectByOrganizationId } from "@restorationx/db/queries/project/addImageToProject";
import getOrCreateRoom, {
  getRoomById,
} from "@restorationx/db/queries/room/getOrCreateRoom";
import { TRPCError } from "@trpc/server";
import { z } from "zod";

import { protectedProcedure } from "../../trpc";
import requireOrganization from "../../utils/requireOrganization";
import requireProject from "../../utils/requireProject";
import requireUser from "../../utils/requireUser";
import { supabaseServiceRole } from "../../utils/supabaseServiceRoleClient";

const UNKNOWN_ROOM = "Unknown Room";

const createNotification = protectedProcedure
  .input(
    z.object({
      fileName: z.string(),
      projectPublicId: z.string(),
      mediaType: z.union([z.literal("photo"), z.literal("video")]),
      roomId: z.string().optional(),
    })
  )
  .mutation(async ({ input, ctx }) => {
    const user = await requireUser(ctx.user?.id);
    const organization = await requireOrganization(user);
    await requireProject(input.projectPublicId, organization.id);

    if (!ctx.supabase) {
      throw new TRPCError({
        code: "PRECONDITION_FAILED",
        message: "An unexpected error occurred, please try again later.",
        cause: "Could not create supabaseclient",
      });
    }

    const subscriptionStatus = await getSubcriptionStatusFromOrganizationId(
      organization.id,
      organization.createdAt
    );
    if (subscriptionStatus === SubscriptionStatus.past_due) {
      throw new TRPCError({
        code: "PRECONDITION_FAILED",
        message: "An unexpected error occurred, please try again later.",
        cause: "Trial expired",
      });
    }

    const fullPath = `${user.id}/${input.fileName}`;

    const image = await addImageToProjectByOrganizationId(
      organization.id,
      input.projectPublicId,
      encodeURIComponent(fullPath)
    );

    if (!image) {
      throw new TRPCError({
        code: "PRECONDITION_FAILED",
        message: "An unexpected error occurred, please try again later.",
        cause: "Could not create image",
      });
    }

    let roomName;
    let roomId = input.roomId;

    try {
      if (roomId) {
        let room = await getRoomById(image.projectId, roomId);
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
      throw new TRPCError({
        code: "PRECONDITION_FAILED",
        message: "An unexpected error occurred, please try again later.",
        cause: "Could not  add image to room",
      });
    }

    const inference = await createInference(image.publicId, inferenceRoom.id);

    if (!inference) {
      throw new TRPCError({
        code: "PRECONDITION_FAILED",
        message: "An unexpected error occurred, please try again later.",
        cause: "Could not create inference",
      });
    }

    const { data: signedurl } = await supabaseServiceRole.storage
      .from("media")
      .createSignedUrl(decodeURIComponent(inference.imageKey!), 1800);

    return {
      status: "ok",
      signedUrl: signedurl?.signedUrl as string,
      imageKey: inference.imageKey as string,
      publicId: inference.publicId,
      createdAt: inference.createdAt.toISOString(),
      roomId: inferenceRoom.publicId,
      roomName: inferenceRoom.name,
      didCreateRoom,
      imagePublicId: image.publicId,
    };
  });

export default createNotification;
