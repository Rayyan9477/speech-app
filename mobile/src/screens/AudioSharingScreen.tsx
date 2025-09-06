import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Dimensions,
  TextInput,
  Image,
  Share,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';

const { width } = Dimensions.get('window');

interface RouteParams {
  audioTitle: string;
  duration: number;
  waveformData?: number[];
}

const AudioSharingScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { audioTitle, duration, waveformData } = route.params as RouteParams;

  const [shareMessage, setShareMessage] = useState('');
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([]);
  const [isSharing, setIsSharing] = useState(false);

  const platforms = [
    { id: 'whatsapp', name: 'WhatsApp', icon: 'message', color: '#25D366' },
    { id: 'facebook', name: 'Facebook', icon: 'facebook', color: '#1877F2' },
    { id: 'twitter', name: 'Twitter', icon: 'flutter-dash', color: '#1DA1F2' },
    { id: 'instagram', name: 'Instagram', icon: 'camera-alt', color: '#E4405F' },
    { id: 'linkedin', name: 'LinkedIn', icon: 'business', color: '#0A66C2' },
    { id: 'telegram', name: 'Telegram', icon: 'send', color: '#0088CC' },
    { id: 'email', name: 'Email', icon: 'email', color: '#EA4335' },
    { id: 'copy', name: 'Copy Link', icon: 'content-copy', color: '#6B7280' },
  ];

  const exportFormats = [
    { id: 'mp3', name: 'MP3', description: 'Best for sharing', size: '2.1 MB' },
    { id: 'wav', name: 'WAV', description: 'High quality', size: '8.5 MB' },
    { id: 'aac', name: 'AAC', description: 'Apple devices', size: '1.8 MB' },
    { id: 'flac', name: 'FLAC', description: 'Lossless quality', size: '15.2 MB' },
  ];

  const [selectedFormat, setSelectedFormat] = useState('mp3');

  const togglePlatform = (platformId: string) => {
    setSelectedPlatforms(prev =>
      prev.includes(platformId)
        ? prev.filter(id => id !== platformId)
        : [...prev, platformId]
    );
  };

  const handleNativeShare = async () => {
    try {
      setIsSharing(true);
      
      const message = shareMessage || `Check out this audio: ${audioTitle}`;
      
      const result = await Share.share({
        message,
        title: audioTitle,
        url: 'https://example.com/audio/sample', // In real app, this would be actual audio URL
      });

      if (result.action === Share.sharedAction) {
        Alert.alert('Success', 'Audio shared successfully!');
        navigation.goBack();
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to share audio');
    } finally {
      setIsSharing(false);
    }
  };

  const handlePlatformShare = (platform: string) => {
    Alert.alert(
      'Share to ' + platforms.find(p => p.id === platform)?.name,
      'This would open the respective app for sharing',
      [{ text: 'OK' }]
    );
  };

  const handleExportAndShare = () => {
    if (selectedPlatforms.length === 0) {
      Alert.alert('Select Platform', 'Please select at least one platform to share');
      return;
    }

    Alert.alert(
      'Export & Share',
      `Export as ${selectedFormat.toUpperCase()} and share to ${selectedPlatforms.length} platform(s)?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Export & Share',
          onPress: () => {
            setIsSharing(true);
            // Simulate export and share process
            setTimeout(() => {
              setIsSharing(false);
              Alert.alert('Success', 'Audio exported and shared successfully!');
              navigation.goBack();
            }, 3000);
          },
        },
      ]
    );
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const renderWaveformPreview = () => {
    const bars = waveformData || Array.from({ length: 30 }, () => Math.random() * 0.8 + 0.2);
    
    return (
      <View style={styles.waveformPreview}>
        {bars.slice(0, 30).map((height, index) => (
          <View
            key={index}
            style={[
              styles.waveformBar,
              { height: height * 40 + 10 }
            ]}
          />
        ))}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <MaterialIcons name="arrow-back" size={24} color="#374151" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Share Audio</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Audio Preview */}
        <View style={styles.previewContainer}>
          <View style={styles.audioPreview}>
            <View style={styles.previewHeader}>
              <MaterialIcons name="audiotrack" size={32} color="#6366f1" />
              <View style={styles.previewInfo}>
                <Text style={styles.previewTitle} numberOfLines={2}>
                  {audioTitle}
                </Text>
                <Text style={styles.previewDuration}>
                  Duration: {formatTime(duration)}
                </Text>
              </View>
            </View>
            
            {renderWaveformPreview()}
            
            <TouchableOpacity style={styles.playPreviewButton}>
              <MaterialIcons name="play-arrow" size={20} color="white" />
              <Text style={styles.playPreviewText}>Preview</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Share Message */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Share Message</Text>
          <Text style={styles.sectionSubtitle}>Add a personal message (optional)</Text>
          
          <TextInput
            style={styles.messageInput}
            placeholder={`Check out this audio: ${audioTitle}`}
            value={shareMessage}
            onChangeText={setShareMessage}
            multiline
            numberOfLines={3}
            placeholderTextColor="#9ca3af"
          />
        </View>

        {/* Export Format */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Export Format</Text>
          <Text style={styles.sectionSubtitle}>Choose the best format for your needs</Text>
          
          <View style={styles.formatGrid}>
            {exportFormats.map((format) => (
              <TouchableOpacity
                key={format.id}
                style={[
                  styles.formatCard,
                  selectedFormat === format.id && styles.selectedFormatCard,
                ]}
                onPress={() => setSelectedFormat(format.id)}
              >
                <Text style={[
                  styles.formatName,
                  selectedFormat === format.id && styles.selectedFormatName,
                ]}>
                  {format.name}
                </Text>
                <Text style={styles.formatDescription}>{format.description}</Text>
                <Text style={styles.formatSize}>{format.size}</Text>
                
                {selectedFormat === format.id && (
                  <View style={styles.selectedIndicator}>
                    <MaterialIcons name="check-circle" size={20} color="#6366f1" />
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Platform Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Share Platforms</Text>
          <Text style={styles.sectionSubtitle}>Select where you want to share</Text>
          
          <View style={styles.platformsGrid}>
            {platforms.map((platform) => (
              <TouchableOpacity
                key={platform.id}
                style={[
                  styles.platformCard,
                  selectedPlatforms.includes(platform.id) && styles.selectedPlatformCard,
                ]}
                onPress={() => togglePlatform(platform.id)}
              >
                <View style={[styles.platformIcon, { backgroundColor: platform.color }]}>
                  <MaterialIcons name={platform.icon as any} size={24} color="white" />
                </View>
                <Text style={[
                  styles.platformName,
                  selectedPlatforms.includes(platform.id) && styles.selectedPlatformName,
                ]}>
                  {platform.name}
                </Text>
                
                {selectedPlatforms.includes(platform.id) && (
                  <View style={styles.platformSelectedBadge}>
                    <MaterialIcons name="check" size={16} color="white" />
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Quick Share Options */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Share</Text>
          <Text style={styles.sectionSubtitle}>Use device's native share menu</Text>
          
          <TouchableOpacity
            style={styles.quickShareButton}
            onPress={handleNativeShare}
            disabled={isSharing}
          >
            <MaterialIcons name="share" size={20} color="#6366f1" />
            <Text style={styles.quickShareText}>Open Share Menu</Text>
            <MaterialIcons name="arrow-forward" size={20} color="#6366f1" />
          </TouchableOpacity>
        </View>

        {/* Share Statistics */}
        <View style={styles.statsContainer}>
          <View style={styles.statsCard}>
            <MaterialIcons name="bar-chart" size={24} color="#10b981" />
            <View style={styles.statsContent}>
              <Text style={styles.statsTitle}>Sharing Tips</Text>
              <View style={styles.statsList}>
                <Text style={styles.statsItem}>• MP3 format works best for most platforms</Text>
                <Text style={styles.statsItem}>• Add hashtags to increase visibility</Text>
                <Text style={styles.statsItem}>• Tag relevant people to expand reach</Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Bottom Actions */}
      <View style={styles.bottomContainer}>
        <TouchableOpacity
          style={[
            styles.shareButton,
            (selectedPlatforms.length === 0 || isSharing) && styles.disabledButton,
          ]}
          onPress={handleExportAndShare}
          disabled={selectedPlatforms.length === 0 || isSharing}
        >
          <LinearGradient
            colors={
              selectedPlatforms.length > 0 && !isSharing
                ? ['#6366f1', '#8b5cf6']
                : ['#e5e7eb', '#d1d5db']
            }
            style={styles.shareButtonGradient}
          >
            {isSharing ? (
              <>
                <MaterialIcons name="hourglass-empty" size={20} color="#9ca3af" />
                <Text style={styles.disabledButtonText}>Sharing...</Text>
              </>
            ) : (
              <>
                <Text style={[
                  styles.shareButtonText,
                  selectedPlatforms.length === 0 && styles.disabledButtonText,
                ]}>
                  Export & Share ({selectedPlatforms.length})
                </Text>
                <MaterialIcons 
                  name="send" 
                  size={20} 
                  color={selectedPlatforms.length > 0 ? 'white' : '#9ca3af'} 
                />
              </>
            )}
          </LinearGradient>
        </TouchableOpacity>

        {selectedPlatforms.length === 0 && (
          <Text style={styles.validationText}>
            Please select at least one platform to share
          </Text>
        )}
      </View>
    </SafeAreaView>
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
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
  },
  placeholder: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  previewContainer: {
    padding: 20,
  },
  audioPreview: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  previewHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  previewInfo: {
    flex: 1,
    marginLeft: 12,
  },
  previewTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  previewDuration: {
    fontSize: 14,
    color: '#6b7280',
  },
  waveformPreview: {
    flexDirection: 'row',
    alignItems: 'end',
    height: 50,
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  waveformBar: {
    width: 3,
    backgroundColor: '#6366f1',
    borderRadius: 2,
    opacity: 0.7,
  },
  playPreviewButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#6366f1',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignSelf: 'center',
  },
  playPreviewText: {
    color: 'white',
    fontWeight: '500',
    marginLeft: 4,
  },
  section: {
    padding: 20,
    backgroundColor: 'white',
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 16,
  },
  messageInput: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#111827',
    backgroundColor: '#f9fafb',
    minHeight: 80,
    textAlignVertical: 'top',
  },
  formatGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  formatCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    position: 'relative',
  },
  selectedFormatCard: {
    backgroundColor: '#f0f4ff',
    borderColor: '#6366f1',
  },
  formatName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  selectedFormatName: {
    color: '#6366f1',
  },
  formatDescription: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 4,
  },
  formatSize: {
    fontSize: 12,
    color: '#9ca3af',
    fontWeight: '500',
  },
  selectedIndicator: {
    position: 'absolute',
    top: 12,
    right: 12,
  },
  platformsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  platformCard: {
    alignItems: 'center',
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    minWidth: '22%',
    position: 'relative',
  },
  selectedPlatformCard: {
    backgroundColor: '#f0f4ff',
    borderColor: '#6366f1',
  },
  platformIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  platformName: {
    fontSize: 12,
    color: '#6b7280',
    textAlign: 'center',
    fontWeight: '500',
  },
  selectedPlatformName: {
    color: '#6366f1',
  },
  platformSelectedBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: '#6366f1',
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  quickShareButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  quickShareText: {
    flex: 1,
    fontSize: 16,
    color: '#6366f1',
    fontWeight: '500',
    marginLeft: 12,
  },
  statsContainer: {
    padding: 20,
  },
  statsCard: {
    flexDirection: 'row',
    backgroundColor: '#f0fdf4',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#bbf7d0',
  },
  statsContent: {
    flex: 1,
    marginLeft: 12,
  },
  statsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#065f46',
    marginBottom: 8,
  },
  statsList: {
    gap: 4,
  },
  statsItem: {
    fontSize: 12,
    color: '#047857',
    lineHeight: 16,
  },
  bottomContainer: {
    padding: 20,
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  shareButton: {
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  disabledButton: {
    shadowOpacity: 0,
    elevation: 0,
  },
  shareButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
  },
  shareButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
    marginRight: 8,
  },
  disabledButtonText: {
    color: '#9ca3af',
  },
  validationText: {
    fontSize: 12,
    color: '#9ca3af',
    textAlign: 'center',
    marginTop: 12,
  },
});

export default AudioSharingScreen;