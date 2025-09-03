import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Button } from '../../components/ui/button';
import { Card } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Progress } from '../../components/ui/progress';
import { useTheme } from '../../lib/theme-provider';
import {
  MicrophoneIcon,
  StopIcon,
  PlayIcon,
  PauseIcon,
  CloudArrowUpIcon,
  SparklesIcon,
  ClockIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';
import {
  MicrophoneIcon as MicrophoneIconSolid,
  PlayIcon as PlayIconSolid,
  PauseIcon as PauseIconSolid,
  StopIcon as StopIconSolid
} from '@heroicons/react/24/solid';

const VoiceCloning = () => {
  const { theme } = useTheme();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [step, setStep] = useState(1);
  const [isRecording, setIsRecording] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [cloneName, setCloneName] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingProgress, setProcessingProgress] = useState(0);

  const steps = [
    { id: 1, title: 'Record Samples', description: 'Record or upload voice samples' },
    { id: 2, title: 'Configure Voice', description: 'Set voice characteristics' },
    { id: 3, title: 'Process & Train', description: 'AI training in progress' },
    { id: 4, title: 'Test & Save', description: 'Test your new voice clone' }
  ];

  const sampleTexts = [
    "Hello, my name is Alex and I'm excited to meet you.",
    "The weather today is beautiful and sunny outside.",
    "I love reading books and learning new things every day.",
    "Technology is changing the world in amazing ways.",
    "Music has the power to bring people together."
  ];

  const handleRecord = () => {
    if (isRecording) {
      setIsRecording(false);
      setRecordingTime(0);
    } else {
      setIsRecording(true);
      const interval = setInterval(() => {
        setRecordingTime(prev => {
          if (prev >= 30) {
            clearInterval(interval);
            setIsRecording(false);
            return 30;
          }
          return prev + 1;
        });
      }, 1000);
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    setUploadedFiles(prev => [...prev, ...files]);
  };

  const handleNextStep = () => {
    if (step < 4) {
      setStep(step + 1);
      if (step === 2) {
        handleStartProcessing();
      }
    }
  };

  const handleStartProcessing = () => {
    setIsProcessing(true);
    setProcessingProgress(0);

    const interval = setInterval(() => {
      setProcessingProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsProcessing(false);
          setStep(4);
          return 100;
        }
        return prev + Math.random() * 15;
      });
    }, 500);
  };

  const handlePlay = () => {
    if (isPlaying) {
      setIsPlaying(false);
    } else {
      setIsPlaying(true);
    }
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
            <h1 className="text-2xl font-bold text-foreground">Voice Cloning</h1>
            <p className="text-muted-foreground mt-1">Create your own AI voice clone</p>
          </div>
          <Badge variant="premium" className="rounded-full">
            <SparklesIcon className="w-4 h-4 mr-1" />
            Premium Feature
          </Badge>
        </motion.div>

        {/* Progress Steps */}
        <motion.div variants={itemVariants}>
          <Card className="p-4">
            <div className="flex items-center justify-between mb-4">
              {steps.map((stepItem, index) => (
                <div key={stepItem.id} className="flex items-center flex-1">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    stepItem.id <= step
                      ? 'bg-primary text-primary-foreground'
                      : theme === 'dark'
                      ? 'bg-slate-700 text-slate-400'
                      : 'bg-slate-200 text-slate-500'
                  }`}>
                    {stepItem.id < step ? (
                      <CheckCircleIcon className="w-4 h-4" />
                    ) : (
                      stepItem.id
                    )}
                  </div>
                  {index < steps.length - 1 && (
                    <div className={`flex-1 h-0.5 mx-2 ${
                      stepItem.id < step ? 'bg-primary' : 'bg-border'
                    }`} />
                  )}
                </div>
              ))}
            </div>
            <div className="text-center">
              <h3 className="font-medium text-foreground">{steps[step - 1].title}</h3>
              <p className="text-sm text-muted-foreground">{steps[step - 1].description}</p>
            </div>
          </Card>
        </motion.div>

        {/* Step Content */}
        {step === 1 && (
          <motion.div variants={itemVariants} className="space-y-6">
            {/* Recording Instructions */}
            <Card className="p-6">
              <div className="text-center space-y-4">
                <div className="w-20 h-20 mx-auto rounded-2xl bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center">
                  <MicrophoneIconSolid className="w-10 h-10 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-foreground">Record Voice Samples</h3>
                  <p className="text-muted-foreground">
                    Record 5-10 minutes of clear speech for best results
                  </p>
                </div>
              </div>
            </Card>

            {/* Sample Texts */}
            <Card className="p-4">
              <h3 className="font-medium text-foreground mb-4">Sample Texts to Read</h3>
              <div className="space-y-3">
                {sampleTexts.map((text, index) => (
                  <div key={index} className="p-3 bg-muted/50 rounded-lg">
                    <p className="text-sm text-foreground">{text}</p>
                  </div>
                ))}
              </div>
            </Card>

            {/* Recording Controls */}
            <Card className="p-6">
              <div className="text-center space-y-6">
                <div className="relative">
                  <div className={`w-32 h-32 mx-auto rounded-full flex items-center justify-center transition-all duration-300 ${
                    isRecording
                      ? 'bg-red-500 animate-pulse shadow-lg shadow-red-500/50'
                      : 'bg-gradient-to-r from-purple-500 to-pink-500'
                  }`}>
                    <MicrophoneIconSolid className={`w-16 h-16 transition-colors ${
                      isRecording ? 'text-white' : 'text-white'
                    }`} />
                  </div>
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

                {isRecording && (
                  <div className="text-2xl font-mono font-bold text-red-500">
                    {recordingTime}s
                  </div>
                )}

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

                <div className="flex items-center justify-center space-x-4">
                  <Button
                    onClick={handleNextStep}
                    disabled={recordingTime < 30}
                    className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white"
                  >
                    Continue
                  </Button>
                  <span className="text-muted-foreground">or</span>
                  <Button
                    onClick={() => fileInputRef.current?.click()}
                    variant="outline"
                  >
                    <CloudArrowUpIcon className="w-4 h-4 mr-2" />
                    Upload Files
                  </Button>
                </div>

                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept="audio/*"
                  onChange={handleFileUpload}
                  className="hidden"
                  aria-label="Upload audio files for voice cloning"
                  title="Select audio files (MP3, WAV, etc.) for voice cloning"
                />
              </div>
            </Card>

            {/* Uploaded Files */}
            {uploadedFiles.length > 0 && (
              <Card className="p-4">
                <h3 className="font-medium text-foreground mb-4">Uploaded Files</h3>
                <div className="space-y-2">
                  {uploadedFiles.map((file, index) => (
                    <div key={index} className="flex items-center justify-between p-2 bg-muted/50 rounded-lg">
                      <div className="flex items-center space-x-2">
                        <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                          <PlayIcon className="w-4 h-4 text-primary" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-foreground">{file.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {(file.size / 1024 / 1024).toFixed(1)} MB
                          </p>
                        </div>
                      </div>
                      <Button variant="ghost" size="sm">
                        <PlayIcon className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </Card>
            )}
          </motion.div>
        )}

        {step === 2 && (
          <motion.div variants={itemVariants} className="space-y-6">
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-foreground mb-4">Voice Configuration</h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Voice Clone Name
                  </label>
                  <input
                    type="text"
                    value={cloneName}
                    onChange={(e) => setCloneName(e.target.value)}
                    placeholder="Enter a name for your voice clone"
                    className={`w-full p-3 rounded-lg border focus:outline-none focus:ring-2 focus:ring-primary/20 transition-colors ${
                      theme === 'dark'
                        ? 'bg-slate-800 border-slate-700 text-white placeholder-slate-400'
                        : 'bg-white border-slate-200 text-slate-900 placeholder-slate-500'
                    }`}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Gender
                    </label>
                    <select
                      className={`w-full p-3 rounded-lg border focus:outline-none focus:ring-2 focus:ring-primary/20 transition-colors ${
                        theme === 'dark'
                          ? 'bg-slate-800 border-slate-700 text-white'
                          : 'bg-white border-slate-200 text-slate-900'
                      }`}
                      aria-label="Select gender for voice cloning"
                      title="Choose the gender of the voice to clone"
                    >
                      <option>Auto-detect</option>
                      <option>Male</option>
                      <option>Female</option>
                      <option>Neutral</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Age Range
                    </label>
                    <select
                      className={`w-full p-3 rounded-lg border focus:outline-none focus:ring-2 focus:ring-primary/20 transition-colors ${
                        theme === 'dark'
                          ? 'bg-slate-800 border-slate-700 text-white'
                          : 'bg-white border-slate-200 text-slate-900'
                      }`}
                      aria-label="Select age range for voice cloning"
                      title="Choose the age range of the voice to clone"
                    >
                      <option>Auto-detect</option>
                      <option>Child (5-12)</option>
                      <option>Teen (13-19)</option>
                      <option>Young Adult (20-35)</option>
                      <option>Adult (36-55)</option>
                      <option>Senior (56+)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Accent/Region
                  </label>
                  <select
                    className={`w-full p-3 rounded-lg border focus:outline-none focus:ring-2 focus:ring-primary/20 transition-colors ${
                      theme === 'dark'
                        ? 'bg-slate-800 border-slate-700 text-white'
                        : 'bg-white border-slate-200 text-slate-900'
                    }`}
                    aria-label="Select accent or region for voice cloning"
                    title="Choose the accent or regional variant for voice cloning"
                  >
                    <option>Auto-detect</option>
                    <option>American English</option>
                    <option>British English</option>
                    <option>Australian English</option>
                    <option>Canadian English</option>
                    <option>Other</option>
                  </select>
                </div>
              </div>

              <div className="mt-6 flex space-x-3">
                <Button onClick={handleNextStep} className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white">
                  Start Processing
                </Button>
                <Button onClick={() => setStep(1)} variant="outline" className="flex-1">
                  Back
                </Button>
              </div>
            </Card>
          </motion.div>
        )}

        {step === 3 && (
          <motion.div variants={itemVariants} className="space-y-6">
            <Card className="p-6">
              <div className="text-center space-y-6">
                <div className="relative">
                  <div className="w-32 h-32 mx-auto rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center">
                    <SparklesIcon className="w-16 h-16 text-white animate-pulse" />
                  </div>
                  <motion.div
                    className="absolute inset-0 rounded-full border-4 border-primary/20"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                  >
                    <div className="absolute top-0 left-1/2 w-2 h-2 bg-primary rounded-full transform -translate-x-1/2 -translate-y-1" />
                  </motion.div>
                </div>

                <div>
                  <h3 className="text-xl font-semibold text-foreground">AI Training in Progress</h3>
                  <p className="text-muted-foreground">
                    Our AI is analyzing your voice samples and creating your custom voice clone
                  </p>
                </div>

                <div className="space-y-4">
                  <Progress value={processingProgress} className="w-full" />
                  <p className="text-sm text-muted-foreground">
                    {Math.round(processingProgress)}% Complete
                  </p>
                </div>

                <div className="text-left space-y-2">
                  <div className="flex items-center space-x-2">
                    <CheckCircleIcon className="w-4 h-4 text-green-500" />
                    <span className="text-sm text-muted-foreground">Voice samples processed</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    {processingProgress > 25 ? (
                      <CheckCircleIcon className="w-4 h-4 text-green-500" />
                    ) : (
                      <div className="w-4 h-4 border-2 border-muted-foreground rounded-full" />
                    )}
                    <span className="text-sm text-muted-foreground">AI model training</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    {processingProgress > 50 ? (
                      <CheckCircleIcon className="w-4 h-4 text-green-500" />
                    ) : (
                      <div className="w-4 h-4 border-2 border-muted-foreground rounded-full" />
                    )}
                    <span className="text-sm text-muted-foreground">Voice synthesis optimization</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    {processingProgress > 75 ? (
                      <CheckCircleIcon className="w-4 h-4 text-green-500" />
                    ) : (
                      <div className="w-4 h-4 border-2 border-muted-foreground rounded-full" />
                    )}
                    <span className="text-sm text-muted-foreground">Quality validation</span>
                  </div>
                </div>

                <div className="bg-yellow-50 dark:bg-yellow-950 p-4 rounded-lg">
                  <div className="flex items-start space-x-2">
                    <ExclamationTriangleIcon className="w-5 h-5 text-yellow-600 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                        Processing Time
                      </p>
                      <p className="text-sm text-yellow-700 dark:text-yellow-300">
                        Voice cloning typically takes 10-15 minutes. You'll receive a notification when complete.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>
        )}

        {step === 4 && (
          <motion.div variants={itemVariants} className="space-y-6">
            <Card className="p-6">
              <div className="text-center space-y-6">
                <div className="w-20 h-20 mx-auto rounded-2xl bg-gradient-to-r from-green-500 to-emerald-500 flex items-center justify-center">
                  <CheckCircleIcon className="w-10 h-10 text-white" />
                </div>

                <div>
                  <h3 className="text-xl font-semibold text-foreground">Voice Clone Ready!</h3>
                  <p className="text-muted-foreground">
                    Your custom voice "{cloneName || 'My Voice'}" has been created successfully
                  </p>
                </div>

                <div className="bg-muted/50 p-4 rounded-lg">
                  <h4 className="font-medium text-foreground mb-2">Voice Details</h4>
                  <div className="text-sm text-muted-foreground space-y-1">
                    <p>Name: {cloneName || 'My Voice'}</p>
                    <p>Quality: High Definition</p>
                    <p>Processing Time: 12 minutes</p>
                    <p>Sample Rate: 44.1kHz</p>
                  </div>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="font-medium text-foreground mb-4">Test Your Voice</h3>

              <div className="space-y-4">
                <textarea
                  placeholder="Type something to test your new voice clone..."
                  className={`w-full h-20 p-3 rounded-lg border resize-none focus:outline-none focus:ring-2 focus:ring-primary/20 transition-colors ${
                    theme === 'dark'
                      ? 'bg-slate-800 border-slate-700 text-white placeholder-slate-400'
                      : 'bg-white border-slate-200 text-slate-900 placeholder-slate-500'
                  }`}
                />

                <div className="flex items-center justify-center space-x-6">
                  <Button onClick={handlePlay} size="lg" className="w-16 h-16 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white shadow-lg">
                    {isPlaying ? (
                      <PauseIconSolid className="w-8 h-8" />
                    ) : (
                      <PlayIconSolid className="w-8 h-8" />
                    )}
                  </Button>
                </div>

                {isPlaying && (
                  <div className="flex items-end justify-center space-x-1 h-12 bg-muted/50 rounded-lg p-2">
                    {[...Array(20)].map((_, i) => (
                      <motion.div
                        key={i}
                        className="w-1 bg-primary rounded-full"
                        animate={{
                          height: Math.random() * 32 + 8
                        }}
                        transition={{
                          duration: 0.2,
                          repeat: Infinity,
                          repeatType: "reverse"
                        }}
                      />
                    ))}
                  </div>
                )}
              </div>
            </Card>

            <div className="grid grid-cols-2 gap-4">
              <Button className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white">
                <PlayIcon className="w-4 h-4 mr-2" />
                Use Voice
              </Button>
              <Button variant="outline">
                <ArrowPathIcon className="w-4 h-4 mr-2" />
                Clone Another
              </Button>
            </div>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
};

export default VoiceCloning;
