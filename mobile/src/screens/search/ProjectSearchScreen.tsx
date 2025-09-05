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

const ProjectSearchScreen = () => {
  const navigation = useNavigation();
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [recentSearches, setRecentSearches] = useState([
    'TTS Marketing',
    'Voice Changer Podcast',
    'Spanish Translation',
    'Audiobook Narration',
  ]);

  // Mock search results
  const mockResults = [
    {
      id: '1',
      title: 'Marketing Campaign Audio',
      description: 'Voice overs for product launch campaign',
      type: 'TTS',
      status: 'completed',
      createdAt: '2024-01-15',
      author: 'John Doe',
    },
    {
      id: '2',
      title: 'Podcast Episode Translation',
      description: 'Spanish translation of tech podcast',
      type: 'Translation',
      status: 'processing',
      createdAt: '2024-01-12',
      author: 'Jane Smith',
    },
    {
      id: '3',
      title: 'Audiobook Narration',
      description: 'Fiction novel voice over',
      type: 'TTS',
      status: 'completed',
      createdAt: '2024-01-10',
      author: 'Mike Johnson',
    },
  ];

  useEffect(() => {
    if (searchQuery.length > 2) {
      performSearch();
    } else {
      setSearchResults([]);
    }
  }, [searchQuery]);

  const performSearch = async () => {
    setIsLoading(true);
    try {
      // TODO: Integrate with backend search API
      await new Promise(resolve => setTimeout(resolve, 1000));
      setSearchResults(mockResults.filter(result =>
        result.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        result.description.toLowerCase().includes(searchQuery.toLowerCase())
      ));
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

  const handleFilterPress = () => {
    // TODO: Implement filter modal
    console.log('Filter pressed');
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

  const renderSearchResult = ({ item }: { item: any }) => (
    <TouchableOpacity
      style={styles.resultCard}
      onPress={() => navigation.navigate('ProjectDetail', { project: item })}
    >
      <View style={styles.resultHeader}>
        <View style={styles.resultIcon}>
          <MaterialIcons
            name={getTypeIcon(item.type)}
            size={20}
            color="#5546FF"
          />
        </View>
        <View style={styles.resultInfo}>
          <Text style={styles.resultTitle}>{item.title}</Text>
          <Text style={styles.resultDescription}>{item.description}</Text>
          <Text style={styles.resultAuthor}>by {item.author}</Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) + '20' }]}>
          <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>
            {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
          </Text>
        </View>
      </View>
      <Text style={styles.resultDate}>{item.createdAt}</Text>
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
        <Text style={styles.title}>Search Projects</Text>
        <TouchableOpacity style={styles.filterButton} onPress={handleFilterPress}>
          <MaterialIcons name="filter-list" size={24} color="#5546FF" />
        </TouchableOpacity>
      </View>

      {/* Search Input */}
      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <MaterialIcons name="search" size={20} color="#6B7280" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search projects, descriptions, or authors..."
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
            <Text style={styles.loadingText}>Searching...</Text>
          </View>
        ) : searchResults.length > 0 ? (
          // Search Results
          <>
            <Text style={styles.resultsTitle}>
              Found {searchResults.length} result{searchResults.length !== 1 ? 's' : ''}
            </Text>
            <FlatList
              data={searchResults}
              renderItem={renderSearchResult}
              keyExtractor={(item) => item.id}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.resultsList}
            />
          </>
        ) : searchQuery.length > 2 ? (
          // No Results
          <View style={styles.noResults}>
            <MaterialIcons name="search-off" size={64} color="#E5E7EB" />
            <Text style={styles.noResultsTitle}>No projects found</Text>
            <Text style={styles.noResultsText}>
              Try adjusting your search terms or check for typos
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
  filterButton: {
    padding: 4,
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
  resultCard: {
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
  resultHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  resultIcon: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  resultInfo: {
    flex: 1,
  },
  resultTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  resultDescription: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 4,
  },
  resultAuthor: {
    fontSize: 12,
    color: '#9CA3AF',
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
  resultDate: {
    fontSize: 12,
    color: '#9CA3AF',
    textAlign: 'right',
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

export default ProjectSearchScreen;
