import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  Alert,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

const CreateProjectScreen = () => {
  const navigation = useNavigation();
  const [projectData, setProjectData] = useState({
    title: '',
    description: '',
    type: 'TTS',
    tags: [] as string[],
  });
  const [tagInput, setTagInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const projectTypes = [
    { id: 'TTS', name: 'Text to Speech', icon: 'volume-up', description: 'Convert text to natural speech' },
    { id: 'Voice Changer', name: 'Voice Changer', icon: 'mic', description: 'Modify voice characteristics' },
    { id: 'Translation', name: 'Voice Translation', icon: 'translate', description: 'Translate speech across languages' },
    { id: 'Voice Cloning', name: 'Voice Cloning', icon: 'content-copy', description: 'Clone and recreate voices' },
  ];

  const handleInputChange = (field: string, value: string) => {
    setProjectData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleTypeSelect = (type: string) => {
    setProjectData(prev => ({
      ...prev,
      type,
    }));
  };

  const handleAddTag = () => {
    if (tagInput.trim() && !projectData.tags.includes(tagInput.trim())) {
      setProjectData(prev => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()],
      }));
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setProjectData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove),
    }));
  };

  const handleCreateProject = async () => {
    if (!projectData.title.trim()) {
      Alert.alert('Error', 'Please enter a project title');
      return;
    }

    setIsLoading(true);
    try {
      // TODO: Integrate with backend API
      await new Promise(resolve => setTimeout(resolve, 1500));

      Alert.alert('Success', 'Project created successfully!', [
        {
          text: 'Continue',
          onPress: () => {
            navigation.goBack();
            // Navigate to project detail or refresh projects list
          },
        },
      ]);
    } catch (error) {
      Alert.alert('Error', 'Failed to create project');
    } finally {
      setIsLoading(false);
    }
  };

  const selectedType = projectTypes.find(type => type.id === projectData.type);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <MaterialIcons name="arrow-back" size={24} color="#6B7280" />
          </TouchableOpacity>
          <Text style={styles.title}>Create New Project</Text>
          <View style={{ width: 24 }} />
        </View>

        {/* Project Type Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Project Type</Text>
          <View style={styles.typeGrid}>
            {projectTypes.map((type) => (
              <TouchableOpacity
                key={type.id}
                style={[
                  styles.typeCard,
                  projectData.type === type.id && styles.selectedTypeCard,
                ]}
                onPress={() => handleTypeSelect(type.id)}
              >
                <View style={styles.typeIcon}>
                  <MaterialIcons
                    name={type.icon as any}
                    size={24}
                    color={projectData.type === type.id ? '#FFFFFF' : '#5546FF'}
                  />
                </View>
                <Text
                  style={[
                    styles.typeName,
                    projectData.type === type.id && styles.selectedTypeText,
                  ]}
                >
                  {type.name}
                </Text>
                <Text
                  style={[
                    styles.typeDescription,
                    projectData.type === type.id && styles.selectedTypeText,
                  ]}
                >
                  {type.description}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Project Details */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Project Details</Text>

          {/* Title */}
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Project Title</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter project title"
              value={projectData.title}
              onChangeText={(value) => handleInputChange('title', value)}
              maxLength={100}
            />
          </View>

          {/* Description */}
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Description (Optional)</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Describe your project..."
              value={projectData.description}
              onChangeText={(value) => handleInputChange('description', value)}
              multiline
              numberOfLines={4}
              maxLength={500}
            />
          </View>

          {/* Tags */}
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Tags (Optional)</Text>
            <View style={styles.tagInputContainer}>
              <TextInput
                style={styles.tagInput}
                placeholder="Add a tag..."
                value={tagInput}
                onChangeText={setTagInput}
                onSubmitEditing={handleAddTag}
                maxLength={20}
              />
              <TouchableOpacity style={styles.addTagButton} onPress={handleAddTag}>
                <MaterialIcons name="add" size={20} color="#FFFFFF" />
              </TouchableOpacity>
            </View>

            {/* Tag List */}
            {projectData.tags.length > 0 && (
              <View style={styles.tagList}>
                {projectData.tags.map((tag, index) => (
                  <View key={index} style={styles.tag}>
                    <Text style={styles.tagText}>{tag}</Text>
                    <TouchableOpacity
                      style={styles.removeTagButton}
                      onPress={() => handleRemoveTag(tag)}
                    >
                      <MaterialIcons name="close" size={14} color="#6B7280" />
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            )}
          </View>
        </View>

        {/* Selected Type Info */}
        {selectedType && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Selected Configuration</Text>
            <View style={styles.selectedTypeInfo}>
              <View style={styles.selectedTypeHeader}>
                <MaterialIcons name={selectedType.icon as any} size={24} color="#5546FF" />
                <Text style={styles.selectedTypeTitle}>{selectedType.name}</Text>
              </View>
              <Text style={styles.selectedTypeDesc}>{selectedType.description}</Text>
            </View>
          </View>
        )}

        {/* Create Button */}
        <View style={styles.section}>
          <TouchableOpacity
            style={[
              styles.createButton,
              (!projectData.title.trim() || isLoading) && styles.disabledButton,
            ]}
            onPress={handleCreateProject}
            disabled={!projectData.title.trim() || isLoading}
          >
            <Text style={styles.createButtonText}>
              {isLoading ? 'Creating...' : 'Create Project'}
            </Text>
          </TouchableOpacity>
        </View>
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
  section: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 16,
  },
  typeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  typeCard: {
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
  selectedTypeCard: {
    backgroundColor: '#5546FF',
  },
  typeIcon: {
    marginBottom: 8,
  },
  typeName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
    textAlign: 'center',
  },
  typeDescription: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 16,
  },
  selectedTypeText: {
    color: '#FFFFFF',
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#1F2937',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  tagInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  tagInput: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#1F2937',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginRight: 8,
  },
  addTagButton: {
    backgroundColor: '#5546FF',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tagList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 12,
    gap: 8,
  },
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  tagText: {
    fontSize: 14,
    color: '#374151',
    marginRight: 4,
  },
  removeTagButton: {
    padding: 2,
  },
  selectedTypeInfo: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  selectedTypeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  selectedTypeTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginLeft: 8,
  },
  selectedTypeDesc: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
  },
  createButton: {
    backgroundColor: '#5546FF',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    shadowColor: '#5546FF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  disabledButton: {
    backgroundColor: '#9CA3AF',
  },
  createButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
});

export default CreateProjectScreen;
