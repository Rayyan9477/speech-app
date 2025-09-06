import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { useProjectManagement, ProjectItem } from '../../contexts/ProjectManagementContext';
import ProjectContextMenu from './ProjectContextMenu';
import ProjectDeleteConfirmation from './ProjectDeleteConfirmation';
import ProjectRenameDialog from './ProjectRenameDialog';
import ProjectSearchOverlay from './ProjectSearchOverlay';
import WaveformAudioPlayer from '../tts/WaveformAudioPlayer';
import {
  MagnifyingGlassIcon,
  EllipsisVerticalIcon,
  PlayIcon,
  PauseIcon,
  DocumentTextIcon,
  MicrophoneIcon,
  LanguageIcon,
  ClockIcon,
  CalendarDaysIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';

const EnhancedProjectManagement: React.FC = () => {
  const {
    state,
    setSearchQuery,
    addRecentSearch,
    setFilter,
    showContextMenu,
    hideContextMenu
  } = useProjectManagement();

  const [searchFocused, setSearchFocused] = useState(false);
  const [playingProject, setPlayingProject] = useState<string | null>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const handleSearchFocus = () => {
    setSearchFocused(true);
  };

  const handleSearchBlur = () => {
    // Delay hiding to allow clicking on search suggestions
    setTimeout(() => setSearchFocused(false), 150);
  };

  const handleSearchSubmit = (query: string) => {
    if (query.trim()) {
      addRecentSearch(query);
      setSearchQuery(query);
      setSearchFocused(false);
    }
  };

  const handleContextMenu = (e: React.MouseEvent, project: ProjectItem) => {
    e.preventDefault();
    showContextMenu(project, e.clientX, e.clientY);
  };

  const handlePlayProject = (project: ProjectItem) => {
    if (playingProject === project.id) {
      setPlayingProject(null);
    } else {
      setPlayingProject(project.id);
    }
  };

  const getProjectIcon = (type: string) => {
    switch (type) {
      case 'AI Text to Speech':
        return <DocumentTextIcon className="w-5 h-5 text-blue-600" />;
      case 'AI Voice Changer':
        return <MicrophoneIcon className="w-5 h-5 text-purple-600" />;
      case 'AI Voice Translate':
        return <LanguageIcon className="w-5 h-5 text-green-600" />;
      default:
        return <DocumentTextIcon className="w-5 h-5 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'processing':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'draft':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
      case 'failed':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default:
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
    }
  };

  const formatDuration = (duration: string) => {
    return duration;
  };

  const formatDate = (dateStr: string) => {
    return dateStr;
  };

  const filterOptions = [
    { id: 'All', name: 'All', count: state.projects.length },
    { 
      id: 'AI Text to Speech', 
      name: 'AI Text to Speech', 
      count: state.projects.filter(p => p.type === 'AI Text to Speech').length 
    },
    { 
      id: 'AI Voice Changer', 
      name: 'AI Voice Changer', 
      count: state.projects.filter(p => p.type === 'AI Voice Changer').length 
    },
    { 
      id: 'AI Voice Translate', 
      name: 'AI Voice Translate', 
      count: state.projects.filter(p => p.type === 'AI Voice Translate').length 
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">My Projects</h1>
          <p className="text-muted-foreground">
            {state.filteredProjects.length} project{state.filteredProjects.length !== 1 ? 's' : ''}
          </p>
        </div>
        <Button variant="outline" size="sm">
          <EllipsisVerticalIcon className="w-4 h-4" />
        </Button>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
        <Input
          ref={searchInputRef}
          type="text"
          placeholder="Search by Project Name"
          value={state.searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onFocus={handleSearchFocus}
          onBlur={handleSearchBlur}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              handleSearchSubmit(state.searchQuery);
            }
          }}
          className="pl-10 pr-10 h-12 bg-muted/50 border-border"
        />
        {state.searchQuery && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSearchQuery('')}
            className="absolute right-1 top-1/2 transform -translate-y-1/2 p-2"
          >
            <XMarkIcon className="w-4 h-4" />
          </Button>
        )}

        {/* Search Overlay */}
        <ProjectSearchOverlay
          isVisible={searchFocused}
          searchQuery={state.searchQuery}
          onSearchSubmit={handleSearchSubmit}
          onClose={() => setSearchFocused(false)}
        />
      </div>

      {/* Filters */}
      <div className="flex space-x-2 overflow-x-auto pb-2">
        {filterOptions.map((filter) => (
          <Button
            key={filter.id}
            onClick={() => setFilter(filter.id as any)}
            variant={state.selectedFilter === filter.id ? 'default' : 'outline'}
            size="sm"
            className={`whitespace-nowrap rounded-full min-w-fit ${
              state.selectedFilter === filter.id
                ? 'bg-blue-600 text-white hover:bg-blue-700'
                : 'hover:bg-accent'
            }`}
          >
            {filter.name}
          </Button>
        ))}
      </div>

      {/* Projects List */}
      <div className="space-y-4">
        <AnimatePresence>
          {state.filteredProjects.map((project) => (
            <motion.div
              key={project.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.2 }}
            >
              <Card 
                className="p-4 hover:shadow-md transition-all duration-200 cursor-pointer"
                onContextMenu={(e) => handleContextMenu(e, project)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4 flex-1">
                    {/* Project Icon */}
                    <div className="w-12 h-12 rounded-xl bg-muted/50 flex items-center justify-center">
                      {getProjectIcon(project.type)}
                    </div>

                    {/* Project Details */}
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center space-x-2">
                        <h3 className="font-semibold text-foreground line-clamp-1">
                          {project.title}
                        </h3>
                        <Badge 
                          className={`text-xs px-2 py-0.5 rounded-full ${getStatusColor(project.status)}`}
                        >
                          {project.status}
                        </Badge>
                      </div>

                      <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                        <div className="flex items-center space-x-1">
                          <ClockIcon className="w-3 h-3" />
                          <span>{formatDuration(project.duration)}</span>
                        </div>
                        <span>•</span>
                        <div className="flex items-center space-x-1">
                          <CalendarDaysIcon className="w-3 h-3" />
                          <span>{formatDate(project.createdAt)}</span>
                        </div>
                        <span>•</span>
                        <span className="capitalize">{project.type}</span>
                      </div>
                    </div>
                  </div>

                  {/* Action Button */}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleContextMenu(e, project);
                    }}
                    className="p-2"
                  >
                    <EllipsisVerticalIcon className="w-4 h-4" />
                  </Button>
                </div>

                {/* Expanded Audio Player */}
                {playingProject === project.id && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mt-4 pt-4 border-t border-border"
                  >
                    <WaveformAudioPlayer
                      audioUrl={project.audioUrl || '/audio/sample.mp3'}
                      waveformData={project.waveformData}
                      showControls={true}
                      showWaveform={true}
                      title={project.title}
                      className="bg-muted/20"
                    />
                  </motion.div>
                )}
              </Card>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Empty State */}
      {state.filteredProjects.length === 0 && !state.isLoading && (
        <div className="text-center py-12">
          <div className="w-24 h-24 mx-auto mb-4 bg-muted rounded-full flex items-center justify-center">
            <DocumentTextIcon className="w-12 h-12 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold text-foreground mb-2">
            {state.searchQuery ? 'No projects found' : 'No projects yet'}
          </h3>
          <p className="text-muted-foreground">
            {state.searchQuery 
              ? 'Try adjusting your search terms or filters'
              : 'Create your first project to get started'
            }
          </p>
        </div>
      )}

      {/* Context Menu */}
      <ProjectContextMenu />

      {/* Delete Confirmation Dialog */}
      <ProjectDeleteConfirmation />

      {/* Rename Dialog */}
      <ProjectRenameDialog />
    </div>
  );
};

export default EnhancedProjectManagement;