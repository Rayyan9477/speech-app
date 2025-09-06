import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Card } from '../ui/card';
import { Badge } from '../ui/badge';
import VoiceCard from './VoiceCard';
import VoiceFilterModal from './VoiceFilterModal';
import { useVoiceExplorer } from '../../contexts/VoiceExplorerContext';
import {
  MagnifyingGlassIcon,
  FunnelIcon,
  Squares2X2Icon,
  ListBulletIcon,
  ChevronUpDownIcon,
  SparklesIcon,
  HeartIcon,
  PlayIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';

interface AudioManager {
  currentAudio: HTMLAudioElement | null;
  playingVoiceId: string | null;
}

const EnhancedVoiceExplorer: React.FC = () => {
  const {
    state,
    loadVoices,
    loadMoreVoices,
    searchVoices,
    updateFilters,
    clearFilters,
    toggleFilterPanel,
    toggleFavorite,
    previewVoice,
    stopPreview,
    setViewMode,
    setSorting,
    getFilterOptions
  } = useVoiceExplorer();

  const [audioManager, setAudioManager] = useState<AudioManager>({
    currentAudio: null,
    playingVoiceId: null
  });

  const [searchInput, setSearchInput] = useState(state.searchQuery);
  const [showSortMenu, setShowSortMenu] = useState(false);

  // Load voices on component mount
  useEffect(() => {
    if (state.voices.length === 0) {
      loadVoices();
    }
  }, [loadVoices, state.voices.length]);

  // Handle search input changes
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      searchVoices(searchInput);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchInput, searchVoices]);

  // Clean up audio when component unmounts
  useEffect(() => {
    return () => {
      if (audioManager.currentAudio) {
        audioManager.currentAudio.pause();
        audioManager.currentAudio.src = '';
      }
    };
  }, [audioManager.currentAudio]);

  const handlePlayVoice = async (voiceId: string) => {
    const voice = state.voices.find(v => v.id === voiceId);
    if (!voice || !voice.sampleUrl) return;

    // Stop current audio if playing
    if (audioManager.currentAudio) {
      audioManager.currentAudio.pause();
      audioManager.currentAudio.src = '';
    }

    try {
      const audio = new Audio(voice.sampleUrl);
      audio.preload = 'auto';
      
      audio.addEventListener('loadstart', () => {
        previewVoice(voiceId);
      });

      audio.addEventListener('canplaythrough', () => {
        audio.play().catch(console.error);
      });

      audio.addEventListener('ended', () => {
        stopPreview();
        setAudioManager(prev => ({
          ...prev,
          currentAudio: null,
          playingVoiceId: null
        }));
      });

      audio.addEventListener('error', () => {
        console.error('Failed to load audio for voice:', voiceId);
        stopPreview();
        setAudioManager(prev => ({
          ...prev,
          currentAudio: null,
          playingVoiceId: null
        }));
      });

      setAudioManager({
        currentAudio: audio,
        playingVoiceId: voiceId
      });

      // Load the audio
      audio.load();

    } catch (error) {
      console.error('Error playing voice sample:', error);
      stopPreview();
    }
  };

  const handlePauseVoice = () => {
    if (audioManager.currentAudio) {
      audioManager.currentAudio.pause();
      stopPreview();
      setAudioManager(prev => ({
        ...prev,
        currentAudio: null,
        playingVoiceId: null
      }));
    }
  };

  const sortOptions = [
    { value: 'rating', label: 'Rating', icon: SparklesIcon },
    { value: 'name', label: 'Name', icon: null },
    { value: 'usage', label: 'Popularity', icon: HeartIcon },
    { value: 'recent', label: 'Recently Added', icon: null }
  ];

  const getActiveFilterCount = () => {
    let count = 0;
    count += state.filters.languages.length;
    count += state.filters.genders.length;
    count += state.filters.ageGroups.length;
    count += state.filters.categories.length;
    count += state.filters.providers.length;
    if (state.filters.isPremium !== undefined) count += 1;
    if (state.filters.rating && state.filters.rating > 0) count += 1;
    return count;
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.4 }
    }
  };

  return (
    <div className="min-h-screen pb-20 bg-background">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="py-6 space-y-6 max-w-7xl mx-auto px-4"
      >
        {/* Header */}
        <motion.div variants={itemVariants}>
          <div className="flex flex-col space-y-4">
            <div>
              <h1 className="text-2xl font-bold text-foreground">Explore AI Voices</h1>
              <p className="text-muted-foreground">
                Discover the perfect voice for your project from our extensive collection
              </p>
            </div>

            {/* Search and Controls */}
            <div className="flex flex-col sm:flex-row gap-4">
              {/* Search */}
              <div className="relative flex-1">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  placeholder="Search voices by name, language, or style..."
                  className="pl-10 pr-10"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                />
                {searchInput && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSearchInput('')}
                    className="absolute right-1 top-1/2 transform -translate-y-1/2 p-2"
                  >
                    <XMarkIcon className="w-4 h-4" />
                  </Button>
                )}
              </div>

              {/* Filter Button */}
              <Button
                variant="outline"
                onClick={() => toggleFilterPanel(true)}
                className="flex items-center space-x-2"
              >
                <FunnelIcon className="w-4 h-4" />
                <span>Filters</span>
                {getActiveFilterCount() > 0 && (
                  <Badge variant="secondary" className="px-1.5 py-0.5 text-xs">
                    {getActiveFilterCount()}
                  </Badge>
                )}
              </Button>

              {/* View Mode Toggle */}
              <div className="flex items-center border rounded-lg">
                <Button
                  variant={state.viewMode === 'grid' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('grid')}
                  className="rounded-r-none"
                >
                  <Squares2X2Icon className="w-4 h-4" />
                </Button>
                <Button
                  variant={state.viewMode === 'list' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('list')}
                  className="rounded-l-none border-l"
                >
                  <ListBulletIcon className="w-4 h-4" />
                </Button>
              </div>

              {/* Sort Menu */}
              <div className="relative">
                <Button
                  variant="outline"
                  onClick={() => setShowSortMenu(!showSortMenu)}
                  className="flex items-center space-x-2"
                >
                  <ChevronUpDownIcon className="w-4 h-4" />
                  <span>
                    {sortOptions.find(opt => opt.value === state.sortBy)?.label || 'Sort'}
                  </span>
                </Button>

                <AnimatePresence>
                  {showSortMenu && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="absolute right-0 top-full mt-2 w-48 bg-background border rounded-lg shadow-lg z-50"
                    >
                      <div className="py-2">
                        {sortOptions.map((option) => (
                          <button
                            key={option.value}
                            onClick={() => {
                              setSorting(option.value, state.sortOrder);
                              setShowSortMenu(false);
                            }}
                            className={`w-full flex items-center px-3 py-2 text-left hover:bg-muted/50 transition-colors ${
                              state.sortBy === option.value ? 'bg-muted text-primary' : ''
                            }`}
                          >
                            {option.icon && <option.icon className="w-4 h-4 mr-2" />}
                            <span>{option.label}</span>
                          </button>
                        ))}
                        <div className="border-t mt-2 pt-2">
                          <button
                            onClick={() => {
                              setSorting(state.sortBy, state.sortOrder === 'asc' ? 'desc' : 'asc');
                              setShowSortMenu(false);
                            }}
                            className="w-full flex items-center px-3 py-2 text-left hover:bg-muted/50 transition-colors"
                          >
                            <span>{state.sortOrder === 'asc' ? 'Descending' : 'Ascending'}</span>
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* Active Filters */}
            <AnimatePresence>
              {getActiveFilterCount() > 0 && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="flex flex-wrap items-center gap-2"
                >
                  <span className="text-sm text-muted-foreground">Active filters:</span>
                  
                  {state.filters.languages.map((lang) => (
                    <Badge key={lang} variant="secondary" className="cursor-pointer">
                      {getFilterOptions().languages.find(l => l.code === lang)?.name || lang}
                      <XMarkIcon 
                        className="w-3 h-3 ml-1" 
                        onClick={() => updateFilters({
                          ...state.filters,
                          languages: state.filters.languages.filter(l => l !== lang)
                        })}
                      />
                    </Badge>
                  ))}

                  {state.filters.isPremium !== undefined && (
                    <Badge variant="secondary" className="cursor-pointer">
                      {state.filters.isPremium ? 'Premium' : 'Free'}
                      <XMarkIcon 
                        className="w-3 h-3 ml-1" 
                        onClick={() => updateFilters({ ...state.filters, isPremium: undefined })}
                      />
                    </Badge>
                  )}

                  <Button variant="ghost" size="sm" onClick={clearFilters} className="text-xs">
                    Clear all
                  </Button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>

        {/* Results Summary */}
        <motion.div variants={itemVariants}>
          <div className="flex items-center justify-between">
            <div className="text-sm text-muted-foreground">
              {state.loading ? 'Loading...' : `${state.filteredVoices.length} voices found`}
              {state.searchQuery && ` for "${state.searchQuery}"`}
            </div>
            
            {state.filteredVoices.length > 0 && (
              <div className="text-sm text-muted-foreground">
                Sorted by {sortOptions.find(opt => opt.value === state.sortBy)?.label.toLowerCase()} 
                ({state.sortOrder === 'desc' ? 'high to low' : 'low to high'})
              </div>
            )}
          </div>
        </motion.div>

        {/* Loading State */}
        <AnimatePresence>
          {state.loading && state.voices.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex items-center justify-center py-12"
            >
              <div className="flex items-center space-x-3">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                <span className="text-muted-foreground">Loading voices...</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Error State */}
        <AnimatePresence>
          {state.error && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <Card className="p-6 border-red-200 bg-red-50 dark:bg-red-950 dark:border-red-800">
                <div className="flex items-center justify-center space-x-2 text-red-600">
                  <span>Failed to load voices: {state.error}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={loadVoices}
                    className="text-red-600 hover:text-red-700"
                  >
                    Retry
                  </Button>
                </div>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Voice Grid/List */}
        <motion.div variants={itemVariants}>
          <AnimatePresence>
            {state.filteredVoices.length > 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className={
                  state.viewMode === 'grid'
                    ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'
                    : 'space-y-4'
                }
              >
                {state.filteredVoices.map((voice, index) => (
                  <motion.div
                    key={voice.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ 
                      opacity: 1, 
                      y: 0,
                      transition: { delay: index * 0.05, duration: 0.3 }
                    }}
                    exit={{ opacity: 0, y: -20 }}
                  >
                    <VoiceCard
                      voice={voice}
                      viewMode={state.viewMode}
                      isPlaying={audioManager.playingVoiceId === voice.id}
                      isPreviewing={state.previewingVoice === voice.id}
                      onPlay={() => handlePlayVoice(voice.id)}
                      onPause={handlePauseVoice}
                      onToggleFavorite={() => toggleFavorite(voice.id)}
                    />
                  </motion.div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* No Results */}
        <AnimatePresence>
          {!state.loading && state.filteredVoices.length === 0 && state.voices.length > 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-center py-12"
            >
              <div className="space-y-3">
                <div className="text-muted-foreground">No voices match your current filters</div>
                <Button variant="outline" onClick={clearFilters}>
                  Clear Filters
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Load More */}
        <AnimatePresence>
          {state.hasMore && state.filteredVoices.length > 0 && !state.loading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex justify-center pt-8"
            >
              <Button
                variant="outline"
                onClick={loadMoreVoices}
                disabled={state.loading}
                className="px-8"
              >
                {state.loading ? 'Loading...' : 'Load More Voices'}
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Filter Modal */}
      <VoiceFilterModal
        isOpen={state.isFilterOpen}
        onClose={() => toggleFilterPanel(false)}
        filters={state.filters}
        onFiltersChange={updateFilters}
        onClearFilters={clearFilters}
        filterOptions={getFilterOptions()}
      />

      {/* Click outside to close sort menu */}
      {showSortMenu && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setShowSortMenu(false)}
        />
      )}
    </div>
  );
};

export default EnhancedVoiceExplorer;