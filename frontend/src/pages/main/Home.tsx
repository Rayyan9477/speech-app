import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Button } from '../../components/ui/button';
import { Card } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '../../components/ui/avatar';
import { useTheme } from '../../lib/theme-provider';
import {
  SpeakerWaveIcon,
  MicrophoneIcon,
  LanguageIcon,
  SparklesIcon,
  AdjustmentsHorizontalIcon,
  ClockIcon,
  PlayIcon,
  StarIcon,
  ArrowRightIcon
} from '@heroicons/react/24/outline';
import {
  SpeakerWaveIcon as SpeakerWaveIconSolid,
  MicrophoneIcon as MicrophoneIconSolid,
  LanguageIcon as LanguageIconSolid
} from '@heroicons/react/24/solid';

const Home = () => {
  const { theme } = useTheme();

  const quickActions = [
    {
      title: 'Text to Speech',
      description: 'Convert text to natural voice',
      icon: SpeakerWaveIcon,
      path: '/app/tts',
      gradient: 'from-blue-500 to-cyan-500',
      color: 'text-blue-600'
    },
    {
      title: 'Voice Changer',
      description: 'Transform your voice instantly',
      icon: MicrophoneIcon,
      path: '/app/voice-changer',
      gradient: 'from-purple-500 to-pink-500',
      color: 'text-purple-600'
    },
    {
      title: 'Voice Translate',
      description: 'Translate and speak in any language',
      icon: LanguageIcon,
      path: '/app/voice-translate',
      gradient: 'from-green-500 to-emerald-500',
      color: 'text-green-600'
    },
    {
      title: 'Voice Customizer',
      description: 'Fine-tune voice parameters',
      icon: AdjustmentsHorizontalIcon,
      path: '/app/voice-customizer',
      gradient: 'from-orange-500 to-red-500',
      color: 'text-orange-600'
    },
    {
      title: 'Voice Cloning',
      description: 'Create your own AI voice',
      icon: SparklesIcon,
      path: '/app/voice-cloning',
      gradient: 'from-pink-500 to-rose-500',
      color: 'text-pink-600'
    }
  ];

  const featuredVoices = [
    {
      name: 'Emma',
      description: 'Natural & Warm',
      language: 'English',
      rating: 4.9,
      avatar: '👩',
      isPremium: false
    },
    {
      name: 'Marcus',
      description: 'Professional',
      language: 'English',
      rating: 4.8,
      avatar: '👨',
      isPremium: true
    },
    {
      name: 'Luna',
      description: 'Friendly & Casual',
      language: 'Spanish',
      rating: 4.7,
      avatar: '👩',
      isPremium: false
    }
  ];

  const recentProjects = [
    {
      title: 'Product Demo Script',
      type: 'TTS',
      duration: '2:34',
      createdAt: '2 hours ago',
      voice: 'Emma'
    },
    {
      title: 'Spanish Translation',
      type: 'Translation',
      duration: '1:45',
      createdAt: '1 day ago',
      voice: 'Luna'
    },
    {
      title: 'Voice Over Recording',
      type: 'Voice Changer',
      duration: '3:12',
      createdAt: '2 days ago',
      voice: 'Marcus'
    }
  ];

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
        className="py-6 space-y-8"
      >
        {/* Header */}
        <motion.div variants={itemVariants} className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Good morning! 👋</h1>
            <p className="text-muted-foreground mt-1">Ready to create amazing voices?</p>
          </div>
          <div className="flex items-center space-x-3">
            <Link to="/app/notifications">
              <Button variant="ghost" size="sm" className="p-2 relative">
                <span className="text-xl">🔔</span>
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></span>
              </Button>
            </Link>
            <Avatar className="w-12 h-12">
              <AvatarImage src="/api/placeholder/48/48" />
              <AvatarFallback>JD</AvatarFallback>
            </Avatar>
          </div>
        </motion.div>

        {/* Quick Actions */}
        <motion.div variants={itemVariants}>
          <h2 className="text-lg font-semibold text-foreground mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {quickActions.map((action) => {
              const IconComponent = action.icon;
              return (
                <Link key={action.title} to={action.path}>
                  <Card className="p-4 hover:shadow-lg transition-all duration-200 cursor-pointer group">
                    <div className="flex items-center space-x-4">
                      <div className={`w-12 h-12 rounded-xl bg-gradient-to-r ${action.gradient} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                        <IconComponent className="w-6 h-6 text-white" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">
                          {action.title}
                        </h3>
                        <p className="text-sm text-muted-foreground">{action.description}</p>
                      </div>
                      <ArrowRightIcon className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
                    </div>
                  </Card>
                </Link>
              );
            })}
          </div>
        </motion.div>

        {/* Featured Voices */}
        <motion.div variants={itemVariants}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-foreground">Featured Voices</h2>
            <Link to="/app/explore-voices" className="text-sm text-primary hover:underline">
              View all
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {featuredVoices.map((voice) => (
              <Card key={voice.name} className="p-4 hover:shadow-md transition-shadow cursor-pointer">
                <div className="flex items-center space-x-3">
                  <div className="text-2xl">{voice.avatar}</div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <h3 className="font-medium text-foreground">{voice.name}</h3>
                      {voice.isPremium && (
                        <Badge variant="premium" className="text-xs">
                          <SparklesIcon className="w-3 h-3 mr-1" />
                          Premium
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">{voice.description}</p>
                    <div className="flex items-center space-x-2 mt-1">
                      <span className="text-xs text-muted-foreground">{voice.language}</span>
                      <div className="flex items-center space-x-1">
                        <StarIcon className="w-3 h-3 text-yellow-500 fill-current" />
                        <span className="text-xs text-muted-foreground">{voice.rating}</span>
                      </div>
                    </div>
                  </div>
                  <Button size="sm" variant="outline" className="rounded-full">
                    <PlayIcon className="w-4 h-4" />
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </motion.div>

        {/* Recent Projects */}
        <motion.div variants={itemVariants}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-foreground">Recent Projects</h2>
            <Link to="/app/enhanced-projects" className="text-sm text-primary hover:underline">
              View all
            </Link>
          </div>
          <div className="space-y-3">
            {recentProjects.map((project, index) => (
              <Card key={index} className="p-4 hover:shadow-md transition-shadow cursor-pointer">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h3 className="font-medium text-foreground">{project.title}</h3>
                    <div className="flex items-center space-x-3 mt-1">
                      <Badge variant="outline" className="text-xs">
                        {project.type}
                      </Badge>
                      <span className="text-sm text-muted-foreground">{project.duration}</span>
                      <span className="text-sm text-muted-foreground">•</span>
                      <span className="text-sm text-muted-foreground">{project.voice}</span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <ClockIcon className="w-4 h-4 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">{project.createdAt}</span>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </motion.div>

        {/* Usage Stats */}
        <motion.div variants={itemVariants}>
          <Card className="p-4 sm:p-6 bg-gradient-to-r from-purple-500 to-pink-500 text-white">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-lg font-semibold mb-1">Free Plan</h3>
                <p className="text-purple-100 text-sm">Upgrade to unlock premium voices</p>
              </div>
              <div className="text-left sm:text-right">
                <div className="text-2xl font-bold">247</div>
                <div className="text-sm text-purple-100">minutes left</div>
              </div>
            </div>
            <div className="mt-4 bg-white/20 rounded-full h-2">
              <div className="bg-white h-2 rounded-full w-3/4"></div>
            </div>
          </Card>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default Home;
