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
  FlatList,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';

const { width } = Dimensions.get('window');
const cardWidth = (width - 48) / 2;

interface Voice {
  id: string;
  name: string;
  language: string;
  gender: string;
  style: string;
  avatar?: string;
  audioUrl?: string;
  duration?: number;
  createdAt: Date;
  isProcessing?: boolean;
  progress?: number;
}

const VoiceManagementScreen = () => {
  const navigation = useNavigation();
  const [voices, setVoices] = useState<Voice[]>([
    {
      id: '1',
      name: 'My Voice Clone',
      language: 'English',
      gender: 'Female',
      style: 'Natural',
      audioUrl: 'mock-audio.mp3',
      duration: 45,
      createdAt: new Date(),
    },
    {
      id: '2',
      name: 'Professional Narrator',
      language: 'English',
      gender: 'Male',
      style: 'Professional',
      audioUrl: 'mock-audio-2.mp3',
      duration: 32,
      createdAt: new Date(),
    },
  ]);
  
  const [showAddVoiceModal, setShowAddVoiceModal] = useState(false);
  const [showOptionsModal, setShowOptionsModal] = useState(false);
  const [selectedVoice, setSelectedVoice] = useState<Voice | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);

  const filteredVoices = voices.filter(voice =>
    voice.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    voice.language.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const startRecording = () => {
    setIsRecording(true);
    setRecordingDuration(0);
    
    // Simulate recording timer
    const timer = setInterval(() => {
      setRecordingDuration(prev => {
        if (prev >= 30) {
          stopRecording();
          return prev;
        }
        return prev + 1;
      });
    }, 1000);
    
    // Auto stop after 30 seconds
    setTimeout(() => {
      clearInterval(timer);
      stopRecording();
    }, 30000);
  };

  const stopRecording = () => {
    setIsRecording(false);
    if (recordingDuration > 3) {
      // Process the recorded voice
      const newVoice: Voice = {
        id: Date.now().toString(),
        name: `New Voice ${voices.length + 1}`,
        language: 'English',
        gender: 'Unknown',
        style: 'Custom',
        audioUrl: 'recorded-voice.mp3',
        duration: recordingDuration,
        createdAt: new Date(),
        isProcessing: true,
        progress: 0,
      };
      
      setVoices(prev => [...prev, newVoice]);
      setShowAddVoiceModal(false);
      simulateProcessing(newVoice.id);
    }
    setRecordingDuration(0);
  };

  const simulateProcessing = (voiceId: string) => {
    let progress = 0;
    const interval = setInterval(() => {
      progress += 10;
      setVoices(prev => prev.map(voice => 
        voice.id === voiceId 
          ? { ...voice, progress }
          : voice
      ));
      
      if (progress >= 100) {
        clearInterval(interval);
        setVoices(prev => prev.map(voice => 
          voice.id === voiceId 
            ? { ...voice, isProcessing: false, progress: undefined }
            : voice
        ));
        Alert.alert('Success', 'Voice processing completed!');
      }
    }, 500);
  };

  const handleVoiceOptions = (voice: Voice) => {
    setSelectedVoice(voice);
    setShowOptionsModal(true);
  };

  const handleDeleteVoice = () => {
    if (!selectedVoice) return;
    
    Alert.alert(
      'Delete Voice',
      `Are you sure you want to delete "${selectedVoice.name}"? This action cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            setVoices(prev => prev.filter(voice => voice.id !== selectedVoice.id));
            setShowOptionsModal(false);
            setSelectedVoice(null);
          },
        },
      ]
    );
  };

  const handleRenameVoice = () => {
    if (!selectedVoice) return;
    
    Alert.prompt(
      'Rename Voice',
      'Enter a new name for this voice:',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Rename',
          onPress: (newName) => {
            if (newName && newName.trim()) {
              setVoices(prev => prev.map(voice => 
                voice.id === selectedVoice.id 
                  ? { ...voice, name: newName.trim() }
                  : voice
              ));
              setShowOptionsModal(false);
              setSelectedVoice(null);
            }
          },
        },
      ],
      'plain-text',
      selectedVoice.name
    );
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const renderVoiceCard = ({ item: voice, index }: { item: Voice; index: number }) => (
    <View style={[styles.voiceCard, { width: cardWidth }]}>
      {voice.isProcessing && (
        <View style={styles.processingOverlay}>
          <MaterialIcons name="auto-awesome" size={24} color="#6366f1" />
          <Text style={styles.processingText}>Processing...</Text>
          <View style={styles.progressBarContainer}>
            <View style={[styles.progressBarFill, { width: `${voice.progress || 0}%` }]} />
          </View>
        </View>
      )}
      
      <View style={styles.voiceCardHeader}>
        <View style={styles.voiceAvatar}>
          <MaterialIcons name="mic" size={24} color="#6366f1" />
        </View>
        <TouchableOpacity
          style={styles.voiceOptionsButton}
          onPress={() => handleVoiceOptions(voice)}
          activeOpacity={0.7}
        >
          <MaterialIcons name="more-vert" size={20} color="#6b7280" />
        </TouchableOpacity>
      </View>

      <Text style={styles.voiceName}>{voice.name}</Text>
      <Text style={styles.voiceDetails}>
        {voice.language} • {voice.gender} • {voice.style}
      </Text>
      
      {voice.audioUrl && (
        <View style={styles.voiceAudioInfo}>
          <MaterialIcons name="volume-up" size={16} color="#6b7280" />
          <Text style={styles.voiceAudioDuration}>
            {formatDuration(voice.duration || 0)}
          </Text>
        </View>
      )}

      <TouchableOpacity 
        style={styles.voicePlayButton}
        activeOpacity={0.8}
        disabled={voice.isProcessing}
      >
        <LinearGradient
          colors={voice.isProcessing ? ['#e5e7eb', '#d1d5db'] : ['#6366f1', '#8b5cf6']}
          style={styles.voicePlayGradient}
        >
          <MaterialIcons 
            name="play-arrow" 
            size={20} 
            color={voice.isProcessing ? '#9ca3af' : 'white'} 
          />
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );

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
          <Text style={styles.headerTitle}>My Voices</Text>
          <Text style={styles.headerSubtitle}>{voices.length} custom voices</Text>
        </View>

        <TouchableOpacity
          style={styles.addButton}
          onPress={() => setShowAddVoiceModal(true)}
          activeOpacity={0.7}
        >
          <MaterialIcons name="add" size={24} color="#6366f1" />
        </TouchableOpacity>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <MaterialIcons name="search" size={20} color="#9ca3af" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search voices..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor="#9ca3af"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity
              onPress={() => setSearchQuery('')}
              activeOpacity={0.7}
            >
              <MaterialIcons name="close" size={20} color="#9ca3af" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Voices Grid */}
      <FlatList
        data={filteredVoices}
        renderItem={renderVoiceCard}
        numColumns={2}
        columnWrapperStyle={styles.voicesRow}
        contentContainerStyle={styles.voicesContainer}
        showsVerticalScrollIndicator={false}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={() => (
          <View style={styles.emptyContainer}>
            <MaterialIcons name="mic-none" size={64} color="#d1d5db" />
            <Text style={styles.emptyTitle}>No voices found</Text>
            <Text style={styles.emptySubtitle}>
              {searchQuery 
                ? 'Try adjusting your search terms'
                : 'Create your first custom voice to get started'
              }
            </Text>
            {!searchQuery && (
              <TouchableOpacity
                style={styles.emptyAction}
                onPress={() => setShowAddVoiceModal(true)}
                activeOpacity={0.8}
              >
                <Text style={styles.emptyActionText}>Add Voice</Text>
              </TouchableOpacity>
            )}
          </View>
        )}
      />

      {/* Add Voice Modal */}
      <Modal
        visible={showAddVoiceModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Add New Voice</Text>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setShowAddVoiceModal(false)}
              activeOpacity={0.7}
            >
              <MaterialIcons name="close" size={24} color="#374151" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            {/* Upload Option */}
            <TouchableOpacity style={styles.addOption} activeOpacity={0.8}>
              <View style={styles.addOptionIcon}>
                <MaterialIcons name="upload-file" size={32} color="#6366f1" />
              </View>
              <View style={styles.addOptionContent}>
                <Text style={styles.addOptionTitle}>Upload Voice File</Text>
                <Text style={styles.addOptionDescription}>
                  Upload an existing audio recording to create a voice clone
                </Text>
              </View>
              <MaterialIcons name="arrow-forward-ios" size={16} color="#9ca3af" />
            </TouchableOpacity>

            {/* Record Option */}
            <TouchableOpacity 
              style={styles.addOption} 
              onPress={() => setShowAddVoiceModal(false)}
              activeOpacity={0.8}
            >
              <View style={styles.addOptionIcon}>
                <MaterialIcons name="mic" size={32} color="#ec4899" />
              </View>
              <View style={styles.addOptionContent}>
                <Text style={styles.addOptionTitle}>Record Voice</Text>
                <Text style={styles.addOptionDescription}>
                  Record a new voice sample directly from your device
                </Text>
              </View>
              <MaterialIcons name="arrow-forward-ios" size={16} color="#9ca3af" />
            </TouchableOpacity>

            {/* Recording Interface */}
            {isRecording && (
              <View style={styles.recordingInterface}>
                <View style={styles.recordingVisualizer}>
                  {Array.from({ length: 20 }).map((_, i) => (
                    <Animated.View
                      key={i}
                      style={[
                        styles.visualizerBar,
                        { height: Math.random() * 40 + 10 },
                      ]}
                    />
                  ))}
                </View>
                
                <Text style={styles.recordingTimer}>
                  {formatDuration(recordingDuration)}
                </Text>

                <TouchableOpacity
                  style={styles.stopButton}
                  onPress={stopRecording}
                  activeOpacity={0.8}
                >
                  <View style={styles.stopButtonInner} />
                </TouchableOpacity>
              </View>
            )}

            {/* Recording Tips */}
            <View style={styles.tipsContainer}>
              <MaterialIcons name="lightbulb" size={20} color="#f59e0b" />
              <View style={styles.tipsContent}>
                <Text style={styles.tipsTitle}>Recording Tips</Text>
                <View style={styles.tipsList}>
                  <Text style={styles.tipItem}>• Record in a quiet environment</Text>
                  <Text style={styles.tipItem}>• Speak clearly and naturally</Text>
                  <Text style={styles.tipItem}>• Record for at least 30 seconds</Text>
                  <Text style={styles.tipItem}>• Include varied emotions and tones</Text>
                </View>
              </View>
            </View>
          </ScrollView>
        </View>
      </Modal>

      {/* Voice Options Modal */}
      <Modal
        visible={showOptionsModal}
        animationType="fade"
        transparent={true}
      >
        <TouchableOpacity
          style={styles.modalBackdrop}
          onPress={() => setShowOptionsModal(false)}
          activeOpacity={1}
        >
          <View style={styles.optionsModal}>
            <TouchableOpacity
              style={styles.optionItem}
              onPress={() => {
                setShowOptionsModal(false);
                // Play voice
              }}
              activeOpacity={0.8}
            >
              <MaterialIcons name="play-arrow" size={24} color="#6366f1" />
              <Text style={styles.optionText}>Play Voice</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.optionItem}
              onPress={handleRenameVoice}
              activeOpacity={0.8}
            >
              <MaterialIcons name="edit" size={24} color="#6b7280" />
              <Text style={styles.optionText}>Rename</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.optionItem}
              onPress={() => {
                setShowOptionsModal(false);
                // Share voice
              }}
              activeOpacity={0.8}
            >
              <MaterialIcons name="share" size={24} color="#6b7280" />
              <Text style={styles.optionText}>Share</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.optionItem, styles.deleteOption]}
              onPress={handleDeleteVoice}
              activeOpacity={0.8}
            >
              <MaterialIcons name="delete" size={24} color="#ef4444" />
              <Text style={[styles.optionText, styles.deleteText]}>Delete</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
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
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  backButton: {
    marginRight: 16,
    padding: 8,
  },
  headerContent: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 2,
  },
  addButton: {
    padding: 8,
  },
  searchContainer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: 'white',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  searchInput: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
    color: '#111827',
  },
  voicesContainer: {
    padding: 16,
  },
  voicesRow: {
    justifyContent: 'space-between',
  },
  voiceCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    position: 'relative',
  },
  processingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  processingText: {
    fontSize: 14,
    color: '#6366f1',
    fontWeight: '500',
    marginTop: 8,
    marginBottom: 16,
  },
  progressBarContainer: {
    width: '80%',
    height: 4,
    backgroundColor: '#e5e7eb',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#6366f1',
  },
  voiceCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  voiceAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#e0e7ff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  voiceOptionsButton: {
    padding: 4,
  },
  voiceName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  voiceDetails: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 12,
  },
  voiceAudioInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  voiceAudioDuration: {
    fontSize: 12,
    color: '#6b7280',
    marginLeft: 4,
  },
  voicePlayButton: {
    borderRadius: 8,
    overflow: 'hidden',
    alignSelf: 'flex-start',
  },
  voicePlayGradient: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
    paddingVertical: 64,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#111827',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },
  emptyAction: {
    backgroundColor: '#6366f1',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  emptyActionText: {
    color: 'white',
    fontWeight: '600',
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
  modalContent: {
    flex: 1,
    paddingHorizontal: 20,
  },
  addOption: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    padding: 16,
    marginVertical: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  addOptionIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  addOptionContent: {
    flex: 1,
  },
  addOptionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  addOptionDescription: {
    fontSize: 14,
    color: '#6b7280',
    lineHeight: 20,
  },
  recordingInterface: {
    backgroundColor: '#f0f4ff',
    borderRadius: 16,
    padding: 24,
    marginVertical: 16,
    alignItems: 'center',
  },
  recordingVisualizer: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 60,
    marginBottom: 16,
  },
  visualizerBar: {
    width: 3,
    backgroundColor: '#6366f1',
    marginHorizontal: 1,
    borderRadius: 1.5,
  },
  recordingTimer: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#6366f1',
    marginBottom: 16,
  },
  stopButton: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#ef4444',
    justifyContent: 'center',
    alignItems: 'center',
  },
  stopButtonInner: {
    width: 24,
    height: 24,
    backgroundColor: 'white',
    borderRadius: 4,
  },
  tipsContainer: {
    flexDirection: 'row',
    backgroundColor: '#fef3c7',
    borderRadius: 12,
    padding: 16,
    marginTop: 16,
  },
  tipsContent: {
    flex: 1,
    marginLeft: 12,
  },
  tipsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#92400e',
    marginBottom: 8,
  },
  tipsList: {
    gap: 4,
  },
  tipItem: {
    fontSize: 12,
    color: '#b45309',
    lineHeight: 16,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  optionsModal: {
    backgroundColor: 'white',
    borderRadius: 16,
    margin: 20,
    paddingVertical: 8,
    minWidth: 200,
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  optionText: {
    fontSize: 16,
    color: '#374151',
    marginLeft: 16,
  },
  deleteOption: {
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
  },
  deleteText: {
    color: '#ef4444',
  },
});

export default VoiceManagementScreen;