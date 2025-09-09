import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Dimensions,
  TextInput,
  FlatList,
  Animated,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

const { width } = Dimensions.get('window');

interface AudioFile {
  id: string;
  title: string;
  duration: number;
  project: string;
  createdAt: string;
  size: string;
  format: string;
  waveformData: number[];
  tags: string[];
  isPlaying?: boolean;
}

const AudioLibraryScreen = () => {
  const navigation = useNavigation();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [sortBy, setSortBy] = useState('recent');
  const [selectedFiles, setSelectedFiles] = useState<string[]>([]);
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const [playingId, setPlayingId] = useState<string | null>(null);

  const scrollY = useRef(new Animated.Value(0)).current;

  const mockAudioFiles: AudioFile[] = [
    {
      id: '1',
      title: 'Welcome Message',
      duration: 45,
      project: 'Onboarding Flow',
      createdAt: '2024-01-15',
      size: '1.2 MB',
      format: 'mp3',
      waveformData: Array.from({ length: 50 }, () => Math.random()),
      tags: ['welcome', 'intro', 'voice'],
    },
    {
      id: '2',
      title: 'Product Demo Narration',
      duration: 180,
      project: 'Marketing Campaign',
      createdAt: '2024-01-14',
      size: '4.8 MB',
      format: 'wav',
      waveformData: Array.from({ length: 50 }, () => Math.random()),
      tags: ['demo', 'product', 'marketing'],
    },
    {
      id: '3',
      title: 'Podcast Intro',
      duration: 30,
      project: 'Weekly Podcast',
      createdAt: '2024-01-13',
      size: '0.8 MB',
      format: 'mp3',
      waveformData: Array.from({ length: 50 }, () => Math.random()),
      tags: ['podcast', 'intro', 'weekly'],
    },
    {
      id: '4',
      title: 'Training Module Voice',
      duration: 300,
      project: 'Employee Training',
      createdAt: '2024-01-12',
      size: '7.2 MB',
      format: 'flac',
      waveformData: Array.from({ length: 50 }, () => Math.random()),
      tags: ['training', 'education', 'corporate'],
    },
  ];

  const [audioFiles, setAudioFiles] = useState(mockAudioFiles);

  const filters = [
    { id: 'all', name: 'All Files', count: audioFiles.length },
    { id: 'mp3', name: 'MP3', count: audioFiles.filter(f => f.format === 'mp3').length },
    { id: 'wav', name: 'WAV', count: audioFiles.filter(f => f.format === 'wav').length },
    { id: 'recent', name: 'Recent', count: audioFiles.filter(f => new Date(f.createdAt) > new Date('2024-01-14')).length },
  ];

  const sortOptions = [
    { id: 'recent', name: 'Most Recent' },
    { id: 'oldest', name: 'Oldest First' },
    { id: 'name', name: 'Name A-Z' },
    { id: 'duration', name: 'Duration' },
    { id: 'size', name: 'File Size' },
  ];

  const filteredFiles = audioFiles.filter(file => {
    const matchesSearch = file.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         file.project.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         file.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    
    if (selectedFilter === 'all') return matchesSearch;
    if (selectedFilter === 'recent') return matchesSearch && new Date(file.createdAt) > new Date('2024-01-14');
    return matchesSearch && file.format === selectedFilter;
  });

  const sortedFiles = [...filteredFiles].sort((a, b) => {
    switch (sortBy) {
      case 'recent':
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      case 'oldest':
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      case 'name':
        return a.title.localeCompare(b.title);
      case 'duration':
        return b.duration - a.duration;
      case 'size':
        return parseFloat(b.size) - parseFloat(a.size);
      default:
        return 0;
    }
  });

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    });
  };

  const toggleFileSelection = (fileId: string) => {
    setSelectedFiles(prev =>
      prev.includes(fileId)
        ? prev.filter(id => id !== fileId)
        : [...prev, fileId]
    );
  };

  const handlePlayPause = (fileId: string) => {
    if (playingId === fileId) {
      setPlayingId(null);
    } else {
      setPlayingId(fileId);
      // Navigate to audio player
      const file = audioFiles.find(f => f.id === fileId);
      if (file) {
        navigation.navigate('AudioPlayer' as never, {
          title: file.title,
          duration: file.duration,
          project: file.project,
        } as never);
      }
    }
  };

  const handleShare = (file: AudioFile) => {
    navigation.navigate('AudioSharing' as never, {
      audioTitle: file.title,
      duration: file.duration,
      waveformData: file.waveformData,
    } as never);
  };

  const handleBulkAction = (action: string) => {
    if (selectedFiles.length === 0) {
      Alert.alert('No Files Selected', 'Please select files to perform bulk actions');
      return;
    }

    switch (action) {
      case 'delete':
        Alert.alert(
          'Delete Files',
          `Are you sure you want to delete ${selectedFiles.length} file(s)?`,
          [
            { text: 'Cancel', style: 'cancel' },
            {
              text: 'Delete',
              style: 'destructive',
              onPress: () => {
                setAudioFiles(prev => prev.filter(file => !selectedFiles.includes(file.id)));
                setSelectedFiles([]);
              },
            },
          ]
        );
        break;
      case 'export':
        Alert.alert('Export Files', `Exporting ${selectedFiles.length} file(s)...`);
        break;
      case 'share':
        Alert.alert('Share Files', `Sharing ${selectedFiles.length} file(s)...`);
        break;
    }
  };

  const renderWaveform = (waveformData: number[], isCompact = false) => {
    const barCount = isCompact ? 20 : 30;
    const maxHeight = isCompact ? 20 : 30;
    
    return (
      <View style={[styles.waveform, isCompact && styles.compactWaveform]}>
        {waveformData.slice(0, barCount).map((height, index) => (
          <View
            key={index}
            style={[
              styles.waveformBar,
              {
                height: height * maxHeight + 5,
                backgroundColor: playingId ? '#6366f1' : '#d1d5db',
              },
            ]}
          />
        ))}
      </View>
    );
  };

  const renderListItem = ({ item }: { item: AudioFile }) => (
    <View style={styles.listItem}>
      <TouchableOpacity
        style={styles.selectButton}
        onPress={() => toggleFileSelection(item.id)}
      >
        <MaterialIcons
          name={selectedFiles.includes(item.id) ? 'check-circle' : 'radio-button-unchecked'}
          size={20}
          color={selectedFiles.includes(item.id) ? '#6366f1' : '#9ca3af'}
        />
      </TouchableOpacity>

      <View style={styles.itemContent}>
        <View style={styles.itemHeader}>
          <View style={styles.itemInfo}>
            <Text style={styles.itemTitle} numberOfLines={1}>
              {item.title}
            </Text>
            <Text style={styles.itemProject}>{item.project}</Text>
          </View>
          <View style={styles.itemActions}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => handlePlayPause(item.id)}
            >
              <MaterialIcons
                name={playingId === item.id ? 'pause' : 'play-arrow'}
                size={20}
                color="#6366f1"
              />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => handleShare(item)}
            >
              <MaterialIcons name="share" size={20} color="#6b7280" />
            </TouchableOpacity>
          </View>
        </View>

        {renderWaveform(item.waveformData, true)}

        <View style={styles.itemFooter}>
          <View style={styles.itemMeta}>
            <MaterialIcons name="access-time" size={14} color="#9ca3af" />
            <Text style={styles.metaText}>{formatTime(item.duration)}</Text>
            <MaterialIcons name="folder" size={14} color="#9ca3af" />
            <Text style={styles.metaText}>{item.size}</Text>
            <Text style={styles.formatBadge}>{item.format.toUpperCase()}</Text>
          </View>
          <Text style={styles.dateText}>{formatDate(item.createdAt)}</Text>
        </View>

        <View style={styles.tagsContainer}>
          {item.tags.map((tag, index) => (
            <View key={index} style={styles.tag}>
              <Text style={styles.tagText}>#{tag}</Text>
            </View>
          ))}
        </View>
      </View>
    </View>
  );

  const renderGridItem = ({ item }: { item: AudioFile }) => (
    <TouchableOpacity
      style={styles.gridItem}
      onPress={() => handlePlayPause(item.id)}
      activeOpacity={0.7}
    >
      <TouchableOpacity
        style={styles.gridSelectButton}
        onPress={() => toggleFileSelection(item.id)}
      >
        <MaterialIcons
          name={selectedFiles.includes(item.id) ? 'check-circle' : 'radio-button-unchecked'}
          size={20}
          color={selectedFiles.includes(item.id) ? '#6366f1' : '#9ca3af'}
        />
      </TouchableOpacity>

      <View style={styles.gridIcon}>
        <MaterialIcons name="audiotrack" size={32} color="#6366f1" />
      </View>

      {renderWaveform(item.waveformData, true)}

      <Text style={styles.gridTitle} numberOfLines={2}>
        {item.title}
      </Text>
      <Text style={styles.gridProject} numberOfLines={1}>
        {item.project}
      </Text>

      <View style={styles.gridMeta}>
        <Text style={styles.gridDuration}>{formatTime(item.duration)}</Text>
        <Text style={styles.gridFormat}>{item.format.toUpperCase()}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Animated Header */}
      <Animated.View style={[
        styles.header,
        {
          shadowOpacity: scrollY.interpolate({
            inputRange: [0, 50],
            outputRange: [0, 0.1],
            extrapolate: 'clamp',
          }),
        },
      ]}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <MaterialIcons name="arrow-back" size={24} color="#374151" />
        </TouchableOpacity>
        
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Audio Library</Text>
          <Text style={styles.headerSubtitle}>
            {sortedFiles.length} {sortedFiles.length === 1 ? 'file' : 'files'}
          </Text>
        </View>

        <View style={styles.headerActions}>
          <TouchableOpacity
            style={[styles.viewToggle, viewMode === 'list' && styles.activeViewToggle]}
            onPress={() => setViewMode('list')}
          >
            <MaterialIcons name="list" size={20} color={viewMode === 'list' ? 'white' : '#6b7280'} />
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.viewToggle, viewMode === 'grid' && styles.activeViewToggle]}
            onPress={() => setViewMode('grid')}
          >
            <MaterialIcons name="grid-view" size={20} color={viewMode === 'grid' ? 'white' : '#6b7280'} />
          </TouchableOpacity>
        </View>
      </Animated.View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <MaterialIcons name="search" size={20} color="#9ca3af" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search audio files..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor="#9ca3af"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <MaterialIcons name="clear" size={20} color="#9ca3af" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Filters */}
      <View style={styles.filtersContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={styles.filtersRow}>
            {filters.map((filter) => (
              <TouchableOpacity
                key={filter.id}
                style={[
                  styles.filterChip,
                  selectedFilter === filter.id && styles.activeFilterChip,
                ]}
                onPress={() => setSelectedFilter(filter.id)}
              >
                <Text style={[
                  styles.filterText,
                  selectedFilter === filter.id && styles.activeFilterText,
                ]}>
                  {filter.name} ({filter.count})
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>

        <TouchableOpacity style={styles.sortButton}>
          <MaterialIcons name="sort" size={20} color="#6b7280" />
          <Text style={styles.sortText}>Sort</Text>
        </TouchableOpacity>
      </View>

      {/* Bulk Actions */}
      {selectedFiles.length > 0 && (
        <View style={styles.bulkActionsContainer}>
          <Text style={styles.selectedCount}>
            {selectedFiles.length} selected
          </Text>
          <View style={styles.bulkActions}>
            <TouchableOpacity
              style={styles.bulkButton}
              onPress={() => handleBulkAction('share')}
            >
              <MaterialIcons name="share" size={18} color="#6366f1" />
              <Text style={styles.bulkButtonText}>Share</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.bulkButton}
              onPress={() => handleBulkAction('export')}
            >
              <MaterialIcons name="download" size={18} color="#6366f1" />
              <Text style={styles.bulkButtonText}>Export</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.bulkButton, styles.deleteButton]}
              onPress={() => handleBulkAction('delete')}
            >
              <MaterialIcons name="delete" size={18} color="#ef4444" />
              <Text style={[styles.bulkButtonText, styles.deleteButtonText]}>Delete</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* File List/Grid */}
      <FlatList
        data={sortedFiles}
        renderItem={viewMode === 'list' ? renderListItem : renderGridItem}
        keyExtractor={item => item.id}
        numColumns={viewMode === 'grid' ? 2 : 1}
        key={viewMode}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: false }
        )}
      />

      {/* Empty State */}
      {sortedFiles.length === 0 && (
        <View style={styles.emptyState}>
          <MaterialIcons name="library-music" size={64} color="#d1d5db" />
          <Text style={styles.emptyTitle}>No audio files found</Text>
          <Text style={styles.emptyDescription}>
            {searchQuery ? 'Try adjusting your search terms' : 'Create your first audio file to get started'}
          </Text>
        </View>
      )}
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
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  backButton: {
    padding: 8,
    marginRight: 8,
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
    gap: 8,
  },
  viewToggle: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#f3f4f6',
  },
  activeViewToggle: {
    backgroundColor: '#6366f1',
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
    marginLeft: 8,
    fontSize: 16,
    color: '#111827',
  },
  filtersContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  filtersRow: {
    flexDirection: 'row',
    paddingLeft: 20,
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f3f4f6',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  activeFilterChip: {
    backgroundColor: '#6366f1',
    borderColor: '#6366f1',
  },
  filterText: {
    fontSize: 14,
    color: '#6b7280',
    fontWeight: '500',
  },
  activeFilterText: {
    color: 'white',
  },
  sortButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginLeft: 'auto',
    marginRight: 20,
  },
  sortText: {
    fontSize: 14,
    color: '#6b7280',
    marginLeft: 4,
  },
  bulkActionsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: '#f0f4ff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  selectedCount: {
    fontSize: 14,
    color: '#6366f1',
    fontWeight: '600',
  },
  bulkActions: {
    flexDirection: 'row',
    gap: 16,
  },
  bulkButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  bulkButtonText: {
    fontSize: 14,
    color: '#6366f1',
    marginLeft: 4,
    fontWeight: '500',
  },
  deleteButton: {},
  deleteButtonText: {
    color: '#ef4444',
  },
  listContainer: {
    paddingBottom: 20,
  },
  listItem: {
    flexDirection: 'row',
    backgroundColor: 'white',
    marginHorizontal: 20,
    marginVertical: 4,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  selectButton: {
    marginRight: 12,
    alignSelf: 'flex-start',
    padding: 4,
  },
  itemContent: {
    flex: 1,
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  itemInfo: {
    flex: 1,
  },
  itemTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 2,
  },
  itemProject: {
    fontSize: 14,
    color: '#6b7280',
  },
  itemActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    padding: 4,
  },
  waveform: {
    flexDirection: 'row',
    alignItems: 'end',
    height: 30,
    marginVertical: 8,
    gap: 2,
  },
  compactWaveform: {
    height: 20,
  },
  waveformBar: {
    width: 2,
    borderRadius: 1,
  },
  itemFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  itemMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  metaText: {
    fontSize: 12,
    color: '#9ca3af',
  },
  formatBadge: {
    fontSize: 10,
    color: '#6366f1',
    backgroundColor: '#f0f4ff',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    fontWeight: '600',
  },
  dateText: {
    fontSize: 12,
    color: '#9ca3af',
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
  },
  tag: {
    backgroundColor: '#f3f4f6',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  tagText: {
    fontSize: 11,
    color: '#6b7280',
  },
  gridItem: {
    flex: 1,
    backgroundColor: 'white',
    margin: 8,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
    position: 'relative',
  },
  gridSelectButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    padding: 4,
  },
  gridIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#f0f4ff',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  gridTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
    textAlign: 'center',
    marginTop: 8,
  },
  gridProject: {
    fontSize: 12,
    color: '#6b7280',
    textAlign: 'center',
    marginTop: 2,
  },
  gridMeta: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
    alignItems: 'flex-end',
  },
  gridDuration: {
    fontSize: 11,
    color: '#9ca3af',
  },
  gridFormat: {
    fontSize: 10,
    color: '#6366f1',
    backgroundColor: '#f0f4ff',
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: 3,
    fontWeight: '600',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#374151',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyDescription: {
    fontSize: 14,
    color: '#9ca3af',
    textAlign: 'center',
    lineHeight: 20,
  },
});

export default AudioLibraryScreen;