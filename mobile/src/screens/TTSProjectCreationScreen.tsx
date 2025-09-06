import React, { useState } from 'react';
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
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

const { width } = Dimensions.get('window');

interface ProjectTemplate {
  id: string;
  title: string;
  description: string;
  category: string;
  icon: keyof typeof MaterialIcons.glyphMap;
  estimatedTime: string;
  popular?: boolean;
}

const TTSProjectCreationScreen = () => {
  const navigation = useNavigation();
  const [projectTitle, setProjectTitle] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');

  const templates: ProjectTemplate[] = [
    {
      id: 'blank',
      title: 'Blank Project',
      description: 'Start from scratch with complete creative control',
      category: 'General',
      icon: 'edit',
      estimatedTime: '5-30 min',
      popular: true,
    },
    {
      id: 'podcast-intro',
      title: 'Podcast Introduction',
      description: 'Professional podcast intro with music and voice-over',
      category: 'Podcast',
      icon: 'headphones',
      estimatedTime: '10-15 min',
    },
    {
      id: 'social-media',
      title: 'Social Media Video',
      description: 'Engaging voice-over for Instagram, TikTok, or YouTube',
      category: 'Social Media',
      icon: 'smartphone',
      estimatedTime: '5-10 min',
    },
    {
      id: 'product-demo',
      title: 'Product Demo',
      description: 'Clear narration for product demonstrations',
      category: 'Business',
      icon: 'business-center',
      estimatedTime: '15-25 min',
    },
    {
      id: 'educational',
      title: 'Educational Content',
      description: 'Tutorial or lesson with structured content blocks',
      category: 'Education',
      icon: 'school',
      estimatedTime: '20-40 min',
    },
    {
      id: 'audiobook',
      title: 'Audiobook Chapter',
      description: 'Long-form narration with chapter breaks',
      category: 'Publishing',
      icon: 'menu-book',
      estimatedTime: '30-60 min',
    },
  ];

  const recentProjects = [
    'My Podcast Episode 12',
    'Product Launch Video',
    'Training Module 3',
    'Instagram Story Voice',
  ];

  const handleCreateProject = () => {
    if (!projectTitle.trim()) {
      Alert.alert('Project Title Required', 'Please enter a project title to continue.');
      return;
    }

    // Navigate to TTS Editor with project details
    navigation.navigate('TTSEditor' as never, {
      title: projectTitle,
      template: selectedTemplate || 'blank',
    } as never);
  };

  const handleUseRecent = (title: string) => {
    setProjectTitle(title);
  };

  const isFormValid = projectTitle.trim() !== '';

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
          <Text style={styles.headerTitle}>Create New TTS Project</Text>
          <Text style={styles.headerSubtitle}>Choose a template or start from scratch</Text>
        </View>
      </View>

      <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        {/* Project Title Input */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Project Details</Text>
          <Text style={styles.sectionSubtitle}>Give your project a descriptive name</Text>
          
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Project Title *</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g., My Awesome Podcast Episode"
              value={projectTitle}
              onChangeText={setProjectTitle}
              placeholderTextColor="#9ca3af"
            />
          </View>

          {/* Recent Projects */}
          {recentProjects.length > 0 && (
            <View style={styles.recentContainer}>
              <Text style={styles.recentLabel}>Recent Projects</Text>
              <ScrollView 
                horizontal 
                showsHorizontalScrollIndicator={false}
                style={styles.recentScrollView}
              >
                {recentProjects.map((project, index) => (
                  <TouchableOpacity
                    key={index}
                    style={styles.recentChip}
                    onPress={() => handleUseRecent(project)}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.recentChipText}>{project}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          )}
        </View>

        {/* Template Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Choose Template</Text>
          <Text style={styles.sectionSubtitle}>Select a template to get started quickly</Text>

          <View style={styles.templatesGrid}>
            {templates.map((template) => (
              <TouchableOpacity
                key={template.id}
                style={[
                  styles.templateCard,
                  selectedTemplate === template.id && styles.selectedTemplateCard,
                ]}
                onPress={() => setSelectedTemplate(template.id)}
                activeOpacity={0.8}
              >
                <View style={styles.templateHeader}>
                  <View style={[
                    styles.templateIcon,
                    selectedTemplate === template.id && styles.selectedTemplateIcon,
                  ]}>
                    <MaterialIcons
                      name={template.icon}
                      size={24}
                      color={selectedTemplate === template.id ? '#6366f1' : '#6b7280'}
                    />
                  </View>
                  {template.popular && (
                    <View style={styles.popularBadge}>
                      <Text style={styles.popularText}>Popular</Text>
                    </View>
                  )}
                </View>

                <Text style={[
                  styles.templateTitle,
                  selectedTemplate === template.id && styles.selectedTemplateTitle,
                ]}>
                  {template.title}
                </Text>

                <Text style={styles.templateDescription}>
                  {template.description}
                </Text>

                <View style={styles.templateFooter}>
                  <View style={styles.templateCategory}>
                    <Text style={styles.templateCategoryText}>{template.category}</Text>
                  </View>
                  <View style={styles.templateTime}>
                    <MaterialIcons name="access-time" size={12} color="#9ca3af" />
                    <Text style={styles.templateTimeText}>{template.estimatedTime}</Text>
                  </View>
                </View>

                {selectedTemplate === template.id && (
                  <View style={styles.selectedIndicator}>
                    <MaterialIcons name="check-circle" size={24} color="#6366f1" />
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Pro Tips */}
        <View style={styles.tipsContainer}>
          <View style={styles.tipsCard}>
            <MaterialIcons name="lightbulb" size={24} color="#f59e0b" />
            <View style={styles.tipsContent}>
              <Text style={styles.tipsTitle}>Pro Tips</Text>
              <View style={styles.tipsList}>
                <Text style={styles.tipItem}>• Use descriptive project names for easy organization</Text>
                <Text style={styles.tipItem}>• Templates save time with pre-configured settings</Text>
                <Text style={styles.tipItem}>• You can always customize templates later</Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Bottom Action Button */}
      <View style={styles.bottomContainer}>
        <TouchableOpacity
          style={[styles.createButton, !isFormValid && styles.disabledButton]}
          onPress={handleCreateProject}
          disabled={!isFormValid}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={isFormValid ? ['#6366f1', '#8b5cf6'] : ['#e5e7eb', '#d1d5db']}
            style={styles.createButtonGradient}
          >
            <Text style={[
              styles.createButtonText,
              !isFormValid && styles.disabledButtonText,
            ]}>
              Create Project
            </Text>
            <MaterialIcons 
              name="arrow-forward" 
              size={20} 
              color={isFormValid ? 'white' : '#9ca3af'} 
            />
          </LinearGradient>
        </TouchableOpacity>

        {!isFormValid && (
          <Text style={styles.validationText}>
            Please enter a project title to continue
          </Text>
        )}
      </View>
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
  scrollContainer: {
    flex: 1,
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
    marginBottom: 20,
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
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: '#111827',
    backgroundColor: '#f9fafb',
  },
  recentContainer: {
    marginTop: 8,
  },
  recentLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 12,
  },
  recentScrollView: {
    marginHorizontal: -4,
  },
  recentChip: {
    backgroundColor: '#f3f4f6',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginHorizontal: 4,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  recentChipText: {
    fontSize: 12,
    color: '#6b7280',
    fontWeight: '500',
  },
  templatesGrid: {
    gap: 16,
  },
  templateCard: {
    backgroundColor: '#f9fafb',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    position: 'relative',
  },
  selectedTemplateCard: {
    backgroundColor: '#f0f4ff',
    borderColor: '#6366f1',
  },
  templateHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  templateIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#e5e7eb',
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectedTemplateIcon: {
    backgroundColor: '#e0e7ff',
  },
  popularBadge: {
    backgroundColor: '#6366f1',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  popularText: {
    fontSize: 10,
    color: 'white',
    fontWeight: '600',
  },
  templateTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 8,
  },
  selectedTemplateTitle: {
    color: '#6366f1',
  },
  templateDescription: {
    fontSize: 14,
    color: '#6b7280',
    lineHeight: 20,
    marginBottom: 16,
  },
  templateFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  templateCategory: {
    backgroundColor: '#e5e7eb',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  templateCategoryText: {
    fontSize: 12,
    color: '#6b7280',
    fontWeight: '500',
  },
  templateTime: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  templateTimeText: {
    fontSize: 12,
    color: '#9ca3af',
    marginLeft: 4,
  },
  selectedIndicator: {
    position: 'absolute',
    top: 16,
    right: 16,
  },
  tipsContainer: {
    padding: 20,
  },
  tipsCard: {
    flexDirection: 'row',
    backgroundColor: '#fef3c7',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#fbbf24',
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
  bottomContainer: {
    padding: 20,
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  createButton: {
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  disabledButton: {
    shadowOpacity: 0,
    elevation: 0,
  },
  createButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
  },
  createButtonText: {
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

export default TTSProjectCreationScreen;