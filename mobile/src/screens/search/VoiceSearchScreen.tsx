import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  FlatList,
  ActivityIndicator,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

const VoiceSearchScreen = () => {
  const navigation = useNavigation();
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [recentSearches, setRecentSearches] = useState([
    'English Female',
    'Deep Voice',
    'Professional',
    'Cartoon Character',
  ]);

  const categories = [
    { id: 'all', name: 'All Voices' },
    { id: 'ai', name: 'AI Voices' },
    { id: 'cloned', name: 'Cloned' },
    { id: 'premium', name: 'Premium' },
  ];

  // Mock search results
  const mockResults = [
    {
      id: '1',
      name: 'Emma - Professional',
      category: 'AI Voices',
      language: 'English',
      type: 'Female',
      isPremium: false,
      rating: 4.8,
      usageCount: 1250,
    },
    {
      id: '2',
      name: 'Marcus - Deep Voice',
      category: 'AI Voices',
      language: 'English',
      type: 'Male',
      isPremium: true,
      rating: 4.9,
      usageCount: 890,
    },
    {
      id: '3',
      name: 'Luna - Friendly',
      category: 'AI Voices',
      language: 'English',
      type: 'Female',
      isPremium: false,
      rating: 4.7,
      usageCount: 2100,
    },
    {
      id: '4',
      name: 'My Custom Voice',
      category: 'Cloned',
      language: 'English',
      type: 'Male',
      isPremium: false,
      rating: 5.0,
      usageCount: 45,
    },
  ];

  useEffect(() => {
    if (searchQuery.length > 2) {
      performSearch();
    } else {
      setSearchResults([]);
    }
  }, [searchQuery, selectedCategory]);

  const performSearch = async () => {
    setIsLoading(true);
    try {
      // TODO: Integrate with backend search API
      await new Promise(resolve => setTimeout(resolve, 1000));
      let results = mockResults.filter(result =>
        result.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        result.language.toLowerCase().includes(searchQuery.toLowerCase()) ||
        result.type.toLowerCase().includes(searchQuery.toLowerCase())
      );

      if (selectedCategory !== 'all') {
        results = results.filter(result => {
          switch (selectedCategory) {
            case 'ai':
              return result.category === 'AI Voices';
            case 'cloned':
              return result.category === 'Cloned';
            case 'premium':
              return result.isPremium;
            default:
              return true;
          }
        });
      }

      setSearchResults(results);
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRecentSearch = (query: string) => {
    setSearchQuery(query);
  };

  const handleClearSearch = () => {
    setSearchQuery('');
    setSearchResults([]);
  };

  const handleCategorySelect = (categoryId: string) => {
    setSelectedCategory(categoryId);
  };

  const handleVoicePress = (voice: any) => {
    // Navigate to voice details or use voice
    console.log('Voice selected:', voice);
  };

  const handleAddToFavorites = (voiceId: string) => {
    // TODO: Add to favorites
    console.log('Add to favorites:', voiceId);
  };

  const renderVoiceResult = ({ item }: { item: any }) => (
    <TouchableOpacity
      style={styles.voiceCard}
      onPress={() => handleVoicePress(item)}
    >
      <View style={styles.voiceHeader}>
        <View style={styles.voiceInfo}>
          <Text style={styles.voiceName}>{item.name}</Text>
          <Text style={styles.voiceDetails}>
            {item.language} • {item.type}
          </Text>
          <View style={styles.voiceMeta}>
            <View style={styles.rating}>
              <MaterialIcons name="star" size={14} color="#F59E0B" />
              <Text style={styles.ratingText}>{item.rating}</Text>
            </View>
            <Text style={styles.usageText}>{item.usageCount} uses</Text>
          </View>
        </View>
        <View style={styles.voiceActions}>
          {item.isPremium && (
            <View style={styles.premiumBadge}>
              <MaterialIcons name="star" size={12} color="#F59E0B" />
              <Text style={styles.premiumText}>Pro</Text>
            </View>
          )}
          <TouchableOpacity
            style={styles.favoriteButton}
            onPress={() => handleAddToFavorites(item.id)}
          >
            <MaterialIcons name="favorite-border" size={20} color="#6B7280" />
          </TouchableOpacity>
        </View>
      </View>
      <View style={styles.voiceFooter}>
        <TouchableOpacity style={styles.previewButton}>
          <MaterialIcons name="play-arrow" size={16} color="#5546FF" />
          <Text style={styles.previewText}>Preview</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.useButton}>
          <Text style={styles.useButtonText}>Use Voice</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  const renderRecentSearch = (query: string, index: number) => (
    <TouchableOpacity
      key={index}
      style={styles.recentSearchItem}
      onPress={() => handleRecentSearch(query)}
    >
      <MaterialIcons name="history" size={20} color="#6B7280" />
      <Text style={styles.recentSearchText}>{query}</Text>
      <TouchableOpacity
        style={styles.removeRecentButton}
        onPress={() => {
          setRecentSearches(prev => prev.filter((_, i) => i !== index));
        }}
      >
        <MaterialIcons name="close" size={16} color="#9CA3AF" />
      </TouchableOpacity>
    </TouchableOpacity>
  );

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
        <Text style={styles.title}>Search Voices</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* Search Input */}
      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <MaterialIcons name="search" size={20} color="#6B7280" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search voices, languages, or categories..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            autoFocus
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={handleClearSearch}>
              <MaterialIcons name="close" size={20} color="#6B7280" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Categories */}
      <View style={styles.categoriesContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={styles.categoriesList}>
            {categories.map((category) => (
              <TouchableOpacity
                key={category.id}
                style={[
                  styles.categoryButton,
                  selectedCategory === category.id && styles.categoryButtonActive,
                ]}
                onPress={() => handleCategorySelect(category.id)}
              >
                <Text
                  style={[
                    styles.categoryText,
                    selectedCategory === category.id && styles.categoryTextActive,
                  ]}
                >
                  {category.name}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      </View>

      {/* Content */}
      <View style={styles.content}>
        {searchQuery.length === 0 ? (
          // Recent Searches
          <View style={styles.recentSearches}>
            <Text style={styles.sectionTitle}>Recent Searches</Text>
            {recentSearches.map((query, index) => renderRecentSearch(query, index))}
          </View>
        ) : isLoading ? (
          // Loading State
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#5546FF" />
            <Text style={styles.loadingText}>Searching voices...</Text>
          </View>
        ) : searchResults.length > 0 ? (
          // Search Results
          <>
            <Text style={styles.resultsTitle}>
              Found {searchResults.length} voice{searchResults.length !== 1 ? 's' : ''}
            </Text>
            <FlatList
              data={searchResults}
              renderItem={renderVoiceResult}
              keyExtractor={(item) => item.id}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.resultsList}
            />
          </>
        ) : searchQuery.length > 2 ? (
          // No Results
          <View style={styles.noResults}>
            <MaterialIcons name="voice-over-off" size={64} color="#E5E7EB" />
            <Text style={styles.noResultsTitle}>No voices found</Text>
            <Text style={styles.noResultsText}>
              Try different keywords or check your spelling
            </Text>
            <TouchableOpacity style={styles.clearButton} onPress={handleClearSearch}>
              <Text style={styles.clearButtonText}>Clear Search</Text>
            </TouchableOpacity>
          </View>
        ) : null}
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
  searchContainer: {
    padding: 20,
    backgroundColor: '#FFFFFF',
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#1F2937',
    marginLeft: 12,
    marginRight: 8,
  },
  categoriesContainer: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 12,
  },
  categoriesList: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 8,
  },
  categoryButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  categoryButtonActive: {
    backgroundColor: '#5546FF',
    borderColor: '#5546FF',
  },
  categoryText: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },
  categoryTextActive: {
    color: '#FFFFFF',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  recentSearches: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 16,
  },
  recentSearchItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  recentSearchText: {
    flex: 1,
    fontSize: 16,
    color: '#1F2937',
    marginLeft: 12,
  },
  removeRecentButton: {
    padding: 4,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#6B7280',
    marginTop: 16,
  },
  resultsTitle: {
    fontSize: 16,
    color: '#6B7280',
    marginBottom: 16,
  },
  resultsList: {
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
    marginBottom: 12,
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
  voiceDetails: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 8,
  },
  voiceMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  rating: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    fontSize: 14,
    color: '#1F2937',
    marginLeft: 4,
    fontWeight: '500',
  },
  usageText: {
    fontSize: 14,
    color: '#6B7280',
  },
  voiceActions: {
    alignItems: 'flex-end',
  },
  premiumBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF8E1',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 8,
  },
  premiumText: {
    fontSize: 12,
    color: '#F59E0B',
    fontWeight: '500',
    marginLeft: 2,
  },
  favoriteButton: {
    padding: 8,
  },
  voiceFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  previewButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#F3F4F6',
    borderRadius: 6,
  },
  previewText: {
    fontSize: 14,
    color: '#5546FF',
    marginLeft: 4,
  },
  useButton: {
    backgroundColor: '#5546FF',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 6,
  },
  useButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
  },
  noResults: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  noResultsTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1F2937',
    marginTop: 16,
    marginBottom: 8,
  },
  noResultsText: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 24,
  },
  clearButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    backgroundColor: '#5546FF',
    borderRadius: 8,
  },
  clearButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '500',
  },
});

export default VoiceSearchScreen;
