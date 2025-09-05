'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  ArrowLeftIcon, 
  PlayIcon, 
  PauseIcon, 
  MagnifyingGlassIcon,
  FunnelIcon
} from '@heroicons/react/24/outline';
import { HeartIcon as HeartOutline } from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolid } from '@heroicons/react/24/solid';

const voiceCategories = [
  { id: 'ai-voices', name: 'AI Voices', count: 120 },
  { id: 'my-voices', name: 'My Voices', count: 3 },
  { id: 'favorites', name: 'Favorites', count: 8 }
];

const filters = {
  gender: ['All', 'Male', 'Female', 'Non-binary'],
  accent: ['All', 'American', 'British', 'Australian', 'Canadian', 'Irish', 'Spanish', 'French', 'German'],
  age: ['All', 'Child', 'Young Adult', 'Middle-aged', 'Senior'],
  style: ['All', 'Conversational', 'Professional', 'Friendly', 'Authoritative', 'Warm', 'Energetic']
};

const voices = [
  {
    id: 'sarah',
    name: 'Sarah',
    gender: 'Female',
    accent: 'American',
    age: 'Young Adult',
    style: 'Conversational',
    preview: 'Hello, this is Sarah speaking. I have a warm and friendly voice that\'s perfect for conversational content.',
    avatar: '👩',
    color: '#FF6B6B',
    isFavorite: true,
    isPopular: true
  },
  {
    id: 'james',
    name: 'James',
    gender: 'Male',
    accent: 'British',
    age: 'Middle-aged',
    style: 'Professional',
    preview: 'Good day, I\'m James. My voice conveys authority and professionalism, ideal for business presentations.',
    avatar: '👨',
    color: '#4ECDC4',
    isFavorite: false,
    isPopular: true
  },
  {
    id: 'maria',
    name: 'Maria',
    gender: 'Female',
    accent: 'Spanish',
    age: 'Young Adult',
    style: 'Energetic',
    preview: 'Hola, soy Maria. I bring energy and enthusiasm to any content with my vibrant speaking style.',
    avatar: '👩‍🦱',
    color: '#45B7D1',
    isFavorite: false,
    isPopular: false
  },
  {
    id: 'david',
    name: 'David',
    gender: 'Male',
    accent: 'Australian',
    age: 'Young Adult',
    style: 'Friendly',
    preview: 'G\'day mate, I\'m David. My relaxed Australian accent makes content feel approachable and friendly.',
    avatar: '👨‍🦲',
    color: '#96CEB4',
    isFavorite: true,
    isPopular: false
  },
  {
    id: 'emma',
    name: 'Emma',
    gender: 'Female',
    accent: 'British',
    age: 'Middle-aged',
    style: 'Authoritative',
    preview: 'Hello, I\'m Emma. My authoritative tone commands attention and respect in professional settings.',
    avatar: '👩‍💼',
    color: '#FECA57',
    isFavorite: false,
    isPopular: true
  },
  {
    id: 'alex',
    name: 'Alex',
    gender: 'Non-binary',
    accent: 'Canadian',
    age: 'Young Adult',
    style: 'Warm',
    preview: 'Hi there, I\'m Alex. My inclusive and warm voice creates a welcoming atmosphere for all listeners.',
    avatar: '🧑',
    color: '#FF9FF3',
    isFavorite: false,
    isPopular: false
  }
];

export default function VoiceSelectionPage() {
  const [selectedCategory, setSelectedCategory] = useState('ai-voices');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilters, setSelectedFilters] = useState({
    gender: 'All',
    accent: 'All',
    age: 'All',
    style: 'All'
  });
  const [playingVoice, setPlayingVoice] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [favorites, setFavorites] = useState(new Set(['sarah', 'david']));
  
  const router = useRouter();

  const filteredVoices = voices.filter(voice => {
    const matchesSearch = voice.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         voice.accent.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         voice.style.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesGender = selectedFilters.gender === 'All' || voice.gender === selectedFilters.gender;
    const matchesAccent = selectedFilters.accent === 'All' || voice.accent === selectedFilters.accent;
    const matchesAge = selectedFilters.age === 'All' || voice.age === selectedFilters.age;
    const matchesStyle = selectedFilters.style === 'All' || voice.style === selectedFilters.style;
    
    return matchesSearch && matchesGender && matchesAccent && matchesAge && matchesStyle;
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

  const handleSelectVoice = (voice: any) => {
    // Return to editor with selected voice
    router.back();
  };

  const handleFilterChange = (category: string, value: string) => {
    setSelectedFilters(prev => ({
      ...prev,
      [category]: value
    }));
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Header */}
      <div className="sticky top-0 bg-white border-b border-gray-200 z-10">
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center space-x-3">
            <Button variant="ghost" size="icon" onClick={() => router.back()}>
              <ArrowLeftIcon className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-lg font-semibold text-gray-900">Choose Voice</h1>
              <p className="text-sm text-gray-500">{filteredVoices.length} voices available</p>
            </div>
          </div>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
          >
            <FunnelIcon className="w-4 h-4 mr-2" />
            Filters
          </Button>
        </div>

        {/* Search */}
        <div className="px-6 pb-4">
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search voices by name, accent, or style..."
              className="pl-10 h-10"
            />
          </div>
        </div>

        {/* Category Tabs */}
        <div className="px-6 pb-4">
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

      {/* Filters */}
      {showFilters && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          className="border-b border-gray-200 bg-gray-50 overflow-hidden"
        >
          <div className="px-6 py-4 space-y-4">
            {Object.entries(filters).map(([category, options]) => (
              <div key={category}>
                <label className="block text-sm font-medium text-gray-700 mb-2 capitalize">
                  {category}
                </label>
                <div className="flex flex-wrap gap-2">
                  {options.map((option) => (
                    <button
                      key={option}
                      onClick={() => handleFilterChange(category, option)}
                      className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                        selectedFilters[category as keyof typeof selectedFilters] === option
                          ? 'bg-primary-500 text-white'
                          : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      {option}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Voice List */}
      <div className="flex-1 px-6 py-4">
        <div className="space-y-3">
          {filteredVoices.map((voice, index) => (
            <motion.div
              key={voice.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
              className="bg-white rounded-xl border border-gray-200 p-4 hover:border-primary-300 transition-colors"
            >
              <div className="flex items-start space-x-4">
                {/* Avatar */}
                <div 
                  className="w-12 h-12 rounded-full flex items-center justify-center text-white text-xl flex-shrink-0"
                  style={{ backgroundColor: voice.color }}
                >
                  {voice.avatar}
                </div>

                {/* Voice Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2 mb-1">
                    <h3 className="font-semibold text-gray-900">{voice.name}</h3>
                    {voice.isPopular && (
                      <span className="px-2 py-0.5 bg-orange-100 text-orange-800 text-xs rounded-full font-medium">
                        Popular
                      </span>
                    )}
                  </div>
                  
                  <div className="flex flex-wrap gap-2 text-sm text-gray-600 mb-2">
                    <span>{voice.gender}</span>
                    <span>•</span>
                    <span>{voice.accent}</span>
                    <span>•</span>
                    <span>{voice.age}</span>
                    <span>•</span>
                    <span>{voice.style}</span>
                  </div>
                  
                  <p className="text-sm text-gray-700 leading-relaxed">
                    {voice.preview}
                  </p>
                </div>

                {/* Actions */}
                <div className="flex flex-col space-y-2 flex-shrink-0">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePlayPreview(voice.id)}
                  >
                    {playingVoice === voice.id ? (
                      <PauseIcon className="w-4 h-4" />
                    ) : (
                      <PlayIcon className="w-4 h-4" />
                    )}
                  </Button>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleToggleFavorite(voice.id)}
                  >
                    {favorites.has(voice.id) ? (
                      <HeartSolid className="w-4 h-4 text-red-500" />
                    ) : (
                      <HeartOutline className="w-4 h-4" />
                    )}
                  </Button>
                </div>
              </div>

              {/* Select Button */}
              <div className="mt-4 pt-3 border-t border-gray-100">
                <Button
                  onClick={() => handleSelectVoice(voice)}
                  variant="outline"
                  fullWidth
                  className="font-medium"
                >
                  Select {voice.name}
                </Button>
              </div>
            </motion.div>
          ))}
        </div>

        {filteredVoices.length === 0 && (
          <div className="text-center py-12">
            <div className="text-4xl mb-4">🔍</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No voices found</h3>
            <p className="text-gray-600">Try adjusting your search or filters</p>
          </div>
        )}
      </div>
    </div>
  );
}