import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Alert,
  FlatList,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';

const VoiceLibraryScreen = () => {
  const navigation = useNavigation();
  const [activeTab, setActiveTab] = useState('myVoices');
  const [selectedVoices, setSelectedVoices] = useState<string[]>([]);

  const myVoices = [
    {
      id: '1',
      name: 'My Custom Voice 1',
      type: 'Custom',
      dateCreated: '2024-01-15',
      isFavorite: true,
      usageCount: 24,
    },
    {
      id: '2',
      name: 'Professional Narrator',
      type: 'Cloned',
      dateCreated: '2024-01-10',
      isFavorite: false,
      usageCount: 156,
    },
    {
      id: '3',
      name: 'Casual Chat',
      type: 'Custom',
      dateCreated: '2024-01-05',
      isFavorite: true,
      usageCount: 89,
    },
  ];

  const aiVoices = [
    {
      id: 'ai-1',
      name: 'Emma - Professional',
      category: 'Professional',
      language: 'English',
      isPremium: false,
    },
    {
      id: 'ai-2',
      name: 'Marcus - Deep Voice',
      category: 'Male',
      language: 'English',
      isPremium: true,
    },
    {
      id: 'ai-3',
      name: 'Luna - Friendly',
      category: 'Female',
      language: 'English',
      isPremium: false,
    },
    {
      id: 'ai-4',
      name: 'Alex - Energetic',
      category: 'Male',
      language: 'English',
      isPremium: true,
    },
  ];

  const handleVoiceSelect = (voiceId: string) => {
    setSelectedVoices(prev =>
      prev.includes(voiceId)
        ? prev.filter(id => id !== voiceId)
        : [...prev, voiceId]
    );
  };

  const handleDeleteVoice = (voiceId: string, voiceName: string) => {
    Alert.alert(
      'Delete Voice',
      `Are you sure you want to delete "${voiceName}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            // TODO: Implement delete functionality
            Alert.alert('Success', 'Voice deleted successfully');
          },
        },
      ]
    );
  };

  const handleToggleFavorite = (voiceId: string) => {
    // TODO: Implement favorite toggle
    Alert.alert('Success', 'Favorite status updated');
  };

  const handleAddToFavorites = (voiceId: string) => {
    // TODO: Implement add to favorites
    Alert.alert('Success', 'Voice added to favorites');
  };

  const renderMyVoiceItem = ({ item }: { item: any }) => (
    <View style={styles.voiceCard}>
      <View style={styles.voiceHeader}>
        <View style={styles.voiceInfo}>
          <Text style={styles.voiceName}>{item.name}</Text>
          <Text style={styles.voiceType}>{item.type}</Text>
        </View>
        <TouchableOpacity
          style={styles.favoriteButton}
          onPress={() => handleToggleFavorite(item.id)}
        >
          <MaterialIcons
            name={item.isFavorite ? 'favorite' : 'favorite-border'}
            size={24}
            color={item.isFavorite ? '#EF4444' : '#6B7280'}
          />
        </TouchableOpacity>
      </View>

      <View style={styles.voiceStats}>
        <Text style={styles.statText}>Used {item.usageCount} times</Text>
        <Text style={styles.dateText}>{item.dateCreated}</Text>
      </View>

      <View style={styles.voiceActions}>
        <TouchableOpacity style={styles.actionButton}>
          <MaterialIcons name="play-arrow" size={20} color="#5546FF" />
          <Text style={styles.actionText}>Play</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionButton}>
          <MaterialIcons name="edit" size={20} color="#6B7280" />
          <Text style={styles.actionText}>Edit</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, styles.deleteButton]}
          onPress={() => handleDeleteVoice(item.id, item.name)}
        >
          <MaterialIcons name="delete" size={20} color="#EF4444" />
          <Text style={styles.deleteText}>Delete</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderAIVoiceItem = ({ item }: { item: any }) => (
    <View style={styles.aiVoiceCard}>
      <View style={styles.aiVoiceHeader}>
        <View style={styles.aiVoiceInfo}>
          <Text style={styles.aiVoiceName}>{item.name}</Text>
          <Text style={styles.aiVoiceCategory}>{item.category}</Text>
        </View>
        {item.isPremium && (
          <View style={styles.premiumBadge}>
            <MaterialIcons name="star" size={12} color="#F59E0B" />
            <Text style={styles.premiumText}>Pro</Text>
          </View>
        )}
      </View>

      <Text style={styles.aiVoiceLanguage}>{item.language}</Text>

      <View style={styles.aiVoiceActions}>
        <TouchableOpacity style={styles.aiActionButton}>
          <MaterialIcons name="play-arrow" size={20} color="#5546FF" />
          <Text style={styles.aiActionText}>Preview</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.aiActionButton}
          onPress={() => handleAddToFavorites(item.id)}
        >
          <MaterialIcons name="favorite-border" size={20} color="#6B7280" />
          <Text style={styles.aiActionText}>Favorite</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.aiPrimaryButton}>
          <Text style={styles.aiPrimaryText}>Use Voice</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Voice Library</Text>
        <TouchableOpacity
          style={styles.searchButton}
          onPress={() => navigation.navigate('VoiceSearch' as any)}
        >
          <MaterialIcons name="search" size={24} color="#5546FF" />
        </TouchableOpacity>
      </View>

      {/* Tabs */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'myVoices' && styles.activeTab]}
          onPress={() => setActiveTab('myVoices')}
        >
          <Text style={[styles.tabText, activeTab === 'myVoices' && styles.activeTabText]}>
            My Voices
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, activeTab === 'aiVoices' && styles.activeTab]}
          onPress={() => setActiveTab('aiVoices')}
        >
          <Text style={[styles.tabText, activeTab === 'aiVoices' && styles.activeTabText]}>
            AI Voices
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, activeTab === 'favorites' && styles.activeTab]}
          onPress={() => setActiveTab('favorites')}
        >
          <Text style={[styles.tabText, activeTab === 'favorites' && styles.activeTabText]}>
            Favorites
          </Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      <View style={styles.content}>
        {activeTab === 'myVoices' && (
          <>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Your Custom Voices</Text>
              <TouchableOpacity
                style={styles.addButton}
                onPress={() => navigation.navigate('VoiceCloningUpload' as any)}
              >
                <MaterialIcons name="add" size={20} color="#FFFFFF" />
                <Text style={styles.addButtonText}>Add Voice</Text>
              </TouchableOpacity>
            </View>

            <FlatList
              data={myVoices}
              renderItem={renderMyVoiceItem}
              keyExtractor={(item) => item.id}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.listContainer}
            />
          </>
        )}

        {activeTab === 'aiVoices' && (
          <>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>AI Voice Collection</Text>
              <TouchableOpacity style={styles.filterButton}>
                <MaterialIcons name="filter-list" size={20} color="#5546FF" />
                <Text style={styles.filterText}>Filter</Text>
              </TouchableOpacity>
            </View>

            <FlatList
              data={aiVoices}
              renderItem={renderAIVoiceItem}
              keyExtractor={(item) => item.id}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.listContainer}
            />
          </>
        )}

        {activeTab === 'favorites' && (
          <View style={styles.emptyState}>
            <MaterialIcons name="favorite" size={64} color="#E5E7EB" />
            <Text style={styles.emptyTitle}>No Favorites Yet</Text>
            <Text style={styles.emptyText}>
              Add voices to your favorites to access them quickly
            </Text>
          </View>
        )}
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
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  searchButton: {
    padding: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
    lineHeight: 24,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  tab: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 8,
    marginHorizontal: 4,
  },
  activeTab: {
    backgroundColor: '#5546FF',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6B7280',
  },
  activeTabText: {
    color: '#FFFFFF',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1F2937',
  },
  addButton: {
    backgroundColor: '#5546FF',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  addButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 4,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
  },
  filterText: {
    color: '#5546FF',
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 4,
  },
  listContainer: {
    paddingBottom: 20,
  },
  voiceCard: {
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
  voiceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  voiceInfo: {
    flex: 1,
  },
  voiceName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  voiceType: {
    fontSize: 14,
    color: '#6B7280',
  },
  favoriteButton: {
    padding: 4,
  },
  voiceStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  statText: {
    fontSize: 12,
    color: '#6B7280',
  },
  dateText: {
    fontSize: 12,
    color: '#6B7280',
  },
  voiceActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    backgroundColor: '#F3F4F6',
  },
  actionText: {
    fontSize: 12,
    color: '#374151',
    marginLeft: 4,
  },
  deleteButton: {
    backgroundColor: '#FEF2F2',
  },
  deleteText: {
    color: '#EF4444',
  },
  aiVoiceCard: {
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
  aiVoiceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  aiVoiceInfo: {
    flex: 1,
  },
  aiVoiceName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  aiVoiceCategory: {
    fontSize: 14,
    color: '#6B7280',
  },
  premiumBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF8E1',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  premiumText: {
    fontSize: 12,
    color: '#F59E0B',
    fontWeight: '500',
    marginLeft: 2,
  },
  aiVoiceLanguage: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 12,
  },
  aiVoiceActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  aiActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    backgroundColor: '#F3F4F6',
  },
  aiActionText: {
    fontSize: 12,
    color: '#374151',
    marginLeft: 4,
  },
  aiPrimaryButton: {
    backgroundColor: '#5546FF',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 6,
  },
  aiPrimaryText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '500',
  },
  emptyState: {
    flex: 1,
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
});

export default VoiceLibraryScreen;
