import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card } from '../../ui/card';
import { Button } from '../../ui/button';
import { Input } from '../../ui/input';
import { Badge } from '../../ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '../../ui/avatar';
import { AudioFile } from '../../../contexts/VoiceProcessingContext';
import WaveformAudioPlayer from '../../tts/WaveformAudioPlayer';
import {
  MagnifyingGlassIcon,
  PlayIcon,
  PauseIcon,
  CheckCircleIcon,
  SparklesIcon,
  SpeakerWaveIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';

interface Voice {
  id: string;
  name: string;
  language: string;
  gender: string;
  avatar: string;
  sampleUrl: string;
  isPremium: boolean;
}

interface VoiceSelectionStepProps {
  voices: Voice[];
  selectedVoice?: string;
  onVoiceSelect: (voiceId: string) => void;
  sourceAudio?: AudioFile;
}

interface AudioManager {
  currentAudio: HTMLAudioElement | null;
  playingVoiceId: string | null;
}

const VoiceSelectionStep: React.FC<VoiceSelectionStepProps> = ({
  voices,
  selectedVoice,
  onVoiceSelect,
  sourceAudio
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [genderFilter, setGenderFilter] = useState<'all' | 'Male' | 'Female'>('all');
  const [languageFilter, setLanguageFilter] = useState<string>('all');
  const [audioManager, setAudioManager] = useState<AudioManager>({
    currentAudio: null,
    playingVoiceId: null
  });

  // Filter voices based on search and filters
  const filteredVoices = voices.filter(voice => {
    const matchesSearch = voice.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         voice.language.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesGender = genderFilter === 'all' || voice.gender === genderFilter;
    
    const matchesLanguage = languageFilter === 'all' || voice.language === languageFilter;
    
    return matchesSearch && matchesGender && matchesLanguage;
  });

  // Get unique languages for filter
  const availableLanguages = Array.from(new Set(voices.map(voice => voice.language)));

  const handlePlayVoice = async (voice: Voice) => {
    // Stop current audio if playing
    if (audioManager.currentAudio) {
      audioManager.currentAudio.pause();
      audioManager.currentAudio.src = '';
    }

    try {
      const audio = new Audio(voice.sampleUrl);
      audio.preload = 'auto';
      
      audio.addEventListener('canplaythrough', () => {
        audio.play().catch(console.error);
      });

      audio.addEventListener('ended', () => {
        setAudioManager(prev => ({
          ...prev,
          currentAudio: null,
          playingVoiceId: null
        }));
      });

      audio.addEventListener('error', () => {
        console.error('Failed to load audio for voice:', voice.id);
        setAudioManager(prev => ({
          ...prev,
          currentAudio: null,
          playingVoiceId: null
        }));
      });

      setAudioManager({
        currentAudio: audio,
        playingVoiceId: voice.id
      });

      audio.load();
    } catch (error) {
      console.error('Error playing voice sample:', error);
    }
  };

  const handleStopVoice = () => {
    if (audioManager.currentAudio) {
      audioManager.currentAudio.pause();
      setAudioManager({
        currentAudio: null,
        playingVoiceId: null
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Source Audio Preview */}
      {sourceAudio && (
        <Card className="p-6">
          <h3 className="font-semibold text-foreground mb-4">Original Audio</h3>
          <WaveformAudioPlayer
            audioUrl={sourceAudio.url}
            waveformData={sourceAudio.waveformData}
            showControls={true}
            showWaveform={true}
            title="Your uploaded audio"
            className="bg-muted/20"
          />
        </Card>
      )}

      {/* Voice Selection */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-semibold text-foreground">Choose Target Voice</h2>
            <p className="text-muted-foreground">
              Select the voice you want to transform your audio into
            </p>
          </div>
          
          {selectedVoice && (
            <Badge variant="default" className="bg-green-500 text-white">
              Voice Selected
            </Badge>
          )}
        </div>

        {/* Search and Filters */}
        <div className="space-y-4 mb-6">
          {/* Search */}
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              placeholder="Search voices by name or language..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-10"
            />
            {searchQuery && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSearchQuery('')}
                className="absolute right-1 top-1/2 transform -translate-y-1/2 p-2"
              >
                <XMarkIcon className="w-4 h-4" />
              </Button>
            )}
          </div>

          {/* Filters */}
          <div className="flex flex-wrap gap-4">
            {/* Gender Filter */}
            <div className="flex items-center space-x-2">
              <span className="text-sm font-medium text-foreground">Gender:</span>
              {['all', 'Male', 'Female'].map((gender) => (
                <Button
                  key={gender}
                  variant={genderFilter === gender ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setGenderFilter(gender as any)}
                  className="text-xs"
                >
                  {gender === 'all' ? 'All' : gender}
                </Button>
              ))}
            </div>

            {/* Language Filter */}
            <div className="flex items-center space-x-2">
              <span className="text-sm font-medium text-foreground">Language:</span>
              <select
                value={languageFilter}
                onChange={(e) => setLanguageFilter(e.target.value)}
                className="text-xs bg-background border rounded px-3 py-1"
              >
                <option value="all">All Languages</option>
                {availableLanguages.map((language) => (
                  <option key={language} value={language}>
                    {language}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Voice Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <AnimatePresence>
            {filteredVoices.map((voice) => {
              const isSelected = selectedVoice === voice.id;
              const isPlaying = audioManager.playingVoiceId === voice.id;

              return (
                <motion.div
                  key={voice.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.2 }}
                >
                  <Card 
                    className={`p-4 cursor-pointer transition-all duration-200 hover:shadow-md ${
                      isSelected ? 'ring-2 ring-blue-500 bg-blue-50 dark:bg-blue-950' : ''
                    }`}
                    onClick={() => onVoiceSelect(voice.id)}
                  >
                    {/* Voice Header */}
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <Avatar className="w-12 h-12">
                          <AvatarImage src={voice.avatar} />
                          <AvatarFallback className="bg-gradient-to-br from-blue-400 to-purple-400 text-white font-semibold">
                            {voice.name.substring(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <h3 className="font-semibold text-foreground">{voice.name}</h3>
                          <p className="text-sm text-muted-foreground">
                            {voice.gender} • {voice.language}
                          </p>
                        </div>
                      </div>

                      {voice.isPremium && (
                        <Badge variant="premium" className="text-xs">
                          <SparklesIcon className="w-3 h-3 mr-1" />
                          Premium
                        </Badge>
                      )}
                    </div>

                    {/* Voice Controls */}
                    <div className="flex items-center justify-between">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (isPlaying) {
                            handleStopVoice();
                          } else {
                            handlePlayVoice(voice);
                          }
                        }}
                        className="flex items-center space-x-2"
                      >
                        {isPlaying ? (
                          <>
                            <PauseIcon className="w-4 h-4" />
                            <span className="text-sm">Stop</span>
                          </>
                        ) : (
                          <>
                            <PlayIcon className="w-4 h-4" />
                            <span className="text-sm">Preview</span>
                          </>
                        )}
                      </Button>

                      {isSelected && (
                        <div className="flex items-center space-x-2 text-green-600">
                          <CheckCircleIcon className="w-5 h-5" />
                          <span className="text-sm font-medium">Selected</span>
                        </div>
                      )}
                    </div>

                    {/* Playing Indicator */}
                    {isPlaying && (
                      <motion.div
                        className="mt-2 flex items-center space-x-2 text-blue-600"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                      >
                        <SpeakerWaveIcon className="w-4 h-4" />
                        <div className="flex items-center space-x-1">
                          {[0, 1, 2].map((i) => (
                            <motion.div
                              key={i}
                              className="w-1 bg-blue-600 rounded-full"
                              animate={{
                                height: [4, 12, 4],
                              }}
                              transition={{
                                duration: 1,
                                repeat: Infinity,
                                delay: i * 0.2,
                              }}
                            />
                          ))}
                        </div>
                        <span className="text-sm">Playing sample...</span>
                      </motion.div>
                    )}
                  </Card>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>

        {/* No Results */}
        {filteredVoices.length === 0 && (
          <div className="text-center py-12">
            <div className="text-muted-foreground">
              <SpeakerWaveIcon className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium">No voices found</p>
              <p className="text-sm">Try adjusting your search or filters</p>
            </div>
          </div>
        )}
      </Card>

      {/* Selection Summary */}
      {selectedVoice && (
        <Card className="p-4 bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <CheckCircleIcon className="w-6 h-6 text-green-600" />
              <div>
                <h3 className="font-semibold text-green-800 dark:text-green-200">
                  Voice Selected Successfully!
                </h3>
                <p className="text-sm text-green-600 dark:text-green-400">
                  Your audio will be transformed to sound like{' '}
                  {voices.find(v => v.id === selectedVoice)?.name}
                </p>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Tips */}
      <Card className="p-4 bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800">
        <h3 className="font-medium text-blue-800 dark:text-blue-200 mb-2">
          💡 Voice Selection Tips
        </h3>
        <div className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
          <div>• Preview each voice to find the perfect match</div>
          <div>• Consider gender and age for natural results</div>
          <div>• Premium voices often have higher quality</div>
          <div>• Match the language of your original audio when possible</div>
        </div>
      </Card>
    </div>
  );
};

export default VoiceSelectionStep;