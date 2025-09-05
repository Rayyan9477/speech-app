import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Audio } from 'expo-av';
import * as FileSystem from 'expo-file-system';

interface AudioRecorderProps {
  onRecordingComplete?: (uri: string, duration: number) => void;
  onRecordingStart?: () => void;
  onRecordingStop?: () => void;
  maxDuration?: number; // in seconds
  style?: any;
}

const AudioRecorder: React.FC<AudioRecorderProps> = ({
  onRecordingComplete,
  onRecordingStart,
  onRecordingStop,
  maxDuration = 300, // 5 minutes default
  style,
}) => {
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [duration, setDuration] = useState(0);
  const [permissionGranted, setPermissionGranted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    requestPermissions();
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      if (recording) {
        recording.stopAndUnloadAsync();
      }
    };
  }, []);

  const requestPermissions = async () => {
    try {
      const { granted } = await Audio.requestPermissionsAsync();
      setPermissionGranted(granted);
      if (!granted) {
        Alert.alert(
          'Permission Required',
          'Microphone permission is required to record audio.',
          [{ text: 'OK' }]
        );
      }
    } catch (error) {
      console.error('Error requesting permissions:', error);
    }
  };

  const startRecording = async () => {
    if (!permissionGranted) {
      Alert.alert('Permission Denied', 'Please grant microphone permission to record audio.');
      return;
    }

    try {
      setIsLoading(true);

      // Set audio mode for recording
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        interruptionModeIOS: Audio.INTERRUPTION_MODE_IOS_DO_NOT_MIX,
        playsInSilentModeIOS: true,
        shouldDuckAndroid: true,
        interruptionModeAndroid: Audio.INTERRUPTION_MODE_ANDROID_DO_NOT_MIX,
        playThroughEarpieceAndroid: false,
      });

      const { recording: newRecording } = await Audio.Recording.createAsync(
        Audio.RECORDING_OPTIONS_PRESET_HIGH_QUALITY
      );

      setRecording(newRecording);
      setIsRecording(true);
      setDuration(0);

      // Start duration timer
      intervalRef.current = setInterval(() => {
        setDuration(prev => {
          const newDuration = prev + 1;
          if (newDuration >= maxDuration) {
            stopRecording();
            return maxDuration;
          }
          return newDuration;
        });
      }, 1000);

      onRecordingStart?.();
      setIsLoading(false);
    } catch (error) {
      console.error('Failed to start recording:', error);
      setIsLoading(false);
      Alert.alert('Error', 'Failed to start recording');
    }
  };

  const stopRecording = async () => {
    if (!recording) return;

    try {
      setIsLoading(true);
      await recording.stopAndUnloadAsync();

      const uri = recording.getURI();
      if (uri) {
        // Get audio duration
        const status = await recording.getStatusAsync();
        const finalDuration = status.durationMillis ? status.durationMillis / 1000 : duration;

        onRecordingComplete?.(uri, finalDuration);
      }

      setRecording(null);
      setIsRecording(false);
      setIsLoading(false);

      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }

      onRecordingStop?.();
    } catch (error) {
      console.error('Failed to stop recording:', error);
      setIsLoading(false);
      Alert.alert('Error', 'Failed to stop recording');
    }
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getWaveformBars = () => {
    // Simple waveform visualization
    const bars = [];
    for (let i = 0; i < 20; i++) {
      const height = isRecording ? Math.random() * 40 + 10 : 20;
      bars.push(
        <View
          key={i}
          style={[
            styles.waveformBar,
            {
              height,
              backgroundColor: isRecording ? '#EF4444' : '#E5E7EB',
            },
          ]}
        />
      );
    }
    return bars;
  };

  return (
    <View style={[styles.container, style]}>
      {/* Recording Status */}
      <View style={styles.statusContainer}>
        <View style={[styles.statusIndicator, isRecording && styles.recordingIndicator]} />
        <Text style={styles.statusText}>
          {isRecording ? 'Recording...' : 'Ready to record'}
        </Text>
        <Text style={styles.durationText}>{formatDuration(duration)}</Text>
      </View>

      {/* Waveform Visualization */}
      <View style={styles.waveformContainer}>
        {getWaveformBars()}
      </View>

      {/* Recording Controls */}
      <View style={styles.controlsContainer}>
        {!isRecording ? (
          <TouchableOpacity
            style={[
              styles.recordButton,
              (!permissionGranted || isLoading) && styles.disabledButton,
            ]}
            onPress={startRecording}
            disabled={!permissionGranted || isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <>
                <MaterialIcons name="mic" size={32} color="#FFFFFF" />
                <Text style={styles.recordButtonText}>Start Recording</Text>
              </>
            )}
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={styles.stopButton}
            onPress={stopRecording}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <>
                <MaterialIcons name="stop" size={32} color="#FFFFFF" />
                <Text style={styles.stopButtonText}>Stop Recording</Text>
              </>
            )}
          </TouchableOpacity>
        )}
      </View>

      {/* Recording Tips */}
      <View style={styles.tipsContainer}>
        <Text style={styles.tipsTitle}>Recording Tips:</Text>
        <Text style={styles.tipsText}>
          • Speak clearly and at a consistent distance from the microphone
        </Text>
        <Text style={styles.tipsText}>
          • Minimize background noise for best results
        </Text>
        <Text style={styles.tipsText}>
          • Maximum recording time: {formatDuration(maxDuration)}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  statusIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#22C55E',
    marginRight: 8,
  },
  recordingIndicator: {
    backgroundColor: '#EF4444',
  },
  statusText: {
    flex: 1,
    fontSize: 16,
    fontWeight: '500',
    color: '#1F2937',
  },
  durationText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#5546FF',
  },
  waveformContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 60,
    marginBottom: 24,
    paddingHorizontal: 10,
  },
  waveformBar: {
    width: 4,
    borderRadius: 2,
    opacity: 0.7,
  },
  controlsContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  recordButton: {
    backgroundColor: '#EF4444',
    borderRadius: 50,
    paddingVertical: 16,
    paddingHorizontal: 24,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#EF4444',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  stopButton: {
    backgroundColor: '#6B7280',
    borderRadius: 50,
    paddingVertical: 16,
    paddingHorizontal: 24,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#6B7280',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  disabledButton: {
    backgroundColor: '#9CA3AF',
    shadowColor: '#9CA3AF',
  },
  recordButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  stopButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  tipsContainer: {
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    padding: 16,
  },
  tipsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 8,
  },
  tipsText: {
    fontSize: 12,
    color: '#6B7280',
    lineHeight: 18,
    marginBottom: 4,
  },
});

export default AudioRecorder;
