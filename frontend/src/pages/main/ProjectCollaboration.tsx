import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '../../components/ui/button';
import { Card } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Input } from '../../components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '../../components/ui/avatar';
import { useTheme } from '../../lib/theme-provider';
import {
  ShareIcon,
  LinkIcon,
  UsersIcon,
  PlusIcon,
  ClockIcon,
  CheckCircleIcon,
  EyeIcon,
  MessageCircleIcon,
  PaperAirplaneIcon,
  Cog6ToothIcon
} from '@heroicons/react/24/outline';

const ProjectCollaboration = () => {
  const { theme } = useTheme();
  const [selectedProject, setSelectedProject] = useState('demo-project');
  const [shareEmail, setShareEmail] = useState('');
  const [comment, setComment] = useState('');
  const [activeTab, setActiveTab] = useState('shared');

  const projects = [
    {
      id: 'demo-project',
      title: 'Product Demo Script',
      description: 'Marketing video voiceover for new product launch',
      collaborators: [
        { id: '1', name: 'John Doe', email: 'john@example.com', role: 'Owner', avatar: '/api/placeholder/32/32', status: 'online' },
        { id: '2', name: 'Sarah Wilson', email: 'sarah@example.com', role: 'Editor', avatar: '/api/placeholder/32/32', status: 'offline' },
        { id: '3', name: 'Mike Johnson', email: 'mike@example.com', role: 'Reviewer', avatar: '/api/placeholder/32/32', status: 'online' }
      ],
      sharedLink: 'https://voicify.app/share/demo-project-abc123',
      lastActivity: '2 hours ago',
      views: 24,
      comments: 8
    }
  ];

  const recentActivity = [
    {
      id: '1',
      user: 'Sarah Wilson',
      action: 'edited the project',
      project: 'Product Demo Script',
      time: '2 hours ago',
      avatar: '/api/placeholder/32/32'
    },
    {
      id: '2',
      user: 'Mike Johnson',
      action: 'added a comment',
      project: 'Product Demo Script',
      time: '4 hours ago',
      avatar: '/api/placeholder/32/32'
    },
    {
      id: '3',
      user: 'John Doe',
      action: 'shared the project',
      project: 'Product Demo Script',
      time: '1 day ago',
      avatar: '/api/placeholder/32/32'
    }
  ];

  const comments = [
    {
      id: '1',
      user: 'Sarah Wilson',
      avatar: '/api/placeholder/32/32',
      content: 'The voice selection sounds great! I think we should try a slightly more energetic tone for the introduction.',
      time: '2 hours ago',
      likes: 3
    },
    {
      id: '2',
      user: 'Mike Johnson',
      avatar: '/api/placeholder/32/32',
      content: 'Agreed! The current version is good, but the intro could use more excitement. What do you think about trying the "Energetic" preset?',
      time: '1 hour ago',
      likes: 2
    }
  ];

  const handleShareProject = () => {
    if (shareEmail.trim()) {
      console.log('Sharing project with:', shareEmail);
      setShareEmail('');
    }
  };

  const handleAddComment = () => {
    if (comment.trim()) {
      console.log('Adding comment:', comment);
      setComment('');
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(projects[0].sharedLink);
    // Show toast notification
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
            <h1 className="text-2xl font-bold text-foreground">Collaboration</h1>
            <p className="text-muted-foreground mt-1">Share and collaborate on projects</p>
          </div>
          <Badge variant="outline" className="rounded-full">
            <UsersIcon className="w-4 h-4 mr-1" />
            Team
          </Badge>
        </motion.div>

        {/* Project Selection */}
        <motion.div variants={itemVariants}>
          <Card className="p-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-foreground">Active Projects</h2>
              <Button size="sm" className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white">
                <PlusIcon className="w-4 h-4 mr-2" />
                New Project
              </Button>
            </div>

            <div className="space-y-3">
              {projects.map((project) => (
                <div
                  key={project.id}
                  onClick={() => setSelectedProject(project.id)}
                  className={`p-3 rounded-lg border cursor-pointer transition-all ${
                    selectedProject === project.id
                      ? 'border-primary bg-primary/5'
                      : theme === 'dark'
                      ? 'border-slate-700 hover:border-slate-600'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h3 className="font-medium text-foreground">{project.title}</h3>
                      <p className="text-sm text-muted-foreground">{project.description}</p>
                      <div className="flex items-center space-x-4 mt-2">
                        <div className="flex items-center space-x-1">
                          <UsersIcon className="w-4 h-4 text-muted-foreground" />
                          <span className="text-xs text-muted-foreground">
                            {project.collaborators.length} collaborators
                          </span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <EyeIcon className="w-4 h-4 text-muted-foreground" />
                          <span className="text-xs text-muted-foreground">
                            {project.views} views
                          </span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <MessageCircleIcon className="w-4 h-4 text-muted-foreground" />
                          <span className="text-xs text-muted-foreground">
                            {project.comments} comments
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex -space-x-2">
                      {project.collaborators.slice(0, 3).map((collaborator) => (
                        <Avatar key={collaborator.id} className="w-8 h-8 border-2 border-background">
                          <AvatarImage src={collaborator.avatar} />
                          <AvatarFallback className="text-xs">
                            {collaborator.name.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                      ))}
                      {project.collaborators.length > 3 && (
                        <div className="w-8 h-8 rounded-full bg-muted border-2 border-background flex items-center justify-center">
                          <span className="text-xs text-muted-foreground">
                            +{project.collaborators.length - 3}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </motion.div>

        {/* Collaboration Tabs */}
        <motion.div variants={itemVariants}>
          <Card className="p-4">
            <div className="flex space-x-1 mb-6">
              {[
                { id: 'shared', label: 'Shared Projects', icon: ShareIcon },
                { id: 'activity', label: 'Recent Activity', icon: ClockIcon },
                { id: 'comments', label: 'Comments', icon: MessageCircleIcon }
              ].map((tab) => {
                const IconComponent = tab.icon;
                return (
                  <Button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    variant={activeTab === tab.id ? "default" : "ghost"}
                    size="sm"
                    className={`flex-1 ${
                      activeTab === tab.id
                        ? 'bg-primary text-primary-foreground'
                        : ''
                    }`}
                  >
                    <IconComponent className="w-4 h-4 mr-2" />
                    {tab.label}
                  </Button>
                );
              })}
            </div>

            {/* Share Project */}
            {activeTab === 'shared' && (
              <div className="space-y-6">
                <div>
                  <h3 className="font-medium text-foreground mb-4">Share Project</h3>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        Invite by Email
                      </label>
                      <div className="flex space-x-2">
                        <Input
                          type="email"
                          placeholder="Enter email address"
                          value={shareEmail}
                          onChange={(e) => setShareEmail(e.target.value)}
                          className="flex-1"
                        />
                        <Button
                          onClick={handleShareProject}
                          disabled={!shareEmail.trim()}
                        >
                          <PaperAirplaneIcon className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        Share Link
                      </label>
                      <div className="flex space-x-2">
                        <Input
                          type="text"
                          value={projects[0].sharedLink}
                          readOnly
                          className="flex-1"
                        />
                        <Button onClick={handleCopyLink} variant="outline">
                          <LinkIcon className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Collaborators */}
                <div>
                  <h3 className="font-medium text-foreground mb-4">Current Collaborators</h3>
                  <div className="space-y-3">
                    {projects[0].collaborators.map((collaborator) => (
                      <div key={collaborator.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <Avatar className="w-10 h-10">
                            <AvatarImage src={collaborator.avatar} />
                            <AvatarFallback>
                              {collaborator.name.split(' ').map(n => n[0]).join('')}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium text-foreground">{collaborator.name}</p>
                            <p className="text-sm text-muted-foreground">{collaborator.email}</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge
                            variant={collaborator.status === 'online' ? 'default' : 'secondary'}
                            className="text-xs"
                          >
                            {collaborator.status}
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            {collaborator.role}
                          </Badge>
                          <Button variant="ghost" size="sm">
                            <Cog6ToothIcon className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Recent Activity */}
            {activeTab === 'activity' && (
              <div className="space-y-4">
                <h3 className="font-medium text-foreground mb-4">Recent Activity</h3>
                {recentActivity.map((activity) => (
                  <div key={activity.id} className="flex items-start space-x-3 p-3 hover:bg-muted/50 rounded-lg">
                    <Avatar className="w-8 h-8">
                      <AvatarImage src={activity.avatar} />
                      <AvatarFallback className="text-xs">
                        {activity.user.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <p className="text-sm text-foreground">
                        <span className="font-medium">{activity.user}</span> {activity.action}{' '}
                        <span className="font-medium">&quot;{activity.project}&quot;</span>
                      </p>
                      <p className="text-xs text-muted-foreground">{activity.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Comments */}
            {activeTab === 'comments' && (
              <div className="space-y-6">
                <h3 className="font-medium text-foreground mb-4">Comments</h3>

                {/* Add Comment */}
                <div className="space-y-3">
                  <textarea
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Add a comment..."
                    className={`w-full h-20 p-3 rounded-lg border resize-none focus:outline-none focus:ring-2 focus:ring-primary/20 transition-colors ${
                      theme === 'dark'
                        ? 'bg-slate-800 border-slate-700 text-white placeholder-slate-400'
                        : 'bg-white border-slate-200 text-slate-900 placeholder-slate-500'
                    }`}
                  />
                  <Button
                    onClick={handleAddComment}
                    disabled={!comment.trim()}
                    className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white"
                  >
                    <PaperAirplaneIcon className="w-4 h-4 mr-2" />
                    Post Comment
                  </Button>
                </div>

                {/* Comments List */}
                <div className="space-y-4">
                  {comments.map((commentItem) => (
                    <div key={commentItem.id} className="flex space-x-3">
                      <Avatar className="w-8 h-8">
                        <AvatarImage src={commentItem.avatar} />
                        <AvatarFallback className="text-xs">
                          {commentItem.user.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="bg-muted/50 p-3 rounded-lg">
                          <p className="text-sm font-medium text-foreground">{commentItem.user}</p>
                          <p className="text-sm text-foreground mt-1">{commentItem.content}</p>
                        </div>
                        <div className="flex items-center space-x-4 mt-2">
                          <span className="text-xs text-muted-foreground">{commentItem.time}</span>
                          <Button variant="ghost" size="sm" className="h-6 px-2 text-xs">
                            👍 {commentItem.likes}
                          </Button>
                          <Button variant="ghost" size="sm" className="h-6 px-2 text-xs">
                            Reply
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </Card>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default ProjectCollaboration;
