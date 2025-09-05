'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { 
  ArrowLeftIcon, 
  MicrophoneIcon,
  StopIcon,
  PlayIcon,
  PauseIcon,
  CloudArrowUpIcon,
  SparklesIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ArrowPathIcon,
  PlusIcon
} from '@heroicons/react/24/outline';

const existingVoices = [
  {
    id: 1,
    name: 'My Professional Voice',
    type: 'Custom Clone',
    quality: 'High Definition',
    createdAt: '2 days ago',
    status: 'ready',
    avatar: '🎭',
    color: '#6366f1'
  },
  {
    id: 2,
    name: 'Casual Me',
    type: 'Custom Clone',
    quality: 'Standard',
    createdAt: '1 week ago',
    status: 'ready',
    avatar: '🗣️',
    color: '#ec4899'
  },
  {
    id: 3,
    name: 'News Anchor Voice',
    type: 'Custom Clone',
    quality: 'High Definition',
    createdAt: '2 weeks ago',
    status: 'processing',
    avatar: '📺',
    color: '#10b981'
  }
];

export default function VoiceCloningPage() {
  const [showCreateNew, setShowCreateNew] = useState(false);
  const [step, setStep] = useState(1);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [cloneName, setCloneName] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingProgress, setProcessingProgress] = useState(0);
  
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const handleCreateNew = () => {
    setShowCreateNew(true);
    setStep(1);
  };

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

  const handleVoiceSelect = (voiceId: number) => {
    router.push(`/dashboard/voice-cloning/voice/${voiceId}`);
  };

  if (showCreateNew) {
    return (
      <div className="min-h-screen bg-white">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 z-10">
          <div className="flex items-center justify-between px-6 py-4">
            <div className="flex items-center space-x-3">
              <Button variant="ghost" size="icon" onClick={() => setShowCreateNew(false)}>
                <ArrowLeftIcon className="w-5 h-5" />
              </Button>
              <div>
                <h1 className="text-lg font-semibold text-gray-900">Create Voice Clone</h1>
                <p className="text-sm text-gray-500">Step {step} of {steps.length}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Progress Steps */}
        <div className="px-6 py-4">
          <Card className="p-4">
            <div className="flex items-center justify-between mb-4">
              {steps.map((stepItem, index) => (
                <div key={stepItem.id} className="flex items-center flex-1">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    stepItem.id <= step
                      ? 'bg-primary-500 text-white'
                      : 'bg-gray-200 text-gray-500'
                  }`}>
                    {stepItem.id < step ? (
                      <CheckCircleIcon className="w-4 h-4" />
                    ) : (
                      stepItem.id
                    )}
                  </div>
                  {index < steps.length - 1 && (
                    <div className={`flex-1 h-0.5 mx-2 ${
                      stepItem.id < step ? 'bg-primary-500' : 'bg-gray-300'
                    }`} />
                  )}
                </div>
              ))}
            </div>
            <div className="text-center">
              <h3 className="font-medium text-gray-900">{steps[step - 1].title}</h3>
              <p className="text-sm text-gray-600">{steps[step - 1].description}</p>
            </div>
          </Card>
        </div>

        <div className="px-6 pb-6">
          {/* Step 1: Record Samples */}
          {step === 1 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              {/* Recording Instructions */}
              <Card className="p-6">
                <div className="text-center space-y-4">
                  <div className="w-20 h-20 mx-auto rounded-2xl bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center">
                    <MicrophoneIcon className="w-10 h-10 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Record Voice Samples</h3>
                    <p className="text-gray-600">
                      Record 5-10 minutes of clear speech for best results
                    </p>
                  </div>
                </div>
              </Card>

              {/* Sample Texts */}
              <Card className="p-4">
                <h3 className="font-medium text-gray-900 mb-4">Sample Texts to Read</h3>
                <div className="space-y-3">
                  {sampleTexts.map((text, index) => (
                    <div key={index} className="p-3 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-700">{text}</p>
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
                      <MicrophoneIcon className="w-16 h-16 text-white" />
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
                      <StopIcon className="w-8 h-8 text-white" />
                    ) : (
                      <MicrophoneIcon className="w-8 h-8 text-white" />
                    )}
                  </Button>

                  <div className="flex items-center justify-center space-x-4">
                    <Button
                      onClick={handleNextStep}
                      disabled={recordingTime < 30 && uploadedFiles.length === 0}
                    >
                      Continue
                    </Button>
                    <span className="text-gray-500">or</span>
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
                  />
                </div>
              </Card>

              {/* Uploaded Files */}
              {uploadedFiles.length > 0 && (
                <Card className="p-4">
                  <h3 className="font-medium text-gray-900 mb-4">Uploaded Files</h3>
                  <div className="space-y-2">
                    {uploadedFiles.map((file, index) => (
                      <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                        <div className="flex items-center space-x-2">
                          <div className="w-8 h-8 bg-primary-100 rounded-lg flex items-center justify-center">
                            <PlayIcon className="w-4 h-4 text-primary-600" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-900">{file.name}</p>
                            <p className="text-xs text-gray-500">
                              {(file.size / 1024 / 1024).toFixed(1)} MB
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
              )}
            </motion.div>
          )}

          {/* Step 2: Configure Voice */}
          {step === 2 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <Card className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Voice Configuration</h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Voice Clone Name
                    </label>
                    <input
                      type="text"
                      value={cloneName}
                      onChange={(e) => setCloneName(e.target.value)}
                      placeholder="Enter a name for your voice clone"
                      className="w-full p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Gender
                      </label>
                      <select className="w-full p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-500 focus:border-transparent">
                        <option>Auto-detect</option>
                        <option>Male</option>
                        <option>Female</option>
                        <option>Neutral</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Age Range
                      </label>
                      <select className="w-full p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-500 focus:border-transparent">
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
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Accent/Region
                    </label>
                    <select className="w-full p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-500 focus:border-transparent">
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
                  <Button onClick={handleNextStep} className="flex-1">
                    Start Processing
                  </Button>
                  <Button onClick={() => setStep(1)} variant="outline" className="flex-1">
                    Back
                  </Button>
                </div>
              </Card>
            </motion.div>
          )}

          {/* Step 3: Processing */}
          {step === 3 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <Card className="p-6">
                <div className="text-center space-y-6">
                  <div className="relative">
                    <div className="w-32 h-32 mx-auto rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center">
                      <SparklesIcon className="w-16 h-16 text-white animate-pulse" />
                    </div>
                    <motion.div
                      className="absolute inset-0 rounded-full border-4 border-primary-500/20"
                      animate={{ rotate: 360 }}
                      transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                    >
                      <div className="absolute top-0 left-1/2 w-2 h-2 bg-primary-500 rounded-full transform -translate-x-1/2 -translate-y-1" />
                    </motion.div>
                  </div>

                  <div>
                    <h3 className="text-xl font-semibold text-gray-900">AI Training in Progress</h3>
                    <p className="text-gray-600">
                      Our AI is analyzing your voice samples and creating your custom voice clone
                    </p>
                  </div>

                  <div className="space-y-4">
                    <Progress value={processingProgress} className="w-full" />
                    <p className="text-sm text-gray-500">
                      {Math.round(processingProgress)}% Complete
                    </p>
                  </div>

                  <div className="bg-yellow-50 p-4 rounded-lg">
                    <div className="flex items-start space-x-2">
                      <ExclamationTriangleIcon className="w-5 h-5 text-yellow-600 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-yellow-800">Processing Time</p>
                        <p className="text-sm text-yellow-700">
                          Voice cloning typically takes 10-15 minutes. You'll receive a notification when complete.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            </motion.div>
          )}

          {/* Step 4: Complete */}
          {step === 4 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <Card className="p-6">
                <div className="text-center space-y-6">
                  <div className="w-20 h-20 mx-auto rounded-2xl bg-gradient-to-r from-green-500 to-emerald-500 flex items-center justify-center">
                    <CheckCircleIcon className="w-10 h-10 text-white" />
                  </div>

                  <div>
                    <h3 className="text-xl font-semibold text-gray-900">Voice Clone Ready!</h3>
                    <p className="text-gray-600">
                      Your custom voice "{cloneName || 'My Voice'}" has been created successfully
                    </p>
                  </div>
                </div>
              </Card>

              <div className="grid grid-cols-2 gap-4">
                <Button onClick={() => setShowCreateNew(false)}>
                  <PlayIcon className="w-4 h-4 mr-2" />
                  Use Voice
                </Button>
                <Button variant="outline" onClick={() => setStep(1)}>
                  <ArrowPathIcon className="w-4 h-4 mr-2" />
                  Clone Another
                </Button>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="sticky top-0 bg-white border-b border-gray-200 z-10">
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center space-x-3">
            <Button variant="ghost" size="icon" onClick={() => router.back()}>
              <ArrowLeftIcon className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-lg font-semibold text-gray-900">Voice Cloning</h1>
              <p className="text-sm text-gray-500">Create and manage custom AI voices</p>
            </div>
          </div>
          
          <Button onClick={handleCreateNew}>
            <PlusIcon className="w-4 h-4 mr-2" />
            Create New
          </Button>
        </div>
      </div>

      <div className="px-6 py-6 space-y-6">
        {/* Premium Feature Banner */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl p-6 text-white"
        >
          <div className="flex items-center space-x-3 mb-4">
            <SparklesIcon className="w-8 h-8" />
            <div>
              <h2 className="text-xl font-bold">Premium Voice Cloning</h2>
              <p className="text-purple-100">Create ultra-realistic AI voice clones</p>
            </div>
          </div>
          
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold">5min</div>
              <div className="text-sm text-purple-100">Min Recording</div>
            </div>
            <div>
              <div className="text-2xl font-bold">HD</div>
              <div className="text-sm text-purple-100">Quality</div>
            </div>
            <div>
              <div className="text-2xl font-bold">∞</div>
              <div className="text-sm text-purple-100">Uses</div>
            </div>
          </div>
        </motion.div>

        {/* My Voices */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">My Voices</h2>
            <span className="text-sm text-gray-500">{existingVoices.length} voices</span>
          </div>

          <div className="space-y-3">
            {existingVoices.map((voice, index) => (
              <motion.button
                key={voice.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                onClick={() => handleVoiceSelect(voice.id)}
                className="w-full bg-white rounded-xl border border-gray-200 p-4 text-left hover:border-primary-300 transition-colors"
              >
                <div className="flex items-center space-x-4">
                  {/* Avatar */}
                  <div 
                    className="w-12 h-12 rounded-full flex items-center justify-center text-white text-xl"
                    style={{ backgroundColor: voice.color }}
                  >
                    {voice.avatar}
                  </div>

                  {/* Voice Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 mb-1">
                      <h3 className="font-medium text-gray-900 truncate">{voice.name}</h3>
                      {voice.status === 'processing' && (
                        <span className="px-2 py-0.5 bg-yellow-100 text-yellow-800 text-xs rounded-full">
                          Processing
                        </span>
                      )}
                    </div>
                    
                    <div className="flex items-center space-x-2 text-sm text-gray-500">
                      <span>{voice.type}</span>
                      <span>•</span>
                      <span>{voice.quality}</span>
                      <span>•</span>
                      <span>{voice.createdAt}</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center space-x-2">
                    {voice.status === 'ready' ? (
                      <Button variant="outline" size="sm">
                        <PlayIcon className="w-4 h-4" />
                      </Button>
                    ) : (
                      <div className="w-8 h-8 flex items-center justify-center">
                        <div className="w-4 h-4 border-2 border-yellow-500 border-t-transparent rounded-full animate-spin" />
                      </div>
                    )}
                  </div>
                </div>
              </motion.button>
            ))}
          </div>
        </motion.div>

        {/* Create New Voice */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <button
            onClick={handleCreateNew}
            className="w-full border-2 border-dashed border-gray-300 rounded-xl p-8 hover:border-primary-400 hover:bg-primary-50 transition-colors"
          >
            <div className="text-center space-y-4">
              <div className="w-16 h-16 mx-auto bg-gray-100 rounded-full flex items-center justify-center">
                <PlusIcon className="w-8 h-8 text-gray-400" />
              </div>
              <div>
                <h3 className="font-medium text-gray-900">Create New Voice Clone</h3>
                <p className="text-gray-500 text-sm">Record or upload samples to get started</p>
              </div>
            </div>
          </button>
        </motion.div>

        {/* Tips */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-blue-50 rounded-xl p-4"
        >
          <h3 className="font-medium text-blue-900 mb-2">💡 Voice Cloning Tips</h3>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Record in a quiet environment with consistent audio quality</li>
            <li>• Speak naturally and vary your intonation</li>
            <li>• Minimum 5 minutes of clear speech for best results</li>
            <li>• Higher quality recordings produce better voice clones</li>
          </ul>
        </motion.div>
      </div>
    </div>
  );
}