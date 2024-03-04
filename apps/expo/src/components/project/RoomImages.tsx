import React, {
  Dispatch,
  SetStateAction,
  useMemo,
  useRef,
  useState,
} from "react";
import { InferenceMetaData } from "../../types/ProjectType";
import uuid from "react-native-uuid";
import {
  HStack,
  VStack,
  Image,
  View,
  Modal,
  Pressable,
  FlatList,
} from "native-base";
import { ScrollView } from "react-native";
import safelyGetImageUrl from "../../utils/safelyGetImageKey";
import { MaterialIcons } from "@expo/vector-icons";
import { RouterOutputs } from "@restorationx/api";

type Inferences = NonNullable<
  RouterOutputs["mobile"]["getProjectImages"]["rooms"]
>[0]["inferences"];
const RoomImages = ({
  inferences,
  roomName,
  urlMap,
}: {
  inferences: Inferences;
  roomName: string;
  urlMap: {
    [imageKey: string]: string;
  };
}) => {
  const [activeImageKey, setActiveImageKey] = useState<string | null>(null);
  const scrollRef = useRef<ScrollView>(null);
  const formattedProjectList = useMemo(() => {
    const formatted: {
      [key: string]: Inferences;
    } = {};
    let cur: Inferences = [];
    for (const inference of inferences) {
      if (!inference.imageKey) continue;
      if (cur.length === 3) {
        formatted[`${uuid.v4()}`] = cur;
        cur = [inference];
      } else {
        cur.push(inference);
      }
    }
    if (cur.length > 0) {
      formatted[`${uuid.v4()}`] = cur;
    }
    return formatted;
  }, [inferences]);

  const scrollTo = (x: number) => {
    if (scrollRef && scrollRef.current) {
      scrollRef.current.scrollTo({ x });
    }
  };

  const activeUri = safelyGetImageUrl(urlMap, activeImageKey || "");

  return (
    <VStack space="2">
      {Object.keys(formattedProjectList).map((key) => (
        <HStack key={key} w="full">
          {formattedProjectList[key].map((inference, i) =>
            safelyGetImageUrl(urlMap, inference.imageKey) ? (
              <Pressable
                key={inference.imageKey}
                onPress={() => setActiveImageKey(inference.imageKey)}
                width="1/3"
                {...(i === 0 ? { pr: 1 } : i === 1 ? { px: 1 } : { pl: 1 })}
              >
                <Image
                  source={{
                    uri: safelyGetImageUrl(urlMap, inference.imageKey),
                  }}
                  width="full"
                  height="32"
                  alt={inference.publicId}
                />
              </Pressable>
            ) : (
              <Pressable
                key={inference.imageKey}
                onPress={() => setActiveImageKey(inference.imageKey)}
                width="1/3"
                {...(i === 0 ? { pr: 1 } : i === 1 ? { px: 1 } : { pl: 1 })}
              >
                <View
                  rounded="md"
                  width="full"
                  height="32"
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                >
                  <MaterialIcons
                    name="image-not-supported"
                    size={42}
                    color="black"
                  />
                </View>
              </Pressable>
            )
          )}
        </HStack>
      ))}
      <Modal
        // display={!!activeImageKey}
        isOpen={!!activeImageKey}
        onClose={() => setActiveImageKey(null)}
        backgroundColor="rgba(0, 0, 0, 0.8)"
      >
        <Modal.Content width="full">
          <Modal.CloseButton />
          <Modal.Header>{roomName}</Modal.Header>
          <Modal.Body>
            {!!activeImageKey && (
              <>
                {activeUri ? (
                  <Image
                    source={{
                      uri: activeUri,
                    }}
                    width="full"
                    height="80"
                    alt={activeImageKey!}
                  />
                ) : (
                  <View
                    rounded="md"
                    width="full"
                    height="80"
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                  >
                    <MaterialIcons
                      name="image-not-supported"
                      size={42}
                      color="black"
                    />
                  </View>
                )}
              </>
            )}
            <View w="full">
              <FlatList
                py={4}
                horizontal
                data={inferences}
                keyExtractor={(inference) => inference.publicId}
                renderItem={({ item: inference }) => (
                  <ScrollableItem
                    key={inference.imageKey}
                    inference={inference}
                    activeImageKey={activeImageKey || null}
                    setActiveImageKey={setActiveImageKey}
                    scrollTo={scrollTo}
                    urlMap={urlMap}
                  />
                )}
              />
            </View>
          </Modal.Body>
        </Modal.Content>
      </Modal>
    </VStack>
  );
};

const ScrollableItem = ({
  inference,
  setActiveImageKey,
  activeImageKey,
  scrollTo,
  urlMap,
}: {
  inference: Inferences[0];
  activeImageKey: string | null;
  setActiveImageKey: Dispatch<SetStateAction<string | null>>;
  scrollTo: (x: number) => void;
  urlMap: {
    [imageKey: string]: string;
  };
}) => {
  const imageUri = safelyGetImageUrl(urlMap, inference.imageKey);
  return (
    <Pressable
      key={inference.imageKey}
      onPress={() => setActiveImageKey(inference.imageKey)}
      width="24"
      pr={2}
      onLayout={(e) => {
        let obj = e.nativeEvent.layout;
        if (activeImageKey === inference.imageKey) {
          scrollTo(obj.x);
        }
      }}
    >
      <View>
        {imageUri ? (
          <Image
            source={{
              uri: imageUri,
            }}
            width="full"
            height="32"
            alt={inference.publicId}
            rounded="md"
            {...(activeImageKey === inference.imageKey
              ? {
                  borderWidth: 6,
                  borderColor: "primary.500",
                }
              : {})}
          />
        ) : (
          <View
            rounded="md"
            width="full"
            height="32"
            display="flex"
            alignItems="center"
            justifyContent="center"
            {...(activeImageKey === inference.imageKey
              ? {
                  borderWidth: 6,
                  borderColor: "primary.500",
                }
              : {})}
          >
            <MaterialIcons name="image-not-supported" size={42} color="black" />
          </View>
        )}
      </View>
    </Pressable>
  );
};

export default RoomImages;
