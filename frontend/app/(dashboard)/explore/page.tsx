'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  MagnifyingGlassIcon,
  SparklesIcon,
  TrendingUpIcon,
  ClockIcon,
  StarIcon,
  PlayIcon,
  HeartIcon as HeartOutline,
  HeartIcon as HeartSolid
} from '@heroicons/react/24/outline';

const featuredVoices = [
  {
    id: 'featured-1',
    name: 'Emma Professional',
    gender: 'Female',
    accent: 'British',
    description: 'Perfect for corporate presentations and tutorials',
    rating: 4.9,
    reviews: 1247,
    avatar: '👩‍💼',
    color: '#FF6B6B',
    isNew: true,
    isFavorite: false
  },
  {
    id: 'featured-2',
    name: 'Marcus Storyteller',
    gender: 'Male',
    accent: 'American',
    description: 'Warm, engaging voice for podcasts and audiobooks',
    rating: 4.8,
    reviews: 892,
    avatar: '👨‍🎤',
    color: '#4ECDC4',
    isNew: false,
    isFavorite: true
  },
  {
    id: 'featured-3',
    name: 'Luna Creative',
    gender: 'Female',
    accent: 'Australian',
    description: 'Energetic and creative voice for marketing content',
    rating: 4.7,
    reviews: 654,
    avatar: '👩‍🎨',
    color: '#45B7D1',
    isNew: false,
    isFavorite: false
  }
];

const categories = [
  { id: 'business', name: 'Business', count: 45, icon: '💼' },
  { id: 'education', name: 'Education', count: 32, icon: '📚' },
  { id: 'entertainment', name: 'Entertainment', count: 28, icon: '🎭' },
  { id: 'marketing', name: 'Marketing', count: 51, icon: '📢' },
  { id: 'podcasts', name: 'Podcasts', count: 39, icon: '🎙️' },
  { id: 'audiobooks', name: 'Audiobooks', count: 23, icon: '📖' }
];

const trendingVoices = [
  {
    id: 'trend-1',
    name: 'Alex Conversational',
    gender: 'Non-binary',
    accent: 'Canadian',
    trend: '+25% this week',
    avatar: '🧑',
    color: '#96CEB4'
  },
  {
    id: 'trend-2',
    name: 'Sophie Warm',
    gender: 'Female',
    accent: 'Irish',
    trend: '+18% this week',
    avatar: '👩‍🦰',
    color: '#FF9FF3'
  },
  {
    id: 'trend-3',
    name: 'Carlos Energetic',
    gender: 'Male',
    accent: 'Spanish',
    trend: '+15% this week',
    avatar: '👨‍🦱',
    color: '#54A0FF'
  }
];

export default function ExplorePage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [favorites, setFavorites] = useState(new Set(['featured-2']));

  const router = useRouter();

  const handleToggleFavorite = (voiceId: string) => {
    const newFavorites = new Set(favorites);
    if (newFavorites.has(voiceId)) {
      newFavorites.delete(voiceId);
    } else {
      newFavorites.add(voiceId);
    }
    setFavorites(newFavorites);
  };

  const handleUseVoice = (voiceId: string) => {
    router.push(`/dashboard/tts/create?voice=${voiceId}`);
  };

  const handleCategoryClick = (categoryId: string) => {
    setSelectedCategory(selectedCategory === categoryId ? null : categoryId);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Explore Voices</h1>
              <p className="text-gray-600 mt-1">Discover new AI voices for your projects</p>
            </div>
            <div className="flex items-center space-x-2">
              <SparklesIcon className="w-5 h-5 text-primary-500" />
              <span className="text-sm font-medium text-primary-600">120+ Voices</span>
            </div>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white border-b border-gray-200">
        <div className="px-6 py-4">
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search voices, accents, or styles..."
              className="pl-10"
            />
          </div>
        </div>
      </div>

      {/* Categories */}
      <div className="px-6 py-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Browse by Category</h2>
        <div className="grid grid-cols-2 gap-3">
          {categories.map((category, index) => (
            <motion.button
              key={category.id}
              onClick={() => handleCategoryClick(category.id)}
              className={`p-4 rounded-xl border-2 text-left transition-all ${
                selectedCategory === category.id
                  ? 'border-primary-500 bg-primary-50'
                  : 'border-gray-200 hover:border-gray-300 bg-white'
              }`}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
            >
              <div className="flex items-center space-x-3">
                <div className="text-2xl">{category.icon}</div>
                <div>
                  <h3 className="font-medium text-gray-900">{category.name}</h3>
                  <p className="text-sm text-gray-500">{category.count} voices</p>
                </div>
              </div>
            </motion.button>
          ))}
        </div>
      </div>

      {/* Featured Voices */}
      <div className="px-6 py-6 bg-white">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Featured Voices</h2>
          <Button variant="ghost" size="sm">
            View All
          </Button>
        </div>

        <div className="space-y-4">
          {featuredVoices.map((voice, index) => (
            <motion.div
              key={voice.id}
              className="border border-gray-200 rounded-xl p-4 hover:shadow-md transition-shadow"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
            >
              <div className="flex items-start space-x-4">
                <div className="relative">
                  <div
                    className="w-14 h-14 rounded-full flex items-center justify-center text-white text-xl"
                    style={{ backgroundColor: voice.color }}
                  >
                    {voice.avatar}
                  </div>
                  {voice.isNew && (
                    <div className="absolute -top-1 -right-1 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                      <SparklesIcon className="w-3 h-3 text-white" />
                    </div>
                  )}
                </div>

                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold text-gray-900">{voice.name}</h3>
                    <button
                      onClick={() => handleToggleFavorite(voice.id)}
                      className="p-1 hover:bg-gray-100 rounded-full"
                    >
                      {favorites.has(voice.id) ? (
                        <HeartSolid className="w-5 h-5 text-red-500" />
                      ) : (
                        <HeartOutline className="w-5 h-5 text-gray-400" />
                      )}
                    </button>
                  </div>

                  <div className="flex items-center space-x-2 text-sm text-gray-600 mb-2">
                    <span>{voice.gender}</span>
                    <span>•</span>
                    <span>{voice.accent}</span>
                  </div>

                  <p className="text-sm text-gray-700 mb-3">{voice.description}</p>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-1">
                      <StarIcon className="w-4 h-4 text-yellow-400 fill-current" />
                      <span className="text-sm font-medium text-gray-900">{voice.rating}</span>
                      <span className="text-sm text-gray-500">({voice.reviews})</span>
                    </div>
                    <Button
                      onClick={() => handleUseVoice(voice.id)}
                      size="sm"
                    >
                      Try Voice
                    </Button>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Trending Now */}
      <div className="px-6 py-6">
        <div className="flex items-center space-x-2 mb-4">
          <TrendingUpIcon className="w-5 h-5 text-green-600" />
          <h2 className="text-lg font-semibold text-gray-900">Trending This Week</h2>
        </div>

        <div className="space-y-3">
          {trendingVoices.map((voice, index) => (
            <motion.button
              key={voice.id}
              onClick={() => handleUseVoice(voice.id)}
              className="w-full bg-white rounded-xl border border-gray-200 p-4 text-left hover:shadow-md transition-shadow"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
            >
              <div className="flex items-center space-x-4">
                <div
                  className="w-12 h-12 rounded-full flex items-center justify-center text-white text-lg"
                  style={{ backgroundColor: voice.color }}
                >
                  {voice.avatar}
                </div>
                <div className="flex-1">
                  <h3 className="font-medium text-gray-900">{voice.name}</h3>
                  <p className="text-sm text-gray-600">{voice.gender} • {voice.accent}</p>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium text-green-600">{voice.trend}</div>
                  <div className="text-xs text-gray-500">Trending</div>
                </div>
              </div>
            </motion.button>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="px-6 py-6 bg-white border-t border-gray-200">
        <div className="grid grid-cols-2 gap-4">
          <Button
            onClick={() => router.push('/dashboard/voice-cloning')}
            variant="outline"
            className="h-16 flex-col"
          >
            <PlayIcon className="w-6 h-6 mb-2" />
            Clone Your Voice
          </Button>
          <Button
            onClick={() => router.push('/dashboard/tts/create')}
            className="h-16 flex-col"
          >
            <SparklesIcon className="w-6 h-6 mb-2" />
            Create Project
          </Button>
        </div>
      </div>
    </div>
  );
}
