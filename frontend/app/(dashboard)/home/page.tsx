'use client';

import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Avatar } from '@/components/ui/avatar';
import { BellIcon, PlusIcon } from '@heroicons/react/24/outline';
import { PlayIcon } from '@heroicons/react/24/solid';

const featuresCards = [
  {
    id: 'text-to-speech',
    title: 'AI Text-to-Speech',
    description: 'Convert text into natural-sounding speech with our advanced AI voices',
    icon: (
      <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
        <path d="M12 14c1.66 0 2.99-1.34 2.99-3L15 5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3zm5.3-3c0 3-2.54 5.1-5.3 5.1S6.7 14 6.7 11H5c0 3.41 2.72 6.23 6 6.72V21h2v-3.28c3.28-.48 6-3.3 6-6.72h-1.7z"/>
      </svg>
    ),
    gradient: 'from-blue-500 to-cyan-500',
    route: '/dashboard/tts/create'
  },
  {
    id: 'voice-changer',
    title: 'AI Voice Changer',
    description: 'Transform any voice into another with our AI voice transformation',
    icon: (
      <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
        <path d="M7.5 5.6L5 7l1.4-2.5L5 2l2.5 1.4L10 2 8.6 4.5 10 7 7.5 5.6zm12 9.8L17 14l1.4 2.5L17 19l2.5-1.4L22 19l-1.4-2.5L22 14l-2.5 1.4zM22 2l-2.5 1.4L17 2l1.4 2.5L17 7l2.5-1.4L22 7l-1.4-2.5L22 2z"/>
      </svg>
    ),
    gradient: 'from-purple-500 to-pink-500',
    route: '/dashboard/voice-changer'
  },
  {
    id: 'voice-translate',
    title: 'AI Voice Translate',
    description: 'Translate speech in real-time across 50+ languages',
    icon: (
      <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
        <path d="M12.87 15.07l-2.54-2.51.03-.03A17.52 17.52 0 0014.07 6H17V4h-7V2H8v2H1v2h11.17C11.5 7.92 10.44 9.75 9 11.35 8.07 10.32 7.3 9.19 6.69 8h-2c.73 1.63 1.73 3.17 2.98 4.56l-5.09 5.02L4 19l5-5 3.11 3.11.76-2.04zM18.5 10h-2L12 22h2l1.12-3h4.75L21 22h2l-4.5-12zm-2.62 7l1.62-4.33L19.12 17h-3.24z"/>
      </svg>
    ),
    gradient: 'from-green-500 to-teal-500',
    route: '/dashboard/voice-translate'
  },
  {
    id: 'voice-cloning',
    title: 'Voice Cloning',
    description: 'Create custom AI voices with just a few minutes of audio',
    icon: (
      <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
        <path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm-1 16H9V7h9v14z"/>
      </svg>
    ),
    gradient: 'from-orange-500 to-red-500',
    route: '/dashboard/voice-cloning'
  }
];

const recentProjects = [
  {
    id: 1,
    name: 'Product Demo Video',
    type: 'Text-to-Speech',
    duration: '2:34',
    createdAt: '2 hours ago',
    status: 'completed',
    thumbnail: null
  },
  {
    id: 2,
    name: 'Podcast Intro',
    type: 'Voice Changer',
    duration: '0:45',
    createdAt: '1 day ago',
    status: 'completed',
    thumbnail: null
  },
  {
    id: 3,
    name: 'Tutorial Narration',
    type: 'Text-to-Speech',
    duration: '5:12',
    createdAt: '2 days ago',
    status: 'processing',
    thumbnail: null
  }
];

const quickStats = [
  { label: 'Projects Created', value: '24', change: '+12%' },
  { label: 'Voice Library', value: '8', change: '+2' },
  { label: 'Hours Generated', value: '15.2', change: '+3.4h' }
];

export default function HomePage() {
  const router = useRouter();

  const handleFeatureClick = (route: string) => {
    router.push(route);
  };

  const handleProjectClick = (projectId: number) => {
    router.push(`/dashboard/projects/${projectId}`);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Greeting and Avatar */}
            <div className="flex items-center space-x-3">
              <Avatar className="w-10 h-10">
                <div className="w-full h-full bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center text-white font-semibold">
                  J
                </div>
              </Avatar>
              <div>
                <h1 className="text-lg font-semibold text-gray-900">Good morning, John</h1>
                <p className="text-sm text-gray-500">Ready to create something amazing?</p>
              </div>
            </div>

            {/* Notifications */}
            <Button variant="ghost" size="icon" onClick={() => router.push('/dashboard/notifications')}>
              <BellIcon className="w-6 h-6 text-gray-600" />
            </Button>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="px-6 py-6">
        <div className="grid grid-cols-3 gap-4">
          {quickStats.map((stat, index) => (
            <motion.div
              key={stat.label}
              className="bg-white rounded-xl p-4 text-center shadow-sm border border-gray-100"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
              <div className="text-xs text-gray-500 mt-1">{stat.label}</div>
              <div className="text-xs text-green-600 font-medium mt-1">{stat.change}</div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Feature Cards */}
      <div className="px-6 py-2">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Create New</h2>
          <Button variant="ghost" size="sm" onClick={() => router.push('/dashboard/explore')}>
            View All
          </Button>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {featuresCards.map((feature, index) => (
            <motion.button
              key={feature.id}
              onClick={() => handleFeatureClick(feature.route)}
              className="text-left"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              whileTap={{ scale: 0.95 }}
            >
              <div className={`bg-gradient-to-br ${feature.gradient} rounded-xl p-4 h-32 flex flex-col justify-between relative overflow-hidden`}>
                {/* Background Pattern */}
                <div className="absolute top-0 right-0 w-16 h-16 bg-white/10 rounded-full -mr-8 -mt-8" />
                <div className="absolute bottom-0 left-0 w-12 h-12 bg-white/10 rounded-full -ml-6 -mb-6" />
                
                {/* Icon */}
                <div className="text-white">
                  {feature.icon}
                </div>
                
                {/* Content */}
                <div>
                  <h3 className="text-white font-semibold text-sm">{feature.title}</h3>
                  <p className="text-white/80 text-xs mt-1 line-clamp-2">{feature.description}</p>
                </div>
              </div>
            </motion.button>
          ))}
        </div>
      </div>

      {/* Recent Projects */}
      <div className="px-6 py-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Recent Projects</h2>
          <Button variant="ghost" size="sm" onClick={() => router.push('/dashboard/projects')}>
            View All
          </Button>
        </div>

        <div className="space-y-3">
          {recentProjects.map((project, index) => (
            <motion.button
              key={project.id}
              onClick={() => handleProjectClick(project.id)}
              className="w-full bg-white rounded-xl p-4 border border-gray-100 text-left hover:bg-gray-50 transition-colors"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
            >
              <div className="flex items-center space-x-3">
                {/* Thumbnail/Play Button */}
                <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                  {project.status === 'completed' ? (
                    <PlayIcon className="w-6 h-6 text-gray-600" />
                  ) : (
                    <div className="w-4 h-4 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
                  )}
                </div>

                {/* Project Info */}
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-gray-900 truncate">{project.name}</h3>
                  <div className="flex items-center space-x-2 mt-1">
                    <span className="text-sm text-gray-500">{project.type}</span>
                    <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                    <span className="text-sm text-gray-500">{project.duration}</span>
                  </div>
                  <p className="text-xs text-gray-400 mt-1">{project.createdAt}</p>
                </div>

                {/* Status */}
                <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                  project.status === 'completed' 
                    ? 'bg-green-100 text-green-800'
                    : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {project.status === 'completed' ? 'Ready' : 'Processing'}
                </div>
              </div>
            </motion.button>
          ))}
        </div>
      </div>

      {/* Quick Create FAB */}
      <motion.button
        className="fixed bottom-24 right-6 w-14 h-14 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-full shadow-lg flex items-center justify-center"
        whileTap={{ scale: 0.95 }}
        onClick={() => router.push('/dashboard/create')}
      >
        <PlusIcon className="w-6 h-6 text-white" />
      </motion.button>
    </div>
  );
}