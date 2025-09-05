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
} from 'react-native';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';
import * as DocumentPicker from 'expo-document-picker';
import { Audio } from 'expo-av';

const VoiceTranslateScreen = () => {
  const [selectedAudio, setSelectedAudio] = useState<any>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [sourceLanguage, setSourceLanguage] = useState('en');
  const [targetLanguage, setTargetLanguage] = useState('es');
  const [sound, setSound] = useState<Audio.Sound | null>(null);

  const languages = [
    { code: 'en', name: 'English', flag: '🇺🇸' },
    { code: 'es', name: 'Spanish', flag: '🇪🇸' },
    { code: 'fr', name: 'French', flag: '🇫🇷' },
    { code: 'de', name: 'German', flag: '🇩🇪' },
    { code: 'it', name: 'Italian', flag: '🇮🇹' },
    { code: 'pt', name: 'Portuguese', flag: '🇵🇹' },
    { code: 'ru', name: 'Russian', flag: '🇷🇺' },
    { code: 'ja', name: 'Japanese', flag: '🇯🇵' },
    { code: 'ko', name: 'Korean', flag: '🇰🇷' },
    { code: 'zh', name: 'Chinese', flag: '🇨🇳' },
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

  const handleTranslate = async () => {
    if (!selectedAudio) {
      Alert.alert('Error', 'Please select an audio file first');
      return;
    }

    setIsProcessing(true);
    try {
      // TODO: Integrate with backend API for translation
      await new Promise(resolve => setTimeout(resolve, 4000));
      Alert.alert('Success', 'Translation completed successfully!');
    } catch (error) {
      Alert.alert('Error', 'Failed to translate audio');
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePlayPause = async () => {
    if (!sound) {
      Alert.alert('No Audio', 'Please translate audio first');
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
    Alert.alert('Download', 'Translated audio downloaded successfully!');
  };

  const handleShare = () => {
    Alert.alert('Share', 'Audio sharing feature coming soon!');
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Voice Translate</Text>
          <Text style={styles.subtitle}>Translate speech across languages</Text>
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

        {/* Language Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Translation Settings</Text>

          {/* Source Language */}
          <View style={styles.languageSection}>
            <Text style={styles.languageLabel}>From</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={styles.languageGrid}>
                {languages.map((lang) => (
                  <TouchableOpacity
                    key={`source-${lang.code}`}
                    style={[
                      styles.languageCard,
                      sourceLanguage === lang.code && styles.selectedLanguageCard,
                    ]}
                    onPress={() => setSourceLanguage(lang.code)}
                  >
                    <Text style={styles.languageFlag}>{lang.flag}</Text>
                    <Text
                      style={[
                        styles.languageName,
                        sourceLanguage === lang.code && styles.selectedLanguageText,
                      ]}
                    >
                      {lang.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>
          </View>

          {/* Language Swap */}
          <View style={styles.swapContainer}>
            <TouchableOpacity
              style={styles.swapButton}
              onPress={() => {
                const temp = sourceLanguage;
                setSourceLanguage(targetLanguage);
                setTargetLanguage(temp);
              }}
            >
              <MaterialIcons name="swap-vert" size={24} color="#5546FF" />
            </TouchableOpacity>
          </View>

          {/* Target Language */}
          <View style={styles.languageSection}>
            <Text style={styles.languageLabel}>To</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={styles.languageGrid}>
                {languages.map((lang) => (
                  <TouchableOpacity
                    key={`target-${lang.code}`}
                    style={[
                      styles.languageCard,
                      targetLanguage === lang.code && styles.selectedLanguageCard,
                    ]}
                    onPress={() => setTargetLanguage(lang.code)}
                  >
                    <Text style={styles.languageFlag}>{lang.flag}</Text>
                    <Text
                      style={[
                        styles.languageName,
                        targetLanguage === lang.code && styles.selectedLanguageText,
                      ]}
                    >
                      {lang.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>
          </View>
        </View>

        {/* Translate Button */}
        <View style={styles.section}>
          <TouchableOpacity
            style={[
              styles.translateButton,
              (!selectedAudio || isProcessing) && styles.disabledButton,
            ]}
            onPress={handleTranslate}
            disabled={!selectedAudio || isProcessing}
          >
            {isProcessing ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <>
                <MaterialIcons name="translate" size={24} color="#FFFFFF" />
                <Text style={styles.translateButtonText}>Translate Audio</Text>
              </>
            )}
          </TouchableOpacity>
        </View>

        {/* Processing Status */}
        {isProcessing && (
          <View style={styles.section}>
            <View style={styles.processingContainer}>
              <ActivityIndicator size="large" color="#5546FF" />
              <Text style={styles.processingText}>Translating your audio...</Text>
              <Text style={styles.processingSubtext}>
                This may take a few moments depending on audio length
              </Text>
            </View>
          </View>
        )}

        {/* Audio Player */}
        {sound && !isProcessing && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Translation Result</Text>
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
                <Text style={styles.audioTitle}>Translated Audio</Text>
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
  languageSection: {
    marginBottom: 20,
  },
  languageLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 12,
  },
  languageGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  languageCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    width: 100,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  selectedLanguageCard: {
    backgroundColor: '#5546FF',
  },
  languageFlag: {
    fontSize: 24,
    marginBottom: 8,
  },
  languageName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
    textAlign: 'center',
  },
  selectedLanguageText: {
    color: '#FFFFFF',
  },
  swapContainer: {
    alignItems: 'center',
    marginVertical: 16,
  },
  swapButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  translateButton: {
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
  translateButtonText: {
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
    textAlign: 'center',
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

export default VoiceTranslateScreen;
