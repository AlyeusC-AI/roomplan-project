import React, { useState } from "react";
import {
  StyleSheet,
  TouchableOpacity,
  View,
  SafeAreaView,
  Image,
  Text,
} from "react-native";
import {
  GiftedChat,
  Composer,
  InputToolbar,
  Send,
  Bubble,
} from "react-native-gifted-chat";
import { ChevronLeft, Send as SendIcon } from "lucide-react-native";
import { router } from "expo-router";
import OpenAI from "react-native-openai";

interface Message {
  _id: number;
  text: string;
  createdAt: Date;
  user: {
    _id: number;
    name: string;
  };
}

export default function Chat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [messageStrings, setMessageStrings] = useState<string[]>([]);
  const [tempMessage, setTempMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const openAI = new OpenAI({
    apiKey: process.env.EXPO_PUBLIC_OPENAI_API_KEY!,
    organization: process.env.EXPO_PUBLIC_OPENAI_ORGANIZATION!,
  });

  const onSend = async (msgs: Message[]) => {
    setMessages((previousMessages) =>
      GiftedChat.append(previousMessages, msgs)
    );

    setMessageStrings([...messageStrings, msgs[0].text]);

    setLoading(true);

    console.log(messageStrings);

    const out = await openAI.chat.create({
      messages: [
        {
          role: "system",
          content:
            "You are here to help answer Fire, water, and mold restoration questions based off the IICRC standard or other reportable sources. Answer all questions direct and with as few words as possible. Only ask questions if needed to give a better answer.",
        },
        ...messageStrings.map<{ role: "user"; content: string }>((msg) => ({
          role: "user",
          content: msg,
        })),
        {
          role: "user",
          content: msgs[0].text,
        },
      ],
      model: "gpt-4o",
    });

    const message = {
      _id: Math.floor(Math.random() * 1000000),
      text: out.choices[0].message.content,
      createdAt: new Date(),
      user: { _id: 2, name: "Restore Geek" },
    };

    setTempMessage(null);

    setMessages((previousMessages) =>
      GiftedChat.append(previousMessages, [message])
    );

    setMessageStrings([...messageStrings, message.text]);

    setLoading(false);
  }

  openAI.chat.addListener("onChatMessageReceived", (payload) => {
    console.log(tempMessage);
    const newMessage = payload.choices[0]?.delta.content;

    setTempMessage((tempMessage ?? "") + (newMessage ?? ""));

    if (payload.choices[0]?.finishReason === "stop") {
      const message = {
        _id: Math.floor(Math.random() * 1000000),
        text: tempMessage!,
        createdAt: new Date(),
        user: { _id: 2, name: "Restore Geek" },
      };

      setTempMessage(null);

      setMessages((previousMessages) =>
        GiftedChat.append(previousMessages, [message])
      );
    }
  });

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#fff" }}>
      <View style={styles.chatHeader}>
        <TouchableOpacity onPress={() => router.back()}>
          <ChevronLeft color="#1d1d1d" size={24} />
        </TouchableOpacity>

        <TouchableOpacity onPress={() => {}} style={styles.chatHeaderProfile}>
          <Image
            alt="Avatar for Nick Miller"
            style={styles.chatHeaderAvatar}
            source={{
              uri: "https://restoregeek.app/android-chrome-512x512.png",
            }}
          />

          <View style={styles.chatHeaderBody}>
            <Text style={styles.chatHeaderTitle}>Restore Geek</Text>

            <Text style={styles.chatHeaderSubtitle}>
              <View className="size-2 bg-green-600 rounded-full" /> Active Now
            </Text>
          </View>
        </TouchableOpacity>
      </View>
      <GiftedChat
        listViewProps={{
          style: {
            backgroundColor: "#fff",
          },
        }}
        renderInputToolbar={(props) => (
          <InputToolbar {...props} containerStyle={styles.chatInputToolbar} />
        )}
        renderComposer={(props) => (
          <Composer
            {...props}
            placeholderTextColor="#B0ACB3"
            textInputStyle={styles.chatComposer}
          />
        )}
        renderSend={(props) => (
          <View style={[styles.chatActionWrapper, { right: 6 }]}>
            <Send
              {...props}
              disabled={!props.text}
              containerStyle={styles.chatSend}
            >
              <SendIcon size={16} color="#fff" />
            </Send>
          </View>
        )}
        renderBubble={(props) => (
          <Bubble
            {...props}
            wrapperStyle={{
              left: styles.chatBubble,
              right: { ...styles.chatBubble, backgroundColor: "#266EF1" },
            }}
          />
        )}
        isTyping={tempMessage !== null || loading}
        renderTime={() => null}
        renderAvatar={null}
        alwaysShowSend
        minInputToolbarHeight={60}
        minComposerHeight={44}
        messages={messages}
        onSend={(messages) => onSend(messages as Message[])}
        user={{
          _id: 1,
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  chatHeader: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderColor: "#e3e3e3",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-start",
  },
  chatHeaderProfile: {
    flexGrow: 1,
    flexShrink: 1,
    flexBasis: 0,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  chatHeaderAvatar: {
    width: 36,
    height: 36,
    borderRadius: 9999,
    marginLeft: 6,
  },
  chatHeaderBody: {
    marginLeft: 8,
    flexGrow: 1,
    flexShrink: 1,
    flexBasis: 0,
  },
  chatHeaderTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1d1d1d",
  },
  chatHeaderSubtitle: {
    fontSize: 13,
    color: "#9c9c9c",
    marginTop: 2,
  },
  chatInputToolbar: {
    borderTopWidth: 0,
  },
  chatActionWrapper: {
    zIndex: 1,
    position: "absolute",
    width: 56,
    height: 56,
    alignItems: "center",
    justifyContent: "center",
  },
  chatAction: {
    backgroundColor: "#ebe9ec",
    width: 34,
    height: 34,
    borderRadius: 9999,
    alignItems: "center",
    justifyContent: "center",
  },
  chatComposer: {
    color: "#1d1d1d",
    backgroundColor: "#fbfbfb",
    borderWidth: 1,
    borderColor: "#ebebeb",
    alignItems: "center",
    flex: 1,
    borderRadius: 9999,
    paddingTop: 14,
    paddingLeft: 48,
    marginRight: 12,
    width: "100%",
  },
  chatSend: {
    backgroundColor: "#266EF1",
    width: 34,
    height: 34,
    borderRadius: 9999,
    alignItems: "center",
    justifyContent: "center",
  },
  chatBubble: {
    paddingVertical: 4,
    paddingHorizontal: 2,
    borderRadius: 16,
  },
});
