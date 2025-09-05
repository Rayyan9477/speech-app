import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Alert,
  Share,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';

const ProjectDetailScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { project } = route.params as { project: any };

  const [isPlaying, setIsPlaying] = useState(false);

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

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
    // TODO: Implement audio playback
  };

  const handleDownload = () => {
    Alert.alert('Download', 'Downloading project files...');
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: `Check out my ${project.type} project: ${project.title}`,
        title: project.title,
      });
    } catch (error) {
      Alert.alert('Error', 'Failed to share project');
    }
  };

  const handleEdit = () => {
    navigation.navigate('EditProject', { project });
  };

  const handleDuplicate = () => {
    Alert.alert('Duplicate', 'Project duplicated successfully!');
  };

  const handleDelete = () => {
    Alert.alert(
      'Delete Project',
      'Are you sure you want to delete this project? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            navigation.goBack();
            Alert.alert('Success', 'Project deleted successfully');
          },
        },
      ]
    );
  };

  const handleExport = () => {
    Alert.alert('Export', 'Exporting project...');
  };

  // Mock project files
  const projectFiles = [
    { id: '1', name: 'audio_001.mp3', duration: '2:34', size: '3.2 MB' },
    { id: '2', name: 'audio_002.mp3', duration: '1:45', size: '2.1 MB' },
    { id: '3', name: 'audio_003.mp3', duration: '3:12', size: '4.0 MB' },
  ];

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
        <Text style={styles.title} numberOfLines={1}>{project.title}</Text>
        <TouchableOpacity style={styles.menuButton}>
          <MaterialIcons name="more-vert" size={24} color="#6B7280" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Project Overview */}
        <View style={styles.section}>
          <View style={styles.projectCard}>
            <View style={styles.projectHeader}>
              <View style={styles.projectIcon}>
                <MaterialIcons
                  name={getTypeIcon(project.type)}
                  size={32}
                  color="#5546FF"
                />
              </View>
              <View style={styles.projectInfo}>
                <Text style={styles.projectTitle}>{project.title}</Text>
                <Text style={styles.projectDescription}>{project.description}</Text>
                <View style={styles.projectMeta}>
                  <View style={[styles.statusBadge, { backgroundColor: getStatusColor(project.status) + '20' }]}>
                    <Text style={[styles.statusText, { color: getStatusColor(project.status) }]}>
                      {project.status.charAt(0).toUpperCase() + project.status.slice(1)}
                    </Text>
                  </View>
                  <Text style={styles.projectDate}>{project.createdAt}</Text>
                </View>
              </View>
            </View>
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.actionsGrid}>
            <TouchableOpacity style={styles.actionButton} onPress={handlePlayPause}>
              <MaterialIcons
                name={isPlaying ? 'pause' : 'play-arrow'}
                size={24}
                color="#5546FF"
              />
              <Text style={styles.actionText}>
                {isPlaying ? 'Pause' : 'Play'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionButton} onPress={handleDownload}>
              <MaterialIcons name="download" size={24} color="#22C55E" />
              <Text style={styles.actionText}>Download</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionButton} onPress={handleShare}>
              <MaterialIcons name="share" size={24} color="#7C3AED" />
              <Text style={styles.actionText}>Share</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionButton} onPress={handleExport}>
              <MaterialIcons name="file-upload" size={24} color="#F59E0B" />
              <Text style={styles.actionText}>Export</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Project Files */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Project Files ({projectFiles.length})</Text>
          {projectFiles.map((file) => (
            <TouchableOpacity key={file.id} style={styles.fileCard}>
              <View style={styles.fileIcon}>
                <MaterialIcons name="audiotrack" size={24} color="#5546FF" />
              </View>
              <View style={styles.fileInfo}>
                <Text style={styles.fileName}>{file.name}</Text>
                <Text style={styles.fileMeta}>
                  {file.duration} • {file.size}
                </Text>
              </View>
              <TouchableOpacity style={styles.filePlayButton}>
                <MaterialIcons name="play-arrow" size={20} color="#6B7280" />
              </TouchableOpacity>
            </TouchableOpacity>
          ))}
        </View>

        {/* Project Statistics */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Statistics</Text>
          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <MaterialIcons name="audiotrack" size={24} color="#22C55E" />
              <Text style={styles.statNumber}>{projectFiles.length}</Text>
              <Text style={styles.statLabel}>Files</Text>
            </View>
            <View style={styles.statCard}>
              <MaterialIcons name="schedule" size={24} color="#7C3AED" />
              <Text style={styles.statNumber}>12:34</Text>
              <Text style={styles.statLabel}>Total Duration</Text>
            </View>
            <View style={styles.statCard}>
              <MaterialIcons name="storage" size={24} color="#F59E0B" />
              <Text style={styles.statNumber}>9.3 MB</Text>
              <Text style={styles.statLabel}>Total Size</Text>
            </View>
            <View style={styles.statCard}>
              <MaterialIcons name="visibility" size={24} color="#EF4444" />
              <Text style={styles.statNumber}>24</Text>
              <Text style={styles.statLabel}>Views</Text>
            </View>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.section}>
          <View style={styles.buttonRow}>
            <TouchableOpacity style={styles.secondaryButton} onPress={handleEdit}>
              <MaterialIcons name="edit" size={20} color="#5546FF" />
              <Text style={styles.secondaryButtonText}>Edit Project</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.secondaryButton} onPress={handleDuplicate}>
              <MaterialIcons name="content-copy" size={20} color="#6B7280" />
              <Text style={styles.secondaryButtonText}>Duplicate</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={styles.dangerButton} onPress={handleDelete}>
            <MaterialIcons name="delete" size={20} color="#EF4444" />
            <Text style={styles.dangerButtonText}>Delete Project</Text>
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  backButton: {
    padding: 4,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    flex: 1,
    marginHorizontal: 16,
  },
  menuButton: {
    padding: 4,
  },
  scrollView: {
    flex: 1,
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
  projectCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  projectHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  projectIcon: {
    width: 60,
    height: 60,
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  projectInfo: {
    flex: 1,
  },
  projectTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 4,
  },
  projectDescription: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
    marginBottom: 12,
  },
  projectMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
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
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  actionButton: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  actionText: {
    fontSize: 14,
    color: '#1F2937',
    marginTop: 8,
    fontWeight: '500',
  },
  fileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 16,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  fileIcon: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  fileInfo: {
    flex: 1,
  },
  fileName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1F2937',
    marginBottom: 2,
  },
  fileMeta: {
    fontSize: 12,
    color: '#6B7280',
  },
  filePlayButton: {
    padding: 8,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  statCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
    marginTop: 8,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  secondaryButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  secondaryButtonText: {
    fontSize: 14,
    color: '#374151',
    marginLeft: 8,
  },
  dangerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FEF2F2',
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  dangerButtonText: {
    fontSize: 14,
    color: '#EF4444',
    marginLeft: 8,
  },
});

export default ProjectDetailScreen;
