import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui/button';
import { Card } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '../../components/ui/avatar';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../components/ui/dialog';
import { useTheme } from '../../lib/theme-provider';
import {
  ArrowLeftIcon,
  EllipsisVerticalIcon,
  MagnifyingGlassIcon,
  PlayIcon,
  PlusIcon,
  TrashIcon,
  PencilIcon,
  ShareIcon
} from '@heroicons/react/24/outline';

interface CustomVoice {
  id: string;
  name: string;
  gender: 'M' | 'F';
  language: string;
  country: string;
  ageGroup: 'Young' | 'Middle-Aged' | 'Senior';
  avatar: string;
  createdAt: string;
  isProcessing: boolean;
  processingProgress?: number;
}

const MyVoices = () => {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const [searchQuery, setSearchQuery] = useState('');
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedVoice, setSelectedVoice] = useState<CustomVoice | null>(null);
  const [showOptionsMenu, setShowOptionsMenu] = useState<string | null>(null);
  
  const [voices, setVoices] = useState<CustomVoice[]>([
    {
      id: '1',
      name: 'Eleanor',
      gender: 'F',
      language: 'English',
      country: '🇳🇱',
      ageGroup: 'Young',
      avatar: '/api/placeholder/48/48',
      createdAt: '2 days ago',
      isProcessing: false
    },
    {
      id: '2',
      name: 'Clara',
      gender: 'F',
      language: 'Spanish',
      country: '🇨🇳',
      ageGroup: 'Young',
      avatar: '/api/placeholder/48/48',
      createdAt: '1 week ago',
      isProcessing: false
    },
    {
      id: '3',
      name: 'Eugene',
      gender: 'M',
      language: 'English',
      country: '🇸🇦',
      ageGroup: 'Middle-Aged',
      avatar: '/api/placeholder/48/48',
      createdAt: '2 weeks ago',
      isProcessing: false
    },
    {
      id: '4',
      name: 'Walter',
      gender: 'M',
      language: 'German',
      country: '🇮🇳',
      ageGroup: 'Middle-Aged',
      avatar: '/api/placeholder/48/48',
      createdAt: '1 month ago',
      isProcessing: false
    },
    {
      id: '5',
      name: 'Dorothy',
      gender: 'F',
      language: 'French',
      country: '🇰🇷',
      ageGroup: 'Young',
      avatar: '/api/placeholder/48/48',
      createdAt: '2 months ago',
      isProcessing: false
    },
    {
      id: '6',
      name: 'Clifford',
      gender: 'M',
      language: 'English',
      country: '🇺🇸',
      ageGroup: 'Young',
      avatar: '/api/placeholder/48/48',
      createdAt: '3 months ago',
      isProcessing: true,
      processingProgress: 75
    }
  ]);

  const filteredVoices = voices.filter(voice =>
    voice.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    voice.language.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleDeleteVoice = (voiceId: string) => {
    setVoices(voices.filter(voice => voice.id !== voiceId));
    setShowDeleteDialog(false);
    setSelectedVoice(null);
  };

  const openDeleteDialog = (voice: CustomVoice) => {
    setSelectedVoice(voice);
    setShowDeleteDialog(true);
    setShowOptionsMenu(null);
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
        className="py-6"
      >
        {/* Header */}
        <motion.div variants={itemVariants} className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate(-1)}
              className="p-2"
            >
              <ArrowLeftIcon className="w-5 h-5" />
            </Button>
            <h1 className="text-xl font-bold text-foreground">My Voices</h1>
          </div>
          <Button variant="ghost" size="sm" className="p-2">
            <EllipsisVerticalIcon className="w-5 h-5 text-muted-foreground" />
          </Button>
        </motion.div>

        {/* Search Bar */}
        <motion.div variants={itemVariants} className="mb-6">
          <div className="relative">
            <MagnifyingGlassIcon className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search by Voice Name"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 py-3 rounded-xl"
            />
          </div>
        </motion.div>

        {/* Voices Grid */}
        <motion.div variants={itemVariants} className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          {filteredVoices.map((voice, index) => (
            <motion.div
              key={voice.id}
              variants={itemVariants}
              custom={index}
              className="relative"
            >
              <Card className={`p-4 hover:shadow-lg transition-all duration-200 cursor-pointer group ${
                voice.isProcessing ? 'opacity-75' : ''
              }`}>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <Avatar className="w-12 h-12">
                      <AvatarImage src={voice.avatar} />
                      <AvatarFallback>
                        {voice.name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="flex items-center space-x-2">
                        <h3 className="font-semibold text-foreground">
                          {voice.name} ({voice.gender})
                        </h3>
                        <span className="text-lg">{voice.country}</span>
                      </div>
                      <p className="text-sm text-muted-foreground">{voice.ageGroup}</p>
                      <p className="text-xs text-muted-foreground mt-1">{voice.createdAt}</p>
                    </div>
                  </div>
                  
                  {/* Options Menu */}
                  <div className="relative">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowOptionsMenu(showOptionsMenu === voice.id ? null : voice.id);
                      }}
                      className="p-2"
                    >
                      <EllipsisVerticalIcon className="w-5 h-5 text-muted-foreground" />
                    </Button>
                    
                    {showOptionsMenu === voice.id && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="absolute right-0 top-10 z-10 w-48 rounded-lg bg-white dark:bg-slate-800 shadow-lg border border-gray-200 dark:border-gray-700 py-2"
                      >
                        <button
                          className="flex items-center w-full px-4 py-2 text-sm text-foreground hover:bg-gray-100 dark:hover:bg-slate-700"
                          onClick={() => {
                            setShowOptionsMenu(null);
                            // Handle edit
                          }}
                        >
                          <PencilIcon className="w-4 h-4 mr-2" />
                          Rename
                        </button>
                        <button
                          className="flex items-center w-full px-4 py-2 text-sm text-foreground hover:bg-gray-100 dark:hover:bg-slate-700"
                          onClick={() => {
                            setShowOptionsMenu(null);
                            // Handle share
                          }}
                        >
                          <ShareIcon className="w-4 h-4 mr-2" />
                          Share
                        </button>
                        <button
                          className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                          onClick={() => openDeleteDialog(voice)}
                        >
                          <TrashIcon className="w-4 h-4 mr-2" />
                          Delete
                        </button>
                      </motion.div>
                    )}
                  </div>
                </div>

                {/* Processing Progress */}
                {voice.isProcessing && voice.processingProgress && (
                  <div className="mb-4">
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-muted-foreground">Processing...</span>
                      <span className="text-muted-foreground">{voice.processingProgress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div 
                        className="bg-blue-500 h-2 rounded-full transition-all duration-500"
                        style={{ width: `${voice.processingProgress}%` }}
                      ></div>
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-muted-foreground">{voice.language}</span>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="p-2 hover:bg-blue-100 dark:hover:bg-blue-900/30"
                      disabled={voice.isProcessing}
                    >
                      <PlayIcon className="w-4 h-4 text-blue-500" />
                    </Button>
                    <Button
                      size="sm"
                      className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-full text-xs"
                      disabled={voice.isProcessing}
                    >
                      Select
                    </Button>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        {/* Add New Voice Button */}
        <motion.div variants={itemVariants}>
          <Button
            onClick={() => navigate('/app/voice-cloning')}
            className="w-full bg-blue-500 hover:bg-blue-600 text-white py-4 rounded-2xl font-medium flex items-center justify-center space-x-2"
          >
            <PlusIcon className="w-5 h-5" />
            <span>Add New Voice</span>
          </Button>
        </motion.div>

        {/* Empty State */}
        {filteredVoices.length === 0 && (
          <motion.div variants={itemVariants} className="text-center py-12">
            <div className="text-6xl mb-4">🎤</div>
            <h3 className="text-lg font-semibold text-foreground mb-2">No voices found</h3>
            <p className="text-muted-foreground mb-6">Create your first custom voice or try a different search</p>
            <Button
              onClick={() => navigate('/app/voice-cloning')}
              className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-full"
            >
              Create Voice
            </Button>
          </motion.div>
        )}
      </motion.div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Delete Voice</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="text-muted-foreground mb-4">
              Are you sure you want to delete "{selectedVoice?.name}"? This action cannot be undone.
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
                onClick={() => selectedVoice && handleDeleteVoice(selectedVoice.id)}
                className="flex-1"
              >
                Delete
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default MyVoices;