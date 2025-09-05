'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { CheckIcon } from '@heroicons/react/24/solid';

const contentTypes = [
  {
    id: 'videos',
    title: 'Videos & YouTube',
    description: 'Create voiceovers for video content',
    icon: (
      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
        <path d="M17 10.5V7a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h12a1 1 0 001-1v-3.5l4 4v-11l-4 4z"/>
      </svg>
    ),
    gradient: 'from-red-500 to-pink-500'
  },
  {
    id: 'podcasts',
    title: 'Podcasts & Audio',
    description: 'Generate podcast intros, outros, and content',
    icon: (
      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zM9.5 6L14 12l-4.5 6v-12z"/>
      </svg>
    ),
    gradient: 'from-green-500 to-teal-500'
  },
  {
    id: 'presentations',
    title: 'Presentations',
    description: 'Add professional voiceovers to slides',
    icon: (
      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
        <path d="M21 3H3c-1.11 0-2 .89-2 2v12c0 1.11.89 2 2 2h7l-2 3v1h8v-1l-2-3h7c1.11 0 2-.89 2-2V5c0-1.11-.89-2-2-2zm0 12H3V5h18v10z"/>
      </svg>
    ),
    gradient: 'from-blue-500 to-cyan-500'
  },
  {
    id: 'audiobooks',
    title: 'Audiobooks & Stories',
    description: 'Narrate books and storytelling content',
    icon: (
      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
        <path d="M18 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zM6 4h5v8l-2.5-1.5L6 12V4z"/>
      </svg>
    ),
    gradient: 'from-purple-500 to-indigo-500'
  },
  {
    id: 'ads',
    title: 'Ads & Marketing',
    description: 'Create compelling advertising content',
    icon: (
      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
        <path d="M18.5 3.5L12 2l-6.5 1.5v3.07L12 8l6.5-1.43V3.5zM12 10L5.5 8.57v4.43c0 5.25 6.5 7.5 6.5 7.5s6.5-2.25 6.5-7.5V8.57L12 10z"/>
      </svg>
    ),
    gradient: 'from-orange-500 to-red-500'
  },
  {
    id: 'education',
    title: 'Education & Training',
    description: 'Create learning materials and courses',
    icon: (
      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
        <path d="M5 13.18v4L12 21l7-3.82v-4L12 17l-7-3.82zM12 3L1 9l11 6 9-4.91V17h2V9L12 3z"/>
      </svg>
    ),
    gradient: 'from-emerald-500 to-green-500'
  },
  {
    id: 'games',
    title: 'Games & Interactive',
    description: 'Voice characters and game narration',
    icon: (
      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
        <path d="M21.58 16.09l-1.09-7.66A3.996 3.996 0 0016.53 5H7.47C5.48 5 3.79 6.46 3.51 8.43l-1.09 7.66C2.2 17.63 3.39 19 4.94 19c.68 0 1.32-.27 1.8-.75L9 16h6l2.25 2.25c.48.48 1.13.75 1.8.75 1.56 0 2.75-1.37 2.53-2.91zM11 11H9v2H8v-2H6v-1h2V8h1v2h2v1zm4-0.5c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zm2 3c-.83 0-1.5-.67-1.5-1.5S16.17 11 17 11s1.5.67 1.5 1.5-.67 1.5-1.5 1.5z"/>
      </svg>
    ),
    gradient: 'from-violet-500 to-purple-500'
  },
  {
    id: 'multiple',
    title: 'Multiple Types',
    description: 'I create various types of content',
    icon: (
      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
        <path d="M4 6H2v14c0 1.1.9 2 2 2h14v-2H4V6zm16-4H8c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-1 9H9V9h10v2zm-4 4H9v-2h6v2zm4-8H9V5h10v2z"/>
      </svg>
    ),
    gradient: 'from-gray-500 to-gray-600'
  }
];

export default function ContentTypePage() {
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const router = useRouter();

  const handleTypeToggle = (typeId: string) => {
    setSelectedTypes(prev => 
      prev.includes(typeId) 
        ? prev.filter(id => id !== typeId)
        : [...prev, typeId]
    );
  };

  const handleContinue = () => {
    if (selectedTypes.length > 0) {
      router.push('/onboarding/profile-completion');
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Header */}
      <div className="pt-12 px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-2xl font-bold text-gray-900 mb-2">What type of content do you create?</h1>
          <p className="text-gray-600">Select all that apply</p>
        </motion.div>
      </div>

      {/* Progress Indicator */}
      <div className="px-6 mt-6">
        <div className="flex items-center justify-center space-x-2">
          <div className="w-8 h-1 bg-primary-500 rounded-full"></div>
          <div className="w-8 h-1 bg-primary-500 rounded-full"></div>
          <div className="w-8 h-1 bg-primary-500 rounded-full"></div>
          <div className="w-8 h-1 bg-gray-200 rounded-full"></div>
        </div>
        <p className="text-center text-sm text-gray-500 mt-2">3 of 4</p>
      </div>

      {/* Content Type Selection */}
      <div className="flex-1 px-6 py-8">
        <div className="grid grid-cols-1 gap-3 max-w-md mx-auto">
          {contentTypes.map((type, index) => (
            <motion.div
              key={type.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: index * 0.05 }}
            >
              <button
                onClick={() => handleTypeToggle(type.id)}
                className={`w-full p-4 rounded-xl border-2 transition-all text-left ${
                  selectedTypes.includes(type.id)
                    ? 'border-primary-500 bg-primary-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center space-x-4">
                  {/* Icon */}
                  <div className={`w-10 h-10 rounded-lg bg-gradient-to-r ${type.gradient} flex items-center justify-center text-white flex-shrink-0`}>
                    {type.icon}
                  </div>

                  {/* Content */}
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">{type.title}</h3>
                    <p className="text-sm text-gray-600">{type.description}</p>
                  </div>

                  {/* Check Icon */}
                  {selectedTypes.includes(type.id) && (
                    <div className="w-6 h-6 bg-primary-500 rounded-full flex items-center justify-center">
                      <CheckIcon className="w-4 h-4 text-white" />
                    </div>
                  )}
                </div>
              </button>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Selection Counter */}
      {selectedTypes.length > 0 && (
        <div className="px-6 text-center">
          <motion.p 
            className="text-sm text-primary-600 font-medium"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            {selectedTypes.length} type{selectedTypes.length !== 1 ? 's' : ''} selected
          </motion.p>
        </div>
      )}

      {/* Navigation */}
      <div className="px-6 pb-8 pt-4 flex space-x-3">
        <Button
          variant="ghost"
          onClick={() => router.back()}
          className="flex-1 h-12 font-medium"
        >
          Back
        </Button>
        <Button
          onClick={handleContinue}
          disabled={selectedTypes.length === 0}
          className="flex-1 h-12 font-medium"
        >
          Continue
        </Button>
      </div>
    </div>
  );
}