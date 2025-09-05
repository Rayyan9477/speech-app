import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui/button';
import { Card } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { Badge } from '../../components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../components/ui/dialog';
import { useTheme } from '../../lib/theme-provider';
import {
  ArrowLeftIcon,
  EllipsisVerticalIcon,
  MagnifyingGlassIcon,
  ChatBubbleLeftIcon,
  MicrophoneIcon,
  LanguageIcon,
  PlayIcon,
  TrashIcon,
  PencilIcon,
  ShareIcon,
  DocumentDuplicateIcon
} from '@heroicons/react/24/outline';

interface Project {
  id: string;
  title: string;
  type: 'AI Text to Speech' | 'AI Voice Changer' | 'AI Voice Translate';
  duration: string;
  createdAt: string;
  voice?: string;
  description?: string;
}

const EnhancedProjects = () => {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<'All' | 'AI Text to Speech' | 'AI Voice Changer' | 'AI Voice Translate'>('All');
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showRenameDialog, setShowRenameDialog] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [showOptionsMenu, setShowOptionsMenu] = useState<string | null>(null);
  const [newTitle, setNewTitle] = useState('');

  const [projects, setProjects] = useState<Project[]>([
    {
      id: '1',
      title: 'Nikka Shoes Promotions Au...',
      type: 'AI Text to Speech',
      duration: '00:44 s',
      createdAt: 'Today',
      voice: 'AI Text to Speech',
      description: 'Product promotion audio for Nikka shoes campaign'
    },
    {
      id: '2',
      title: 'Words of Motivation',
      type: 'AI Voice Changer',
      duration: '03:25 s',
      createdAt: 'Today',
      voice: 'AI Voice Changer',
      description: 'Motivational speech with voice transformation'
    },
    {
      id: '3',
      title: 'Public Speaking Audio',
      type: 'AI Voice Translate',
      duration: '05:46 s',
      createdAt: 'Today',
      voice: 'AI Voice Translate',
      description: 'Translated presentation for international audience'
    },
    {
      id: '4',
      title: 'Social Media Trends',
      type: 'AI Text to Speech',
      duration: '02:29 s',
      createdAt: 'Yesterday',
      voice: 'AI Text to Speech',
      description: 'Content about latest social media trends'
    },
    {
      id: '5',
      title: 'English Conversation',
      type: 'AI Voice Changer',
      duration: '01:08 s',
      createdAt: 'Yesterday',
      voice: 'AI Voice Changer',
      description: 'English conversation practice with voice modulation'
    },
    {
      id: '6',
      title: 'Music & Podcast Intro',
      type: 'AI Voice Translate',
      duration: '03:54 s',
      createdAt: 'Dec 20, 2023',
      voice: 'AI Voice Translate',
      description: 'Multilingual intro for podcast series'
    }
  ]);

  const getProjectIcon = (type: string) => {
    switch (type) {
      case 'AI Text to Speech':
        return <ChatBubbleLeftIcon className="w-6 h-6 text-blue-500" />;
      case 'AI Voice Changer':
        return <MicrophoneIcon className="w-6 h-6 text-purple-500" />;
      case 'AI Voice Translate':
        return <LanguageIcon className="w-6 h-6 text-green-500" />;
      default:
        return <ChatBubbleLeftIcon className="w-6 h-6 text-gray-500" />;
    }
  };

  const filteredProjects = projects.filter(project => {
    const matchesSearch = project.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = selectedFilter === 'All' || project.type === selectedFilter;
    return matchesSearch && matchesFilter;
  });

  const handleDeleteProject = () => {
    if (selectedProject) {
      setProjects(projects.filter(project => project.id !== selectedProject.id));
      setShowDeleteDialog(false);
      setSelectedProject(null);
      setShowOptionsMenu(null);
    }
  };

  const handleRenameProject = () => {
    if (selectedProject && newTitle.trim()) {
      setProjects(projects.map(project =>
        project.id === selectedProject.id ? { ...project, title: newTitle } : project
      ));
      setShowRenameDialog(false);
      setSelectedProject(null);
      setNewTitle('');
      setShowOptionsMenu(null);
    }
  };

  const openOptionsMenu = (project: Project, action: 'delete' | 'rename') => {
    setSelectedProject(project);
    if (action === 'delete') {
      setShowDeleteDialog(true);
    } else if (action === 'rename') {
      setNewTitle(project.title);
      setShowRenameDialog(true);
    }
    setShowOptionsMenu(null);
  };

  const groupedProjects = filteredProjects.reduce((groups, project) => {
    const date = project.createdAt;
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(project);
    return groups;
  }, {} as Record<string, Project[]>);

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
        <motion.div variants={itemVariants} className="flex items-center justify-between mb-6 px-4">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate(-1)}
              className="p-2"
            >
              <ArrowLeftIcon className="w-5 h-5" />
            </Button>
            <h1 className="text-xl font-bold text-foreground">My Projects</h1>
          </div>
          <Button variant="ghost" size="sm" className="p-2">
            <EllipsisVerticalIcon className="w-5 h-5 text-muted-foreground" />
          </Button>
        </motion.div>

        {/* Search Bar */}
        <motion.div variants={itemVariants} className="mb-6 px-4">
          <div className="relative">
            <MagnifyingGlassIcon className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search by Project Name"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 py-3 rounded-xl"
            />
          </div>
        </motion.div>

        {/* Filter Tabs */}
        <motion.div variants={itemVariants} className="mb-6 px-4">
          <div className="flex space-x-2 overflow-x-auto pb-2">
            {['All', 'AI Text to Speech', 'AI Voice Changer', 'AI Voice Translate'].map((filter) => (
              <Button
                key={filter}
                variant={selectedFilter === filter ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedFilter(filter as any)}
                className="rounded-full whitespace-nowrap"
              >
                {filter}
              </Button>
            ))}
          </div>
        </motion.div>

        {/* Projects List */}
        <div className="px-4">
          {Object.entries(groupedProjects).map(([date, dateProjects]) => (
            <motion.div key={date} variants={itemVariants} className="mb-6">
              <h2 className="text-sm font-medium text-muted-foreground mb-3">{date}</h2>
              <div className="space-y-3">
                {dateProjects.map((project, index) => (
                  <Card
                    key={project.id}
                    className="p-4 cursor-pointer hover:shadow-md transition-all duration-200"
                    onClick={() => {
                      if (project.type === 'AI Text to Speech') {
                        navigate('/app/tts-editor');
                      }
                    }}
                  >
                    <div className="flex items-center space-x-4">
                      <div className="flex-shrink-0">
                        {getProjectIcon(project.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-foreground truncate">
                          {project.title}
                        </h3>
                        <div className="flex items-center space-x-3 mt-1">
                          <span className="text-sm text-muted-foreground">{project.duration}</span>
                          <span className="text-sm text-muted-foreground">•</span>
                          <span className="text-sm text-muted-foreground">{project.createdAt}</span>
                          <span className="text-sm text-muted-foreground">•</span>
                          <span className="text-sm text-muted-foreground">{project.voice}</span>
                        </div>
                        {project.description && (
                          <p className="text-xs text-muted-foreground mt-1 line-clamp-1">
                            {project.description}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="p-2 hover:bg-blue-100 dark:hover:bg-blue-900/30"
                          onClick={(e) => {
                            e.stopPropagation();
                            // Handle play
                          }}
                        >
                          <PlayIcon className="w-4 h-4 text-blue-500" />
                        </Button>
                        <div className="relative">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              setShowOptionsMenu(showOptionsMenu === project.id ? null : project.id);
                            }}
                            className="p-2"
                          >
                            <EllipsisVerticalIcon className="w-4 h-4 text-muted-foreground" />
                          </Button>

                          {/* Options Menu */}
                          {showOptionsMenu === project.id && (
                            <motion.div
                              initial={{ opacity: 0, scale: 0.95 }}
                              animate={{ opacity: 1, scale: 1 }}
                              className="absolute right-0 top-10 z-10 w-48 rounded-lg bg-white dark:bg-slate-800 shadow-lg border border-gray-200 dark:border-gray-700 py-2"
                            >
                              <button
                                className="flex items-center w-full px-4 py-2 text-sm text-foreground hover:bg-gray-100 dark:hover:bg-slate-700"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  openOptionsMenu(project, 'rename');
                                }}
                              >
                                <PencilIcon className="w-4 h-4 mr-2" />
                                Rename
                              </button>
                              <button
                                className="flex items-center w-full px-4 py-2 text-sm text-foreground hover:bg-gray-100 dark:hover:bg-slate-700"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setShowOptionsMenu(null);
                                }}
                              >
                                <DocumentDuplicateIcon className="w-4 h-4 mr-2" />
                                Duplicate
                              </button>
                              <button
                                className="flex items-center w-full px-4 py-2 text-sm text-foreground hover:bg-gray-100 dark:hover:bg-slate-700"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setShowOptionsMenu(null);
                                }}
                              >
                                <ShareIcon className="w-4 h-4 mr-2" />
                                Share
                              </button>
                              <button
                                className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  openOptionsMenu(project, 'delete');
                                }}
                              >
                                <TrashIcon className="w-4 h-4 mr-2" />
                                Delete
                              </button>
                            </motion.div>
                          )}
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Empty State */}
        {filteredProjects.length === 0 && (
          <motion.div variants={itemVariants} className="text-center py-12 px-4">
            <div className="text-6xl mb-4">📁</div>
            <h3 className="text-lg font-semibold text-foreground mb-2">No projects found</h3>
            <p className="text-muted-foreground mb-6">Create your first project or try a different search</p>
            <Button
              onClick={() => navigate('/app')}
              className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-full"
            >
              Create Project
            </Button>
          </motion.div>
        )}
      </motion.div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Delete Project</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="text-muted-foreground mb-4">
              Are you sure you want to delete "{selectedProject?.title}"? This action cannot be undone.
            </p>
            <div className="flex items-center space-x-3">
              <Button
                variant="outline"
                onClick={() => setShowDeleteDialog(false)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={handleDeleteProject}
                className="flex-1"
              >
                Delete
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Rename Dialog */}
      <Dialog open={showRenameDialog} onOpenChange={setShowRenameDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Rename Project</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <Input
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder="Enter new project name"
              className="mb-4"
            />
            <div className="flex items-center space-x-3">
              <Button
                variant="outline"
                onClick={() => setShowRenameDialog(false)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={handleRenameProject}
                className="flex-1 bg-blue-500 hover:bg-blue-600 text-white"
              >
                Save
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default EnhancedProjects;