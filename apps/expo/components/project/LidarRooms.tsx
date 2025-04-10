import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, ScrollView, Image, Alert } from 'react-native';
import { userStore } from "@/lib/state/user";
import { Button } from '@/components/ui/button';
import { roomsStore } from '@/lib/state/rooms';
import { useGlobalSearchParams, usePathname, useRouter } from 'expo-router';
import { WebView } from "react-native-webview";
import { Ionicons } from '@expo/vector-icons';
import { api } from '@/lib/api';

export const RoomPlanImage = ({ src, onPngReady = null }:
{ src: string, onPngReady?: ((data: string) => void) | null }) => {
  if (src.startsWith("http")) {
    return (
      <Image source={{ uri: src }} style={{ width: "100%", height: "100%" }} />
    )
  }

  const re = /<svg viewBox="[\d\.\-]*\s[\d\.\-]*\s([\d\.\-]*)\s([\d\.\-]*)">/
  let [_, w, h] = src.match(re) || []
  w = Math.floor(parseFloat(w) * 1.5)
  h = Math.floor(parseFloat(h) * 1.5)

  const htmlContent = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
            body {
              margin: 0; display: flex; justify-content: center; align-items: center; height: 100vh;
            }
            svg, img { width: 100%; height: 100%; }
        </style>
    </head>
    <body>${src}</body>
    </html>
  `;

  const script = `
    function svgToPngBase64(width, height, callback) {
      var svg = document.querySelector('svg');
      var xml = new XMLSerializer().serializeToString(svg);
      xml = xml.replace("ft²", "ft");
      var svg64 = btoa(xml);
      var b64Start = 'data:image/svg+xml;base64,';
      var url = b64Start + svg64;

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      const img = document.createElement('img');
      img.width = width;
      img.height = height;
      img.onload = function () {
        ctx.beginPath();
        ctx.fillStyle = "#fff";
        ctx.fillRect(0, 0, width, height);

        ctx.drawImage(img, 0, 0, width, height);

        const pngBase64 = canvas.toDataURL('image/png');
        callback(pngBase64);
      };
      img.onerror=alert;
      img.src = url;
    }

    svgToPngBase64(${w}, ${h}, (pngBase64) => {
      window.ReactNativeWebView.postMessage(pngBase64);
    });
  `

  return (
    <WebView
      className="h-full w-full"
      source={{ html: htmlContent }}
      javaScriptEnabled={!!onPngReady}
      injectedJavaScript={onPngReady ? script : ''}
      onMessage={(ev => {
        onPngReady && onPngReady(ev.nativeEvent.data)
      })}
    />
  )
}

const PLACEHOLDER_SVG = `
<svg width="99" height="99" viewBox="0 0 99 99" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M16.9773 45.2727V54H15.9545L11.1989 47.1477H11.1136V54H10.0568V45.2727H11.0795L15.8523 52.142H15.9375V45.2727H16.9773ZM21.6147 54.1364C21.0238 54.1364 20.5053 53.9957 20.0593 53.7145C19.6161 53.4332 19.2695 53.0398 19.0195 52.5341C18.7724 52.0284 18.6488 51.4375 18.6488 50.7614C18.6488 50.0795 18.7724 49.4844 19.0195 48.9759C19.2695 48.4673 19.6161 48.0724 20.0593 47.7912C20.5053 47.5099 21.0238 47.3693 21.6147 47.3693C22.2056 47.3693 22.7227 47.5099 23.1658 47.7912C23.6119 48.0724 23.9585 48.4673 24.2056 48.9759C24.4556 49.4844 24.5806 50.0795 24.5806 50.7614C24.5806 51.4375 24.4556 52.0284 24.2056 52.5341C23.9585 53.0398 23.6119 53.4332 23.1658 53.7145C22.7227 53.9957 22.2056 54.1364 21.6147 54.1364ZM21.6147 53.233C22.0636 53.233 22.4329 53.1179 22.7227 52.8878C23.0124 52.6577 23.2269 52.3551 23.3661 51.9801C23.5053 51.6051 23.5749 51.1989 23.5749 50.7614C23.5749 50.3239 23.5053 49.9162 23.3661 49.5384C23.2269 49.1605 23.0124 48.8551 22.7227 48.6222C22.4329 48.3892 22.0636 48.2727 21.6147 48.2727C21.1658 48.2727 20.7965 48.3892 20.5067 48.6222C20.217 48.8551 20.0025 49.1605 19.8633 49.5384C19.7241 49.9162 19.6545 50.3239 19.6545 50.7614C19.6545 51.1989 19.7241 51.6051 19.8633 51.9801C20.0025 52.3551 20.217 52.6577 20.5067 52.8878C20.7965 53.1179 21.1658 53.233 21.6147 53.233ZM29.6271 54V45.2727H32.576C33.2578 45.2727 33.8175 45.3892 34.255 45.6222C34.6925 45.8523 35.0163 46.169 35.2266 46.5724C35.4368 46.9759 35.5419 47.4347 35.5419 47.9489C35.5419 48.4631 35.4368 48.919 35.2266 49.3168C35.0163 49.7145 34.6939 50.027 34.2592 50.2543C33.8246 50.4787 33.2692 50.5909 32.593 50.5909H30.2067V49.6364H32.5589C33.0249 49.6364 33.3999 49.5682 33.6839 49.4318C33.9709 49.2955 34.1783 49.1023 34.3061 48.8523C34.4368 48.5994 34.5021 48.2983 34.5021 47.9489C34.5021 47.5994 34.4368 47.294 34.3061 47.0327C34.1754 46.7713 33.9666 46.5696 33.6797 46.4276C33.3928 46.2827 33.0135 46.2102 32.5419 46.2102H30.6839V54H29.6271ZM33.7351 50.0795L35.8828 54H34.6555L32.5419 50.0795H33.7351ZM39.7553 54.1364C39.1644 54.1364 38.646 53.9957 38.1999 53.7145C37.7567 53.4332 37.4102 53.0398 37.1602 52.5341C36.913 52.0284 36.7894 51.4375 36.7894 50.7614C36.7894 50.0795 36.913 49.4844 37.1602 48.9759C37.4102 48.4673 37.7567 48.0724 38.1999 47.7912C38.646 47.5099 39.1644 47.3693 39.7553 47.3693C40.3462 47.3693 40.8633 47.5099 41.3065 47.7912C41.7525 48.0724 42.0991 48.4673 42.3462 48.9759C42.5962 49.4844 42.7212 50.0795 42.7212 50.7614C42.7212 51.4375 42.5962 52.0284 42.3462 52.5341C42.0991 53.0398 41.7525 53.4332 41.3065 53.7145C40.8633 53.9957 40.3462 54.1364 39.7553 54.1364ZM39.7553 53.233C40.2042 53.233 40.5735 53.1179 40.8633 52.8878C41.1531 52.6577 41.3675 52.3551 41.5067 51.9801C41.646 51.6051 41.7156 51.1989 41.7156 50.7614C41.7156 50.3239 41.646 49.9162 41.5067 49.5384C41.3675 49.1605 41.1531 48.8551 40.8633 48.6222C40.5735 48.3892 40.2042 48.2727 39.7553 48.2727C39.3065 48.2727 38.9371 48.3892 38.6474 48.6222C38.3576 48.8551 38.1431 49.1605 38.0039 49.5384C37.8647 49.9162 37.7951 50.3239 37.7951 50.7614C37.7951 51.1989 37.8647 51.6051 38.0039 51.9801C38.1431 52.3551 38.3576 52.6577 38.6474 52.8878C38.9371 53.1179 39.3065 53.233 39.7553 53.233ZM46.9155 54.1364C46.3246 54.1364 45.8061 53.9957 45.3601 53.7145C44.9169 53.4332 44.5703 53.0398 44.3203 52.5341C44.0732 52.0284 43.9496 51.4375 43.9496 50.7614C43.9496 50.0795 44.0732 49.4844 44.3203 48.9759C44.5703 48.4673 44.9169 48.0724 45.3601 47.7912C45.8061 47.5099 46.3246 47.3693 46.9155 47.3693C47.5064 47.3693 48.0234 47.5099 48.4666 47.7912C48.9126 48.0724 49.2592 48.4673 49.5064 48.9759C49.7564 49.4844 49.8814 50.0795 49.8814 50.7614C49.8814 51.4375 49.7564 52.0284 49.5064 52.5341C49.2592 53.0398 48.9126 53.4332 48.4666 53.7145C48.0234 53.9957 47.5064 54.1364 46.9155 54.1364ZM46.9155 53.233C47.3643 53.233 47.7337 53.1179 48.0234 52.8878C48.3132 52.6577 48.5277 52.3551 48.6669 51.9801C48.8061 51.6051 48.8757 51.1989 48.8757 50.7614C48.8757 50.3239 48.8061 49.9162 48.6669 49.5384C48.5277 49.1605 48.3132 48.8551 48.0234 48.6222C47.7337 48.3892 47.3643 48.2727 46.9155 48.2727C46.4666 48.2727 46.0973 48.3892 45.8075 48.6222C45.5178 48.8551 45.3033 49.1605 45.1641 49.5384C45.0249 49.9162 44.9553 50.3239 44.9553 50.7614C44.9553 51.1989 45.0249 51.6051 45.1641 51.9801C45.3033 52.3551 45.5178 52.6577 45.8075 52.8878C46.0973 53.1179 46.4666 53.233 46.9155 53.233ZM51.4165 54V47.4545H52.3881V48.4773H52.4734C52.6097 48.1278 52.8299 47.8565 53.1339 47.6634C53.4379 47.4673 53.8029 47.3693 54.229 47.3693C54.6609 47.3693 55.0202 47.4673 55.3072 47.6634C55.5969 47.8565 55.8228 48.1278 55.9847 48.4773H56.0529C56.2205 48.1392 56.4719 47.8707 56.8072 47.6719C57.1424 47.4702 57.5444 47.3693 58.0131 47.3693C58.5984 47.3693 59.0771 47.5526 59.4492 47.919C59.8214 48.2827 60.0075 48.8494 60.0075 49.6193V54H59.0018V49.6193C59.0018 49.1364 58.8697 48.7912 58.6055 48.5838C58.3413 48.3764 58.0302 48.2727 57.6722 48.2727C57.212 48.2727 56.8555 48.4119 56.6026 48.6903C56.3498 48.9659 56.2234 49.3153 56.2234 49.7386V54H55.2006V49.517C55.2006 49.1449 55.0799 48.8452 54.8384 48.6179C54.5969 48.3878 54.2859 48.2727 53.9052 48.2727C53.6438 48.2727 53.3995 48.3423 53.1722 48.4815C52.9478 48.6207 52.766 48.8139 52.6268 49.0611C52.4904 49.3054 52.4222 49.5881 52.4222 49.9091V54H51.4165ZM65.3576 54V45.2727H68.3065C68.9911 45.2727 69.5508 45.3963 69.9854 45.6435C70.4229 45.8878 70.7468 46.2188 70.957 46.6364C71.1673 47.054 71.2724 47.5199 71.2724 48.0341C71.2724 48.5483 71.1673 49.0156 70.957 49.4361C70.7496 49.8565 70.4286 50.1918 69.994 50.4418C69.5593 50.6889 69.0025 50.8125 68.3235 50.8125H66.2099V49.875H68.2894C68.7582 49.875 69.1346 49.794 69.4187 49.6321C69.7028 49.4702 69.9087 49.2514 70.0366 48.9759C70.1673 48.6974 70.2326 48.3835 70.2326 48.0341C70.2326 47.6847 70.1673 47.3722 70.0366 47.0966C69.9087 46.821 69.7013 46.6051 69.4144 46.4489C69.1275 46.2898 68.7468 46.2102 68.2724 46.2102H66.4144V54H65.3576ZM73.8441 45.2727V54H72.8384V45.2727H73.8441ZM77.6122 54.1534C77.1974 54.1534 76.821 54.0753 76.483 53.919C76.1449 53.7599 75.8764 53.5312 75.6776 53.233C75.4787 52.9318 75.3793 52.5682 75.3793 52.142C75.3793 51.767 75.4531 51.4631 75.6009 51.2301C75.7486 50.9943 75.946 50.8097 76.1932 50.6761C76.4403 50.5426 76.7131 50.4432 77.0114 50.3778C77.3125 50.3097 77.6151 50.2557 77.919 50.2159C78.3168 50.1648 78.6392 50.1264 78.8864 50.1009C79.1364 50.0724 79.3182 50.0256 79.4318 49.9602C79.5483 49.8949 79.6065 49.7812 79.6065 49.6193V49.5852C79.6065 49.1648 79.4915 48.8381 79.2614 48.6051C79.0341 48.3722 78.6889 48.2557 78.2259 48.2557C77.7457 48.2557 77.3693 48.3608 77.0966 48.571C76.8239 48.7812 76.6321 49.0057 76.5213 49.2443L75.5668 48.9034C75.7372 48.5057 75.9645 48.196 76.2486 47.9744C76.5355 47.75 76.848 47.5937 77.1861 47.5057C77.527 47.4148 77.8622 47.3693 78.1918 47.3693C78.402 47.3693 78.6435 47.3949 78.9162 47.446C79.1918 47.4943 79.4574 47.5952 79.7131 47.7486C79.9716 47.902 80.1861 48.1335 80.3565 48.4432C80.527 48.7528 80.6122 49.1676 80.6122 49.6875V54H79.6065V53.1136H79.5554C79.4872 53.2557 79.3736 53.4077 79.2145 53.5696C79.0554 53.7315 78.8438 53.8693 78.5795 53.983C78.3153 54.0966 77.9929 54.1534 77.6122 54.1534ZM77.7656 53.25C78.1634 53.25 78.4986 53.1719 78.7713 53.0156C79.0469 52.8594 79.2543 52.6577 79.3935 52.4105C79.5355 52.1634 79.6065 51.9034 79.6065 51.6307V50.7102C79.5639 50.7614 79.4702 50.8082 79.3253 50.8509C79.1832 50.8906 79.0185 50.9261 78.831 50.9574C78.6463 50.9858 78.4659 51.0114 78.2898 51.0341C78.1165 51.054 77.9759 51.071 77.8679 51.0852C77.6065 51.1193 77.3622 51.1747 77.1349 51.2514C76.9105 51.3253 76.7287 51.4375 76.5895 51.5881C76.4531 51.7358 76.3849 51.9375 76.3849 52.1932C76.3849 52.5426 76.5142 52.8068 76.7727 52.9858C77.0341 53.1619 77.3651 53.25 77.7656 53.25ZM83.4535 50.0625V54H82.4478V47.4545H83.4194V48.4773H83.5046C83.658 48.1449 83.891 47.8778 84.2035 47.6761C84.516 47.4716 84.9194 47.3693 85.4137 47.3693C85.8569 47.3693 86.2447 47.4602 86.5771 47.642C86.9094 47.821 87.168 48.0938 87.3526 48.4602C87.5373 48.8239 87.6296 49.2841 87.6296 49.8409V54H86.6239V49.9091C86.6239 49.3949 86.4904 48.9943 86.2234 48.7074C85.9563 48.4176 85.5898 48.2727 85.1239 48.2727C84.8029 48.2727 84.516 48.3423 84.2631 48.4815C84.0131 48.6207 83.8157 48.8239 83.6708 49.0909C83.5259 49.358 83.4535 49.6818 83.4535 50.0625Z" fill="black"/>
</svg>
`;

export function LidarRooms() {
  const { projectId } = useGlobalSearchParams<{
    projectId: string;
  }>();
  const { session: supabaseSession } = userStore((state) => state);
  const rooms = roomsStore();
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [sendingEmail, setSendingEmail] = useState<boolean>(false);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    async function fetchRooms() {
      try {
        setLoading(true);

        const roomsRes = await fetch(
          `${process.env.EXPO_PUBLIC_BASE_URL}/api/v1/projects/${projectId}/room`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              "auth-token": supabaseSession?.access_token || "",
            },
          }
        );

        const roomsData = await roomsRes.json();
        console.log("🚀 ~ refreshData ~ roomsData:", roomsData);
        rooms.setRooms(roomsData.rooms);
      } catch (err) {
        setError('Failed to fetch rooms');
      } finally {
        setLoading(false);
      }
    }

    if (pathname === `/projects/${projectId}/lidar/rooms`) {
      fetchRooms();
    }
  }, [projectId, pathname]);

  const handleAddRoom = () => {
    router.push({
      pathname: `/projects/${projectId}/lidar/scan`,
      params: {
        roomId: undefined,
        roomPlanSVG: undefined,
      },
    });
  };

  const handleRoomPress = (roomId: number, roomPlanSVG: string) => {
    router.push({
      pathname: `/projects/${projectId}/lidar/scan`,
      params: { roomId, roomPlanSVG },
    });
  };

  const handleSendEmail = async (roomId: number, roomPlanSVG: string) => {
    try {
      setSendingEmail(true);
      
      const response = await api.post(
        `/api/v1/projects/${projectId}/lidar/email`,
        {
          roomId,
          roomPlanSVG,
        }
      );

      if (response.status !== 200) {
        throw new Error(response.data.error || 'Failed to send email');
      }

      Alert.alert(
        'ESX Version Requested',
        'Your room plan has been sent to ESX for professional analysis. You will receive a detailed report within 24 hours.',
        [{ text: 'OK' }]
      );
    } catch (err) {
      Alert.alert(
        'Error',
        'Failed to request ESX version. Please try again later.',
        [{ text: 'OK' }]
      );
    } finally {
      setSendingEmail(false);
    }
  };

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center">
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (error) {
    return (
      <View className="flex-1 items-center justify-center p-4">
        <Text className="text-destructive text-center">{error}</Text>
        <Button variant="outline" className="mt-4" onPress={() => setLoading(true)}>
          Retry
        </Button>
      </View>
    );
  }

  return (
    <ScrollView className="flex-1">
      <View className="flex-row flex-wrap p-4">
        {/* Add New Room Card */}
        <View className="w-1/2 p-2 h-44">
          <TouchableOpacity onPress={handleAddRoom}>
            <View className="h-full flex items-center justify-center border-dashed border-2 border-muted-foreground/50 rounded-lg">
              <View className="flex items-center justify-center">
                <Text className="text-5xl text-muted-foreground">+</Text>
                <Text className="text-muted-foreground mt-2">New Room</Text>
              </View>
            </View>
          </TouchableOpacity>
        </View>

        {/* Room Cards */}
        {rooms.rooms?.map((room) => (
          <View key={room.id} className="w-1/2 p-2 h-44">
            <View className="h-full border border-muted-foreground/40 rounded-lg">
              <TouchableOpacity onPress={() => handleRoomPress(room.id, room.roomPlanSVG)}>
                <View className="h-32 overflow-hidden">
                  <RoomPlanImage src={room.roomPlanSVG || PLACEHOLDER_SVG} />
                </View>
              </TouchableOpacity>
              <View className="h-8 justify-center pl-2 bg-muted-foreground/10">
                <Text className="font-semibold" numberOfLines={1}>{room.name}</Text>
              </View>
              {room.roomPlanSVG && (
                <View className="absolute top-2 right-2 flex-row items-center">
                  <TouchableOpacity
                    onPress={() => handleSendEmail(room.id, room.roomPlanSVG)}
                    disabled={sendingEmail}
                    className="bg-primary/90 px-3 py-1 rounded-full flex-row items-center"
                  >
                    <Ionicons name="analytics" size={14} color="white" />
                    <Text className="text-white text-xs ml-1 font-medium">
                      {sendingEmail ? 'Sending...' : 'Get ESX Version'}
                    </Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

export default LidarRooms;
