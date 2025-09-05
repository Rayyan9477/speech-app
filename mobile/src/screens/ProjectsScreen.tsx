import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  FlatList,
  Alert,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

const ProjectsScreen = () => {
  const navigation = useNavigation();
  const [activeTab, setActiveTab] = useState('all');
  const [selectedProjects, setSelectedProjects] = useState<string[]>([]);

  const projects = [
    {
      id: '1',
      title: 'Marketing Campaign Audio',
      description: 'Voice overs for product launch campaign',
      type: 'TTS',
      status: 'completed',
      createdAt: '2024-01-15',
      files: 12,
      duration: '45 min',
      thumbnail: '🎙️',
    },
    {
      id: '2',
      title: 'Language Learning Series',
      description: 'Multi-language pronunciation guide',
      type: 'Translation',
      status: 'processing',
      createdAt: '2024-01-12',
      files: 8,
      duration: '120 min',
      thumbnail: '🌍',
    },
    {
      id: '3',
      title: 'Podcast Episode',
      description: 'Interview with industry expert',
      type: 'Voice Changer',
      status: 'draft',
      createdAt: '2024-01-10',
      files: 3,
      duration: '25 min',
      thumbnail: '🎧',
    },
    {
      id: '4',
      title: 'Audiobook Chapter 1',
      description: 'Fiction novel narration',
      type: 'TTS',
      status: 'completed',
      createdAt: '2024-01-08',
      files: 1,
      duration: '30 min',
      thumbnail: '📖',
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return '#22C55E';
      case 'processing':
        return '#F59E0B';
      case 'draft':
        return '#6B7280';
      default:
        return '#6B7280';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'TTS':
        return 'volume-up';
      case 'Translation':
        return 'translate';
      case 'Voice Changer':
        return 'mic';
      default:
        return 'work';
    }
  };

  const handleProjectPress = (project: any) => {
    navigation.navigate('ProjectDetail', { project });
  };

  const handleCreateProject = () => {
    navigation.navigate('CreateProject');
  };

  const handleProjectOptions = (project: any) => {
    Alert.alert(
      'Project Options',
      `What would you like to do with "${project.title}"?`,
      [
        { text: 'Edit', onPress: () => navigation.navigate('EditProject', { project }) },
        { text: 'Duplicate', onPress: () => handleDuplicateProject(project) },
        { text: 'Share', onPress: () => handleShareProject(project) },
        { text: 'Delete', onPress: () => handleDeleteProject(project), style: 'destructive' },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  };

  const handleDuplicateProject = (project: any) => {
    Alert.alert('Success', 'Project duplicated successfully!');
  };

  const handleShareProject = (project: any) => {
    Alert.alert('Share', 'Project sharing feature coming soon!');
  };

  const handleDeleteProject = (project: any) => {
    Alert.alert(
      'Delete Project',
      `Are you sure you want to delete "${project.title}"? This action cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => Alert.alert('Success', 'Project deleted successfully!'),
        },
      ]
    );
  };

  const renderProjectItem = ({ item }: { item: any }) => (
    <TouchableOpacity
      style={styles.projectCard}
      onPress={() => handleProjectPress(item)}
      activeOpacity={0.7}
    >
      <View style={styles.projectHeader}>
        <View style={styles.projectIcon}>
          <Text style={styles.projectThumbnail}>{item.thumbnail}</Text>
        </View>
        <View style={styles.projectInfo}>
          <Text style={styles.projectTitle}>{item.title}</Text>
          <Text style={styles.projectDescription}>{item.description}</Text>
        </View>
        <TouchableOpacity
          style={styles.optionsButton}
          onPress={() => handleProjectOptions(item)}
        >
          <MaterialIcons name="more-vert" size={24} color="#6B7280" />
        </TouchableOpacity>
      </View>

      <View style={styles.projectMeta}>
        <View style={styles.metaItem}>
          <MaterialIcons name={getTypeIcon(item.type)} size={16} color="#6B7280" />
          <Text style={styles.metaText}>{item.type}</Text>
        </View>
        <View style={styles.metaItem}>
          <MaterialIcons name="audiotrack" size={16} color="#6B7280" />
          <Text style={styles.metaText}>{item.files} files</Text>
        </View>
        <View style={styles.metaItem}>
          <MaterialIcons name="schedule" size={16} color="#6B7280" />
          <Text style={styles.metaText}>{item.duration}</Text>
        </View>
      </View>

      <View style={styles.projectFooter}>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) + '20' }]}>
          <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>
            {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
          </Text>
        </View>
        <Text style={styles.projectDate}>{item.createdAt}</Text>
      </View>
    </TouchableOpacity>
  );

  const filteredProjects = activeTab === 'all'
    ? projects
    : projects.filter(project => project.status === activeTab);

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>My Projects</Text>
        <TouchableOpacity
          style={styles.searchButton}
          onPress={() => navigation.navigate('ProjectSearch')}
        >
          <MaterialIcons name="search" size={24} color="#5546FF" />
        </TouchableOpacity>
      </View>

      {/* Tabs */}
      <View style={styles.tabContainer}>
        {[
          { key: 'all', label: 'All Projects' },
          { key: 'completed', label: 'Completed' },
          { key: 'processing', label: 'Processing' },
          { key: 'draft', label: 'Drafts' },
        ].map((tab) => (
          <TouchableOpacity
            key={tab.key}
            style={[styles.tab, activeTab === tab.key && styles.activeTab]}
            onPress={() => setActiveTab(tab.key)}
          >
            <Text style={[styles.tabText, activeTab === tab.key && styles.activeTabText]}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Projects List */}
      <FlatList
        data={filteredProjects}
        renderItem={renderProjectItem}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <MaterialIcons name="work" size={64} color="#E5E7EB" />
            <Text style={styles.emptyTitle}>No Projects Yet</Text>
            <Text style={styles.emptyText}>
              Create your first project to get started with AI voice processing
            </Text>
          </View>
        }
      />

      {/* Create Project Button */}
      <TouchableOpacity style={styles.createButton} onPress={handleCreateProject}>
        <MaterialIcons name="add" size={24} color="#FFFFFF" />
      </TouchableOpacity>
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
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#FFFFFF',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  searchButton: {
    padding: 8,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  tab: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 8,
    marginHorizontal: 2,
  },
  activeTab: {
    backgroundColor: '#5546FF',
  },
  tabText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#6B7280',
  },
  activeTabText: {
    color: '#FFFFFF',
  },
  listContainer: {
    padding: 20,
  },
  projectCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  projectHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  projectIcon: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  projectThumbnail: {
    fontSize: 20,
  },
  projectInfo: {
    flex: 1,
  },
  projectTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  projectDescription: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
  },
  optionsButton: {
    padding: 4,
  },
  projectMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metaText: {
    fontSize: 12,
    color: '#6B7280',
    marginLeft: 4,
  },
  projectFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
  },
  projectDate: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1F2937',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 24,
    maxWidth: 280,
  },
  createButton: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#5546FF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#5546FF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
});

export default ProjectsScreen;
