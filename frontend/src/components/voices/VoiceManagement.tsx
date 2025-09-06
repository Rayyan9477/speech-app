import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { useVoiceManagement } from '../../contexts/VoiceManagementContext';
import VoiceOptionsMenu from './VoiceOptionsMenu';
import VoiceDeleteConfirmation from './VoiceDeleteConfirmation';
import AddVoiceDialog from './AddVoiceDialog';
import {
  MagnifyingGlassIcon,
  EllipsisVerticalIcon,
  PlayIcon,
  PlusIcon,
  SparklesIcon,
  ClockIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';

const VoiceManagement: React.FC = () => {
  const {
    state,
    setSearchQuery,
    selectVoice,
    showVoiceOptions,
    showAddVoiceDialog,
    playVoice
  } = useVoiceManagement();

  const [playingVoice, setPlayingVoice] = useState<string | null>(null);

  const handlePlayVoice = async (voice: any) => {
    if (playingVoice === voice.id) {
      setPlayingVoice(null);
    } else {
      setPlayingVoice(voice.id);
      await playVoice(voice);
      // Reset after playing
      setTimeout(() => setPlayingVoice(null), 3000);
    }
  };

  const getStatusIcon = (voice: any) => {
    if (voice.status === 'processing') {
      return <ClockIcon className="w-4 h-4 text-yellow-600" />;
    } else if (voice.status === 'ready') {
      return <CheckCircleIcon className="w-4 h-4 text-green-600" />;
    } else if (voice.status === 'failed') {
      return <ExclamationTriangleIcon className="w-4 h-4 text-red-600" />;
    }
    return null;
  };

  const getCountryFlag = (languageCode: string) => {
    const flagMap: { [key: string]: string } = {
      'en-US': '🇺🇸',
      'en-GB': '🇬🇧',
      'de-DE': '🇩🇪',
      'es-ES': '🇪🇸',
      'fr-FR': '🇫🇷',
      'it-IT': '🇮🇹',
      'pt-PT': '🇵🇹',
      'zh-CN': '🇨🇳',
      'ja-JP': '🇯🇵',
      'ko-KR': '🇰🇷'
    };
    return flagMap[languageCode] || '🌐';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">My Voices</h1>
          <p className="text-muted-foreground">
            {state.filteredVoices.length} custom voice{state.filteredVoices.length !== 1 ? 's' : ''}
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
          type="text"
          placeholder="Search by Voice Name"
          value={state.searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10 h-12 bg-muted/50 border-border"
        />
      </div>

      {/* Voices Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <AnimatePresence>
          {state.filteredVoices.map((voice) => (
            <motion.div
              key={voice.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.2 }}
            >
              <Card className="p-4 hover:shadow-md transition-all duration-200 relative">
                {/* Voice Options Button */}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => showVoiceOptions(voice)}
                  className="absolute top-2 right-2 p-1 w-8 h-8"
                >
                  <EllipsisVerticalIcon className="w-4 h-4" />
                </Button>

                {/* Voice Avatar */}
                <div className="flex flex-col items-center text-center mb-4">
                  <div className="relative mb-3">
                    <Avatar className="w-20 h-20 mb-2">
                      <AvatarImage src={voice.avatar} />
                      <AvatarFallback className="bg-gradient-to-br from-blue-400 to-purple-400 text-white text-lg font-semibold">
                        {voice.name.substring(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    
                    {/* Country Flag */}
                    <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-white dark:bg-gray-800 rounded-full flex items-center justify-center text-sm">
                      {getCountryFlag(voice.languageCode)}
                    </div>
                  </div>

                  {/* Voice Info */}
                  <div className="space-y-1">
                    <h3 className="font-semibold text-foreground flex items-center space-x-2">
                      <span>{voice.name} ({voice.gender[0]})</span>
                      {voice.isPremium && (
                        <SparklesIcon className="w-4 h-4 text-yellow-500" />
                      )}
                    </h3>
                    <p className="text-sm text-muted-foreground">{voice.ageGroup}</p>
                  </div>
                </div>

                {/* Voice Actions */}
                <div className="flex items-center justify-between">
                  {/* Play Button */}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handlePlayVoice(voice)}
                    disabled={voice.status !== 'ready'}
                    className="flex items-center space-x-2 p-2"
                  >
                    <PlayIcon className="w-4 h-4" />
                    <span className="text-sm">
                      {playingVoice === voice.id ? 'Playing...' : 'Preview'}
                    </span>
                  </Button>

                  {/* Select Button */}
                  <Button
                    onClick={() => selectVoice(voice)}
                    disabled={voice.status !== 'ready'}
                    size="sm"
                    className={`text-sm ${
                      voice.status === 'ready'
                        ? 'bg-blue-600 hover:bg-blue-700 text-white'
                        : 'bg-muted text-muted-foreground cursor-not-allowed'
                    }`}
                  >
                    {voice.status === 'processing' ? (
                      <div className="flex items-center space-x-2">
                        <ClockIcon className="w-4 h-4 animate-spin" />
                        <span>{voice.processingProgress}%</span>
                      </div>
                    ) : (
                      'Select'
                    )}
                  </Button>
                </div>

                {/* Processing Status */}
                {voice.status === 'processing' && (
                  <div className="mt-3">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-muted-foreground">Processing...</span>
                      <span className="text-xs font-medium">{voice.processingProgress}%</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-1">
                      <div 
                        className="bg-blue-600 h-1 rounded-full transition-all duration-300"
                        style={{ width: `${voice.processingProgress}%` }}
                      />
                    </div>
                  </div>
                )}

                {/* Voice Status Indicator */}
                <div className="absolute top-4 left-4">
                  {getStatusIcon(voice)}
                </div>

                {/* Playing Animation */}
                {playingVoice === voice.id && (
                  <motion.div
                    className="absolute inset-0 border-2 border-blue-500 rounded-lg"
                    animate={{ opacity: [0.3, 0.7, 0.3] }}
                    transition={{ duration: 1, repeat: Infinity }}
                  />
                )}
              </Card>
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Add New Voice Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.2 }}
        >
          <Card 
            className="p-4 border-dashed border-2 border-muted-foreground/30 hover:border-blue-500 transition-all duration-200 cursor-pointer min-h-[200px] flex flex-col items-center justify-center"
            onClick={showAddVoiceDialog}
          >
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mx-auto">
                <PlusIcon className="w-8 h-8 text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground mb-1">Add New Voice</h3>
                <p className="text-sm text-muted-foreground">
                  Upload or record your custom voice
                </p>
              </div>
            </div>
          </Card>
        </motion.div>
      </div>

      {/* Empty State */}
      {state.filteredVoices.length === 0 && !state.isLoading && state.searchQuery && (
        <div className="text-center py-12">
          <div className="w-24 h-24 mx-auto mb-4 bg-muted rounded-full flex items-center justify-center">
            <MagnifyingGlassIcon className="w-12 h-12 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold text-foreground mb-2">No voices found</h3>
          <p className="text-muted-foreground mb-4">
            Try adjusting your search terms
          </p>
          <Button
            onClick={() => setSearchQuery('')}
            variant="outline"
          >
            Clear Search
          </Button>
        </div>
      )}

      {/* Voice Options Menu */}
      <VoiceOptionsMenu />

      {/* Delete Confirmation Dialog */}
      <VoiceDeleteConfirmation />

      {/* Add Voice Dialog */}
      <AddVoiceDialog />
    </div>
  );
};

export default VoiceManagement;