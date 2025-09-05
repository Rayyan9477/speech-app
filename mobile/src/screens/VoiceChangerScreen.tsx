import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Alert,
  ActivityIndicator,
  Image,
} from 'react-native';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';
import * as DocumentPicker from 'expo-document-picker';
import { Audio } from 'expo-av';

const VoiceChangerScreen = () => {
  const [selectedAudio, setSelectedAudio] = useState<any>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [selectedVoice, setSelectedVoice] = useState('voice-1');
  const [sound, setSound] = useState<Audio.Sound | null>(null);

  const voices = [
    { id: 'voice-1', name: 'Deep Voice', preview: '🎤', category: 'Male' },
    { id: 'voice-2', name: 'High Pitch', preview: '🎵', category: 'Female' },
    { id: 'voice-3', name: 'Robot', preview: '🤖', category: 'Effect' },
    { id: 'voice-4', name: 'Cartoon', preview: '🎭', category: 'Fun' },
    { id: 'voice-5', name: 'Elderly', preview: '👴', category: 'Age' },
    { id: 'voice-6', name: 'Child', preview: '👶', category: 'Age' },
  ];

  const handleSelectAudio = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['audio/*'],
        copyToCacheDirectory: true,
      });

      if (result.type === 'success') {
        setSelectedAudio(result);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to select audio file');
    }
  };

  const handleRecordAudio = () => {
    Alert.alert('Record Audio', 'Audio recording feature coming soon!');
  };

  const handleProcessVoice = async () => {
    if (!selectedAudio) {
      Alert.alert('Error', 'Please select an audio file first');
      return;
    }

    setIsProcessing(true);
    try {
      // TODO: Integrate with backend API for voice processing
      await new Promise(resolve => setTimeout(resolve, 3000));
      Alert.alert('Success', 'Voice changed successfully!');
    } catch (error) {
      Alert.alert('Error', 'Failed to process voice');
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePlayPause = async () => {
    if (!sound) {
      Alert.alert('No Audio', 'Please process voice first');
      return;
    }

    try {
      if (isPlaying) {
        await sound.pauseAsync();
        setIsPlaying(false);
      } else {
        await sound.playAsync();
        setIsPlaying(true);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to play audio');
    }
  };

  const handleDownload = () => {
    Alert.alert('Download', 'Processed audio downloaded successfully!');
  };

  const handleShare = () => {
    Alert.alert('Share', 'Audio sharing feature coming soon!');
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Voice Changer</Text>
          <Text style={styles.subtitle}>Transform your voice with AI</Text>
        </View>

        {/* Audio Input */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Select Audio</Text>

          {!selectedAudio ? (
            <View style={styles.audioInputContainer}>
              <TouchableOpacity
                style={styles.uploadButton}
                onPress={handleSelectAudio}
              >
                <MaterialIcons name="cloud-upload" size={48} color="#5546FF" />
                <Text style={styles.uploadText}>Upload Audio File</Text>
                <Text style={styles.uploadSubtext}>MP3, WAV, M4A supported</Text>
              </TouchableOpacity>

              <View style={styles.divider}>
                <View style={styles.dividerLine} />
                <Text style={styles.dividerText}>OR</Text>
                <View style={styles.dividerLine} />
              </View>

              <TouchableOpacity
                style={styles.recordButton}
                onPress={handleRecordAudio}
              >
                <MaterialIcons name="mic" size={32} color="#FFFFFF" />
                <Text style={styles.recordText}>Record Audio</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.selectedAudioContainer}>
              <MaterialIcons name="audiotrack" size={32} color="#5546FF" />
              <View style={styles.audioInfo}>
                <Text style={styles.audioName}>{selectedAudio.name}</Text>
                <Text style={styles.audioSize}>
                  {(selectedAudio.size / 1024 / 1024).toFixed(2)} MB
                </Text>
              </View>
              <TouchableOpacity
                style={styles.removeButton}
                onPress={() => setSelectedAudio(null)}
              >
                <MaterialIcons name="close" size={24} color="#EF4444" />
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Voice Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Choose Voice Effect</Text>
          <View style={styles.voiceGrid}>
            {voices.map((voice) => (
              <TouchableOpacity
                key={voice.id}
                style={[
                  styles.voiceCard,
                  selectedVoice === voice.id && styles.selectedVoiceCard,
                ]}
                onPress={() => setSelectedVoice(voice.id)}
              >
                <Text style={styles.voicePreview}>{voice.preview}</Text>
                <Text
                  style={[
                    styles.voiceName,
                    selectedVoice === voice.id && styles.selectedVoiceText,
                  ]}
                >
                  {voice.name}
                </Text>
                <Text
                  style={[
                    styles.voiceCategory,
                    selectedVoice === voice.id && styles.selectedVoiceText,
                  ]}
                >
                  {voice.category}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Process Button */}
        <View style={styles.section}>
          <TouchableOpacity
            style={[
              styles.processButton,
              (!selectedAudio || isProcessing) && styles.disabledButton,
            ]}
            onPress={handleProcessVoice}
            disabled={!selectedAudio || isProcessing}
          >
            {isProcessing ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <>
                <MaterialIcons name="transform" size={24} color="#FFFFFF" />
                <Text style={styles.processButtonText}>Change Voice</Text>
              </>
            )}
          </TouchableOpacity>
        </View>

        {/* Processing Status */}
        {isProcessing && (
          <View style={styles.section}>
            <View style={styles.processingContainer}>
              <ActivityIndicator size="large" color="#5546FF" />
              <Text style={styles.processingText}>Processing your voice...</Text>
              <Text style={styles.processingSubtext}>
                This may take a few moments
              </Text>
            </View>
          </View>
        )}

        {/* Audio Player */}
        {sound && !isProcessing && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Result</Text>
            <View style={styles.audioPlayer}>
              <TouchableOpacity
                style={styles.playButton}
                onPress={handlePlayPause}
              >
                <MaterialIcons
                  name={isPlaying ? 'pause' : 'play-arrow'}
                  size={32}
                  color="#5546FF"
                />
              </TouchableOpacity>

              <View style={styles.audioInfo}>
                <Text style={styles.audioTitle}>Changed Voice</Text>
                <Text style={styles.audioDuration}>00:00 / 00:00</Text>
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
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    padding: 20,
    backgroundColor: '#FFFFFF',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
    lineHeight: 24,
  },
  section: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 16,
  },
  audioInputContainer: {
    alignItems: 'center',
  },
  uploadButton: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 40,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    width: '100%',
  },
  uploadText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginTop: 16,
  },
  uploadSubtext: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 4,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 24,
    width: '100%',
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#E5E7EB',
  },
  dividerText: {
    paddingHorizontal: 16,
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },
  recordButton: {
    backgroundColor: '#5546FF',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  recordText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  selectedAudioContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  audioInfo: {
    flex: 1,
    marginLeft: 12,
  },
  audioName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
  },
  audioSize: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 2,
  },
  removeButton: {
    padding: 8,
  },
  voiceGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  voiceCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    width: '48%',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  selectedVoiceCard: {
    backgroundColor: '#5546FF',
  },
  voicePreview: {
    fontSize: 32,
    marginBottom: 8,
  },
  voiceName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    textAlign: 'center',
  },
  voiceCategory: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 4,
  },
  selectedVoiceText: {
    color: '#FFFFFF',
  },
  processButton: {
    backgroundColor: '#5546FF',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  disabledButton: {
    backgroundColor: '#9CA3AF',
  },
  processButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 8,
  },
  processingContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 32,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  processingText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginTop: 16,
  },
  processingSubtext: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 8,
  },
  audioPlayer: {
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
  audioTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
  },
  audioDuration: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 2,
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

export default VoiceChangerScreen;
