import { AccessLevel, prisma } from "../../";
import { v4 as uuidv4, v4 } from "uuid";

const createOrg = async (
  userId: string,
  orgName: string,
  size: string,
  role: string
) => {
  const publicId = uuidv4();
  const user = await prisma.user.update({
    where: {
      id: userId,
    },
    data: {
      org: {
        create: {
          isAdmin: true,
          role,
          accessLevel: AccessLevel.admin,
          organization: {
            create: {
              name: orgName,
              size,
              publicId,
              ProjectStatusValue: {
                createMany: {
                  data: [
                    {
                      label: "Active",
                      description: "The job is currently being worked on.",
                      color: "blue",
                      publicId: v4(),
                      order: 0,
                    },
                    {
                      label: "Mitigation",
                      description: "The mitigation process is underway.",
                      color: "blue",
                      publicId: v4(),
                      order: 1,
                    },
                    {
                      label: "Inspection",
                      description: "The inspection process is underway.",
                      color: "yellow",
                      publicId: v4(),
                      order: 2,
                    },
                    {
                      label: "Review",
                      description:
                        "The job is being finalized and is currently under review.",
                      color: "orange",
                      publicId: v4(),
                      order: 3,
                    },
                    {
                      label: "Completed",
                      description: "The job is complete",
                      color: "none",
                      publicId: v4(),
                      order: 4,
                    },
                    {
                      label: "Inactive",
                      description: "The job is no longer being worked on.",
                      color: "none",
                      publicId: v4(),
                      order: 5,
                    },
                    {
                      label: "Incomplete",
                      description:
                        "The job is not finished and is not being worked on",
                      color: "red",
                      publicId: v4(),
                      order: 6,
                    },
                  ],
                },
              },
            },
          },
        },
      },
    },
    include: {
      org: {
        include: {
          organization: true,
        },
      },
    },
  });

  return user;
};

export default createOrg;
