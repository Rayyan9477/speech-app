import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Alert,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import * as DocumentPicker from 'expo-document-picker';

const VoiceCloningUploadScreen = () => {
  const navigation = useNavigation();
  const [selectedFile, setSelectedFile] = useState<any>(null);

  const handleFileSelect = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['audio/*'],
        copyToCacheDirectory: true,
      });

      if (result.type === 'success') {
        setSelectedFile(result);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to select audio file');
    }
  };

  const handleContinue = () => {
    if (!selectedFile) {
      Alert.alert('Error', 'Please select an audio file first');
      return;
    }

    navigation.navigate('VoiceCloningRecord', { audioFile: selectedFile });
  };

  const handleRecordInstead = () => {
    navigation.navigate('VoiceCloningRecord');
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <MaterialIcons name="arrow-back" size={24} color="#6B7280" />
        </TouchableOpacity>
        <Text style={styles.title}>Add New Voice</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* Content */}
      <View style={styles.content}>
        <Text style={styles.subtitle}>Upload Voice Sample</Text>
        <Text style={styles.description}>
          Upload a high-quality audio sample of the voice you want to clone.
          The sample should be clear and contain only the target voice.
        </Text>

        {/* Upload Area */}
        {!selectedFile ? (
          <TouchableOpacity style={styles.uploadArea} onPress={handleFileSelect}>
            <MaterialIcons name="cloud-upload" size={64} color="#5546FF" />
            <Text style={styles.uploadTitle}>Select Audio File</Text>
            <Text style={styles.uploadSubtitle}>MP3, WAV, M4A supported</Text>
            <Text style={styles.uploadHint}>Tap to browse files</Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.selectedFile}>
            <MaterialIcons name="audiotrack" size={48} color="#22C55E" />
            <View style={styles.fileInfo}>
              <Text style={styles.fileName}>{selectedFile.name}</Text>
              <Text style={styles.fileSize}>
                {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
              </Text>
            </View>
            <TouchableOpacity
              style={styles.changeFileButton}
              onPress={handleFileSelect}
            >
              <MaterialIcons name="edit" size={20} color="#5546FF" />
            </TouchableOpacity>
          </View>
        )}

        {/* Requirements */}
        <View style={styles.requirements}>
          <Text style={styles.requirementsTitle}>Audio Requirements:</Text>
          <View style={styles.requirementItem}>
            <MaterialIcons name="check-circle" size={16} color="#22C55E" />
            <Text style={styles.requirementText}>Clear audio quality</Text>
          </View>
          <View style={styles.requirementItem}>
            <MaterialIcons name="check-circle" size={16} color="#22C55E" />
            <Text style={styles.requirementText}>Only target voice speaking</Text>
          </View>
          <View style={styles.requirementItem}>
            <MaterialIcons name="check-circle" size={16} color="#22C55E" />
            <Text style={styles.requirementText}>At least 30 seconds of audio</Text>
          </View>
          <View style={styles.requirementItem}>
            <MaterialIcons name="check-circle" size={16} color="#22C55E" />
            <Text style={styles.requirementText}>No background noise</Text>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actions}>
          <TouchableOpacity
            style={styles.recordButton}
            onPress={handleRecordInstead}
          >
            <MaterialIcons name="mic" size={20} color="#5546FF" />
            <Text style={styles.recordButtonText}>Record Instead</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.continueButton,
              !selectedFile && styles.disabledButton,
            ]}
            onPress={handleContinue}
            disabled={!selectedFile}
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
  uploadArea: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 40,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    marginBottom: 32,
  },
  uploadTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginTop: 16,
    marginBottom: 4,
  },
  uploadSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 8,
  },
  uploadHint: {
    fontSize: 14,
    color: '#5546FF',
    fontWeight: '500',
  },
  selectedFile: {
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
    marginBottom: 32,
  },
  fileInfo: {
    flex: 1,
    marginLeft: 16,
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
  changeFileButton: {
    padding: 8,
  },
  requirements: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    marginBottom: 32,
  },
  requirementsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 16,
  },
  requirementItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  requirementText: {
    fontSize: 14,
    color: '#6B7280',
    marginLeft: 8,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  recordButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
  },
  recordButtonText: {
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
});

export default VoiceCloningUploadScreen;
