import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card } from '../../ui/card';
import { Button } from '../../ui/button';
import { Badge } from '../../ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '../../ui/avatar';
import { useVoiceTranslation, TranslationVoice, Language, AudioFile } from '../../../contexts/VoiceTranslationContext';
import WaveformAudioPlayer from '../../tts/WaveformAudioPlayer';
import {
  PlayIcon,
  PauseIcon,
  CheckCircleIcon,
  SparklesIcon,
  SpeakerWaveIcon,
  LanguageIcon,
  MicrophoneIcon
} from '@heroicons/react/24/outline';

interface TranslationVoiceSelectionStepProps {
  voices: TranslationVoice[];
  selectedVoice?: TranslationVoice;
  onVoiceSelect: (voice: TranslationVoice) => void;
  targetLanguage?: Language;
  sourceAudio?: AudioFile;
}

interface AudioManager {
  currentAudio: HTMLAudioElement | null;
  playingVoiceId: string | null;
}

const TranslationVoiceSelectionStep: React.FC<TranslationVoiceSelectionStepProps> = ({
  voices,
  selectedVoice,
  onVoiceSelect,
  targetLanguage,
  sourceAudio
}) => {
  const { selectVoice } = useVoiceTranslation();
  const [audioManager, setAudioManager] = useState<AudioManager>({
    currentAudio: null,
    playingVoiceId: null
  });

  const handleVoiceSelect = (voice: TranslationVoice) => {
    selectVoice(voice);
  };

  const handlePlayVoice = async (voice: TranslationVoice) => {
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
      {/* Source Audio and Target Language Info */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Source Audio */}
        {sourceAudio && (
          <Card className="p-6">
            <h3 className="font-semibold text-foreground mb-4 flex items-center space-x-2">
              <MicrophoneIcon className="w-5 h-5" />
              <span>Source Audio</span>
            </h3>
            <WaveformAudioPlayer
              audioUrl={sourceAudio.url}
              waveformData={sourceAudio.waveformData}
              showControls={true}
              showWaveform={true}
              title="Original audio"
              className="bg-muted/20"
            />
          </Card>
        )}

        {/* Target Language */}
        {targetLanguage && (
          <Card className="p-6">
            <h3 className="font-semibold text-foreground mb-4 flex items-center space-x-2">
              <LanguageIcon className="w-5 h-5" />
              <span>Target Language</span>
            </h3>
            <div className="flex items-center space-x-4 p-4 bg-blue-50 dark:bg-blue-950 rounded-lg">
              <div className="text-3xl">{targetLanguage.flag}</div>
              <div>
                <h4 className="font-semibold text-foreground">{targetLanguage.name}</h4>
                <p className="text-sm text-muted-foreground">{targetLanguage.nativeName}</p>
              </div>
            </div>
          </Card>
        )}
      </div>

      {/* Voice Selection */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-semibold text-foreground flex items-center space-x-2">
              <SpeakerWaveIcon className="w-6 h-6" />
              <span>Select AI Voices</span>
            </h2>
            <p className="text-muted-foreground">
              Choose the voice for your translated audio
            </p>
          </div>
          
          {selectedVoice && (
            <Badge variant="default" className="bg-green-500 text-white">
              Voice Selected
            </Badge>
          )}
        </div>

        {/* Available Voices */}
        <div className="space-y-4">
          {voices.length === 0 ? (
            <div className="text-center py-8">
              <SpeakerWaveIcon className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">No voices available</h3>
              <p className="text-muted-foreground">
                Please select a target language first
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <AnimatePresence>
                {voices.map((voice) => {
                  const isSelected = selectedVoice?.id === voice.id;
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
                        onClick={() => handleVoiceSelect(voice)}
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
                            <Badge variant="secondary" className="text-xs">
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
          )}
        </div>
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
                  Your translated audio will use {selectedVoice.name}&apos;s voice
                </p>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Translation Preview */}
      <Card className="p-4 bg-purple-50 dark:bg-purple-950 border-purple-200 dark:border-purple-800">
        <h3 className="font-medium text-purple-800 dark:text-purple-200 mb-2">
          🎯 Translation Preview
        </h3>
        <div className="text-sm text-purple-700 dark:text-purple-300 space-y-1">
          {sourceAudio && targetLanguage && selectedVoice && (
            <>
              <div>• Source: {sourceAudio.name} (Original language)</div>
              <div>• Target: {targetLanguage.name} with {selectedVoice.name} voice</div>
              <div>• The AI will preserve your speaking style and emotion</div>
              <div>• Translation accuracy: 95%+ for supported languages</div>
            </>
          )}
        </div>
      </Card>
    </div>
  );
};

export default TranslationVoiceSelectionStep;