import React from 'react';
import LidarScan from '@/components/project/LidarScan';
import { useLocalSearchParams, useRouter } from 'expo-router';

const LidarScanScreen: React.FC = () => {
  const router = useRouter();
  const { roomId, roomPlanSVG } = useLocalSearchParams<{
    roomId: string;
    roomPlanSVG: string;
  }>();

  return (
    <LidarScan
      roomId={Number(roomId)}
      roomPlanSVG={roomPlanSVG}
      onScanComplete={(roomId) => {
        // pass
      }}
      onClose={() => {
        router.back();
      }}
    />
  )
};

export default LidarScanScreen; 