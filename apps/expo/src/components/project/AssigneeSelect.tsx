import { RouterOutputs } from "@servicegeek/api";
import {
  Actionsheet,
  Box,
  Heading,
  View,
  Text,
  Pressable,
  CheckIcon,
} from "native-base";
import React, { useState } from "react";
// @ts-expect-error
import UsersIcon from "../../../assets/icons/Users.svg";
import { userStore } from "../../atoms/user";
import { api } from "../../utils/api";

const AssigneeSelect = ({
  projectAssignees,
  teamMembers,
  projectPublicId,
}: {
  projectAssignees: NonNullable<
    RouterOutputs["mobile"]["getProjectOverviewData"]["project"]
  >["projectAssignees"];
  teamMembers: NonNullable<
    RouterOutputs["mobile"]["getProjectOverviewData"]["teamMembers"]
  >;
  projectPublicId: string;
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const selectedMembers = projectAssignees.filter((p) =>
    teamMembers.find((t) => t.user.id === p.userId)
  );
  const { session } = userStore(state => state);

  const trpcContext = api.useContext();
  const addProjectAssignee = api.mobile.addProjectAssignee.useMutation({
    async onMutate({ jwt, projectPublicId, userId }) {
      await trpcContext.mobile.getProjectOverviewData.cancel();
      const prevData = trpcContext.mobile.getProjectOverviewData.getData();
      const alreadyContained = prevData?.project?.projectAssignees.find(
        (a) => a.userId === userId
      );
      if (alreadyContained) {
        return { prevData };
      }
      const newUser = teamMembers.find((m) => m.user.id === userId);
      if (!newUser) {
        return { prevData };
      }

      trpcContext.mobile.getProjectOverviewData.setData(
        { jwt, projectPublicId },
        (old) => {
          if (!old || !old.project) return old;
          return {
            ...old,
            project: {
              ...old.project,
              projectAssignees: [
                ...(old.project?.projectAssignees || []),
                {
                  userId,
                  user: {
                    firstName: newUser.user.firstName,
                    email: newUser.user.email,
                  },
                },
              ],
            },
          };
        }
      );
      return { prevData };
    },
    onError(err, { jwt, projectPublicId }, ctx) {
      // If the mutation fails, use the context-value from onMutate
      if (ctx?.prevData)
        trpcContext.mobile.getProjectOverviewData.setData(
          { jwt, projectPublicId },
          ctx.prevData
        );
    },
    onSettled(d, a) {
      trpcContext.mobile.getProjectOverviewData.invalidate();
    },
  });
  const removeProjectAssignee = api.mobile.removeProjectAssignee.useMutation({
    async onMutate({ jwt, projectPublicId, userId }) {
      await trpcContext.mobile.getProjectOverviewData.cancel();
      const prevData = trpcContext.mobile.getProjectOverviewData.getData();
      const alreadyContained = prevData?.project?.projectAssignees.find(
        (a) => a.userId === userId
      );
      if (alreadyContained) {
        return { prevData };
      }
      const newUser = teamMembers.find((m) => m.user.id === userId);
      if (!newUser) {
        return { prevData };
      }

      trpcContext.mobile.getProjectOverviewData.setData(
        { jwt, projectPublicId },
        (old) => {
          if (!old || !old.project) return old;
          return {
            ...old,
            project: {
              ...old.project,
              projectAssignees: (old.project?.projectAssignees || []).filter(
                (m) => m.userId !== userId
              ),
            },
          };
        }
      );
      return { prevData };
    },
    onError(err, { jwt, projectPublicId }, ctx) {
      // If the mutation fails, use the context-value from onMutate
      if (ctx?.prevData)
        trpcContext.mobile.getProjectOverviewData.setData(
          { jwt, projectPublicId },
          ctx.prevData
        );
    },
    onSettled(d, a) {
      trpcContext.mobile.getProjectOverviewData.invalidate();
    },
  });

  const onPress = (userId: string, isAlreadySelected: boolean) => {
    if (isAlreadySelected) {
      removeProjectAssignee.mutate({
        jwt: session ? session["access_token"] : "null",
        projectPublicId,
        userId,
      });
    } else {
      addProjectAssignee.mutate({
        jwt: session ? session["access_token"] : "null",
        projectPublicId,
        userId,
      });
    }
  };
  return (
    <>
      <Pressable
        display="flex"
        flexDirection="row"
        onPress={() => setIsOpen(true)}
      >
        <UsersIcon height={24} width={24} />
        <View ml={2}>
          {selectedMembers.map((m) => (
            <Heading key={m.userId} size="sm" color="blue.500">
              {m.user.firstName || m.user.email}
            </Heading>
          ))}
        </View>
      </Pressable>
      <Actionsheet isOpen={isOpen} onClose={() => setIsOpen(false)}>
        <Actionsheet.Content>
          <Box w="100%" h={60} px={4} justifyContent="center">
            <Text
              fontSize="16"
              color="gray.500"
              _dark={{
                color: "gray.300",
              }}
            >
              Team Members
            </Text>
          </Box>
          {teamMembers.map((member) => (
            <Actionsheet.Item
              key={member.user.id}
              onPress={() =>
                onPress(
                  member.user.id,
                  !!projectAssignees.find((a) => a.userId === member.user.id)
                )
              }
            >
              <View
                display="flex"
                flexDirection={"row"}
                justifyContent="space-between"
                w="full"
              >
                {!member.user.firstName ? (
                  <Text>{member.user.email}</Text>
                ) : (
                  <Text>
                    {`${member.user.firstName} ${member.user.lastName}`}
                  </Text>
                )}
                {projectAssignees.find((a) => a.userId === member.user.id) && (
                  <View ml={6} color="blue.500">
                    <CheckIcon />
                  </View>
                )}
              </View>
            </Actionsheet.Item>
          ))}
        </Actionsheet.Content>
      </Actionsheet>
    </>
  );
};

export default AssigneeSelect;
