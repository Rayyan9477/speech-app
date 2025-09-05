import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Audio } from 'expo-av';
import { AudioRecorder } from '../../components';

const VoiceCloningRecordScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const [isRecording, setIsRecording] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [recordedUri, setRecordedUri] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const audioFile = route.params?.audioFile;
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  const handleRecordingComplete = (uri: string, duration: number) => {
    setRecordedUri(uri);
    setRecordingDuration(duration);
    setIsRecording(false);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
  };

  const handleContinue = () => {
    if (!recordedUri && !audioFile) {
      Alert.alert('Error', 'Please record audio or go back to upload');
      return;
    }

    navigation.navigate('VoiceCloningProcessing', {
      audioUri: recordedUri || audioFile?.uri,
      duration: recordingDuration,
    });
  };

  const handleUploadInstead = () => {
    navigation.navigate('VoiceCloningUpload');
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  if (audioFile) {
    // If user uploaded a file, show confirmation screen
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <MaterialIcons name="arrow-back" size={24} color="#6B7280" />
          </TouchableOpacity>
          <Text style={styles.title}>Voice File Ready</Text>
          <View style={{ width: 24 }} />
        </View>

        <View style={styles.content}>
          <View style={styles.readyContainer}>
            <MaterialIcons name="check-circle" size={80} color="#22C55E" />
            <Text style={styles.readyTitle}>Audio File Uploaded Successfully</Text>
            <Text style={styles.readySubtitle}>
              Your voice sample is ready for processing
            </Text>

            <View style={styles.fileInfo}>
              <Text style={styles.fileName}>{audioFile.name}</Text>
              <Text style={styles.fileSize}>
                {(audioFile.size / 1024 / 1024).toFixed(2)} MB
              </Text>
            </View>
          </View>

          <TouchableOpacity style={styles.continueButton} onPress={handleContinue}>
            <Text style={styles.continueButtonText}>Continue to Processing</Text>
            <MaterialIcons name="arrow-forward" size={20} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <MaterialIcons name="arrow-back" size={24} color="#6B7280" />
        </TouchableOpacity>
        <Text style={styles.title}>Record Voice Sample</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.content}>
        <Text style={styles.subtitle}>Record Your Voice</Text>
        <Text style={styles.description}>
          Record a clear sample of your voice. Speak naturally for at least 30 seconds.
          Make sure you're in a quiet environment.
        </Text>

        <AudioRecorder
          onRecordingComplete={handleRecordingComplete}
          maxDuration={300}
          style={styles.audioRecorder}
        />

        {recordedUri && (
          <View style={styles.recordingComplete}>
            <MaterialIcons name="check-circle" size={48} color="#22C55E" />
            <Text style={styles.completeTitle}>Recording Complete!</Text>
            <Text style={styles.completeSubtitle}>
              Duration: {formatDuration(recordingDuration)}
            </Text>
          </View>
        )}

        <View style={styles.tips}>
          <Text style={styles.tipsTitle}>Recording Tips:</Text>
          <Text style={styles.tipsText}>• Speak clearly and at normal volume</Text>
          <Text style={styles.tipsText}>• Record in a quiet environment</Text>
          <Text style={styles.tipsText}>• Include various speech patterns</Text>
          <Text style={styles.tipsText}>• Aim for at least 30 seconds</Text>
        </View>

        <View style={styles.actions}>
          <TouchableOpacity
            style={styles.uploadButton}
            onPress={handleUploadInstead}
          >
            <MaterialIcons name="cloud-upload" size={20} color="#5546FF" />
            <Text style={styles.uploadButtonText}>Upload File Instead</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.continueButton,
              !recordedUri && styles.disabledButton,
            ]}
            onPress={handleContinue}
            disabled={!recordedUri}
          >
            <Text style={styles.continueButtonText}>Continue</Text>
            <MaterialIcons name="arrow-forward" size={20} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    backgroundColor: '#FFFFFF',
  },
  backButton: {
    padding: 4,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  subtitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 8,
  },
  description: {
    fontSize: 16,
    color: '#6B7280',
    lineHeight: 24,
    marginBottom: 32,
  },
  audioRecorder: {
    marginBottom: 32,
  },
  recordingComplete: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
    marginBottom: 32,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  completeTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
    marginTop: 16,
    marginBottom: 4,
  },
  completeSubtitle: {
    fontSize: 16,
    color: '#6B7280',
  },
  tips: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    marginBottom: 32,
  },
  tipsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 12,
  },
  tipsText: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 8,
    lineHeight: 20,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  uploadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
  },
  uploadButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#5546FF',
    marginLeft: 8,
  },
  continueButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 24,
    backgroundColor: '#5546FF',
    borderRadius: 8,
  },
  disabledButton: {
    backgroundColor: '#9CA3AF',
  },
  continueButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginRight: 8,
  },
  readyContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 32,
    alignItems: 'center',
    marginBottom: 32,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  readyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
    marginTop: 16,
    marginBottom: 8,
  },
  readySubtitle: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 24,
  },
  fileInfo: {
    alignItems: 'center',
  },
  fileName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  fileSize: {
    fontSize: 14,
    color: '#6B7280',
  },
});

export default VoiceCloningRecordScreen;
