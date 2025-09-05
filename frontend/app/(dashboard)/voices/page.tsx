'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  MagnifyingGlassIcon,
  HeartIcon as HeartOutline,
  HeartIcon as HeartSolid,
  PlayIcon,
  PauseIcon,
  PlusIcon
} from '@heroicons/react/24/outline';

const voiceCategories = [
  { id: 'ai-voices', name: 'AI Voices', count: 120 },
  { id: 'my-voices', name: 'My Voices', count: 3 },
  { id: 'favorites', name: 'Favorites', count: 8 }
];

const voices = [
  {
    id: 'sarah',
    name: 'Sarah',
    gender: 'Female',
    accent: 'American',
    age: 'Young Adult',
    style: 'Conversational',
    preview: 'Hello, this is Sarah speaking. I have a warm and friendly voice...',
    avatar: '👩',
    color: '#FF6B6B',
    isFavorite: true,
    category: 'ai-voices',
    isPlaying: false
  },
  {
    id: 'james',
    name: 'James',
    gender: 'Male',
    accent: 'British',
    age: 'Middle-aged',
    style: 'Professional',
    preview: 'Good day, I\'m James. My voice conveys authority and professionalism...',
    avatar: '👨',
    color: '#4ECDC4',
    isFavorite: false,
    category: 'ai-voices',
    isPlaying: false
  },
  {
    id: 'maria',
    name: 'Maria',
    gender: 'Female',
    accent: 'Spanish',
    age: 'Young Adult',
    style: 'Energetic',
    preview: 'Hola, soy Maria. I bring energy and enthusiasm to any content...',
    avatar: '👩‍🦱',
    color: '#45B7D1',
    isFavorite: false,
    category: 'ai-voices',
    isPlaying: false
  },
  {
    id: 'david',
    name: 'David',
    gender: 'Male',
    accent: 'Australian',
    age: 'Young Adult',
    style: 'Friendly',
    preview: 'G\'day mate, I\'m David. My relaxed Australian accent makes content...',
    avatar: '👨‍🦲',
    color: '#96CEB4',
    isFavorite: true,
    category: 'favorites',
    isPlaying: false
  },
  {
    id: 'custom1',
    name: 'My Custom Voice',
    gender: 'Custom',
    accent: 'Personal',
    age: 'Custom',
    style: 'Unique',
    preview: 'This is your custom cloned voice, perfect for personal projects...',
    avatar: '🎭',
    color: '#FF9FF3',
    isFavorite: true,
    category: 'my-voices',
    isPlaying: false
  }
];

export default function VoicesPage() {
  const [selectedCategory, setSelectedCategory] = useState('ai-voices');
  const [searchQuery, setSearchQuery] = useState('');
  const [playingVoice, setPlayingVoice] = useState<string | null>(null);
  const [favorites, setFavorites] = useState(new Set(['sarah', 'david', 'custom1']));

  const router = useRouter();

  const filteredVoices = voices.filter(voice => {
    const matchesCategory = selectedCategory === 'favorites'
      ? favorites.has(voice.id)
      : selectedCategory === 'my-voices'
      ? voice.category === 'my-voices'
      : voice.category === 'ai-voices';

    const matchesSearch = voice.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         voice.accent.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         voice.style.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesCategory && matchesSearch;
  });

  const handlePlayPreview = (voiceId: string) => {
    setPlayingVoice(playingVoice === voiceId ? null : voiceId);
  };

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
    router.push(`/dashboard/tts/voice-selection?voice=${voiceId}`);
  };

  const handleCreateVoice = () => {
    router.push('/dashboard/voice-cloning');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Voice Library</h1>
              <p className="text-gray-600 mt-1">Discover and manage your AI voices</p>
            </div>
            <Button onClick={handleCreateVoice}>
              <PlusIcon className="w-4 h-4 mr-2" />
              Clone Voice
            </Button>
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
              placeholder="Search voices by name, accent, or style..."
              className="pl-10"
            />
          </div>
        </div>
      </div>

      {/* Category Tabs */}
      <div className="bg-white border-b border-gray-200">
        <div className="px-6 py-4">
          <div className="flex space-x-1 bg-gray-100 rounded-lg p-1">
            {voiceCategories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-colors ${
                  selectedCategory === category.id
                    ? 'bg-white text-primary-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {category.name} ({category.count})
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Voices Grid */}
      <div className="px-6 py-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredVoices.map((voice, index) => (
            <motion.div
              key={voice.id}
              className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-md transition-shadow"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
            >
              <div className="flex items-start space-x-4">
                {/* Avatar */}
                <div
                  className="w-14 h-14 rounded-full flex items-center justify-center text-white text-xl flex-shrink-0"
                  style={{ backgroundColor: voice.color }}
                >
                  {voice.avatar}
                </div>

                {/* Voice Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold text-gray-900 text-lg">{voice.name}</h3>
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

                  <div className="flex flex-wrap gap-2 text-sm text-gray-600 mb-3">
                    <span>{voice.gender}</span>
                    <span>•</span>
                    <span>{voice.accent}</span>
                    <span>•</span>
                    <span>{voice.age}</span>
                    <span>•</span>
                    <span>{voice.style}</span>
                  </div>

                  <p className="text-sm text-gray-700 leading-relaxed mb-4">
                    {voice.preview}
                  </p>

                  <div className="flex space-x-2">
                    <Button
                      onClick={() => handlePlayPreview(voice.id)}
                      variant="outline"
                      size="sm"
                      className="flex-1"
                    >
                      {playingVoice === voice.id ? (
                        <PauseIcon className="w-4 h-4 mr-2" />
                      ) : (
                        <PlayIcon className="w-4 h-4 mr-2" />
                      )}
                      Preview
                    </Button>
                    <Button
                      onClick={() => handleUseVoice(voice.id)}
                      size="sm"
                      className="flex-1"
                    >
                      Use Voice
                    </Button>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {filteredVoices.length === 0 && (
          <div className="text-center py-12">
            <div className="text-4xl mb-4">
              {selectedCategory === 'favorites' ? '❤️' : '🔍'}
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {selectedCategory === 'favorites' ? 'No favorite voices yet' : 'No voices found'}
            </h3>
            <p className="text-gray-600 mb-6">
              {selectedCategory === 'favorites'
                ? 'Add voices to your favorites to see them here'
                : 'Try adjusting your search or browse different categories'
              }
            </p>
            <Button onClick={handleCreateVoice}>
              <PlusIcon className="w-4 h-4 mr-2" />
              Create Custom Voice
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
