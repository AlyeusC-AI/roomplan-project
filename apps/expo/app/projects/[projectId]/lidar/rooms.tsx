import React from 'react';
import { StyleSheet } from 'react-native';
import LidarRooms from '@/components/project/LidarRooms';
import { useGlobalSearchParams } from 'expo-router';

const LidarRoomsScreen: React.FC = () => {
  const { projectId } = useGlobalSearchParams<{
    projectId: string;
  }>();
  return (
    <LidarRooms
      projectId={projectId}
    />
  )
};

export default LidarRoomsScreen; 