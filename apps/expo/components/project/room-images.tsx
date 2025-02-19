// import React, {
//   Dispatch,
//   SetStateAction,
//   useMemo,
//   useRef,
//   useState,
// } from "react";
// import uuid from "react-native-uuid";eact-native";
// import safelyGetImageUrl from "../../utils/safelyGetImageKey";
// import { ImageOff } from "lucide-react-native";

// type Inferences = NonNullable<
//   RouterOutputs["mobile"]["getProjectImages"]["rooms"]
// >[0]["inferences"];
// const RoomImages = ({
//   inferences,
//   roomName,
//   urlMap,
// }: {
//   inferences: Inferences;
//   roomName: string;
//   urlMap: {
//     [imageKey: string]: string;
//   };
// }) => {
//   const [activeImageKey, setActiveImageKey] = useState<string | null>(null);
//   const scrollRef = useRef<ScrollView>(null);
//   const formattedProjectList = useMemo(() => {
//     const formatted: {
//       [key: string]: Inferences;
//     } = {};
//     let cur: Inferences = [];
//     for (const inference of inferences) {
//       if (!inference.imageKey) continue;
//       if (cur.length === 3) {
//         formatted[`${uuid.v4()}`] = cur;
//         cur = [inference];
//       } else {
//         cur.push(inference);
//       }
//     }
//     if (cur.length > 0) {
//       formatted[`${uuid.v4()}`] = cur;
//     }
//     return formatted;
//   }, [inferences]);

//   const scrollTo = (x: number) => {
//     if (scrollRef && scrollRef.current) {
//       scrollRef.current.scrollTo({ x });
//     }
//   };

//   const activeUri = safelyGetImageUrl(urlMap, activeImageKey || "");

//   return (
//     <VStack space="2">
//       {Object.keys(formattedProjectList).map((key) => (
//         <HStack key={key} w="full">
//           {formattedProjectList[key].map((inference, i) =>
//             safelyGetImageUrl(urlMap, inference.imageKey) ? (
//               <Pressable
//                 key={inference.imageKey}
//                 onPress={() => setActiveImageKey(inference.imageKey)}
//                 width="1/3"
//                 {...(i === 0 ? { pr: 1 } : i === 1 ? { px: 1 } : { pl: 1 })}
//               >
//                 <Image
//                   source={{
//                     uri: safelyGetImageUrl(urlMap, inference.imageKey),
//                   }}
//                   width="full"
//                   height="32"
//                   alt={inference.publicId}
//                 />
//               </Pressable>
//             ) : (
//               <Pressable
//                 key={inference.imageKey}
//                 onPress={() => setActiveImageKey(inference.imageKey)}
//                 width="1/3"
//                 {...(i === 0 ? { pr: 1 } : i === 1 ? { px: 1 } : { pl: 1 })}
//               >
//                 <View
//                   rounded="md"
//                   width="full"
//                   height="32"
//                   display="flex"
//                   alignItems="center"
//                   justifyContent="center"
//                 >
//                   <ImageOff
//                     size={42}
//                     color="black"
//                   />
//                 </View>
//               </Pressable>
//             )
//           )}
//         </HStack>
//       ))}
//       <Modal
//         // display={!!activeImageKey}
//         isOpen={!!activeImageKey}
//         onClose={() => setActiveImageKey(null)}
//         backgroundColor="rgba(0, 0, 0, 0.8)"
//       >
//         <Modal.Content width="full">
//           <Modal.CloseButton />
//           <Modal.Header>{roomName}</Modal.Header>
//           <Modal.Body>
//             {!!activeImageKey && (
//               <>
//                 {activeUri ? (
//                   <Image
//                     source={{
//                       uri: activeUri,
//                     }}
//                     width="full"
//                     height="80"
//                     alt={activeImageKey!}
//                   />
//                 ) : (
//                   <View
//                     rounded="md"
//                     width="full"
//                     height="80"
//                     display="flex"
//                     alignItems="center"
//                     justifyContent="center"
//                   >
//                     <ImageOff
//                       size={42}
//                       color="black"
//                     />
//                   </View>
//                 )}
//               </>
//             )}
//             <View w="full">
//               <FlatList
//                 py={4}
//                 horizontal
//                 data={inferences}
//                 keyExtractor={(inference) => inference.publicId}
//                 renderItem={({ item: inference }) => (
//                   <ScrollableItem
//                     key={inference.imageKey}
//                     inference={inference}
//                     activeImageKey={activeImageKey || null}
//                     setActiveImageKey={setActiveImageKey}
//                     scrollTo={scrollTo}
//                     urlMap={urlMap}
//                   />
//                 )}
//               />
//             </View>
//           </Modal.Body>
//         </Modal.Content>
//       </Modal>
//     </VStack>
//   );
// };

// const ScrollableItem = ({
//   inference,
//   setActiveImageKey,
//   activeImageKey,
//   scrollTo,
//   urlMap,
// }: {
//   inference: Inferences[0];
//   activeImageKey: string | null;
//   setActiveImageKey: Dispatch<SetStateAction<string | null>>;
//   scrollTo: (x: number) => void;
//   urlMap: {
//     [imageKey: string]: string;
//   };
// }) => {
//   const imageUri = safelyGetImageUrl(urlMap, inference.imageKey);
//   return (
//     <Pressable
//       key={inference.imageKey}
//       onPress={() => setActiveImageKey(inference.imageKey)}
//       width="24"
//       pr={2}
//       onLayout={(e) => {
//         let obj = e.nativeEvent.layout;
//         if (activeImageKey === inference.imageKey) {
//           scrollTo(obj.x);
//         }
//       }}
//     >
//       <View>
//         {imageUri ? (
//           <Image
//             source={{
//               uri: imageUri,
//             }}
//             width="full"
//             height="32"
//             alt={inference.publicId}
//             rounded="md"
//             {...(activeImageKey === inference.imageKey
//               ? {
//                   borderWidth: 6,
//                   borderColor: "primary.500",
//                 }
//               : {})}
//           />
//         ) : (
//           <View
//             rounded="md"
//             width="full"
//             height="32"
//             display="flex"
//             alignItems="center"
//             justifyContent="center"
//             {...(activeImageKey === inference.imageKey
//               ? {
//                   borderWidth: 6,
//                   borderColor: "primary.500",
//                 }
//               : {})}
//           >
//             <ImageOff size={42} color="black" />
//           </View>
//         )}
//       </View>
//     </Pressable>
//   );
// };

// export default RoomImages;
import safelyGetImageUrl from '@/utils/safelyGetImageKey';
import React from 'react';
import {
  StyleSheet,
  SafeAreaView,
  View,
  ScrollView,
  TouchableOpacity,
  Image,
} from 'react-native';

export default function RoomImageGallery({
    inferences,
    urlMap,
  }: {
    inferences: Inference[];
    urlMap: {
      [imageKey: string]: string;
    };
  }) {
  const itemsPerRow = 3;
  const rows = Array.from({ length: Math.ceil(inferences.length / 3) }).map(
    (_, rowIndex) => {
      // each row should have 3 items
      const row = Array.from({ length: itemsPerRow }).map((_, index) => {
        const itemIndex = rowIndex * itemsPerRow + index;
        return inferences[itemIndex] || undefined;
      });
      return row;
    },
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
      <View style={styles.container}>
        <ScrollView contentContainerStyle={styles.gallery}>
          {rows.map((row, i) => (
            <View key={i} style={styles.galleryRow}>
              {row.map((item, j) => {
                if (!item) {
                  return <View style={styles.galleryItem} />;
                }
                return (
                  <TouchableOpacity
                    key={j}
                    style={styles.galleryItem}>
                    <Image
                      resizeMode="cover"
                      source={{ uri: safelyGetImageUrl(urlMap, item.imageKey) }}
                      style={styles.galleryImage} />
                  </TouchableOpacity>
                );
              })}
            </View>
          ))}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingBottom: 24,
    flexGrow: 1,
    flexShrink: 1,
    flexBasis: 0,
  },
  /** Gallery */
  gallery: {
    flexGrow: 1,
    flexShrink: 1,
    flexBasis: 0,
    flexDirection: 'column',
    alignItems: 'flex-start',
    justifyContent: 'flex-start',
  },
  galleryHeader: {
    width: '100%',
    backgroundColor: '#f4f4f4',
    padding: 16,
    borderBottomWidth: 1,
    borderColor: '#e3e3e3',
  },
  galleryHeaderText: {
    fontSize: 14,
    fontWeight: '500',
    lineHeight: 17,
    color: '#1d1d1d',
  },
  galleryHeaderAction: {
    paddingLeft: 4,
    fontWeight: '600',
    color: '#266EF1',
  },
  galleryRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    margin: -2,
    marginBottom: 2,
  },
  galleryItem: {
    flexGrow: 1,
    flexShrink: 1,
    flexBasis: 0,
    padding: 2,
    height: 160,
  },
  galleryImage: {
    width: '100%',
    height: '100%',
  },
});