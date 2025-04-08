import { MaterialIcons } from '@expo/vector-icons';
import { FlatList } from 'native-base';
import React, { useEffect, useRef } from 'react';
import { TouchableOpacity, View, Text, SafeAreaView, Dimensions } from 'react-native';
import RBSheet from 'react-native-raw-bottom-sheet';

const roomTypes = [
  { value: 'bedroom', label: 'Bedroom' },
  { value: 'living_room', label: 'Living Room' },
  { value: 'kitchen', label: 'Kitchen' },
  { value: 'bathroom', label: 'Bathroom' },
  { value: 'dining_room', label: 'Dining Room' },
  { value: 'office', label: 'Office' },
  { value: 'garage', label: 'Garage' },
  { value: 'basement', label: 'Basement' },
  { value: 'attic', label: 'Attic' },
  { value: 'hallway', label: 'Hallway' },
  { value: 'laundry_room', label: 'Laundry Room' },
  { value: 'pantry', label: 'Pantry' },
  { value: 'closet', label: 'Closet' },
  { value: 'playroom', label: 'Playroom' },
  { value: 'gym', label: 'Gym' },
  { value: 'library', label: 'Library' },
  { value: 'guest_room', label: 'Guest Room' },
  { value: 'sunroom', label: 'Sunroom' },
  { value: 'mudroom', label: 'Mudroom' },
  { value: 'storage_room', label: 'Storage Room' },
  { value: 'other', label: 'Other' }
]

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
        height={Dimensions.get('window').height * 0.8}
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
            Select Room Type
          </Text>
          <Text className='text-sm text-gray-500'>
            Choose the type of room you want to scan.
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
        <FlatList
          className='mb-12'
          data={roomTypes}
          keyExtractor={(item) => item.value}
          renderItem={({ item }) => (
            <TouchableOpacity
              onPress={() => {
                selected.current = item.label;
                rbSheetRef.current?.close();
              }}
            >
              <View className='px-4 py-3'>
                <Text className='text-lg'>
                  {item.label}
                </Text>
              </View>
            </TouchableOpacity>
          )}
        />
      </RBSheet>
    </SafeAreaView>
  )
}
