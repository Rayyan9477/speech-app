import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui/button';
import { Card } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Input } from '../../components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '../../components/ui/avatar';
import { useTheme } from '../../lib/theme-provider';
import {
  ArrowLeftIcon,
  AdjustmentsHorizontalIcon,
  MagnifyingGlassIcon,
  PlayIcon,
  HeartIcon,
  StarIcon
} from '@heroicons/react/24/outline';
import {
  HeartIcon as HeartIconSolid
} from '@heroicons/react/24/solid';

interface Voice {
  id: string;
  name: string;
  gender: 'M' | 'F';
  language: string;
  country: string;
  ageGroup: 'Young' | 'Middle-Aged' | 'Senior';
  accent?: string;
  rating: number;
  avatar: string;
  isPremium: boolean;
  isFavorite: boolean;
  description?: string;
  sampleUrl?: string;
}

const ExploreVoices = () => {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'premium' | 'free'>('all');
  const [voices, setVoices] = useState<Voice[]>([
    {
      id: '1',
      name: 'Olivia',
      gender: 'F',
      language: 'English',
      country: '🇺🇸',
      ageGroup: 'Young',
      rating: 4.9,
      avatar: '/api/placeholder/48/48',
      isPremium: false,
      isFavorite: true,
      description: 'Warm and friendly voice perfect for storytelling'
    },
    {
      id: '2',
      name: 'Samuel',
      gender: 'M',
      language: 'English',
      country: '🇺🇸',
      ageGroup: 'Middle-Aged',
      rating: 4.8,
      avatar: '/api/placeholder/48/48',
      isPremium: false,
      isFavorite: false,
      description: 'Professional and authoritative tone'
    },
    {
      id: '3',
      name: 'Daniel',
      gender: 'M',
      language: 'English',
      country: '🇮🇳',
      ageGroup: 'Middle-Aged',
      rating: 4.7,
      avatar: '/api/placeholder/48/48',
      isPremium: false,
      isFavorite: false,
      description: 'Clear and articulate with Indian accent'
    },
    {
      id: '4',
      name: 'Isabella',
      gender: 'F',
      language: 'Spanish',
      country: '🇩🇪',
      ageGroup: 'Young',
      rating: 4.9,
      avatar: '/api/placeholder/48/48',
      isPremium: true,
      isFavorite: false,
      description: 'Energetic and expressive Spanish voice'
    },
    {
      id: '5',
      name: 'Abigail',
      gender: 'F',
      language: 'English',
      country: '🇳🇱',
      ageGroup: 'Middle-Aged',
      rating: 4.6,
      avatar: '/api/placeholder/48/48',
      isPremium: true,
      isFavorite: true,
      description: 'Sophisticated Dutch-English accent'
    },
    {
      id: '6',
      name: 'Gabriel',
      gender: 'M',
      language: 'Portuguese',
      country: '🇸🇦',
      ageGroup: 'Middle-Aged',
      rating: 4.8,
      avatar: '/api/placeholder/48/48',
      isPremium: true,
      isFavorite: false,
      description: 'Rich and smooth Portuguese voice'
    }
  ]);

  const toggleFavorite = (voiceId: string) => {
    setVoices(voices.map(voice =>
      voice.id === voiceId ? { ...voice, isFavorite: !voice.isFavorite } : voice
    ));
  };

  const filteredVoices = voices.filter(voice => {
    const matchesSearch = voice.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         voice.language.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesFilter = selectedFilter === 'all' ||
                         (selectedFilter === 'premium' && voice.isPremium) ||
                         (selectedFilter === 'free' && !voice.isPremium);
    
    return matchesSearch && matchesFilter;
  });

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
        className="py-6"
      >
        {/* Header */}
        <motion.div variants={itemVariants} className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate(-1)}
              className="p-2"
            >
              <ArrowLeftIcon className="w-5 h-5" />
            </Button>
            <h1 className="text-xl font-bold text-foreground">Explore AI Voices</h1>
          </div>
          <Button variant="ghost" size="sm" className="p-2">
            <AdjustmentsHorizontalIcon className="w-5 h-5 text-muted-foreground" />
          </Button>
        </motion.div>

        {/* Search Bar */}
        <motion.div variants={itemVariants} className="mb-6">
          <div className="relative">
            <MagnifyingGlassIcon className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search by Voice Name"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 py-3 rounded-xl"
            />
          </div>
        </motion.div>

        {/* Filter Tabs */}
        <motion.div variants={itemVariants} className="mb-6">
          <div className="flex space-x-2">
            {[
              { key: 'all', label: 'All Voices' },
              { key: 'premium', label: 'Premium' },
              { key: 'free', label: 'Free' }
            ].map((filter) => (
              <Button
                key={filter.key}
                variant={selectedFilter === filter.key ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedFilter(filter.key as any)}
                className="rounded-full"
              >
                {filter.label}
              </Button>
            ))}
          </div>
        </motion.div>

        {/* Voices Grid */}
        <motion.div variants={itemVariants} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {filteredVoices.map((voice, index) => (
            <motion.div
              key={voice.id}
              variants={itemVariants}
              custom={index}
            >
              <Card className="p-4 hover:shadow-lg transition-all duration-200 cursor-pointer group">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <Avatar className="w-12 h-12">
                      <AvatarImage src={voice.avatar} />
                      <AvatarFallback>
                        {voice.name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="flex items-center space-x-2">
                        <h3 className="font-semibold text-foreground">
                          {voice.name} ({voice.gender})
                        </h3>
                        <span className="text-lg">{voice.country}</span>
                        {voice.isPremium && (
                          <Badge variant="premium" className="text-xs px-2 py-0">
                            <StarIcon className="w-3 h-3 mr-1 fill-current" />
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">{voice.ageGroup}</p>
                      {voice.description && (
                        <p className="text-xs text-muted-foreground mt-1 line-clamp-1">
                          {voice.description}
                        </p>
                      )}
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleFavorite(voice.id);
                    }}
                    className="p-2"
                  >
                    {voice.isFavorite ? (
                      <HeartIconSolid className="w-5 h-5 text-red-500" />
                    ) : (
                      <HeartIcon className="w-5 h-5 text-muted-foreground" />
                    )}
                  </Button>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="flex items-center space-x-1">
                      <StarIcon className="w-4 h-4 text-yellow-500 fill-current" />
                      <span className="text-sm text-muted-foreground">{voice.rating}</span>
                    </div>
                    <span className="text-sm text-muted-foreground">•</span>
                    <span className="text-sm text-muted-foreground">{voice.language}</span>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="p-2 hover:bg-blue-100 dark:hover:bg-blue-900/30"
                    >
                      <PlayIcon className="w-4 h-4 text-blue-500" />
                    </Button>
                    <Button
                      size="sm"
                      className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-full text-xs"
                    >
                      Select
                    </Button>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        {/* Empty State */}
        {filteredVoices.length === 0 && (
          <motion.div variants={itemVariants} className="text-center py-12">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-lg font-semibold text-foreground mb-2">No voices found</h3>
            <p className="text-muted-foreground">Try adjusting your search or filters</p>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
};

export default ExploreVoices;