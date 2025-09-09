import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Progress } from '../ui/progress';
import { useVoiceManagement } from '../../contexts/VoiceManagementContext';
import WaveformAudioPlayer from '../tts/WaveformAudioPlayer';
import {
  ArrowLeftIcon,
  XMarkIcon,
  CloudArrowUpIcon,
  MicrophoneIcon,
  CheckCircleIcon,
  PlayIcon,
  StopIcon,
  UserIcon,
  CpuChipIcon,
  SparklesIcon
} from '@heroicons/react/24/outline';

const AddVoiceDialog: React.FC = () => {
  const {
    state,
    dispatch,
    hideAddVoiceDialog,
    createVoice
  } = useVoiceManagement();

  const [formData, setFormData] = useState({
    name: '',
    language: '',
    gender: '' as 'Male' | 'Female' | 'Other' | '',
    ageGroup: '' as 'Young' | 'Middle-Aged' | 'Senior' | ''
  });

  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [recordedAudio, setRecordedAudio] = useState<Blob | null>(null);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordingInterval = useRef<NodeJS.Timeout | null>(null);

  const languages = [
    'English - US',
    'English - UK', 
    'Spanish',
    'French',
    'German',
    'Italian',
    'Portuguese',
    'Japanese',
    'Chinese',
    'Korean',
    'Arabic',
    'Russian',
    'Hindi'
  ];

  if (!state.showAddVoiceDialog) {
    return null;
  }

  const handleNext = () => {
    const currentStep = state.voiceCreation.step;
    
    if (currentStep === 'method') {
      if (state.voiceCreation.method === 'upload') {
        dispatch({ type: 'SET_CREATION_STEP', payload: 'upload' });
      } else {
        dispatch({ type: 'SET_CREATION_STEP', payload: 'record' });
      }
    } else if (currentStep === 'upload' && uploadedFile) {
      dispatch({ type: 'SET_CREATION_STEP', payload: 'processing' });
      handleProcessing();
    } else if (currentStep === 'record' && recordedAudio) {
      dispatch({ type: 'SET_CREATION_STEP', payload: 'processing' });
      handleProcessing();
    } else if (currentStep === 'processing') {
      dispatch({ type: 'SET_CREATION_STEP', payload: 'identity' });
    } else if (currentStep === 'identity') {
      handleSave();
    }
  };

  const handleBack = () => {
    const currentStep = state.voiceCreation.step;
    
    if (currentStep === 'upload' || currentStep === 'record') {
      dispatch({ type: 'SET_CREATION_STEP', payload: 'method' });
    } else if (currentStep === 'processing') {
      if (state.voiceCreation.method === 'upload') {
        dispatch({ type: 'SET_CREATION_STEP', payload: 'upload' });
      } else {
        dispatch({ type: 'SET_CREATION_STEP', payload: 'record' });
      }
    } else if (currentStep === 'identity') {
      dispatch({ type: 'SET_CREATION_STEP', payload: 'processing' });
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadedFile(file);
      dispatch({ type: 'SET_UPLOADED_FILE', payload: file });
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      
      const audioChunks: Blob[] = [];
      
      mediaRecorder.ondataavailable = (event) => {
        audioChunks.push(event.data);
      };
      
      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunks, { type: 'audio/wav' });
        setRecordedAudio(audioBlob);
        dispatch({ type: 'SET_RECORDED_AUDIO', payload: audioBlob });
        stream.getTracks().forEach(track => track.stop());
      };
      
      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);
      
      recordingInterval.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
      
    } catch (error) {
      console.error('Error starting recording:', error);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (recordingInterval.current) {
        clearInterval(recordingInterval.current);
      }
    }
  };

  const handleProcessing = async () => {
    dispatch({ type: 'SET_IS_PROCESSING', payload: true });
    
    // Simulate processing
    for (let progress = 0; progress <= 100; progress += 10) {
      dispatch({ type: 'SET_PROCESSING_PROGRESS', payload: progress });
      await new Promise(resolve => setTimeout(resolve, 200));
    }
    
    dispatch({ type: 'SET_IS_PROCESSING', payload: false });
  };

  const handleSave = async () => {
    const audioSource = uploadedFile || recordedAudio;
    if (audioSource && formData.name && formData.gender && formData.language && formData.ageGroup) {
      await createVoice({
        name: formData.name,
        gender: (formData.gender || 'Other') as 'Male' | 'Female' | 'Other',
        language: formData.language,
        ageGroup: (formData.ageGroup || 'Young') as 'Young' | 'Middle-Aged' | 'Senior',
      }, audioSource);
      hideAddVoiceDialog();
      setFormData({ name: '', language: '', gender: '', ageGroup: '' });
      setUploadedFile(null);
      setRecordedAudio(null);
      setRecordingTime(0);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const canProceed = () => {
    const step = state.voiceCreation.step;
    if (step === 'method') return !!state.voiceCreation.method;
    if (step === 'upload') return !!uploadedFile;
    if (step === 'record') return !!recordedAudio;
    if (step === 'processing') return state.voiceCreation.processingProgress === 100;
    if (step === 'identity') {
      return formData.name && formData.gender && formData.language && formData.ageGroup;
    }
    return false;
  };

  const renderCurrentStep = () => {
    const step = state.voiceCreation.step;

    switch (step) {
      case 'method':
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h3 className="text-xl font-semibold text-foreground mb-2">Add New Voice</h3>
              <p className="text-muted-foreground">Choose how you want to add your voice</p>
            </div>

            <div className="grid grid-cols-1 gap-4">
              <Button
                variant={state.voiceCreation.method === 'upload' ? 'default' : 'outline'}
                onClick={() => dispatch({ type: 'SET_CREATION_METHOD', payload: 'upload' })}
                className="h-16 flex items-center justify-start space-x-4 p-6"
              >
                <CloudArrowUpIcon className="w-6 h-6" />
                <div className="text-left">
                  <div className="font-semibold">Upload Voice</div>
                  <div className="text-sm opacity-75">Upload an audio file</div>
                </div>
              </Button>

              <Button
                variant={state.voiceCreation.method === 'record' ? 'default' : 'outline'}
                onClick={() => dispatch({ type: 'SET_CREATION_METHOD', payload: 'record' })}
                className="h-16 flex items-center justify-start space-x-4 p-6"
              >
                <MicrophoneIcon className="w-6 h-6" />
                <div className="text-left">
                  <div className="font-semibold">Record Voice</div>
                  <div className="text-sm opacity-75">Record directly in the app</div>
                </div>
              </Button>
            </div>
          </div>
        );

      case 'upload':
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h3 className="text-xl font-semibold text-foreground mb-2">Upload Voice</h3>
              <p className="text-muted-foreground">Select an audio file to upload</p>
            </div>

            {!uploadedFile ? (
              <Card 
                className="p-8 border-dashed border-2 border-muted-foreground/30 hover:border-blue-500 transition-all cursor-pointer"
                onClick={() => fileInputRef.current?.click()}
              >
                <div className="text-center space-y-4">
                  <CloudArrowUpIcon className="w-12 h-12 text-muted-foreground mx-auto" />
                  <div>
                    <p className="font-semibold text-foreground">Click to upload</p>
                    <p className="text-sm text-muted-foreground">Supports .mp3, .wav, .flac, .aac</p>
                  </div>
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="audio/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </Card>
            ) : (
              <Card className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <CheckCircleIcon className="w-6 h-6 text-green-600" />
                    <div>
                      <p className="font-semibold text-foreground">{uploadedFile.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {(uploadedFile.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setUploadedFile(null)}
                  >
                    <XMarkIcon className="w-4 h-4" />
                  </Button>
                </div>
              </Card>
            )}
          </div>
        );

      case 'record':
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h3 className="text-xl font-semibold text-foreground mb-2">Record Voice</h3>
              <p className="text-muted-foreground">Record your voice directly</p>
            </div>

            <Card className="p-8">
              <div className="text-center space-y-6">
                <div className={`w-24 h-24 mx-auto rounded-full flex items-center justify-center ${
                  isRecording ? 'bg-red-100 dark:bg-red-900' : 'bg-blue-100 dark:bg-blue-900'
                }`}>
                  <MicrophoneIcon className={`w-12 h-12 ${
                    isRecording ? 'text-red-600' : 'text-blue-600'
                  }`} />
                </div>

                <div>
                  <div className="text-2xl font-mono font-bold text-foreground mb-2">
                    {formatTime(recordingTime)}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {isRecording ? 'Recording in progress...' : recordedAudio ? 'Recording complete!' : 'Ready to record'}
                  </p>
                </div>

                {!recordedAudio ? (
                  <Button
                    onClick={isRecording ? stopRecording : startRecording}
                    className={`h-12 px-8 ${
                      isRecording 
                        ? 'bg-red-600 hover:bg-red-700 text-white' 
                        : 'bg-blue-600 hover:bg-blue-700 text-white'
                    }`}
                  >
                    {isRecording ? (
                      <>
                        <StopIcon className="w-5 h-5 mr-2" />
                        Stop Recording
                      </>
                    ) : (
                      <>
                        <MicrophoneIcon className="w-5 h-5 mr-2" />
                        Start Recording
                      </>
                    )}
                  </Button>
                ) : (
                  <div className="space-y-3">
                    <div className="flex items-center justify-center space-x-4">
                      <Button variant="outline" onClick={() => setRecordedAudio(null)}>
                        Record Again
                      </Button>
                      <Button variant="outline">
                        <PlayIcon className="w-4 h-4 mr-2" />
                        Play
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </Card>
          </div>
        );

      case 'processing':
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h3 className="text-xl font-semibold text-foreground mb-2">Processing Voice</h3>
              <p className="text-muted-foreground">AI is analyzing your voice patterns</p>
            </div>

            <Card className="p-8">
              <div className="text-center space-y-6">
                <div className="w-16 h-16 mx-auto bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                  <CpuChipIcon className="w-8 h-8 text-blue-600 animate-pulse" />
                </div>

                <div>
                  <div className="text-lg font-semibold text-foreground mb-2">
                    Deep Learning in Progress
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Training your custom voice model...
                  </p>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Progress</span>
                    <span className="font-medium">{state.voiceCreation.processingProgress}%</span>
                  </div>
                  <Progress value={state.voiceCreation.processingProgress} className="h-2" />
                </div>

                {state.voiceCreation.processingProgress === 100 && (
                  <div className="text-center space-y-2">
                    <CheckCircleIcon className="w-8 h-8 text-green-600 mx-auto" />
                    <p className="text-green-600 font-medium">Processing Complete!</p>
                  </div>
                )}
              </div>
            </Card>
          </div>
        );

      case 'identity':
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h3 className="text-xl font-semibold text-foreground mb-2">Touch Your Voice 👤</h3>
              <p className="text-muted-foreground">
                Create an identity for your voice. This will make it easier for you to recognize it when you want to use it.
              </p>
            </div>

            <div className="space-y-4">
              <div className="flex justify-center mb-6">
                <div className="relative">
                  <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center">
                    <UserIcon className="w-10 h-10 text-muted-foreground" />
                  </div>
                  <Button
                    size="sm"
                    className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full p-0 bg-blue-600 hover:bg-blue-700"
                  >
                    ✏️
                  </Button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Name</label>
                <Input
                  placeholder="Name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Language</label>
                <select
                  value={formData.language}
                  onChange={(e) => setFormData(prev => ({ ...prev, language: e.target.value }))}
                  className="w-full p-3 border border-border rounded-lg bg-background text-foreground"
                >
                  <option value="">Language</option>
                  {languages.map(lang => (
                    <option key={lang} value={lang}>{lang}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Gender</label>
                <select
                  value={formData.gender}
                  onChange={(e) => setFormData(prev => ({ ...prev, gender: e.target.value as any }))}
                  className="w-full p-3 border border-border rounded-lg bg-background text-foreground"
                >
                  <option value="">Gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Age Groups</label>
                <select
                  value={formData.ageGroup}
                  onChange={(e) => setFormData(prev => ({ ...prev, ageGroup: e.target.value as any }))}
                  className="w-full p-3 border border-border rounded-lg bg-background text-foreground"
                >
                  <option value="">Age Group</option>
                  <option value="Young">Young</option>
                  <option value="Middle-Aged">Middle-Aged</option>
                  <option value="Senior">Senior</option>
                </select>
              </div>
            </div>
          </div>
        );

      case 'completed':
        return (
          <div className="space-y-6 text-center">
            <div className="w-16 h-16 mx-auto bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
              <CheckCircleIcon className="w-8 h-8 text-green-600" />
            </div>
            <div>
              <h3 className="text-xl font-semibold text-foreground mb-2">Voice Added Successfully! 🎉</h3>
              <p className="text-muted-foreground">Your custom voice is now ready to use</p>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={hideAddVoiceDialog}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          onClick={(e) => e.stopPropagation()}
          className="w-full max-w-md max-h-[90vh] overflow-auto"
        >
          <Card className="shadow-xl">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b">
              {state.voiceCreation.step !== 'method' && (
                <Button variant="ghost" size="sm" onClick={handleBack}>
                  <ArrowLeftIcon className="w-4 h-4" />
                </Button>
              )}
              <div className="flex-1" />
              <Button variant="ghost" size="sm" onClick={hideAddVoiceDialog}>
                <XMarkIcon className="w-4 h-4" />
              </Button>
            </div>

            {/* Content */}
            <div className="p-6">
              {renderCurrentStep()}
            </div>

            {/* Footer */}
            {state.voiceCreation.step !== 'completed' && (
              <div className="p-6 border-t">
                <Button
                  onClick={handleNext}
                  disabled={!canProceed() || state.isProcessing}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white h-12"
                >
                  {state.voiceCreation.step === 'method' && 'Continue'}
                  {state.voiceCreation.step === 'upload' && 'Continue'}
                  {state.voiceCreation.step === 'record' && 'Continue'}
                  {state.voiceCreation.step === 'processing' && (
                    state.voiceCreation.processingProgress === 100 ? 'Continue' : 'Processing...'
                  )}
                  {state.voiceCreation.step === 'identity' && 'Save'}
                </Button>
              </div>
            )}
          </Card>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default AddVoiceDialog;