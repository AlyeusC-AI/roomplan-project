import { MaterialIcons } from '@expo/vector-icons';
import { Input } from 'native-base';
import React, { useEffect, useRef } from 'react';
import { TouchableOpacity, View, Text, SafeAreaView, Dimensions } from 'react-native';
import RBSheet from 'react-native-raw-bottom-sheet';

export interface RBSheetRef {
  /**
   * The method to open bottom sheet.
   */
  open: () => void;

  /**
   * The method to close bottom sheet.
   */
  close: () => void;
}

export const LidarRoomTypeSelect = ({ onSelect, onCancel }: {
  onSelect: (type: string) => void;
  onCancel: () => void;
}) => {
  const rbSheetRef = React.useRef<RBSheetRef | null>(null);
  const selected = useRef<string>('');

  useEffect(() => {
    if (rbSheetRef.current) {
      rbSheetRef.current.open();
    }
  }, []);

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <RBSheet
        ref={rbSheetRef}
        closeOnPressBack={false}
        closeOnPressMask={false}
        customStyles={{
          container: {
            borderTopLeftRadius: 14,
            borderTopRightRadius: 14,
          }
        }}
        onClose={() => {
          if (selected.current) {
            onSelect(selected.current);
          } else {
            onCancel()
          }
        }}
      >
        <View className='p-4 relative'>
          <Text className='text-lg font-bold'>
            Input Room name
          </Text>
          <Text className='text-sm text-gray-500'>
            Input the name of the room you want to scan.
          </Text>

          <View className='absolute top-4 right-4'>
            <TouchableOpacity
              onPress={() => {
                selected.current = '';
                rbSheetRef.current?.close();
              }}
              className='p-2'
            >
              <MaterialIcons name='close' size={24} color='black' />
            </TouchableOpacity>
          </View>
        </View>
        <View className='p-4 pt-0'>
          <Input
            placeholder="Room Name"
            variant="filled"
            size="lg"
            onChangeText={(text) => {
              selected.current = text;
            }}
            className='my-2'
          />
          <TouchableOpacity
            onPress={() => {
              if (selected.current) {
                rbSheetRef.current?.close();
              }
            }}
            className='bg-blue-500 p-4 rounded-lg mt-4'
          >
            <Text className='text-white text-center font-bold text-lg'>
              Start Scan
            </Text>
          </TouchableOpacity>
        </View>
      </RBSheet>
    </SafeAreaView>
  )
}
