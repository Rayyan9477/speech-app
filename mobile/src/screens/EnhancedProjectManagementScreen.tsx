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

interface Project {
  id: string;
  title: string;
  type: 'tts' | 'voice-changer' | 'voice-translate' | 'voice-clone';
  status: 'draft' | 'processing' | 'completed' | 'failed';
  duration?: number;
  audioUrl?: string;
  createdAt: Date;
  updatedAt: Date;
  progress?: number;
}

const EnhancedProjectManagementScreen = () => {
  const navigation = useNavigation();
  const [projects, setProjects] = useState<Project[]>([
    {
      id: '1',
      title: 'Podcast Episode Introduction',
      type: 'tts',
      status: 'completed',
      duration: 45,
      audioUrl: 'audio1.mp3',
      createdAt: new Date('2024-01-15'),
      updatedAt: new Date('2024-01-15'),
    },
    {
      id: '2',
      title: 'Marketing Video Voiceover',
      type: 'voice-changer',
      status: 'processing',
      progress: 75,
      createdAt: new Date('2024-01-14'),
      updatedAt: new Date('2024-01-14'),
    },
    {
      id: '3',
      title: 'Spanish Translation',
      type: 'voice-translate',
      status: 'completed',
      duration: 120,
      audioUrl: 'audio3.mp3',
      createdAt: new Date('2024-01-13'),
      updatedAt: new Date('2024-01-13'),
    },
    {
      id: '4',
      title: 'Voice Clone Training',
      type: 'voice-clone',
      status: 'failed',
      createdAt: new Date('2024-01-12'),
      updatedAt: new Date('2024-01-12'),
    },
  ]);

  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'date' | 'name' | 'type'>('date');
  const [showFilters, setShowFilters] = useState(false);
  const [showOptionsModal, setShowOptionsModal] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');

  const projectTypes = [
    { id: 'all', label: 'All Projects', icon: 'apps' },
    { id: 'tts', label: 'Text to Speech', icon: 'volume-up' },
    { id: 'voice-changer', label: 'Voice Changer', icon: 'mic' },
    { id: 'voice-translate', label: 'Voice Translate', icon: 'translate' },
    { id: 'voice-clone', label: 'Voice Clone', icon: 'person' },
  ];

  const getProjectTypeInfo = (type: string) => {
    const typeMap = {
      'tts': { icon: 'volume-up', color: '#6366f1', label: 'TTS' },
      'voice-changer': { icon: 'mic', color: '#8b5cf6', label: 'Voice Changer' },
      'voice-translate': { icon: 'translate', color: '#ec4899', label: 'Voice Translate' },
      'voice-clone': { icon: 'person', color: '#f59e0b', label: 'Voice Clone' },
    };
    return typeMap[type as keyof typeof typeMap] || { icon: 'folder', color: '#6b7280', label: 'Unknown' };
  };

  const getStatusInfo = (status: string) => {
    const statusMap = {
      'draft': { color: '#6b7280', label: 'Draft' },
      'processing': { color: '#f59e0b', label: 'Processing' },
      'completed': { color: '#10b981', label: 'Completed' },
      'failed': { color: '#ef4444', label: 'Failed' },
    };
    return statusMap[status as keyof typeof statusMap] || { color: '#6b7280', label: 'Unknown' };
  };

  const filteredProjects = projects
    .filter(project => {
      const matchesSearch = project.title.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesFilter = filterType === 'all' || project.type === filterType;
      return matchesSearch && matchesFilter;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.title.localeCompare(b.title);
        case 'type':
          return a.type.localeCompare(b.type);
        case 'date':
        default:
          return b.updatedAt.getTime() - a.updatedAt.getTime();
      }
    });

  const handleProjectOptions = (project: Project) => {
    setSelectedProject(project);
    setShowOptionsModal(true);
  };

  const handleDeleteProject = () => {
    if (!selectedProject) return;
    
    Alert.alert(
      'Delete Project',
      `Are you sure you want to delete "${selectedProject.title}"? This action cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            setProjects(prev => prev.filter(project => project.id !== selectedProject.id));
            setShowOptionsModal(false);
            setSelectedProject(null);
          },
        },
      ]
    );
  };

  const handleRenameProject = () => {
    if (!selectedProject) return;
    
    Alert.prompt(
      'Rename Project',
      'Enter a new name for this project:',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Rename',
          onPress: (newName) => {
            if (newName && newName.trim()) {
              setProjects(prev => prev.map(project => 
                project.id === selectedProject.id 
                  ? { ...project, title: newName.trim(), updatedAt: new Date() }
                  : project
              ));
              setShowOptionsModal(false);
              setSelectedProject(null);
            }
          },
        },
      ],
      'plain-text',
      selectedProject.title
    );
  };

  const handleDuplicateProject = () => {
    if (!selectedProject) return;
    
    const duplicatedProject: Project = {
      ...selectedProject,
      id: Date.now().toString(),
      title: `${selectedProject.title} (Copy)`,
      status: 'draft',
      createdAt: new Date(),
      updatedAt: new Date(),
      progress: undefined,
    };
    
    setProjects(prev => [duplicatedProject, ...prev]);
    setShowOptionsModal(false);
    setSelectedProject(null);
  };

  const formatDate = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (days === 0) {
      return 'Today';
    } else if (days === 1) {
      return 'Yesterday';
    } else if (days < 7) {
      return `${days} days ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const renderProjectCard = ({ item: project }: { item: Project }) => {
    const typeInfo = getProjectTypeInfo(project.type);
    const statusInfo = getStatusInfo(project.status);

    if (viewMode === 'grid') {
      return (
        <View style={[styles.projectGridCard, { width: (width - 48) / 2 }]}>
          <View style={styles.projectCardHeader}>
            <View style={[styles.projectTypeIcon, { backgroundColor: `${typeInfo.color}20` }]}>
              <MaterialIcons
                name={typeInfo.icon as keyof typeof MaterialIcons.glyphMap}
                size={20}
                color={typeInfo.color}
              />
            </View>
            <TouchableOpacity
              style={styles.projectOptionsButton}
              onPress={() => handleProjectOptions(project)}
              activeOpacity={0.7}
            >
              <MaterialIcons name="more-vert" size={16} color="#9ca3af" />
            </TouchableOpacity>
          </View>

          <Text style={styles.projectGridTitle} numberOfLines={2}>
            {project.title}
          </Text>

          <View style={styles.projectGridMeta}>
            <View style={[styles.projectStatus, { backgroundColor: `${statusInfo.color}20` }]}>
              <Text style={[styles.projectStatusText, { color: statusInfo.color }]}>
                {statusInfo.label}
              </Text>
            </View>
          </View>

          {project.status === 'processing' && project.progress && (
            <View style={styles.progressContainer}>
              <View style={styles.progressBar}>
                <View style={[styles.progressFill, { width: `${project.progress}%` }]} />
              </View>
              <Text style={styles.progressText}>{project.progress}%</Text>
            </View>
          )}

          <Text style={styles.projectGridDate}>{formatDate(project.updatedAt)}</Text>
        </View>
      );
    }

    return (
      <View style={styles.projectListCard}>
        <View style={styles.projectListContent}>
          <View style={[styles.projectTypeIcon, { backgroundColor: `${typeInfo.color}20` }]}>
            <MaterialIcons
              name={typeInfo.icon as keyof typeof MaterialIcons.glyphMap}
              size={24}
              color={typeInfo.color}
            />
          </View>

          <View style={styles.projectInfo}>
            <Text style={styles.projectTitle} numberOfLines={1}>
              {project.title}
            </Text>
            <View style={styles.projectMeta}>
              <Text style={styles.projectType}>{typeInfo.label}</Text>
              <Text style={styles.projectDate}>{formatDate(project.updatedAt)}</Text>
            </View>
          </View>

          <View style={styles.projectActions}>
            <View style={[styles.projectStatus, { backgroundColor: `${statusInfo.color}20` }]}>
              <Text style={[styles.projectStatusText, { color: statusInfo.color }]}>
                {statusInfo.label}
              </Text>
            </View>
            
            <TouchableOpacity
              style={styles.projectOptionsButton}
              onPress={() => handleProjectOptions(project)}
              activeOpacity={0.7}
            >
              <MaterialIcons name="more-vert" size={20} color="#9ca3af" />
            </TouchableOpacity>
          </View>
        </View>

        {project.status === 'processing' && project.progress && (
          <View style={styles.progressContainer}>
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: `${project.progress}%` }]} />
            </View>
            <Text style={styles.progressText}>{project.progress}%</Text>
          </View>
        )}

        {project.audioUrl && (
          <View style={styles.audioPreview}>
            <TouchableOpacity style={styles.playButton} activeOpacity={0.8}>
              <MaterialIcons name="play-arrow" size={20} color="#6366f1" />
            </TouchableOpacity>
            <View style={styles.audioInfo}>
              <Text style={styles.audioDuration}>
                Duration: {formatDuration(project.duration || 0)}
              </Text>
            </View>
          </View>
        )}
      </View>
    );
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
          <Text style={styles.headerTitle}>My Projects</Text>
          <Text style={styles.headerSubtitle}>{projects.length} projects</Text>
        </View>

        <View style={styles.headerActions}>
          <TouchableOpacity
            style={styles.viewToggle}
            onPress={() => setViewMode(viewMode === 'list' ? 'grid' : 'list')}
            activeOpacity={0.7}
          >
            <MaterialIcons 
              name={viewMode === 'list' ? 'grid-view' : 'view-list'} 
              size={20} 
              color="#6b7280" 
            />
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.filterButton}
            onPress={() => setShowFilters(true)}
            activeOpacity={0.7}
          >
            <MaterialIcons name="tune" size={20} color="#6b7280" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <MaterialIcons name="search" size={20} color="#9ca3af" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search projects..."
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

      {/* Active Filters */}
      {(filterType !== 'all' || sortBy !== 'date') && (
        <View style={styles.activeFilters}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {filterType !== 'all' && (
              <View style={styles.activeFilter}>
                <Text style={styles.activeFilterText}>
                  {projectTypes.find(t => t.id === filterType)?.label}
                </Text>
                <TouchableOpacity onPress={() => setFilterType('all')}>
                  <MaterialIcons name="close" size={16} color="#6366f1" />
                </TouchableOpacity>
              </View>
            )}
            {sortBy !== 'date' && (
              <View style={styles.activeFilter}>
                <Text style={styles.activeFilterText}>Sort by {sortBy}</Text>
                <TouchableOpacity onPress={() => setSortBy('date')}>
                  <MaterialIcons name="close" size={16} color="#6366f1" />
                </TouchableOpacity>
              </View>
            )}
          </ScrollView>
        </View>
      )}

      {/* Projects List */}
      <FlatList
        data={filteredProjects}
        renderItem={renderProjectCard}
        numColumns={viewMode === 'grid' ? 2 : 1}
        key={viewMode} // Force re-render when view mode changes
        columnWrapperStyle={viewMode === 'grid' ? styles.projectsRow : undefined}
        contentContainerStyle={styles.projectsContainer}
        showsVerticalScrollIndicator={false}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={() => (
          <View style={styles.emptyContainer}>
            <MaterialIcons name="folder-open" size={64} color="#d1d5db" />
            <Text style={styles.emptyTitle}>No projects found</Text>
            <Text style={styles.emptySubtitle}>
              {searchQuery || filterType !== 'all'
                ? 'Try adjusting your search or filters'
                : 'Create your first project to get started'
              }
            </Text>
          </View>
        )}
      />

      {/* Filters Modal */}
      <Modal
        visible={showFilters}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Filter & Sort</Text>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setShowFilters(false)}
              activeOpacity={0.7}
            >
              <MaterialIcons name="close" size={24} color="#374151" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            {/* Project Type Filter */}
            <View style={styles.filterSection}>
              <Text style={styles.filterSectionTitle}>Project Type</Text>
              {projectTypes.map((type) => (
                <TouchableOpacity
                  key={type.id}
                  style={[
                    styles.filterOption,
                    filterType === type.id && styles.selectedFilterOption,
                  ]}
                  onPress={() => setFilterType(type.id)}
                  activeOpacity={0.8}
                >
                  <MaterialIcons
                    name={type.icon as keyof typeof MaterialIcons.glyphMap}
                    size={20}
                    color={filterType === type.id ? '#6366f1' : '#6b7280'}
                  />
                  <Text style={[
                    styles.filterOptionText,
                    filterType === type.id && styles.selectedFilterOptionText,
                  ]}>
                    {type.label}
                  </Text>
                  {filterType === type.id && (
                    <MaterialIcons name="check" size={20} color="#6366f1" />
                  )}
                </TouchableOpacity>
              ))}
            </View>

            {/* Sort Options */}
            <View style={styles.filterSection}>
              <Text style={styles.filterSectionTitle}>Sort By</Text>
              {[
                { id: 'date', label: 'Last Modified', icon: 'schedule' },
                { id: 'name', label: 'Name', icon: 'sort-by-alpha' },
                { id: 'type', label: 'Type', icon: 'category' },
              ].map((option) => (
                <TouchableOpacity
                  key={option.id}
                  style={[
                    styles.filterOption,
                    sortBy === option.id && styles.selectedFilterOption,
                  ]}
                  onPress={() => setSortBy(option.id as 'date' | 'name' | 'type')}
                  activeOpacity={0.8}
                >
                  <MaterialIcons
                    name={option.icon as keyof typeof MaterialIcons.glyphMap}
                    size={20}
                    color={sortBy === option.id ? '#6366f1' : '#6b7280'}
                  />
                  <Text style={[
                    styles.filterOptionText,
                    sortBy === option.id && styles.selectedFilterOptionText,
                  ]}>
                    {option.label}
                  </Text>
                  {sortBy === option.id && (
                    <MaterialIcons name="check" size={20} color="#6366f1" />
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        </View>
      </Modal>

      {/* Project Options Modal */}
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
                // Open project
              }}
              activeOpacity={0.8}
            >
              <MaterialIcons name="open-in-new" size={24} color="#6366f1" />
              <Text style={styles.optionText}>Open Project</Text>
            </TouchableOpacity>

            {selectedProject?.audioUrl && (
              <TouchableOpacity
                style={styles.optionItem}
                onPress={() => {
                  setShowOptionsModal(false);
                  // Play audio
                }}
                activeOpacity={0.8}
              >
                <MaterialIcons name="play-arrow" size={24} color="#6b7280" />
                <Text style={styles.optionText}>Play Audio</Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity
              style={styles.optionItem}
              onPress={handleRenameProject}
              activeOpacity={0.8}
            >
              <MaterialIcons name="edit" size={24} color="#6b7280" />
              <Text style={styles.optionText}>Rename</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.optionItem}
              onPress={handleDuplicateProject}
              activeOpacity={0.8}
            >
              <MaterialIcons name="content-copy" size={24} color="#6b7280" />
              <Text style={styles.optionText}>Duplicate</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.optionItem}
              onPress={() => {
                setShowOptionsModal(false);
                // Share project
              }}
              activeOpacity={0.8}
            >
              <MaterialIcons name="share" size={24} color="#6b7280" />
              <Text style={styles.optionText}>Share</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.optionItem, styles.deleteOption]}
              onPress={handleDeleteProject}
              activeOpacity={0.8}
            >
              <MaterialIcons name="delete" size={24} color="#ef4444" />
              <Text style={[styles.optionText, styles.deleteText]}>Delete</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Floating Action Button */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate('TTSProjectCreation' as never)}
        activeOpacity={0.9}
      >
        <LinearGradient
          colors={['#6366f1', '#8b5cf6']}
          style={styles.fabGradient}
        >
          <MaterialIcons name="add" size={28} color="white" />
        </LinearGradient>
      </TouchableOpacity>
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
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  viewToggle: {
    padding: 8,
    marginRight: 8,
  },
  filterButton: {
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
  activeFilters: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    backgroundColor: 'white',
  },
  activeFilter: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e0e7ff',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
  },
  activeFilterText: {
    fontSize: 12,
    color: '#6366f1',
    fontWeight: '500',
    marginRight: 8,
  },
  projectsContainer: {
    padding: 16,
  },
  projectsRow: {
    justifyContent: 'space-between',
  },
  projectListCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  projectListContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  projectGridCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  projectCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  projectTypeIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  projectInfo: {
    flex: 1,
  },
  projectTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  projectGridTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 8,
    lineHeight: 20,
  },
  projectMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  projectGridMeta: {
    marginBottom: 8,
  },
  projectType: {
    fontSize: 12,
    color: '#6b7280',
    marginRight: 12,
  },
  projectDate: {
    fontSize: 12,
    color: '#9ca3af',
  },
  projectGridDate: {
    fontSize: 11,
    color: '#9ca3af',
  },
  projectActions: {
    alignItems: 'flex-end',
  },
  projectStatus: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 8,
  },
  projectStatusText: {
    fontSize: 11,
    fontWeight: '600',
  },
  projectOptionsButton: {
    padding: 4,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
  },
  progressBar: {
    flex: 1,
    height: 4,
    backgroundColor: '#e5e7eb',
    borderRadius: 2,
    overflow: 'hidden',
    marginRight: 12,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#6366f1',
  },
  progressText: {
    fontSize: 12,
    color: '#6b7280',
    fontWeight: '500',
  },
  audioPreview: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    padding: 8,
    backgroundColor: '#f0f4ff',
    borderRadius: 8,
  },
  playButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#e0e7ff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  audioInfo: {
    flex: 1,
  },
  audioDuration: {
    fontSize: 12,
    color: '#6b7280',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
  },
  filterSection: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  filterSectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 16,
  },
  filterOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  selectedFilterOption: {
    backgroundColor: '#f0f4ff',
  },
  filterOptionText: {
    fontSize: 16,
    color: '#374151',
    marginLeft: 16,
    flex: 1,
  },
  selectedFilterOptionText: {
    color: '#6366f1',
    fontWeight: '500',
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
    minWidth: 220,
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
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    borderRadius: 28,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  fabGradient: {
    width: 56,
    height: 56,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default EnhancedProjectManagementScreen;