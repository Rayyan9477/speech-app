import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui/button';
import { Card } from '../../components/ui/card';
import { Progress } from '../../components/ui/progress';
import { Avatar, AvatarFallback, AvatarImage } from '../../components/ui/avatar';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../components/ui/dialog';
import { useTheme } from '../../lib/theme-provider';
import {
  ArrowLeftIcon,
  CloudArrowUpIcon,
  PlayIcon,
  PauseIcon,
  StopIcon,
  CheckIcon,
  SparklesIcon,
  DocumentArrowDownIcon,
  ShareIcon
} from '@heroicons/react/24/outline';

type WorkflowStep = 'upload' | 'uploading' | 'ready' | 'playing' | 'selectVoice' | 'processing' | 'completed';

interface Voice {
  id: string;
  name: string;
  gender: string;
  language: string;
  avatar: string;
  isPremium: boolean;
}

const VoiceChangerWorkflow = () => {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const [currentStep, setCurrentStep] = useState<WorkflowStep>('upload');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [processingProgress, setProcessingProgress] = useState(0);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedVoice, setSelectedVoice] = useState<Voice | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showVoiceSelector, setShowVoiceSelector] = useState(false);
  const [duration, setDuration] = useState('2:34');

  const voices: Voice[] = [
    {
      id: '1',
      name: 'Olivia',
      gender: 'F',
      language: 'English',
      avatar: '/api/placeholder/48/48',
      isPremium: false
    },
    {
      id: '2',
      name: 'Marcus',
      gender: 'M',
      language: 'English',
      avatar: '/api/placeholder/48/48',
      isPremium: true
    },
    {
      id: '3',
      name: 'Luna',
      gender: 'F',
      language: 'Spanish',
      avatar: '/api/placeholder/48/48',
      isPremium: false
    }
  ];

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setCurrentStep('uploading');
      
      // Simulate upload progress
      let progress = 0;
      const interval = setInterval(() => {
        progress += 10;
        setUploadProgress(progress);
        
        if (progress >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            setCurrentStep('ready');
          }, 500);
        }
      }, 200);
    }
  };

  const playAudio = () => {
    setIsPlaying(true);
    setCurrentStep('playing');
    
    // Simulate audio duration
    setTimeout(() => {
      setIsPlaying(false);
      setCurrentStep('ready');
    }, 3000);
  };

  const selectVoice = (voice: Voice) => {
    setSelectedVoice(voice);
    setShowVoiceSelector(false);
    setCurrentStep('processing');
    
    // Simulate processing
    let progress = 0;
    const interval = setInterval(() => {
      progress += 5;
      setProcessingProgress(progress);
      
      if (progress >= 100) {
        clearInterval(interval);
        setTimeout(() => {
          setCurrentStep('completed');
        }, 500);
      }
    }, 150);
  };

  const getStepTitle = () => {
    switch (currentStep) {
      case 'upload':
        return 'AI Voice Changer - Upload Audio File';
      case 'uploading':
        return 'AI Voice Changer - Uploading Audio File';
      case 'ready':
        return 'AI Voice Changer - Audio File is Ready';
      case 'playing':
        return 'AI Voice Changer - Play Audio File';
      case 'selectVoice':
        return 'AI Voice Changer - Select AI Voices';
      case 'processing':
        return 'AI Voice Changer - Processing Audio Voice Changer';
      case 'completed':
        return 'AI Voice Changer - Voice Changing Completed';
      default:
        return 'AI Voice Changer';
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.5 } },
    exit: { opacity: 0, transition: { duration: 0.3 } }
  };

  return (
    <div className="min-h-screen pb-20">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
        className="py-6"
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-8 px-4">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate(-1)}
              className="p-2"
            >
              <ArrowLeftIcon className="w-5 h-5" />
            </Button>
            <h1 className="text-lg font-bold text-foreground truncate">
              {getStepTitle()}
            </h1>
          </div>
        </div>

        <div className="px-4 space-y-6">
          <AnimatePresence mode="wait">
            {/* Upload Step */}
            {currentStep === 'upload' && (
              <motion.div
                key="upload"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
              >
                <Card className="p-8 text-center border-dashed border-2 border-gray-300 dark:border-gray-600">
                  <div className="mb-6">
                    <CloudArrowUpIcon className="w-16 h-16 mx-auto text-blue-500 mb-4" />
                    <h2 className="text-xl font-semibold text-foreground mb-2">
                      Upload Audio File
                    </h2>
                    <p className="text-muted-foreground">
                      Select an audio file to transform with AI voice changing technology
                    </p>
                  </div>
                  <input
                    type="file"
                    accept="audio/*"
                    onChange={handleFileUpload}
                    className="hidden"
                    id="audio-upload"
                  />
                  <label htmlFor="audio-upload">
                    <Button
                      className="bg-blue-500 hover:bg-blue-600 text-white px-8 py-3 rounded-2xl cursor-pointer"
                      asChild
                    >
                      <span>Choose Audio File</span>
                    </Button>
                  </label>
                  <p className="text-xs text-muted-foreground mt-4">
                    Supports MP3, WAV, M4A files up to 10MB
                  </p>
                </Card>
              </motion.div>
            )}

            {/* Uploading Step */}
            {currentStep === 'uploading' && (
              <motion.div
                key="uploading"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
              >
                <Card className="p-8 text-center">
                  <div className="mb-6">
                    <div className="w-16 h-16 mx-auto mb-4 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                      <CloudArrowUpIcon className="w-8 h-8 text-blue-500" />
                    </div>
                    <h2 className="text-xl font-semibold text-foreground mb-2">
                      Uploading Audio File
                    </h2>
                    <p className="text-muted-foreground mb-6">
                      Please wait while we upload your audio file...
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Progress value={uploadProgress} className="w-full" />
                    <p className="text-sm text-muted-foreground">{uploadProgress}% complete</p>
                  </div>
                </Card>
              </motion.div>
            )}

            {/* Ready Step */}
            {(currentStep === 'ready' || currentStep === 'playing') && (
              <motion.div
                key="ready"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
              >
                <Card className="p-6">
                  <div className="text-center mb-6">
                    <div className="w-16 h-16 mx-auto mb-4 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                      <CheckIcon className="w-8 h-8 text-green-500" />
                    </div>
                    <h2 className="text-xl font-semibold text-foreground mb-2">
                      Audio File is Ready
                    </h2>
                    <p className="text-muted-foreground">
                      Your audio file has been uploaded successfully
                    </p>
                  </div>

                  {/* Audio Player */}
                  <div className="bg-gray-50 dark:bg-gray-800/50 rounded-2xl p-6 mb-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center">
                          <span className="text-white text-sm font-bold">🎵</span>
                        </div>
                        <div>
                          <h3 className="font-semibold text-foreground">
                            {selectedFile?.name || 'Audio File'}
                          </h3>
                          <p className="text-sm text-muted-foreground">{duration}</p>
                        </div>
                      </div>
                    </div>

                    {/* Waveform visualization placeholder */}
                    <div className="flex items-center justify-center space-x-1 mb-4 h-16">
                      {Array.from({ length: 40 }, (_, i) => (
                        <div
                          key={i}
                          className={`w-1 bg-blue-500 rounded-full transition-all duration-100 ${
                            isPlaying ? 'animate-pulse' : ''
                          }`}
                          style={{
                            height: `${Math.random() * 40 + 10}px`,
                            opacity: isPlaying && i < 20 ? 1 : 0.3
                          }}
                        />
                      ))}
                    </div>

                    <div className="flex items-center justify-center space-x-4">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="p-3 rounded-full"
                      >
                        <StopIcon className="w-5 h-5 text-muted-foreground" />
                      </Button>
                      <Button
                        onClick={playAudio}
                        disabled={isPlaying}
                        className="bg-blue-500 hover:bg-blue-600 text-white p-4 rounded-full"
                      >
                        {isPlaying ? (
                          <PauseIcon className="w-6 h-6" />
                        ) : (
                          <PlayIcon className="w-6 h-6" />
                        )}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="p-3 rounded-full"
                      >
                        <span className="text-muted-foreground">1x</span>
                      </Button>
                    </div>
                  </div>

                  <Button
                    onClick={() => setShowVoiceSelector(true)}
                    className="w-full bg-blue-500 hover:bg-blue-600 text-white py-3 rounded-2xl"
                    disabled={isPlaying}
                  >
                    Select AI Voice
                  </Button>
                </Card>
              </motion.div>
            )}

            {/* Processing Step */}
            {currentStep === 'processing' && (
              <motion.div
                key="processing"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
              >
                <Card className="p-8 text-center">
                  <div className="mb-6">
                    <div className="w-16 h-16 mx-auto mb-4 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center animate-spin">
                      <SparklesIcon className="w-8 h-8 text-purple-500" />
                    </div>
                    <h2 className="text-xl font-semibold text-foreground mb-2">
                      Processing Audio Voice Changer
                    </h2>
                    <p className="text-muted-foreground mb-6">
                      Our AI is transforming your voice with {selectedVoice?.name}'s characteristics...
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Progress value={processingProgress} className="w-full" />
                    <p className="text-sm text-muted-foreground">{processingProgress}% complete</p>
                  </div>
                </Card>
              </motion.div>
            )}

            {/* Completed Step */}
            {currentStep === 'completed' && (
              <motion.div
                key="completed"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
              >
                <Card className="p-6">
                  <div className="text-center mb-6">
                    <div className="w-16 h-16 mx-auto mb-4 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                      <CheckIcon className="w-8 h-8 text-green-500" />
                    </div>
                    <h2 className="text-xl font-semibold text-foreground mb-2">
                      Voice Changing Completed!
                    </h2>
                    <p className="text-muted-foreground">
                      Your audio has been successfully transformed with {selectedVoice?.name}'s voice
                    </p>
                  </div>

                  {/* Transformed Audio Player */}
                  <div className="bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 rounded-2xl p-6 mb-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <Avatar className="w-12 h-12">
                          <AvatarImage src={selectedVoice?.avatar} />
                          <AvatarFallback>{selectedVoice?.name[0]}</AvatarFallback>
                        </Avatar>
                        <div>
                          <h3 className="font-semibold text-foreground">
                            Transformed with {selectedVoice?.name}
                          </h3>
                          <p className="text-sm text-muted-foreground">{duration}</p>
                        </div>
                      </div>
                      <SparklesIcon className="w-6 h-6 text-yellow-500" />
                    </div>

                    <div className="flex items-center justify-center space-x-1 mb-4 h-16">
                      {Array.from({ length: 40 }, (_, i) => (
                        <div
                          key={i}
                          className="w-1 bg-gradient-to-t from-green-500 to-blue-500 rounded-full"
                          style={{ height: `${Math.random() * 40 + 10}px` }}
                        />
                      ))}
                    </div>

                    <div className="flex items-center justify-center space-x-4">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="p-3 rounded-full"
                      >
                        <StopIcon className="w-5 h-5 text-muted-foreground" />
                      </Button>
                      <Button
                        className="bg-blue-500 hover:bg-blue-600 text-white p-4 rounded-full"
                      >
                        <PlayIcon className="w-6 h-6" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="p-3 rounded-full"
                      >
                        <span className="text-muted-foreground">1x</span>
                      </Button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <Button
                      variant="outline"
                      className="py-3 flex items-center justify-center space-x-2"
                    >
                      <ShareIcon className="w-5 h-5" />
                      <span>Share</span>
                    </Button>
                    <Button
                      className="bg-blue-500 hover:bg-blue-600 text-white py-3 flex items-center justify-center space-x-2"
                    >
                      <DocumentArrowDownIcon className="w-5 h-5" />
                      <span>Download</span>
                    </Button>
                  </div>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>

      {/* Voice Selector Modal */}
      <Dialog open={showVoiceSelector} onOpenChange={setShowVoiceSelector}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Select AI Voice</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-4">
            {voices.map((voice) => (
              <Card
                key={voice.id}
                className="p-4 cursor-pointer hover:shadow-md transition-all"
                onClick={() => selectVoice(voice)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Avatar className="w-12 h-12">
                      <AvatarImage src={voice.avatar} />
                      <AvatarFallback>{voice.name[0]}</AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-medium">{voice.name} ({voice.gender})</div>
                      <div className="text-sm text-muted-foreground">{voice.language}</div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button variant="ghost" size="sm" className="p-2">
                      <PlayIcon className="w-4 h-4 text-blue-500" />
                    </Button>
                    <Button 
                      size="sm" 
                      className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded-full text-xs"
                    >
                      Select
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default VoiceChangerWorkflow;