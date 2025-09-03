import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '../../components/ui/button';
import { Card } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Input } from '../../components/ui/input';
import { useTheme } from '../../lib/theme-provider';
import {
  PlusIcon,
  SearchIcon,
  FilterIcon,
  ClockIcon,
  PlayIcon,
  MoreVerticalIcon,
  FolderIcon,
  DocumentTextIcon,
  MicrophoneIcon,
  LanguageIcon,
  TrashIcon,
  EditIcon,
  ShareIcon,
  DownloadIcon
} from '@heroicons/react/24/outline';
import {
  PlayIcon as PlayIconSolid
} from '@heroicons/react/24/solid';

const Projects = () => {
  const { theme } = useTheme();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [playingProject, setPlayingProject] = useState<string | null>(null);

  const filters = [
    { id: 'all', name: 'All Projects', count: 24 },
    { id: 'recent', name: 'Recent', count: 8 },
    { id: 'shared', name: 'Shared', count: 5 },
    { id: 'favorites', name: 'Favorites', count: 3 }
  ];

  const projects = [
    {
      id: '1',
      title: 'Product Demo Script',
      description: 'Marketing video voiceover for new product launch',
      type: 'TTS',
      duration: '2:34',
      createdAt: '2 hours ago',
      voice: 'Emma',
      status: 'completed',
      isFavorite: true,
      tags: ['Marketing', 'Product', 'Demo']
    },
    {
      id: '2',
      title: 'Spanish Translation',
      description: 'Document translation with voice synthesis',
      type: 'Translation',
      duration: '1:45',
      createdAt: '1 day ago',
      voice: 'Luna',
      status: 'completed',
      isFavorite: false,
      tags: ['Translation', 'Spanish', 'Document']
    },
    {
      id: '3',
      title: 'Podcast Intro',
      description: 'Intro music and voice for weekly podcast',
      type: 'Voice Changer',
      duration: '0:30',
      createdAt: '2 days ago',
      voice: 'Marcus',
      status: 'processing',
      isFavorite: true,
      tags: ['Podcast', 'Intro', 'Music']
    },
    {
      id: '4',
      title: 'E-learning Module',
      description: 'Educational content for online course',
      type: 'TTS',
      duration: '5:12',
      createdAt: '3 days ago',
      voice: 'Sophie',
      status: 'completed',
      isFavorite: false,
      tags: ['Education', 'Course', 'Learning']
    },
    {
      id: '5',
      title: 'Audiobook Chapter',
      description: 'Fiction novel chapter narration',
      type: 'TTS',
      duration: '8:45',
      createdAt: '1 week ago',
      voice: 'Ahmed',
      status: 'completed',
      isFavorite: true,
      tags: ['Audiobook', 'Fiction', 'Narration']
    },
    {
      id: '6',
      title: 'Voice Message',
      description: 'Personal voice message translation',
      type: 'Translation',
      duration: '0:52',
      createdAt: '1 week ago',
      voice: 'Hans',
      status: 'draft',
      isFavorite: false,
      tags: ['Personal', 'Message', 'Translation']
    }
  ];

  const filteredProjects = projects.filter(project => {
    const matchesSearch = project.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         project.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         project.voice.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesFilter = selectedFilter === 'all' ||
                         (selectedFilter === 'recent' && project.createdAt.includes('hour')) ||
                         (selectedFilter === 'shared') ||
                         (selectedFilter === 'favorites' && project.isFavorite);

    return matchesSearch && matchesFilter;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-600 bg-green-100 dark:bg-green-900';
      case 'processing': return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900';
      case 'draft': return 'text-gray-600 bg-gray-100 dark:bg-gray-900';
      default: return 'text-blue-600 bg-blue-100 dark:bg-blue-900';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'TTS': return <DocumentTextIcon className="w-4 h-4" />;
      case 'Translation': return <LanguageIcon className="w-4 h-4" />;
      case 'Voice Changer': return <MicrophoneIcon className="w-4 h-4" />;
      default: return <FolderIcon className="w-4 h-4" />;
    }
  };

  const handlePlayProject = (projectId: string) => {
    setPlayingProject(playingProject === projectId ? null : projectId);
  };

  const handleCreateProject = () => {
    // Handle create new project
    console.log('Create new project');
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
            <h1 className="text-2xl font-bold text-foreground">My Projects</h1>
            <p className="text-muted-foreground mt-1">Manage your voice projects</p>
          </div>
          <Button
            onClick={handleCreateProject}
            size="sm"
            className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white rounded-full"
          >
            <PlusIcon className="w-4 h-4 mr-2" />
            New Project
          </Button>
        </motion.div>

        {/* Search Bar */}
        <motion.div variants={itemVariants}>
          <div className="relative">
            <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search projects..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-12 bg-background/50 backdrop-blur-sm border-border/50 focus:border-primary"
            />
          </div>
        </motion.div>

        {/* Filters */}
        <motion.div variants={itemVariants}>
          <div className="flex space-x-2 overflow-x-auto pb-2">
            {filters.map((filter) => (
              <Button
                key={filter.id}
                onClick={() => setSelectedFilter(filter.id)}
                variant={selectedFilter === filter.id ? "default" : "outline"}
                size="sm"
                className={`whitespace-nowrap rounded-full ${
                  selectedFilter === filter.id
                    ? 'bg-primary text-primary-foreground'
                    : 'hover:bg-accent'
                }`}
              >
                {filter.name}
                <span className={`ml-2 text-xs ${
                  selectedFilter === filter.id
                    ? 'text-primary-foreground/70'
                    : 'text-muted-foreground'
                }`}>
                  {filter.count}
                </span>
              </Button>
            ))}
          </div>
        </motion.div>

        {/* Projects List */}
        <motion.div variants={itemVariants}>
          <div className="space-y-4">
            {filteredProjects.map((project) => (
              <Card key={project.id} className="p-4 hover:shadow-lg transition-all duration-200">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4 flex-1">
                    {/* Project Icon */}
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                      theme === 'dark' ? 'bg-slate-700' : 'bg-slate-100'
                    }`}>
                      {getTypeIcon(project.type)}
                    </div>

                    {/* Project Info */}
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <h3 className="font-semibold text-foreground">{project.title}</h3>
                        <Badge
                          className={`text-xs rounded-full px-2 py-0.5 ${getStatusColor(project.status)}`}
                        >
                          {project.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">{project.description}</p>
                      <div className="flex items-center space-x-4 text-xs text-muted-foreground mb-2">
                        <span className="flex items-center space-x-1">
                          {getTypeIcon(project.type)}
                          <span>{project.type}</span>
                        </span>
                        <span className="flex items-center space-x-1">
                          <ClockIcon className="w-3 h-3" />
                          <span>{project.duration}</span>
                        </span>
                        <span>•</span>
                        <span>{project.voice}</span>
                        <span>•</span>
                        <span>{project.createdAt}</span>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {project.tags.map((tag) => (
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
                      onClick={() => handlePlayProject(project.id)}
                      variant="outline"
                      size="sm"
                      className="w-8 h-8 rounded-full p-0"
                    >
                      {playingProject === project.id ? (
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
                      <EditIcon className="w-4 h-4" />
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
                {playingProject === project.id && (
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
                        <PlayIcon className="w-4 h-4 mr-2" />
                        Play Full
                      </Button>
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
        {filteredProjects.length > 0 && (
          <motion.div variants={itemVariants}>
            <Button
              variant="outline"
              className="w-full h-12 rounded-xl"
            >
              Load More Projects
            </Button>
          </motion.div>
        )}

        {/* Empty State */}
        {filteredProjects.length === 0 && (
          <motion.div variants={itemVariants} className="text-center py-12">
            <div className="text-6xl mb-4">📁</div>
            <h3 className="text-lg font-semibold text-foreground mb-2">No projects found</h3>
            <p className="text-muted-foreground mb-4">
              Create your first voice project to get started
            </p>
            <Button
              onClick={handleCreateProject}
              className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white"
            >
              <PlusIcon className="w-4 h-4 mr-2" />
              Create Project
            </Button>
          </motion.div>
        )}

        {/* Quick Stats */}
        <motion.div variants={itemVariants}>
          <div className="grid grid-cols-2 gap-4">
            <Card className="p-4 text-center">
              <div className="text-2xl font-bold text-primary mb-1">
                {projects.filter(p => p.status === 'completed').length}
              </div>
              <div className="text-sm text-muted-foreground">Completed</div>
            </Card>
            <Card className="p-4 text-center">
              <div className="text-2xl font-bold text-yellow-600 mb-1">
                {projects.filter(p => p.status === 'processing').length}
              </div>
              <div className="text-sm text-muted-foreground">Processing</div>
            </Card>
          </div>
        </motion.div>

        {/* Storage Usage */}
        <motion.div variants={itemVariants}>
          <Card className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950 dark:to-purple-950">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <FolderIcon className="w-5 h-5 text-blue-600" />
                <div>
                  <p className="text-sm font-medium text-foreground">Storage Used</p>
                  <p className="text-xs text-muted-foreground">Free plan: 1GB limit</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium text-foreground">247 MB / 1 GB</p>
                <div className="w-20 bg-white/50 rounded-full h-1.5 mt-1">
                  <div className="bg-blue-600 h-1.5 rounded-full w-1/4"></div>
                </div>
              </div>
            </div>
          </Card>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default Projects;
