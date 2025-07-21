import React, { useState, useEffect } from "react";
import { TouchableOpacity, Image, View, StyleSheet, Text } from "react-native";
import { router } from "expo-router";
import { Separator } from "@/components/ui/separator";
import { Project, useGetProjectStatus } from "@service-geek/api-client";
import DamageBadge from "./damageBadge";
import StatusBadge from "./statusBadge";

const getStatusColor = (status: string | null): string => {
  switch (status) {
    case "active":
      return "green";
    case "inactive":
      return "gray";
    case "incomplete":
      return "red";
    case "completed":
      return "darkBlue";
    case "inspection":
      return "cyan";
    case "mitigation":
      return "purple";
    case "review":
      return "orange";
    default:
      return "gray";
  }
};

export default function ProjectCell({ project }: { project: Project }) {
  const formatProjectName = (name: string): string => {
    return name.split(" ").join("+");
  };
  const { data: status } = useGetProjectStatus(project.statusId);
  const [imageUrl, setImageUrl] = useState(project.mainImage);

  return (
    <TouchableOpacity
      className="mt-3"
      onPress={() =>
        router.push({
          pathname: `/projects/${project.id}`,
          params: {
            projectName: project.name,
          },
        })
      }
    >
      <View style={styles.card}>
        <View style={[styles.cardImgContainer, styles.shadow]}>
          {imageUrl ? (
            <Image
              source={{
                uri: imageUrl,
              }}
              alt="Image"
              resizeMode="cover"
              onError={() =>
                setImageUrl(
                  `https://eu.ui-avatars.com/api/?name=${formatProjectName(project.name)}&size=250`
                )
              }
              style={styles.cardImg}
            />
          ) : (
            <Image
              source={{
                uri: `https://eu.ui-avatars.com/api/?name=${formatProjectName(project.name)}&size=250`,
              }}
              alt="Image"
              resizeMode="cover"
              style={styles.cardImg}
            />
          )}
        </View>

        <View style={styles.cardBody}>
          {status?.data?.label && (
            // <View
            //   className="mb-1 px-2 py-0.5 rounded-full"
            //   style={{
            //     backgroundColor: status?.data.color?.toLowerCase() === 'slate' ? 'slategray' : status?.data.color?.toLowerCase() || "green",
            //     // borderWidth: 1,
            //   }}
            // >
            //   <Text className="text-xs font-semibold text-white"
            //   style={{
            //     color: status?.data.color?.toLowerCase() === 'cyan' ? 'black' : "white"

            //   }}>
            //     {status?.data.label}
            //   </Text>
            // </View>
            <StatusBadge status={status?.data} />
          )}
          <Text
            style={[styles.cardTitle, { marginTop: 4 }]}
          >{`${project.name}`}</Text>
          <Text style={styles.cardSubTitle}>{project.location}</Text>
          {/* <Text style={[styles.cardTag, { color: status?.data.color }]}>
            {status?.data.label}
          </Text> */}
          <View className="flex-row items-center gap-2">
            {project?.lossType && (
              // <View className="flex-row items-center bg-blue-700 rounded px-2 py-0.5">
              //   <Text className="text-xs text-white capitalize">
              //     {project.lossType.replace(/_/g, " ")}
              //   </Text>
              // </View>
              <DamageBadge lossType={project.lossType} />
            )}
          </View>

          {/* <View style={styles.cardRow}>
            <View style={styles.cardRowItem}>
              <Image
                alt=""
                source={{ uri: imageUrl }}
                style={styles.cardRowItemImg}
                onError={() =>
                  setImageUrl(
                    `https://eu.ui-avatars.com/api/?name=${project.projectAssignees[0].user.firstName}+${project.projectAssignees[0].user.lastName}&size=250`
                  )
                }
              />

              <Text
                style={styles.cardRowItemText}
              >{`${project.projectAssignees[0].user.firstName} ${project.projectAssignees[0].user.lastName}`}</Text>
            </View>

            <Text style={styles.cardRowDivider}>·</Text>

            <View style={styles.cardRowItem}>
              <Text style={styles.cardRowItemText}>
                {formatDate(project.createdAt)}
              </Text>
            </View>
          </View> */}
        </View>
      </View>

      <Separator />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingTop: 8,
    paddingHorizontal: 16,
  },
  /** Header */
  header: {
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  headerTop: {
    marginHorizontal: -6,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  headerAction: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: "700",
    color: "#1d1d1d",
  },
  /** Card */
  card: {
    flexDirection: "row",
    alignItems: "stretch",
    borderRadius: 12,
    marginBottom: 8,
  },
  cardImg: {
    width: 100,
    height: 100,
    borderRadius: 12,
  },
  cardImgContainer: {
    borderRadius: 12,
    marginRight: 0,
    backgroundColor: "#fff", // Optional: helps shadow visibility
    borderWidth: 1,
    borderColor: "#fff",
  },
  shadow: {
    shadowColor: "#000", // Ensure shadow is black
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4, // Android, reduced for subtle effect
  },
  cardBody: {
    flexGrow: 1,
    flexShrink: 1,
    flexBasis: 0,
    flexDirection: "column",
    justifyContent: "flex-start",
    alignItems: "flex-start",
    paddingHorizontal: 16,
  },
  cardTag: {
    fontWeight: "500",
    fontSize: 12,
    color: "#939393",
    marginBottom: 7,
    textTransform: "capitalize",
  },
  cardTitle: {
    fontWeight: "700",
    fontSize: 20,
    lineHeight: 24,
    color: "#1d1d1d",
    marginBottom: 2,
    textTransform: "capitalize",
  },
  cardSubTitle: {
    fontWeight: "400",
    fontSize: 13,
    lineHeight: 19,
    color: "#686565",
    marginBottom: 8,
  },
  cardRow: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: -8,
    marginBottom: "auto",
  },
  cardRowItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 6,
    borderRightWidth: 1,
    borderColor: "transparent",
  },
  cardRowItemImg: {
    width: 22,
    height: 22,
    borderRadius: 9999,
    marginRight: 6,
  },
  cardRowItemText: {
    fontWeight: "400",
    fontSize: 13,
    color: "#939393",
  },
  cardRowDivider: {
    fontSize: 17,
    fontWeight: "bold",
    color: "#939393",
  },
});

// <View m={1}>
//   <Box
//     alignItems="center"
//     w="full"
//     rounded={4}
//     {...(Platform.OS === "ios" && { shadow: 4 })}
//   >
//     <Pressable
//       onPress={() => onPress(project.publicId, project.clientName)}
//       borderLeftWidth={4}
//       borderLeftColor={getBorderColor(project.status)}
//       overflow="hidden"
//       rounded={4}
//       shadow="4"
//       {...(Platform.OS === "android" && { shadow: 4 })}
//       w="full"
//       bg="white"
//       p="5"
//     >
//       <Box>
//         <HStack alignItems="flex-start">
//           <Text
//             color="coolGray.800"
//             fontWeight="medium"
//             fontSize="xl"
//             flexWrap="wrap"
//             overflow="hidden"
//             maxWidth="1/2"
//           >
//             {project.clientName}
//           </Text>
//           <Spacer />
//           <HStack justifyContent="center" alignItems="center">
//             <View
//               rounded="full"
//               w={3}
//               h={3}
//               opacity={50}
//               bg={getBorderColor(project.status)}
//               mr={2}
//             />
//             <Text
//               fontSize={12}
//               textTransform="uppercase"
//               color={getBorderColor(project.status)}
//             >
//               {project.status}
//             </Text>
//           </HStack>
//         </HStack>
//         <HStack alignItems="center">
//           <Text fontSize={14} color="coolGray.600">
//             Created:{" "}
//             {formatDistance(new Date(project.createdAt), Date.now(), {
//               addSuffix: true,
//             })}
//           </Text>
//         </HStack>
//         <HStack justifyContent="space-between" mt="4">
//           <HStack color="coolGray.700" maxW="1/2">
//             <Map width={24} height={24} stroke={Colors.light.primary} />
//             <View marginLeft={2}>
//               <Address address={project.location} />
//             </View>
//           </HStack>
//           {project.images &&
//             project.images.length > 0 &&
//             safelyGetImageUrl(urlMap, project.images[0].key) && (
//               <View shadow="3">
//                 <Image
//                   source={{
//                     uri: safelyGetImageUrl(urlMap, project.images[0].key),
//                   }}
//                   width="24"
//                   height="24"
//                   alt="Image"
//                   rounded="md"
//                 />
//               </View>
//             )}
//         </HStack>
//       </Box>
//     </Pressable>
//   </Box>
// </View>
