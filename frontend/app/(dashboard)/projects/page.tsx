'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  PlusIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  PlayIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon
} from '@heroicons/react/24/outline';

const projects = [
  {
    id: 1,
    name: 'Product Demo Video',
    type: 'Text-to-Speech',
    status: 'completed',
    duration: '4:32',
    createdAt: '2024-01-15',
    updatedAt: '2 hours ago',
    thumbnail: null,
    voice: 'Sarah',
    progress: 100
  },
  {
    id: 2,
    name: 'Podcast Intro',
    type: 'Voice Changer',
    status: 'completed',
    duration: '1:23',
    createdAt: '2024-01-14',
    updatedAt: '1 day ago',
    thumbnail: null,
    voice: 'James',
    progress: 100
  },
  {
    id: 3,
    name: 'Tutorial Narration',
    type: 'Text-to-Speech',
    status: 'processing',
    duration: '0:00',
    createdAt: '2024-01-13',
    updatedAt: '2 days ago',
    thumbnail: null,
    voice: 'Maria',
    progress: 65
  },
  {
    id: 4,
    name: 'Voice Translation Test',
    type: 'Voice Translate',
    status: 'failed',
    duration: '0:00',
    createdAt: '2024-01-12',
    updatedAt: '3 days ago',
    thumbnail: null,
    voice: 'David',
    progress: 0
  },
  {
    id: 5,
    name: 'Custom Voice Demo',
    type: 'Voice Cloning',
    status: 'completed',
    duration: '2:15',
    createdAt: '2024-01-10',
    updatedAt: '5 days ago',
    thumbnail: null,
    voice: 'Custom Voice',
    progress: 100
  }
];

const statusConfig = {
  completed: {
    icon: CheckCircleIcon,
    color: 'text-green-600',
    bgColor: 'bg-green-100',
    label: 'Completed'
  },
  processing: {
    icon: ClockIcon,
    color: 'text-yellow-600',
    bgColor: 'bg-yellow-100',
    label: 'Processing'
  },
  failed: {
    icon: XCircleIcon,
    color: 'text-red-600',
    bgColor: 'bg-red-100',
    label: 'Failed'
  }
};

export default function ProjectsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');
  const router = useRouter();

  const filteredProjects = projects.filter(project => {
    const matchesSearch = project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         project.type.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = selectedFilter === 'all' || project.status === selectedFilter;
    return matchesSearch && matchesFilter;
  });

  const handleProjectClick = (projectId: number) => {
    router.push(`/dashboard/projects/${projectId}`);
  };

  const handleCreateProject = () => {
    router.push('/dashboard/tts/create');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Projects</h1>
              <p className="text-gray-600 mt-1">Manage and track your AI voice projects</p>
            </div>
            <Button onClick={handleCreateProject}>
              <PlusIcon className="w-4 h-4 mr-2" />
              New Project
            </Button>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white border-b border-gray-200">
        <div className="px-6 py-4">
          <div className="flex items-center space-x-4">
            <div className="flex-1">
              <div className="relative">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search projects..."
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <FunnelIcon className="w-5 h-5 text-gray-400" />
              <select
                value={selectedFilter}
                onChange={(e) => setSelectedFilter(e.target.value)}
                className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                aria-label="Filter projects by status"
              >
                <option value="all">All Status</option>
                <option value="completed">Completed</option>
                <option value="processing">Processing</option>
                <option value="failed">Failed</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Projects List */}
      <div className="px-6 py-6">
        <div className="space-y-4">
          {filteredProjects.map((project, index) => {
            const StatusIcon = statusConfig[project.status as keyof typeof statusConfig].icon;

            return (
              <motion.button
                key={project.id}
                onClick={() => handleProjectClick(project.id)}
                className="w-full bg-white rounded-xl border border-gray-200 p-6 text-left hover:shadow-md transition-shadow"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
              >
                <div className="flex items-start space-x-4">
                  {/* Thumbnail */}
                  <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-lg flex items-center justify-center flex-shrink-0">
                    <PlayIcon className="w-8 h-8 text-white" />
                  </div>

                  {/* Project Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="font-semibold text-gray-900 text-lg">{project.name}</h3>
                        <p className="text-gray-600">{project.type}</p>
                      </div>
                      <div className={`flex items-center space-x-1 px-3 py-1 rounded-full text-sm font-medium ${statusConfig[project.status as keyof typeof statusConfig].bgColor}`}>
                        <StatusIcon className={`w-4 h-4 ${statusConfig[project.status as keyof typeof statusConfig].color}`} />
                        <span className={statusConfig[project.status as keyof typeof statusConfig].color}>
                          {statusConfig[project.status as keyof typeof statusConfig].label}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center space-x-4 text-sm text-gray-500 mb-3">
                      <span>Voice: {project.voice}</span>
                      <span>•</span>
                      <span>Duration: {project.duration}</span>
                      <span>•</span>
                      <span>Updated {project.updatedAt}</span>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-primary-500 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${project.progress}%` }}
                      />
                    </div>
                  </div>
                </div>
              </motion.button>
            );
          })}
        </div>

        {filteredProjects.length === 0 && (
          <div className="text-center py-12">
            <div className="text-4xl mb-4">📁</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No projects found</h3>
            <p className="text-gray-600 mb-6">
              {searchQuery || selectedFilter !== 'all'
                ? 'Try adjusting your search or filters'
                : 'Create your first project to get started'
              }
            </p>
            <Button onClick={handleCreateProject}>
              <PlusIcon className="w-4 h-4 mr-2" />
              Create Project
            </Button>
          </div>
        )}
      </div>

      {/* Stats Footer */}
      <div className="fixed bottom-20 left-0 right-0 bg-white border-t border-gray-200">
        <div className="px-6 py-4">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-gray-900">
                {projects.filter(p => p.status === 'completed').length}
              </div>
              <div className="text-sm text-gray-500">Completed</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">
                {projects.filter(p => p.status === 'processing').length}
              </div>
              <div className="text-sm text-gray-500">Processing</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">
                {projects.length}
              </div>
              <div className="text-sm text-gray-500">Total</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
