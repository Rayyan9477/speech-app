import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui/button';
import { Card } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { useTheme } from '../../lib/theme-provider';
import {
  ArrowLeftIcon,
  DocumentTextIcon,
  SparklesIcon,
  ClockIcon,
  ArrowRightIcon
} from '@heroicons/react/24/outline';

interface ProjectTemplate {
  id: string;
  title: string;
  description: string;
  category: string;
  icon: string;
  estimatedTime: string;
  popular?: boolean;
}

const TTSProjectCreation = () => {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const [projectTitle, setProjectTitle] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');

  const templates: ProjectTemplate[] = [
    {
      id: 'blank',
      title: 'Blank Project',
      description: 'Start from scratch with complete creative control',
      category: 'General',
      icon: '📝',
      estimatedTime: '5-30 min',
      popular: true
    },
    {
      id: 'podcast-intro',
      title: 'Podcast Introduction',
      description: 'Professional podcast intro with music and voice-over',
      category: 'Podcast',
      icon: '🎧',
      estimatedTime: '10-15 min'
    },
    {
      id: 'social-media',
      title: 'Social Media Video',
      description: 'Engaging voice-over for Instagram, TikTok, or YouTube',
      category: 'Social Media',
      icon: '📱',
      estimatedTime: '5-10 min'
    },
    {
      id: 'product-demo',
      title: 'Product Demo',
      description: 'Clear narration for product demonstrations',
      category: 'Business',
      icon: '💼',
      estimatedTime: '15-25 min'
    },
    {
      id: 'educational',
      title: 'Educational Content',
      description: 'Tutorial or lesson with structured content blocks',
      category: 'Education',
      icon: '🎓',
      estimatedTime: '20-40 min'
    },
    {
      id: 'audiobook',
      title: 'Audiobook Chapter',
      description: 'Long-form narration with chapter breaks',
      category: 'Publishing',
      icon: '📚',
      estimatedTime: '30-60 min'
    },
    {
      id: 'advertisement',
      title: 'Advertisement',
      description: 'Promotional content with call-to-action',
      category: 'Marketing',
      icon: '📢',
      estimatedTime: '5-10 min'
    },
    {
      id: 'meditation',
      title: 'Meditation Guide',
      description: 'Calm, soothing voice for mindfulness content',
      category: 'Wellness',
      icon: '🧘',
      estimatedTime: '10-30 min'
    }
  ];

  const recentProjects = [
    'My Podcast Episode 12',
    'Product Launch Video',
    'Training Module 3',
    'Instagram Story Voice'
  ];

  const handleCreateProject = () => {
    if (!projectTitle.trim()) {
      return;
    }

    const template = templates.find(t => t.id === selectedTemplate);
    const queryParams = new URLSearchParams({
      title: projectTitle,
      template: selectedTemplate || 'blank'
    });

    navigate(`/app/tts-editor?${queryParams.toString()}`);
  };

  const handleUseRecent = (title: string) => {
    setProjectTitle(title);
  };

  const isFormValid = projectTitle.trim() !== '';

  return (
    <div className="min-h-screen pb-20 bg-background">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="py-6 max-w-4xl mx-auto px-4"
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate(-1)}
              className="p-2"
            >
              <ArrowLeftIcon className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Create New TTS Project</h1>
              <p className="text-muted-foreground">Choose a template or start from scratch</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Project Setup */}
          <div className="lg:col-span-2 space-y-6">
            {/* Project Title */}
            <Card className="p-6">
              <div className="mb-4">
                <h2 className="text-lg font-semibold text-foreground mb-2">Project Details</h2>
                <p className="text-sm text-muted-foreground">Give your project a descriptive name</p>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Project Title *</label>
                  <Input
                    placeholder="e.g., My Awesome Podcast Episode"
                    value={projectTitle}
                    onChange={(e) => setProjectTitle(e.target.value)}
                    className="text-lg"
                  />
                </div>

                {/* Recent Projects */}
                {recentProjects.length > 0 && (
                  <div>
                    <label className="text-sm font-medium mb-2 block">Recent Projects</label>
                    <div className="flex flex-wrap gap-2">
                      {recentProjects.map((project, index) => (
                        <Button
                          key={index}
                          variant="outline"
                          size="sm"
                          onClick={() => handleUseRecent(project)}
                          className="text-xs"
                        >
                          {project}
                        </Button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </Card>

            {/* Template Selection */}
            <Card className="p-6">
              <div className="mb-6">
                <h2 className="text-lg font-semibold text-foreground mb-2">Choose Template</h2>
                <p className="text-sm text-muted-foreground">Select a template to get started quickly</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {templates.map((template) => (
                  <motion.div
                    key={template.id}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Card
                      className={`p-4 cursor-pointer transition-all hover:shadow-md ${
                        selectedTemplate === template.id
                          ? 'border-primary bg-primary/5 shadow-sm'
                          : 'border-border hover:border-primary/50'
                      }`}
                      onClick={() => setSelectedTemplate(template.id)}
                    >
                      <div className="flex items-start space-x-3">
                        <div className="text-2xl">{template.icon}</div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2 mb-1">
                            <h3 className="font-semibold text-sm">{template.title}</h3>
                            {template.popular && (
                              <span className="bg-primary/10 text-primary text-xs px-2 py-0.5 rounded-full">
                                Popular
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground mb-2 line-clamp-2">
                            {template.description}
                          </p>
                          <div className="flex items-center justify-between text-xs text-muted-foreground">
                            <span className="bg-muted px-2 py-1 rounded">
                              {template.category}
                            </span>
                            <div className="flex items-center space-x-1">
                              <ClockIcon className="w-3 h-3" />
                              <span>{template.estimatedTime}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </Card>
          </div>

          {/* Right Column - Preview & Action */}
          <div className="space-y-6">
            {/* Preview */}
            <Card className="p-6">
              <h3 className="font-semibold text-foreground mb-4">Project Preview</h3>
              
              <div className="space-y-4">
                <div className="p-4 bg-muted/50 rounded-lg">
                  <div className="flex items-center space-x-2 mb-2">
                    <DocumentTextIcon className="w-4 h-4 text-primary" />
                    <span className="text-sm font-medium">
                      {projectTitle || 'Untitled Project'}
                    </span>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Template: {templates.find(t => t.id === selectedTemplate)?.title || 'None selected'}
                  </div>
                </div>

                {selectedTemplate && (
                  <div className="space-y-2">
                    <div className="text-sm font-medium">Template Features:</div>
                    <div className="text-xs text-muted-foreground space-y-1">
                      <div>• AI-powered voice selection</div>
                      <div>• Pre-structured content blocks</div>
                      <div>• Professional export options</div>
                      <div>• Real-time preview</div>
                    </div>
                  </div>
                )}
              </div>
            </Card>

            {/* Quick Tips */}
            <Card className="p-6 bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800">
              <div className="flex items-start space-x-2">
                <SparklesIcon className="w-5 h-5 text-blue-600 mt-0.5" />
                <div>
                  <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">Pro Tips</h4>
                  <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
                    <li>• Use descriptive project names for easy organization</li>
                    <li>• Templates save time with pre-configured settings</li>
                    <li>• You can always customize templates later</li>
                  </ul>
                </div>
              </div>
            </Card>

            {/* Action Button */}
            <Button
              onClick={handleCreateProject}
              disabled={!isFormValid}
              className="w-full bg-primary hover:bg-primary/90 text-white font-semibold py-3 rounded-xl"
              size="lg"
            >
              <span className="flex items-center justify-center space-x-2">
                <span>Create Project</span>
                <ArrowRightIcon className="w-4 h-4" />
              </span>
            </Button>

            {!isFormValid && (
              <p className="text-xs text-center text-muted-foreground">
                Please enter a project title to continue
              </p>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default TTSProjectCreation;