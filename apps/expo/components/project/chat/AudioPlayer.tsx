import React, { useState, useEffect, useRef } from "react";
import {
  View,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Platform,
} from "react-native";
import { Text } from "@/components/ui/text";
import { Audio } from "expo-av";
import { CirclePauseIcon, CircleStopIcon, PauseIcon, PlayCircleIcon, PlayIcon } from "lucide-react-native";

interface AudioPlayerProps {
  audioUrl: string;
  fileName?: string;
  duration?: number;
}

export function AudioPlayer({
  audioUrl,
  fileName,
  duration,
}: AudioPlayerProps) {
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [position, setPosition] = useState(0);
  const [totalDuration, setTotalDuration] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const positionUpdateInterval = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    loadAudio();
    return () => {
      if (sound) {
        sound.unloadAsync();
      }
      if (positionUpdateInterval.current) {
        clearInterval(positionUpdateInterval.current);
      }
    };
  }, [audioUrl]);

  const loadAudio = async () => {
    try {
      setIsLoading(true);

      // Configure audio mode for playback
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        playsInSilentModeIOS: true,
        staysActiveInBackground: false,
        shouldDuckAndroid: true,
        playThroughEarpieceAndroid: false,
      });

      const { sound: newSound } = await Audio.Sound.createAsync(
        { uri: audioUrl },
        { shouldPlay: false },
        onPlaybackStatusUpdate
      );

      setSound(newSound);

      // Get initial duration
      const status = await newSound.getStatusAsync();
      if (status.isLoaded) {
        setTotalDuration(status.durationMillis || 0);
      }
    } catch (error) {
      console.error("Error loading audio:", error);
      Alert.alert("Error", "Failed to load audio file.");
    } finally {
      setIsLoading(false);
    }
  };

  const onPlaybackStatusUpdate = (status: any) => {
    if (status.isLoaded) {
      setIsPlaying(status.isPlaying);
      setPosition(status.positionMillis || 0);
      setTotalDuration(status.durationMillis || 0);
    }
  };

  const playAudio = async () => {
    if (!sound) return;
    

    try {
      if (isPlaying) {
        await sound.pauseAsync();
      } else {
        await sound.playAsync();

        // Start position updates
        positionUpdateInterval.current = setInterval(async () => {
          if (sound) {
            const status = await sound.getStatusAsync();
            if (status.isLoaded) {
              setPosition(status.positionMillis || 0);
            }
          }
        }, 100);
      }
    } catch (error) {
      console.error("Error playing audio:", error);
      Alert.alert("Error", "Failed to play audio.");
    }
  };

  const stopAudio = async () => {
    if (!sound) return;

    try {
      await sound.stopAsync();
      await sound.setPositionAsync(0);
      setIsPlaying(false);
      setPosition(0);

      if (positionUpdateInterval.current) {
        clearInterval(positionUpdateInterval.current);
        positionUpdateInterval.current = null;
      }
    } catch (error) {
      console.error("Error stopping audio:", error);
    }
  };

  const formatTime = (milliseconds: number) => {
    const totalSeconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  const getProgressPercentage = () => {
    if (totalDuration === 0) return 0;
    return (position / totalDuration) * 100;
  };

  const getDisplayName = () => {
    if (fileName) {
      return fileName.replace(/\.(m4a|mp3|wav|aac)$/i, "");
    }
    return "Voice Message";
  };

  return (
    <View style={styles.container}>
      <View style={styles.audioInfo}>
        <Text style={styles.audioName}>{getDisplayName()}</Text>
        <Text style={styles.audioDuration}>
          {formatTime(position)} / {formatTime(totalDuration)}
        </Text>
      </View>

      <View style={styles.controls}>
        <TouchableOpacity
          style={[styles.playButton, isPlaying && styles.pauseButton]}
          onPress={playAudio}
          disabled={isLoading}
        >
          <Text style={styles.playIcon}>{isPlaying ? <CirclePauseIcon /> : <PlayCircleIcon />}</Text>
        </TouchableOpacity>

        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View
              style={[
                styles.progressFill,
                { width: `${getProgressPercentage()}%` },
              ]}
            />
          </View>
        </View>

        {isPlaying && (
          <TouchableOpacity style={styles.stopButton} onPress={stopAudio}>
            <Text style={styles.stopIcon}><CircleStopIcon /></Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#f8fafc",
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    minWidth: 200,
  },
  audioInfo: {
    marginBottom: 8,
  },
  audioName: {
    fontSize: 14,
    fontWeight: "500",
    color: "#1e293b",
    marginBottom: 2,
  },
  audioDuration: {
    fontSize: 12,
    color: "#64748b",
  },
  controls: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  playButton: {
    borderColor: "#2563eb",
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  pauseButton: {
    // backgroundColor: "#dc2626",
  },
  playIcon: {
    fontSize: 16,
    color: "#ffffff",
    fontWeight: "bold",
  },
  progressContainer: {
    flex: 1,
  },
  progressBar: {
    height: 4,
    backgroundColor: "#e2e8f0",
    borderRadius: 2,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#2563eb",
    borderRadius: 2,
  },
  stopButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#f1f5f9",
    justifyContent: "center",
    alignItems: "center",
  },
  stopIcon: {
    fontSize: 12,
    color: "#64748b",
  },
});
