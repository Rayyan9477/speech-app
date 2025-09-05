'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArrowLeftIcon, PlayIcon } from '@heroicons/react/24/outline';

const recentProjects = [
  { id: 1, name: 'Product Demo Video', updatedAt: '2 hours ago', type: 'TTS' },
  { id: 2, name: 'Podcast Intro', updatedAt: '1 day ago', type: 'TTS' },
  { id: 3, name: 'Tutorial Narration', updatedAt: '2 days ago', type: 'TTS' }
];

const templates = [
  {
    id: 'product-demo',
    name: 'Product Demo',
    description: 'Perfect for showcasing your product features',
    icon: '🎯',
    sampleText: 'Introducing our revolutionary new product that will transform the way you work...'
  },
  {
    id: 'podcast-intro',
    name: 'Podcast Intro',
    description: 'Welcome your listeners with style',
    icon: '🎙️',
    sampleText: 'Welcome to [Podcast Name], the show where we dive deep into...'
  },
  {
    id: 'tutorial',
    name: 'Tutorial',
    description: 'Educational content made engaging',
    icon: '📚',
    sampleText: 'In this tutorial, we\'ll walk you through step-by-step how to...'
  },
  {
    id: 'advertisement',
    name: 'Advertisement',
    description: 'Compelling ads that convert',
    icon: '📢',
    sampleText: 'Don\'t miss out on this limited-time offer. Get 50% off when you...'
  }
];

export default function CreateTTSPage() {
  const [projectName, setProjectName] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const router = useRouter();

  const handleCreateProject = () => {
    if (projectName.trim()) {
      // Create new project and navigate to editor
      const projectId = 'new-' + Date.now();
      router.push(`/dashboard/tts/editor?name=${encodeURIComponent(projectName)}&template=${selectedTemplate || 'blank'}`);
    }
  };

  const handleUseTemplate = (templateId: string) => {
    setSelectedTemplate(templateId);
    setProjectName(templates.find(t => t.id === templateId)?.name || '');
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="sticky top-0 bg-white border-b border-gray-200 z-10">
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center space-x-3">
            <Button variant="ghost" size="icon" onClick={() => router.back()}>
              <ArrowLeftIcon className="w-5 h-5" />
            </Button>
            <h1 className="text-lg font-semibold text-gray-900">Create TTS Project</h1>
          </div>
        </div>
      </div>

      <div className="px-6 py-6 space-y-8">
        {/* Project Name */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Project Name</h2>
          <Input
            value={projectName}
            onChange={(e) => setProjectName(e.target.value)}
            placeholder="Enter project name (e.g., Product Demo Video)"
            className="h-12 text-base"
          />
        </motion.div>

        {/* Templates */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Choose a Template</h2>
          <div className="grid grid-cols-1 gap-3">
            {templates.map((template) => (
              <button
                key={template.id}
                onClick={() => handleUseTemplate(template.id)}
                className={`p-4 rounded-xl border-2 text-left transition-all ${
                  selectedTemplate === template.id
                    ? 'border-primary-500 bg-primary-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-start space-x-3">
                  <div className="text-2xl">{template.icon}</div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">{template.name}</h3>
                    <p className="text-sm text-gray-600 mt-1">{template.description}</p>
                    <p className="text-xs text-gray-500 mt-2 italic">"{template.sampleText}"</p>
                  </div>
                </div>
              </button>
            ))}
            
            {/* Blank Template */}
            <button
              onClick={() => setSelectedTemplate('blank')}
              className={`p-4 rounded-xl border-2 text-left transition-all ${
                selectedTemplate === 'blank'
                  ? 'border-primary-500 bg-primary-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="flex items-start space-x-3">
                <div className="text-2xl">✍️</div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900">Start from Scratch</h3>
                  <p className="text-sm text-gray-600 mt-1">Create your own custom content</p>
                </div>
              </div>
            </button>
          </div>
        </motion.div>

        {/* Recent Projects */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Recent Projects</h2>
            <Button variant="ghost" size="sm" onClick={() => router.push('/dashboard/projects')}>
              View All
            </Button>
          </div>
          
          <div className="space-y-3">
            {recentProjects.map((project) => (
              <button
                key={project.id}
                onClick={() => router.push(`/dashboard/tts/editor?project=${project.id}`)}
                className="w-full bg-gray-50 rounded-xl p-4 text-left hover:bg-gray-100 transition-colors"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
                    <PlayIcon className="w-5 h-5 text-primary-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900">{project.name}</h3>
                    <p className="text-sm text-gray-500">Updated {project.updatedAt}</p>
                  </div>
                  <div className="text-xs text-gray-400">{project.type}</div>
                </div>
              </button>
            ))}
          </div>
        </motion.div>

        {/* Create Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="pt-4"
        >
          <Button
            onClick={handleCreateProject}
            disabled={!projectName.trim()}
            fullWidth
            className="h-12 font-medium"
          >
            Create Project
          </Button>
        </motion.div>
      </div>
    </div>
  );
}