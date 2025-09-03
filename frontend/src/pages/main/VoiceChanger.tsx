import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '../../components/ui/button';
import { Card } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { useTheme } from '../../lib/theme-provider';
import {
  MicrophoneIcon,
  StopIcon,
  PlayIcon,
  PauseIcon,
  SparklesIcon,
  AdjustmentsHorizontalIcon,
  WaveformIcon,
  SpeakerWaveIcon
} from '@heroicons/react/24/outline';
import {
  MicrophoneIcon as MicrophoneIconSolid,
  StopIcon as StopIconSolid,
  PlayIcon as PlayIconSolid,
  PauseIcon as PauseIconSolid
} from '@heroicons/react/24/solid';

const VoiceChanger = () => {
  const { theme } = useTheme();
  const [isRecording, setIsRecording] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [selectedEffect, setSelectedEffect] = useState('robot');
  const [recordingTime, setRecordingTime] = useState(0);

  const voiceEffects = [
    {
      id: 'robot',
      name: 'Robot',
      description: 'Sci-fi robotic voice',
      icon: '🤖',
      preview: '/audio/robot-preview.mp3'
    },
    {
      id: 'chipmunk',
      name: 'Chipmunk',
      description: 'High-pitched and fast',
      icon: '🐿️',
      preview: '/audio/chipmunk-preview.mp3'
    },
    {
      id: 'deep',
      name: 'Deep Voice',
      description: 'Low and powerful',
      icon: '🗣️',
      preview: '/audio/deep-preview.mp3'
    },
    {
      id: 'alien',
      name: 'Alien',
      description: 'Otherworldly tone',
      icon: '👽',
      preview: '/audio/alien-preview.mp3'
    },
    {
      id: 'echo',
      name: 'Echo',
      description: 'Cave-like reverb',
      icon: '🗣️',
      preview: '/audio/echo-preview.mp3'
    },
    {
      id: 'helium',
      name: 'Helium',
      description: 'Very high pitch',
      icon: '🎈',
      preview: '/audio/helium-preview.mp3'
    }
  ];

  const handleRecord = () => {
    if (isRecording) {
      setIsRecording(false);
      setRecordingTime(0);
    } else {
      setIsRecording(true);
      // Start recording timer
      const interval = setInterval(() => {
        setRecordingTime(prev => {
          if (prev >= 30) { // Max 30 seconds
            clearInterval(interval);
            setIsRecording(false);
            return 30;
          }
          return prev + 1;
        });
      }, 1000);
    }
  };

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

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
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
            <h1 className="text-2xl font-bold text-foreground">Voice Changer</h1>
            <p className="text-muted-foreground mt-1">Transform your voice in real-time</p>
          </div>
          <Badge variant="outline" className="rounded-full">
            <SparklesIcon className="w-4 h-4 mr-1" />
            Live Mode
          </Badge>
        </motion.div>

        {/* Recording Interface */}
        <motion.div variants={itemVariants}>
          <Card className="p-8">
            <div className="text-center space-y-6">
              {/* Recording Animation */}
              <div className="relative">
                <div className={`w-32 h-32 mx-auto rounded-full flex items-center justify-center transition-all duration-300 ${
                  isRecording
                    ? 'bg-red-500 animate-pulse shadow-lg shadow-red-500/50'
                    : theme === 'dark'
                    ? 'bg-slate-700 hover:bg-slate-600'
                    : 'bg-slate-100 hover:bg-slate-200'
                }`}>
                  <MicrophoneIconSolid className={`w-16 h-16 transition-colors ${
                    isRecording ? 'text-white' : 'text-muted-foreground'
                  }`} />
                </div>

                {/* Recording indicator */}
                {isRecording && (
                  <motion.div
                    className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center"
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 1, repeat: Infinity }}
                  >
                    <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                  </motion.div>
                )}
              </div>

              {/* Recording Timer */}
              {isRecording && (
                <div className="text-2xl font-mono font-bold text-red-500">
                  {formatTime(recordingTime)}
                </div>
              )}

              {/* Recording Status */}
              <div className="text-center">
                <p className={`text-lg font-medium ${
                  isRecording ? 'text-red-500' : 'text-muted-foreground'
                }`}>
                  {isRecording ? 'Recording...' : 'Tap to start recording'}
                </p>
                {isRecording && (
                  <p className="text-sm text-muted-foreground mt-1">
                    Max duration: 30 seconds
                  </p>
                )}
              </div>

              {/* Recording Button */}
              <Button
                onClick={handleRecord}
                size="lg"
                className={`w-20 h-20 rounded-full transition-all duration-300 ${
                  isRecording
                    ? 'bg-red-500 hover:bg-red-600 shadow-lg shadow-red-500/50'
                    : 'bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 shadow-lg'
                }`}
              >
                {isRecording ? (
                  <StopIconSolid className="w-8 h-8 text-white" />
                ) : (
                  <MicrophoneIconSolid className="w-8 h-8 text-white" />
                )}
              </Button>
            </div>
          </Card>
        </motion.div>

        {/* Voice Effects */}
        <motion.div variants={itemVariants}>
          <h2 className="text-lg font-semibold text-foreground mb-4">Choose Effect</h2>
          <div className="grid grid-cols-2 gap-4">
            {voiceEffects.map((effect) => (
              <Card
                key={effect.id}
                className={`p-4 cursor-pointer transition-all ${
                  selectedEffect === effect.id
                    ? 'ring-2 ring-primary bg-primary/5'
                    : 'hover:shadow-md'
                }`}
                onClick={() => setSelectedEffect(effect.id)}
              >
                <div className="text-center space-y-2">
                  <div className="text-3xl">{effect.icon}</div>
                  <h3 className="font-medium text-foreground">{effect.name}</h3>
                  <p className="text-xs text-muted-foreground">{effect.description}</p>
                  {selectedEffect === effect.id && (
                    <div className="w-2 h-2 bg-primary rounded-full mx-auto" />
                  )}
                </div>
              </Card>
            ))}
          </div>
        </motion.div>

        {/* Playback Controls */}
        <motion.div variants={itemVariants}>
          <Card className="p-6">
            <div className="space-y-4">
              {/* Playback Controls */}
              <div className="flex items-center justify-center space-x-6">
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
                  className={`w-16 h-16 rounded-full transition-all ${
                    isPlaying
                      ? 'bg-green-500 hover:bg-green-600'
                      : 'bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600'
                  } text-white shadow-lg`}
                  disabled={!recordingTime}
                >
                  {isPlaying && !isPaused ? (
                    <PauseIconSolid className="w-8 h-8" />
                  ) : (
                    <PlayIconSolid className="w-8 h-8" />
                  )}
                </Button>

                <Button
                  variant="outline"
                  size="lg"
                  className="px-6 rounded-full"
                  disabled={!recordingTime}
                >
                  <SpeakerWaveIcon className="w-5 h-5 mr-2" />
                  Apply Effect
                </Button>
              </div>

              {/* Progress Bar */}
              {(isPlaying || isPaused) && (
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-muted-foreground">00:00</span>
                    <span className="text-sm text-muted-foreground">{formatTime(recordingTime)}</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div className="bg-primary h-2 rounded-full w-1/3"></div>
                  </div>
                </div>
              )}

              {/* Waveform Visualization */}
              <div className="bg-muted/50 rounded-lg p-4">
                <div className="flex items-end justify-center space-x-1 h-16">
                  {[...Array(20)].map((_, i) => (
                    <motion.div
                      key={i}
                      className={`w-1 rounded-full ${
                        isRecording || isPlaying ? 'bg-primary' : 'bg-muted-foreground/30'
                      }`}
                      animate={{
                        height: isRecording || isPlaying
                          ? Math.random() * 60 + 10
                          : 4
                      }}
                      transition={{
                        duration: 0.1,
                        repeat: isRecording || isPlaying ? Infinity : 0,
                        repeatType: "reverse"
                      }}
                    />
                  ))}
                </div>
                <p className="text-xs text-center text-muted-foreground mt-2">
                  {isRecording ? 'Recording...' : isPlaying ? 'Playing...' : 'Audio waveform'}
                </p>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Tips */}
        <motion.div variants={itemVariants}>
          <Card className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950 dark:to-purple-950">
            <div className="flex items-start space-x-3">
              <SparklesIcon className="w-5 h-5 text-blue-600 mt-0.5" />
              <div>
                <h3 className="font-medium text-foreground mb-1">Pro Tips</h3>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Speak clearly and at a consistent distance from the microphone</li>
                  <li>• Try different effects to find your favorite transformation</li>
                  <li>• Use headphones to avoid audio feedback</li>
                </ul>
              </div>
            </div>
          </Card>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default VoiceChanger;
