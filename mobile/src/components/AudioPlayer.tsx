import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Audio } from 'expo-av';

interface AudioPlayerProps {
  audioUri?: string;
  title?: string;
  duration?: string;
  onDownload?: () => void;
  onShare?: () => void;
  style?: any;
}

const AudioPlayer: React.FC<AudioPlayerProps> = ({
  audioUri,
  title = 'Audio File',
  duration = '00:00',
  onDownload,
  onShare,
  style,
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    return () => {
      if (sound) {
        sound.unloadAsync();
      }
    };
  }, [sound]);

  const handlePlayPause = async () => {
    if (!audioUri) {
      Alert.alert('No Audio', 'No audio file available');
      return;
    }

    try {
      if (isPlaying && sound) {
        await sound.pauseAsync();
        setIsPlaying(false);
      } else if (sound) {
        await sound.playAsync();
        setIsPlaying(true);
      } else {
        setIsLoading(true);
        const { sound: newSound } = await Audio.Sound.createAsync(
          { uri: audioUri },
          { shouldPlay: true }
        );

        setSound(newSound);
        setIsPlaying(true);
        setIsLoading(false);

        newSound.setOnPlaybackStatusUpdate((status) => {
          if (status.isLoaded && status.didJustFinish) {
            setIsPlaying(false);
          }
        });
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to play audio');
      setIsLoading(false);
    }
  };

  const handleDownload = () => {
    if (onDownload) {
      onDownload();
    } else {
      Alert.alert('Download', 'Download feature coming soon!');
    }
  };

  const handleShare = () => {
    if (onShare) {
      onShare();
    } else {
      Alert.alert('Share', 'Share feature coming soon!');
    }
  };

  return (
    <View style={[styles.container, style]}>
      <TouchableOpacity
        style={styles.playButton}
        onPress={handlePlayPause}
        disabled={isLoading}
      >
        <MaterialIcons
          name={isLoading ? 'hourglass-empty' : (isPlaying ? 'pause' : 'play-arrow')}
          size={32}
          color="#5546FF"
        />
      </TouchableOpacity>

      <View style={styles.audioInfo}>
        <Text style={styles.audioTitle}>{title}</Text>
        <Text style={styles.audioDuration}>{duration}</Text>
      </View>

      <View style={styles.audioActions}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={handleDownload}
        >
          <MaterialIcons name="download" size={24} color="#6B7280" />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionButton}
          onPress={handleShare}
        >
          <MaterialIcons name="share" size={24} color="#6B7280" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  playButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  audioInfo: {
    flex: 1,
    marginLeft: 16,
  },
  audioTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 2,
  },
  audioDuration: {
    fontSize: 14,
    color: '#6B7280',
  },
  audioActions: {
    flexDirection: 'row',
    gap: 16,
  },
  actionButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default AudioPlayer;
