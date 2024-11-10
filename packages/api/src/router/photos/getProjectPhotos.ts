import { prisma } from "@servicegeek/db";
import { z } from "zod";

import { protectedProcedure } from "../../trpc";
import requireOrganization from "../../utils/requireOrganization";
import requireProject from "../../utils/requireProject";
import requireUser from "../../utils/requireUser";
import { supabaseServiceRole } from "../../utils/supabaseServiceRoleClient";
import {
  OnlySelectedFilterQueryParam,
  RoomsFilterQueryParam,
  SortDirectionQueryParam,
} from "../../utils/types";

const getProjectPhotos = protectedProcedure
  .input(
    z.object({
      projectPublicId: z.string().uuid(),
      rooms: RoomsFilterQueryParam,
      onlySelected: OnlySelectedFilterQueryParam,
      sortDirection: SortDirectionQueryParam,
      includUrlMap: z.boolean().optional(),
    })
  )
  .query(async ({ input, ctx }) => {
    const user = await requireUser(ctx.user?.id);
    const project = await requireProject(
      input.projectPublicId,
      user.org?.organizationId as number
    );
    const organization = await requireOrganization(user);
    const images = await prisma.image.findMany({
      where: {
        projectId: project.id,
        organizationId: organization.id,
        isDeleted: false,
        includeInReport: input.onlySelected,
        ...(input.rooms && {
          inference: {
            room: {
              name: {
                in: input.rooms,
              },
            },
          },
        }),
      },
      orderBy: {
        createdAt: input.sortDirection || "desc",
      },
      select: {
        createdAt: true,
        publicId: true,
        key: true,
        includeInReport: true,
        description: true,
        id: true,
        ImageNote: {
          select: {
            id: true,
            createdAt: true,
            updatedAt: true,
            imageId: true,
            body: true,
            mentions: true,
            userId: true,
            User: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
              },
            },
            isDeleted: true,
          },
        },
        inference: {
          select: {
            publicId: true,
            room: {
              select: {
                publicId: true,
                name: true,
              },
            },
          },
        },
      },
    });
    if (input.includUrlMap) {
      const imageKeys = images.map((i) => decodeURIComponent(i.key));
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
      return { images, urlMap };
    }
    return { images };
  });

export default getProjectPhotos;
