import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '../../components/ui/button';
import { Card } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Input } from '../../components/ui/input';
import { useTheme } from '../../lib/theme-provider';
import {
  MagnifyingGlassIcon as SearchIcon,
  FunnelIcon as FilterIcon,
  PlayIcon,
  StarIcon,
  ArrowDownTrayIcon as DownloadIcon,
  ShareIcon,
  EllipsisVerticalIcon as MoreVerticalIcon,
  SparklesIcon,
  ClockIcon,
  UserGroupIcon
} from '@heroicons/react/24/outline';
import {
  PlayIcon as PlayIconSolid,
  StarIcon as StarIconSolid
} from '@heroicons/react/24/solid';

const VoiceLibrary = () => {
  const { theme } = useTheme();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [playingVoice, setPlayingVoice] = useState<string | null>(null);

  const categories = [
    { id: 'all', name: 'All Voices', count: 247 },
    { id: 'premium', name: 'Premium', count: 89 },
    { id: 'free', name: 'Free', count: 158 },
    { id: 'recent', name: 'Recent', count: 24 },
    { id: 'favorites', name: 'Favorites', count: 12 }
  ];

  const voices = [
    {
      id: '1',
      name: 'Emma',
      description: 'Natural & Warm',
      language: 'English',
      style: 'Conversational',
      rating: 4.9,
      downloads: '2.1k',
      avatar: '👩',
      isPremium: false,
      isFavorite: true,
      tags: ['Natural', 'Warm', 'Professional']
    },
    {
      id: '2',
      name: 'Marcus',
      description: 'Professional & Confident',
      language: 'English',
      style: 'Corporate',
      rating: 4.8,
      downloads: '1.8k',
      avatar: '👨',
      isPremium: true,
      isFavorite: false,
      tags: ['Professional', 'Confident', 'Corporate']
    },
    {
      id: '3',
      name: 'Luna',
      description: 'Friendly & Casual',
      language: 'Spanish',
      style: 'Casual',
      rating: 4.7,
      downloads: '956',
      avatar: '👩',
      isPremium: false,
      isFavorite: true,
      tags: ['Friendly', 'Casual', 'Spanish']
    },
    {
      id: '4',
      name: 'Ahmed',
      description: 'Clear & Authoritative',
      language: 'Arabic',
      style: 'News',
      rating: 4.6,
      downloads: '723',
      avatar: '👨',
      isPremium: true,
      isFavorite: false,
      tags: ['Arabic', 'Authoritative', 'News']
    },
    {
      id: '5',
      name: 'Sophie',
      description: 'Elegant & Sophisticated',
      language: 'French',
      style: 'Elegant',
      rating: 4.8,
      downloads: '1.2k',
      avatar: '👩',
      isPremium: false,
      isFavorite: false,
      tags: ['French', 'Elegant', 'Sophisticated']
    },
    {
      id: '6',
      name: 'Hans',
      description: 'Technical & Precise',
      language: 'German',
      style: 'Technical',
      rating: 4.5,
      downloads: '634',
      avatar: '👨',
      isPremium: true,
      isFavorite: true,
      tags: ['German', 'Technical', 'Precise']
    }
  ];

  const filteredVoices = voices.filter(voice => {
    const matchesSearch = voice.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         voice.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         voice.language.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory = selectedCategory === 'all' ||
                           (selectedCategory === 'premium' && voice.isPremium) ||
                           (selectedCategory === 'free' && !voice.isPremium) ||
                           (selectedCategory === 'favorites' && voice.isFavorite) ||
                           (selectedCategory === 'recent');

    return matchesSearch && matchesCategory;
  });

  const handlePlayVoice = (voiceId: string) => {
    setPlayingVoice(playingVoice === voiceId ? null : voiceId);
  };

  const handleFavorite = (voiceId: string) => {
    // Handle favorite toggle
    console.log('Toggle favorite for voice:', voiceId);
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.6,
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
    <div className="min-h-screen pb-20">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="py-6 space-y-6"
      >
        {/* Header */}
        <motion.div variants={itemVariants} className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Voice Library</h1>
            <p className="text-muted-foreground mt-1">Discover and use amazing voices</p>
          </div>
          <Badge variant="outline" className="rounded-full">
            <UserGroupIcon className="w-4 h-4 mr-1" />
            {voices.length} Voices
          </Badge>
        </motion.div>

        {/* Search Bar */}
        <motion.div variants={itemVariants}>
          <div className="relative">
            <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search voices, languages, or styles..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-12 bg-background/50 backdrop-blur-sm border-border/50 focus:border-primary"
            />
          </div>
        </motion.div>

        {/* Categories */}
        <motion.div variants={itemVariants}>
          <div className="flex space-x-2 overflow-x-auto pb-2 scrollbar-hide">
            {categories.map((category) => (
              <Button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                variant={selectedCategory === category.id ? "default" : "outline"}
                size="sm"
                className={`whitespace-nowrap rounded-full ${
                  selectedCategory === category.id
                    ? 'bg-primary text-primary-foreground'
                    : 'hover:bg-accent'
                }`}
              >
                {category.name}
                <span className={`ml-2 text-xs ${
                  selectedCategory === category.id
                    ? 'text-primary-foreground/70'
                    : 'text-muted-foreground'
                }`}>
                  {category.count}
                </span>
              </Button>
            ))}
          </div>
        </motion.div>

        {/* Voice Grid */}
        <motion.div variants={itemVariants}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {filteredVoices.map((voice) => (
              <Card key={voice.id} className="p-4 hover:shadow-lg transition-all duration-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4 flex-1">
                    {/* Avatar */}
                    <div className="text-3xl">{voice.avatar}</div>

                    {/* Voice Info */}
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <h3 className="font-semibold text-foreground">{voice.name}</h3>
                        {voice.isPremium && (
                          <Badge variant="premium" className="text-xs">
                            <SparklesIcon className="w-3 h-3 mr-1" />
                            Premium
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">{voice.description}</p>
                      <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                        <span>{voice.language}</span>
                        <span>•</span>
                        <span>{voice.style}</span>
                        <span>•</span>
                        <div className="flex items-center space-x-1">
                          <StarIcon className="w-3 h-3 text-yellow-500" />
                          <span>{voice.rating}</span>
                        </div>
                        <span>•</span>
                        <span>{voice.downloads} downloads</span>
                      </div>
                      <div className="flex flex-wrap gap-1 mt-2">
                        {voice.tags.map((tag) => (
                          <Badge key={tag} variant="secondary" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center space-x-2">
                    <Button
                      onClick={() => handleFavorite(voice.id)}
                      variant="ghost"
                      size="sm"
                      className="w-8 h-8 rounded-full p-0"
                    >
                      {voice.isFavorite ? (
                        <StarIconSolid className="w-4 h-4 text-yellow-500" />
                      ) : (
                        <StarIcon className="w-4 h-4" />
                      )}
                    </Button>

                    <Button
                      onClick={() => handlePlayVoice(voice.id)}
                      variant="outline"
                      size="sm"
                      className="w-8 h-8 rounded-full p-0"
                    >
                      {playingVoice === voice.id ? (
                        <div className="w-4 h-4 flex items-center justify-center">
                          <div className="w-1 h-3 bg-current rounded-sm"></div>
                          <div className="w-1 h-3 bg-current rounded-sm ml-0.5"></div>
                        </div>
                      ) : (
                        <PlayIcon className="w-4 h-4" />
                      )}
                    </Button>

                    <Button
                      variant="outline"
                      size="sm"
                      className="w-8 h-8 rounded-full p-0"
                    >
                      <MoreVerticalIcon className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                {/* Audio Waveform (when playing) */}
                {playingVoice === voice.id && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mt-4 pt-4 border-t border-border"
                  >
                    <div className="flex items-end justify-center space-x-1 h-12 bg-muted/50 rounded-lg p-2">
                      {[...Array(20)].map((_, i) => (
                        <motion.div
                          key={i}
                          className="w-1 bg-primary rounded-full"
                          animate={{
                            height: Math.random() * 32 + 8
                          }}
                          transition={{
                            duration: 0.2,
                            repeat: Infinity,
                            repeatType: "reverse"
                          }}
                        />
                      ))}
                    </div>
                    <div className="flex items-center justify-center space-x-4 mt-2">
                      <Button variant="outline" size="sm">
                        <DownloadIcon className="w-4 h-4 mr-2" />
                        Download
                      </Button>
                      <Button variant="outline" size="sm">
                        <ShareIcon className="w-4 h-4 mr-2" />
                        Share
                      </Button>
                    </div>
                  </motion.div>
                )}
              </Card>
            ))}
          </div>
        </motion.div>

        {/* Load More */}
        {filteredVoices.length > 0 && (
          <motion.div variants={itemVariants}>
            <Button
              variant="outline"
              className="w-full h-12 rounded-xl"
            >
              Load More Voices
            </Button>
          </motion.div>
        )}

        {/* Empty State */}
        {filteredVoices.length === 0 && (
          <motion.div variants={itemVariants} className="text-center py-12">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-lg font-semibold text-foreground mb-2">No voices found</h3>
            <p className="text-muted-foreground mb-4">
              Try adjusting your search or browse different categories
            </p>
            <Button
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('all');
              }}
              variant="outline"
            >
              Clear Filters
            </Button>
          </motion.div>
        )}

        {/* Usage Stats */}
        <motion.div variants={itemVariants}>
          <Card className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950 dark:to-pink-950">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <SparklesIcon className="w-5 h-5 text-purple-600" />
                <div>
                  <p className="text-sm font-medium text-foreground">Premium Voices Used</p>
                  <p className="text-xs text-muted-foreground">This month</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium text-foreground">12 / 50</p>
                <div className="w-20 bg-white/50 rounded-full h-1.5 mt-1">
                  <div className="bg-purple-600 h-1.5 rounded-full w-1/4"></div>
                </div>
              </div>
            </div>
          </Card>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default VoiceLibrary;
