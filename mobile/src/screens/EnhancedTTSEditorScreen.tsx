import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Dimensions,
  StatusBar,
  Alert,
  Modal,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';

const { width } = Dimensions.get('window');

interface TextBlock {
  id: string;
  content: string;
  audioUrl?: string;
  duration?: number;
  voice: any;
  isPlaying?: boolean;
  order: number;
}

interface ProjectMetadata {
  title: string;
  createdAt: Date;
  updatedAt: Date;
}

const EnhancedTTSEditorScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const params = route.params as any;
  
  const [projectMetadata, setProjectMetadata] = useState<ProjectMetadata>({
    title: params?.title || 'New TTS Project',
    createdAt: new Date(),
    updatedAt: new Date(),
  });
  
  const [textBlocks, setTextBlocks] = useState<TextBlock[]>([
    {
      id: '1',
      content: '',
      voice: { id: 'default', name: 'Emma', gender: 'Female', language: 'English' },
      order: 0,
    },
  ]);
  
  const [selectedVoice, setSelectedVoice] = useState({
    id: 'emma',
    name: 'Emma',
    gender: 'Female',
    language: 'English',
    style: 'Natural',
    provider: 'ElevenLabs',
    avatar: null,
  });
  
  const [showVoiceSelector, setShowVoiceSelector] = useState(false);
  const [showExportDialog, setShowExportDialog] = useState(false);
  const [showControlsModal, setShowControlsModal] = useState(false);
  const [selectedBlockId, setSelectedBlockId] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationProgress, setGenerationProgress] = useState(0);

  const voices = {
    aiVoices: [
      { id: 'emma', name: 'Emma', gender: 'Female', language: 'English', style: 'Natural', provider: 'ElevenLabs' },
      { id: 'james', name: 'James', gender: 'Male', language: 'English', style: 'Professional', provider: 'ElevenLabs' },
      { id: 'sophia', name: 'Sophia', gender: 'Female', language: 'English', style: 'Warm', provider: 'OpenAI' },
      { id: 'david', name: 'David', gender: 'Male', language: 'English', style: 'Authoritative', provider: 'Azure' },
    ],
    myVoices: [],
    favorites: [],
  };

  const calculateStats = () => {
    const totalCharacters = textBlocks.reduce((sum, block) => sum + block.content.length, 0);
    const totalWords = textBlocks.reduce((sum, block) => 
      sum + block.content.split(' ').filter(w => w.length > 0).length, 0);
    const totalDuration = textBlocks.reduce((sum, block) => sum + (block.duration || 0), 0);
    
    return { totalCharacters, totalWords, totalDuration };
  };

  const stats = calculateStats();

  const addTextBlock = () => {
    const newBlock: TextBlock = {
      id: Date.now().toString(),
      content: '',
      voice: selectedVoice,
      order: textBlocks.length,
    };
    setTextBlocks([...textBlocks, newBlock]);
  };

  const updateTextBlock = (id: string, updates: Partial<TextBlock>) => {
    setTextBlocks(blocks => 
      blocks.map(block => 
        block.id === id ? { ...block, ...updates } : block
      )
    );
  };

  const removeTextBlock = (id: string) => {
    if (textBlocks.length === 1) {
      Alert.alert('Cannot Delete', 'You must have at least one text block.');
      return;
    }
    setTextBlocks(blocks => blocks.filter(block => block.id !== id));
  };

  const generateAudio = async (blockId: string) => {
    setIsGenerating(true);
    setGenerationProgress(0);
    
    try {
      // Simulate generation progress
      for (let i = 0; i <= 100; i += 10) {
        setGenerationProgress(i);
        await new Promise(resolve => setTimeout(resolve, 200));
      }
      
      // Update block with mock audio data
      updateTextBlock(blockId, {
        audioUrl: `https://mock-audio-${blockId}.mp3`,
        duration: Math.random() * 30 + 10,
      });
      
      Alert.alert('Success', 'Audio generated successfully!');
    } catch (error) {
      Alert.alert('Error', 'Failed to generate audio. Please try again.');
    } finally {
      setIsGenerating(false);
      setGenerationProgress(0);
    }
  };

  const handleExport = () => {
    const blocksWithAudio = textBlocks.filter(block => block.audioUrl);
    if (blocksWithAudio.length === 0) {
      Alert.alert('No Audio', 'Please generate audio for at least one block before exporting.');
      return;
    }
    setShowExportDialog(true);
  };

  const openControls = (blockId: string) => {
    setSelectedBlockId(blockId);
    setShowControlsModal(true);
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}
        >
          <MaterialIcons name="arrow-back" size={24} color="#374151" />
        </TouchableOpacity>
        
        <View style={styles.headerContent}>
          <TextInput
            style={styles.titleInput}
            value={projectMetadata.title}
            onChangeText={(text) => setProjectMetadata(prev => ({ ...prev, title: text }))}
            placeholder="Project Title"
            placeholderTextColor="#9ca3af"
          />
        </View>

        <TouchableOpacity
          style={styles.exportButton}
          onPress={handleExport}
          activeOpacity={0.7}
        >
          <Text style={styles.exportButtonText}>Export</Text>
        </TouchableOpacity>
      </View>

      {/* Generation Progress */}
      {isGenerating && (
        <View style={styles.progressContainer}>
          <View style={styles.progressCard}>
            <View style={styles.progressHeader}>
              <MaterialIcons name="auto-awesome" size={20} color="#6366f1" />
              <Text style={styles.progressText}>Generating audio... {generationProgress}%</Text>
            </View>
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: `${generationProgress}%` }]} />
            </View>
          </View>
        </View>
      )}

      {/* Voice Selector */}
      <TouchableOpacity
        style={styles.voiceSelector}
        onPress={() => setShowVoiceSelector(true)}
        activeOpacity={0.8}
      >
        <View style={styles.voiceInfo}>
          <View style={styles.voiceAvatar}>
            <MaterialIcons name="person" size={24} color="#6366f1" />
          </View>
          <View style={styles.voiceDetails}>
            <Text style={styles.voiceName}>
              {selectedVoice.name} ({selectedVoice.gender}) - {selectedVoice.language}
            </Text>
            <Text style={styles.voiceStyle}>
              {selectedVoice.style} • {selectedVoice.provider}
            </Text>
          </View>
        </View>
        <MaterialIcons name="keyboard-arrow-down" size={24} color="#6b7280" />
      </TouchableOpacity>

      {/* Project Stats */}
      <View style={styles.statsContainer}>
        <View style={styles.statsGrid}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{textBlocks.length}</Text>
            <Text style={styles.statLabel}>Blocks</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{stats.totalWords}</Text>
            <Text style={styles.statLabel}>Words</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{Math.floor(stats.totalDuration)}s</Text>
            <Text style={styles.statLabel}>Duration</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>
              {textBlocks.filter(b => b.audioUrl).length}
            </Text>
            <Text style={styles.statLabel}>Generated</Text>
          </View>
        </View>
      </View>

      {/* Global Controls */}
      <View style={styles.globalControls}>
        <TouchableOpacity style={styles.playAllButton} activeOpacity={0.8}>
          <LinearGradient
            colors={['#6366f1', '#8b5cf6']}
            style={styles.playAllGradient}
          >
            <MaterialIcons name="play-arrow" size={28} color="white" />
          </LinearGradient>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.generateAllButton}
          onPress={() => {
            textBlocks.forEach(block => {
              if (!block.audioUrl && block.content.trim()) {
                generateAudio(block.id);
              }
            });
          }}
          activeOpacity={0.8}
        >
          <Text style={styles.generateAllText}>Generate All Audio</Text>
        </TouchableOpacity>
      </View>

      {/* Text Blocks */}
      <ScrollView style={styles.blocksContainer} showsVerticalScrollIndicator={false}>
        <View style={styles.blocksHeader}>
          <Text style={styles.blocksTitle}>Script Blocks</Text>
          <Text style={styles.blocksSubtitle}>
            {stats.totalCharacters} characters • ~{Math.ceil(stats.totalCharacters / 150)} min read
          </Text>
        </View>

        {textBlocks
          .sort((a, b) => a.order - b.order)
          .map((block, index) => (
            <View key={block.id} style={styles.textBlockCard}>
              <View style={styles.blockHeader}>
                <Text style={styles.blockNumber}>Block {index + 1}</Text>
                <View style={styles.blockActions}>
                  <TouchableOpacity
                    style={styles.blockAction}
                    onPress={() => openControls(block.id)}
                    activeOpacity={0.7}
                  >
                    <MaterialIcons name="tune" size={20} color="#6b7280" />
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.blockAction}
                    onPress={() => removeTextBlock(block.id)}
                    activeOpacity={0.7}
                  >
                    <MaterialIcons name="delete" size={20} color="#ef4444" />
                  </TouchableOpacity>
                </View>
              </View>

              <TextInput
                style={styles.blockInput}
                value={block.content}
                onChangeText={(text) => updateTextBlock(block.id, { content: text })}
                placeholder="Enter your text here..."
                placeholderTextColor="#9ca3af"
                multiline
                textAlignVertical="top"
              />

              {block.audioUrl && (
                <View style={styles.audioPreview}>
                  <View style={styles.waveform}>
                    {Array.from({ length: 20 }).map((_, i) => (
                      <View
                        key={i}
                        style={[
                          styles.waveformBar,
                          { height: Math.random() * 20 + 4 },
                        ]}
                      />
                    ))}
                  </View>
                  <TouchableOpacity style={styles.playButton} activeOpacity={0.8}>
                    <MaterialIcons name="play-arrow" size={24} color="#6366f1" />
                  </TouchableOpacity>
                  <Text style={styles.audioDuration}>
                    {Math.floor(block.duration || 0)}s
                  </Text>
                </View>
              )}

              {!block.audioUrl && block.content.trim() && (
                <TouchableOpacity
                  style={styles.generateButton}
                  onPress={() => generateAudio(block.id)}
                  activeOpacity={0.8}
                >
                  <MaterialIcons name="auto-awesome" size={16} color="#6366f1" />
                  <Text style={styles.generateButtonText}>Generate Audio</Text>
                </TouchableOpacity>
              )}
            </View>
          ))}

        {/* Add Block Button */}
        <TouchableOpacity
          style={styles.addBlockButton}
          onPress={addTextBlock}
          activeOpacity={0.8}
        >
          <MaterialIcons name="add" size={24} color="#6366f1" />
          <Text style={styles.addBlockText}>Add a Block</Text>
        </TouchableOpacity>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Voice Selector Modal */}
      <Modal
        visible={showVoiceSelector}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Select AI Voice</Text>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setShowVoiceSelector(false)}
              activeOpacity={0.7}
            >
              <MaterialIcons name="close" size={24} color="#374151" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.voicesList}>
            {voices.aiVoices.map((voice) => (
              <TouchableOpacity
                key={voice.id}
                style={[
                  styles.voiceOption,
                  selectedVoice.id === voice.id && styles.selectedVoiceOption,
                ]}
                onPress={() => {
                  setSelectedVoice(voice);
                  setShowVoiceSelector(false);
                }}
                activeOpacity={0.8}
              >
                <View style={styles.voiceOptionAvatar}>
                  <MaterialIcons name="person" size={24} color="#6366f1" />
                </View>
                <View style={styles.voiceOptionDetails}>
                  <Text style={styles.voiceOptionName}>
                    {voice.name} ({voice.gender})
                  </Text>
                  <Text style={styles.voiceOptionInfo}>
                    {voice.language} • {voice.style}
                  </Text>
                </View>
                {selectedVoice.id === voice.id && (
                  <MaterialIcons name="check-circle" size={24} color="#6366f1" />
                )}
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </Modal>

      {/* Controls Modal */}
      <Modal
        visible={showControlsModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Audio Controls</Text>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setShowControlsModal(false)}
              activeOpacity={0.7}
            >
              <MaterialIcons name="close" size={24} color="#374151" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.controlsContent}>
            <Text style={styles.controlsNote}>
              Advanced audio controls coming soon! This will include pitch, speed, 
              volume adjustments, and pause insertion capabilities.
            </Text>
          </ScrollView>
        </View>
      </Modal>

      {/* Export Modal */}
      <Modal
        visible={showExportDialog}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Export Audio</Text>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setShowExportDialog(false)}
              activeOpacity={0.7}
            >
              <MaterialIcons name="close" size={24} color="#374151" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.exportContent}>
            <Text style={styles.exportNote}>
              Export functionality coming soon! You'll be able to export your 
              generated audio in various formats including MP3, WAV, AAC, and FLAC.
            </Text>
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 60,
    paddingBottom: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  backButton: {
    marginRight: 12,
    padding: 8,
  },
  headerContent: {
    flex: 1,
  },
  titleInput: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
    padding: 0,
  },
  exportButton: {
    backgroundColor: '#6366f1',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  exportButtonText: {
    color: 'white',
    fontWeight: '600',
  },
  progressContainer: {
    padding: 16,
    backgroundColor: '#fef3c7',
    marginHorizontal: 16,
    marginTop: 8,
    borderRadius: 12,
  },
  progressCard: {
    alignItems: 'center',
  },
  progressHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  progressText: {
    marginLeft: 8,
    fontSize: 14,
    fontWeight: '500',
    color: '#92400e',
  },
  progressBar: {
    width: '100%',
    height: 4,
    backgroundColor: '#fbbf24',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#d97706',
  },
  voiceSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'white',
    marginHorizontal: 16,
    marginTop: 8,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  voiceInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  voiceAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#e0e7ff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  voiceDetails: {
    flex: 1,
  },
  voiceName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#111827',
  },
  voiceStyle: {
    fontSize: 12,
    color: '#6b7280',
  },
  statsContainer: {
    backgroundColor: 'white',
    marginHorizontal: 16,
    marginTop: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  statsGrid: {
    flexDirection: 'row',
    padding: 16,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#6366f1',
  },
  statLabel: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 2,
  },
  globalControls: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    marginHorizontal: 16,
    marginTop: 8,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  playAllButton: {
    marginRight: 16,
    borderRadius: 32,
    overflow: 'hidden',
  },
  playAllGradient: {
    width: 64,
    height: 64,
    justifyContent: 'center',
    alignItems: 'center',
  },
  generateAllButton: {
    flex: 1,
    backgroundColor: '#f3f4f6',
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  generateAllText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
  },
  blocksContainer: {
    flex: 1,
    paddingHorizontal: 16,
  },
  blocksHeader: {
    paddingVertical: 16,
  },
  blocksTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  blocksSubtitle: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 4,
  },
  textBlockCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  blockHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  blockNumber: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6b7280',
  },
  blockActions: {
    flexDirection: 'row',
  },
  blockAction: {
    marginLeft: 12,
    padding: 4,
  },
  blockInput: {
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#111827',
    minHeight: 100,
    backgroundColor: '#f9fafb',
    textAlignVertical: 'top',
  },
  audioPreview: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    padding: 8,
    backgroundColor: '#f0f4ff',
    borderRadius: 8,
  },
  waveform: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    height: 24,
    marginRight: 12,
  },
  waveformBar: {
    width: 2,
    backgroundColor: '#6366f1',
    marginHorizontal: 1,
    borderRadius: 1,
  },
  playButton: {
    marginRight: 8,
  },
  audioDuration: {
    fontSize: 12,
    color: '#6b7280',
  },
  generateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#e0e7ff',
    paddingVertical: 8,
    borderRadius: 8,
    marginTop: 12,
  },
  generateButtonText: {
    fontSize: 14,
    color: '#6366f1',
    fontWeight: '500',
    marginLeft: 8,
  },
  addBlockButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'white',
    paddingVertical: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#e5e7eb',
    borderStyle: 'dashed',
    marginBottom: 16,
  },
  addBlockText: {
    fontSize: 16,
    color: '#6366f1',
    fontWeight: '500',
    marginLeft: 8,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'white',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  closeButton: {
    padding: 8,
  },
  voicesList: {
    flex: 1,
    paddingHorizontal: 20,
  },
  voiceOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  selectedVoiceOption: {
    backgroundColor: '#f0f4ff',
  },
  voiceOptionAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#e0e7ff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  voiceOptionDetails: {
    flex: 1,
  },
  voiceOptionName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#111827',
  },
  voiceOptionInfo: {
    fontSize: 14,
    color: '#6b7280',
  },
  controlsContent: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  controlsNote: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 24,
  },
  exportContent: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  exportNote: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 24,
  },
});

export default EnhancedTTSEditorScreen;