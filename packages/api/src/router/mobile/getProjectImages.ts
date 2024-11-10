import { prisma } from "@servicegeek/db";
import getMembers from "@servicegeek/db/queries/organization/getMembers";
import { TRPCError } from "@trpc/server";
import { z } from "zod";

import { mobileProcedure } from "../../trpc";
import requireOrganization from "../../utils/requireOrganization";
import requireProject from "../../utils/requireProject";
import requireUser from "../../utils/requireUser";
import { supabaseServiceRole } from "../../utils/supabaseServiceRoleClient";

const getProjectImages = mobileProcedure
  .input(
    z.object({
      projectPublicId: z.string(),
      jwt: z.string(),
    })
  )
  .query(async ({ input, ctx }) => {
    const user = await requireUser(ctx.user?.id);
    const organization = await requireOrganization(user);
    await requireProject(input.projectPublicId, organization.id);

    const project = await prisma.project.findFirst({
      where: {
        publicId: input.projectPublicId,
        isDeleted: false,
      },
      select: {
        rooms: {
          where: {
            isDeleted: false,
          },
          select: {
            publicId: true,
            name: true,

            inferences: {
              where: {
                isDeleted: false,
                image: {
                  isDeleted: false,
                },
              },
              select: {
                publicId: true,
                imageKey: true,
              },
            },
          },
        },
      },
    });

    if (!project) {
      throw new TRPCError({
        code: "PRECONDITION_FAILED",
        message: "An unexpected error occurred, please try again later.",
        cause: "Failed to find project",
      });
    }
    const imageKeys = project.rooms?.reduce<string[]>((prev, cur) => {
      const images = cur.inferences.reduce<string[]>(
        (p, c) => (c.imageKey ? [decodeURIComponent(c.imageKey), ...p] : p),
        []
      );
      return [...images, ...prev];
    }, []) as string[];

    const { data, error } = await supabaseServiceRole.storage
      .from("project-images")
      .createSignedUrls(imageKeys, 1800);

    const { data: mediaData } = await supabaseServiceRole.storage
      .from("media")
      .createSignedUrls(imageKeys, 1800);
    const arr =
      data && mediaData
        ? [...data, ...mediaData]
        : data
        ? data
        : mediaData
        ? mediaData
        : [];
    const urlMap = arr.reduce<{
      [imageKey: string]: string;
    }>((p, c) => {
      if (c.error) return p;
      if (!c.path) return p;
      return {
        [c.path]: c.signedUrl,
        ...p,
      };
    }, {});
    console.log(urlMap);
    return {
      rooms: project.rooms,
      urlMap,
      organizationId: organization.publicId,
    };
  });

export default getProjectImages;
