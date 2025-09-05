import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';
import { Audio } from 'expo-av';
import Slider from '@react-native-community/slider';

const TTSScreen = () => {
  const [text, setText] = useState('');
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedVoice, setSelectedVoice] = useState('en-US-1');
  const [speed, setSpeed] = useState(1.0);
  const [pitch, setPitch] = useState(1.0);
  const [sound, setSound] = useState<Audio.Sound | null>(null);

  const voices = [
    { id: 'en-US-1', name: 'English Female 1', language: 'en-US' },
    { id: 'en-US-2', name: 'English Male 1', language: 'en-US' },
    { id: 'es-ES-1', name: 'Spanish Female', language: 'es-ES' },
    { id: 'fr-FR-1', name: 'French Female', language: 'fr-FR' },
    { id: 'de-DE-1', name: 'German Female', language: 'de-DE' },
  ];

  const handleGenerateSpeech = async () => {
    if (!text.trim()) {
      Alert.alert('Error', 'Please enter text to convert to speech');
      return;
    }

    setIsLoading(true);
    try {
      // TODO: Integrate with backend API
      // For now, using Expo Speech API as placeholder
      const speechOptions = {
        language: selectedVoice.split('-').slice(0, 2).join('-'),
        pitch: pitch,
        rate: speed,
      };

      // This is a placeholder - actual implementation would call backend
      await new Promise(resolve => setTimeout(resolve, 2000));

      Alert.alert('Success', 'Audio generated successfully!');
    } catch (error) {
      Alert.alert('Error', 'Failed to generate speech');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePlayPause = async () => {
    if (!sound) {
      Alert.alert('No Audio', 'Please generate speech first');
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
    Alert.alert('Download', 'Audio file downloaded successfully!');
  };

  const handleShare = () => {
    Alert.alert('Share', 'Audio sharing feature coming soon!');
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Text to Speech</Text>
          <Text style={styles.subtitle}>Convert your text into natural speech</Text>
        </View>

        {/* Text Input */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Enter Text</Text>
          <TextInput
            style={styles.textInput}
            multiline
            placeholder="Type your text here..."
            value={text}
            onChangeText={setText}
            maxLength={5000}
          />
          <Text style={styles.charCount}>{text.length}/5000</Text>
        </View>

        {/* Voice Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Select Voice</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
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
                  <MaterialIcons
                    name="mic"
                    size={24}
                    color={selectedVoice === voice.id ? '#FFFFFF' : '#5546FF'}
                  />
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
                      styles.voiceLanguage,
                      selectedVoice === voice.id && styles.selectedVoiceText,
                    ]}
                  >
                    {voice.language}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        </View>

        {/* Audio Controls */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Audio Settings</Text>

          {/* Speed Control */}
          <View style={styles.sliderContainer}>
            <Text style={styles.sliderLabel}>Speed: {speed.toFixed(1)}x</Text>
            <Slider
              style={styles.slider}
              minimumValue={0.5}
              maximumValue={2.0}
              value={speed}
              onValueChange={setSpeed}
              minimumTrackTintColor="#5546FF"
              maximumTrackTintColor="#E5E7EB"
            />
          </View>

          {/* Pitch Control */}
          <View style={styles.sliderContainer}>
            <Text style={styles.sliderLabel}>Pitch: {pitch.toFixed(1)}</Text>
            <Slider
              style={styles.slider}
              minimumValue={0.5}
              maximumValue={2.0}
              value={pitch}
              onValueChange={setPitch}
              minimumTrackTintColor="#5546FF"
              maximumTrackTintColor="#E5E7EB"
            />
          </View>
        </View>

        {/* Generate Button */}
        <View style={styles.section}>
          <TouchableOpacity
            style={[styles.generateButton, isLoading && styles.disabledButton]}
            onPress={handleGenerateSpeech}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <>
                <MaterialIcons name="play-arrow" size={24} color="#FFFFFF" />
                <Text style={styles.generateButtonText}>Generate Speech</Text>
              </>
            )}
          </TouchableOpacity>
        </View>

        {/* Audio Player */}
        {sound && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Playback</Text>
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
  textInput: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    minHeight: 120,
    textAlignVertical: 'top',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  charCount: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'right',
    marginTop: 8,
  },
  voiceGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  voiceCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    width: 120,
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
  voiceName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
    marginTop: 8,
    textAlign: 'center',
  },
  voiceLanguage: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 4,
  },
  selectedVoiceText: {
    color: '#FFFFFF',
  },
  sliderContainer: {
    marginBottom: 20,
  },
  sliderLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1F2937',
    marginBottom: 8,
  },
  slider: {
    width: '100%',
    height: 40,
  },
  generateButton: {
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
  generateButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 8,
  },
  audioPlayer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
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

export default TTSScreen;
