import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Card } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { useTheme } from '../../lib/theme-provider';
import {
  PlayIcon,
  PauseIcon,
  StopIcon,
  SpeakerWaveIcon,
  AdjustmentsHorizontalIcon,
  DocumentTextIcon,
  MicrophoneIcon,
  ClockIcon,
  SparklesIcon
} from '@heroicons/react/24/outline';
import {
  PlayIcon as PlayIconSolid,
  PauseIcon as PauseIconSolid,
  StopIcon as StopIconSolid
} from '@heroicons/react/24/solid';

const TTS = () => {
  const { theme } = useTheme();
  const [text, setText] = useState('');
  const [selectedVoice, setSelectedVoice] = useState('Emma');
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [speed, setSpeed] = useState(1.0);
  const [pitch, setPitch] = useState(1.0);
  const [volume, setVolume] = useState(0.8);
  const [showAdvanced, setShowAdvanced] = useState(false);

  const voices = [
    { name: 'Emma', language: 'English', style: 'Natural', avatar: '👩', isPremium: false },
    { name: 'Marcus', language: 'English', style: 'Professional', avatar: '👨', isPremium: true },
    { name: 'Luna', language: 'Spanish', style: 'Friendly', avatar: '👩', isPremium: false },
    { name: 'Ahmed', language: 'Arabic', style: 'Clear', avatar: '👨', isPremium: true },
    { name: 'Sophie', language: 'French', style: 'Elegant', avatar: '👩', isPremium: false },
  ];

  const handlePlay = () => {
    if (isPlaying) {
      if (isPaused) {
        setIsPaused(false);
      } else {
        setIsPaused(true);
      }
    } else {
      setIsPlaying(true);
      setIsPaused(false);
    }
  };

  const handleStop = () => {
    setIsPlaying(false);
    setIsPaused(false);
  };

  const handleGenerate = () => {
    // Handle TTS generation logic
    console.log('Generating TTS with:', { text, selectedVoice, speed, pitch, volume });
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
            <h1 className="text-2xl font-bold text-foreground">Text to Speech</h1>
            <p className="text-muted-foreground mt-1">Convert your text into natural speech</p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="rounded-full"
          >
            <AdjustmentsHorizontalIcon className="w-4 h-4 mr-2" />
            Advanced
          </Button>
        </motion.div>

        {/* Text Input */}
        <motion.div variants={itemVariants}>
          <Card className="p-4">
            <div className="flex items-center space-x-2 mb-3">
              <DocumentTextIcon className="w-5 h-5 text-muted-foreground" />
              <span className="text-sm font-medium text-foreground">Enter your text</span>
            </div>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Type or paste your text here... The quick brown fox jumps over the lazy dog. This is a sample text to demonstrate the text-to-speech functionality."
              className={`w-full h-32 p-3 rounded-lg border resize-none focus:outline-none focus:ring-2 focus:ring-primary/20 transition-colors ${
                theme === 'dark'
                  ? 'bg-slate-800 border-slate-700 text-white placeholder-slate-400'
                  : 'bg-white border-slate-200 text-slate-900 placeholder-slate-500'
              }`}
            />
            <div className="flex items-center justify-between mt-3">
              <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                <span>{text.length} characters</span>
                <span>~{Math.ceil(text.length / 150)} min</span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="text-primary hover:text-primary/80"
              >
                <MicrophoneIcon className="w-4 h-4 mr-2" />
                Voice Input
              </Button>
            </div>
          </Card>
        </motion.div>

        {/* Voice Selection */}
        <motion.div variants={itemVariants}>
          <h2 className="text-lg font-semibold text-foreground mb-4">Choose Voice</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {voices.map((voice) => (
              <Card
                key={voice.name}
                className={`p-4 cursor-pointer transition-all ${
                  selectedVoice === voice.name
                    ? 'ring-2 ring-primary bg-primary/5'
                    : 'hover:shadow-md'
                }`}
                onClick={() => setSelectedVoice(voice.name)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="text-2xl">{voice.avatar}</div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <h3 className="font-medium text-foreground">{voice.name}</h3>
                        {voice.isPremium && (
                          <Badge variant="premium" className="text-xs">
                            <SparklesIcon className="w-3 h-3 mr-1" />
                            Premium
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center space-x-2 mt-1">
                        <span className="text-sm text-muted-foreground">{voice.language}</span>
                        <span className="text-sm text-muted-foreground">•</span>
                        <span className="text-sm text-muted-foreground">{voice.style}</span>
                      </div>
                    </div>
                  </div>
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                    selectedVoice === voice.name
                      ? 'border-primary bg-primary'
                      : 'border-muted-foreground'
                  }`}>
                    {selectedVoice === voice.name && (
                      <div className="w-2 h-2 bg-white rounded-full" />
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </motion.div>

        {/* Advanced Settings */}
        {showAdvanced && (
          <motion.div
            variants={itemVariants}
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
          >
            <Card className="p-4">
              <h3 className="font-medium text-foreground mb-4">Voice Settings</h3>
              <div className="space-y-4">
                {/* Speed */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-foreground">Speed</span>
                    <span className="text-sm text-muted-foreground">{speed}x</span>
                  </div>
                                      <input
                      type="range"
                      min="0.5"
                      max="2.0"
                      step="0.1"
                      value={speed}
                      onChange={(e) => setSpeed(parseFloat(e.target.value))}
                      className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer slider"
                      aria-label="Speech speed control"
                      title="Adjust speech speed from 0.5x to 2.0x"
                    />
                </div>

                {/* Pitch */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-foreground">Pitch</span>
                    <span className="text-sm text-muted-foreground">{pitch}x</span>
                  </div>
                                      <input
                      type="range"
                      min="0.5"
                      max="2.0"
                      step="0.1"
                      value={pitch}
                      onChange={(e) => setPitch(parseFloat(e.target.value))}
                      className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer slider"
                      aria-label="Speech pitch control"
                      title="Adjust speech pitch from 0.5x to 2.0x"
                    />
                </div>

                {/* Volume */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-foreground">Volume</span>
                    <span className="text-sm text-muted-foreground">{Math.round(volume * 100)}%</span>
                  </div>
                                      <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.1"
                      value={volume}
                      onChange={(e) => setVolume(parseFloat(e.target.value))}
                      className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer slider"
                      aria-label="Speech volume control"
                      title="Adjust speech volume from 0% to 100%"
                    />
                </div>
              </div>
            </Card>
          </motion.div>
        )}

        {/* Playback Controls */}
        <motion.div variants={itemVariants}>
          <Card className="p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-6">
              <Button
                onClick={handleStop}
                variant="outline"
                size="lg"
                className="w-14 h-14 rounded-full"
                disabled={!isPlaying && !isPaused}
              >
                <StopIcon className="w-6 h-6" />
              </Button>

              <Button
                onClick={handlePlay}
                size="lg"
                className="w-16 h-16 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white shadow-lg"
                disabled={!text.trim()}
              >
                {isPlaying && !isPaused ? (
                  <PauseIconSolid className="w-8 h-8" />
                ) : (
                  <PlayIconSolid className="w-8 h-8" />
                )}
              </Button>

              <Button
                onClick={handleGenerate}
                variant="outline"
                size="lg"
                className="px-6 rounded-full"
                disabled={!text.trim()}
              >
                <SpeakerWaveIcon className="w-5 h-5 mr-2" />
                Generate
              </Button>
            </div>

            {/* Progress Bar */}
            {(isPlaying || isPaused) && (
              <div className="mt-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-muted-foreground">00:00</span>
                  <span className="text-sm text-muted-foreground">02:34</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div className="bg-primary h-2 rounded-full w-1/3"></div>
                </div>
              </div>
            )}
          </Card>
        </motion.div>

        {/* Usage Info */}
        <motion.div variants={itemVariants}>
          <Card className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950 dark:to-purple-950">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <ClockIcon className="w-5 h-5 text-blue-600" />
                <div>
                  <p className="text-sm font-medium text-foreground">Daily Usage</p>
                  <p className="text-xs text-muted-foreground">Reset in 12 hours</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium text-foreground">2:34 / 10:00 min</p>
                <div className="w-20 bg-white/50 rounded-full h-1.5 mt-1">
                  <div className="bg-blue-600 h-1.5 rounded-full w-1/4"></div>
                </div>
              </div>
            </div>
          </Card>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default TTS;
