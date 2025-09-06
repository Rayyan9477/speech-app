import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { Progress } from '../ui/progress';
import { useVoiceProcessing } from '../../contexts/VoiceProcessingContext';
import AudioUploadStep from './steps/AudioUploadStep';
import VoiceSelectionStep from './steps/VoiceSelectionStep';
import ProcessingStep from './steps/ProcessingStep';
import ResultsStep from './steps/ResultsStep';
import {
  ArrowLeftIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';

type WorkflowStep = 'upload' | 'voice-selection' | 'processing' | 'results';

interface StepConfig {
  id: WorkflowStep;
  title: string;
  description: string;
}

const steps: StepConfig[] = [
  {
    id: 'upload',
    title: 'Upload Audio',
    description: 'Upload the audio file you want to transform'
  },
  {
    id: 'voice-selection',
    title: 'Choose Voice',
    description: 'Select the target voice for transformation'
  },
  {
    id: 'processing',
    title: 'Processing',
    description: 'AI is transforming your audio'
  },
  {
    id: 'results',
    title: 'Results',
    description: 'Download and share your transformed audio'
  }
];

const VoiceChangerWorkflow: React.FC = () => {
  const navigate = useNavigate();
  const {
    state,
    startUpload,
    selectVoice,
    startVoiceChange,
    loadAvailableVoices,
    clearCurrentJob,
    clearError,
    downloadResult,
    shareResult
  } = useVoiceProcessing();

  const [currentStep, setCurrentStep] = useState<WorkflowStep>('upload');

  // Load available voices on mount
  useEffect(() => {
    if (state.availableVoices.length === 0) {
      loadAvailableVoices();
    }
  }, [loadAvailableVoices, state.availableVoices.length]);

  // Auto-advance steps based on job status
  useEffect(() => {
    if (!state.currentJob) {
      setCurrentStep('upload');
      return;
    }

    switch (state.currentJob.status) {
      case 'uploading':
        setCurrentStep('upload');
        break;
      case 'idle':
        if (state.currentJob.sourceAudio && !state.currentJob.targetVoice) {
          setCurrentStep('voice-selection');
        }
        break;
      case 'processing':
        setCurrentStep('processing');
        break;
      case 'completed':
      case 'failed':
        setCurrentStep('results');
        break;
    }
  }, [state.currentJob]);

  const getCurrentStepIndex = () => {
    return steps.findIndex(step => step.id === currentStep);
  };

  const handleFileUpload = async (file: File) => {
    await startUpload(file, 'voice-change');
  };

  const handleVoiceSelect = (voiceId: string) => {
    selectVoice(voiceId);
  };

  const handleStartProcessing = async () => {
    if (state.currentJob?.sourceAudio && state.selectedVoice) {
      await startVoiceChange(state.currentJob.sourceAudio, state.selectedVoice);
    }
  };

  const handleNewTransformation = () => {
    clearCurrentJob();
    setCurrentStep('upload');
  };

  const handleBack = () => {
    if (currentStep === 'voice-selection' && state.currentJob?.sourceAudio) {
      setCurrentStep('upload');
    } else {
      navigate(-1);
    }
  };

  const canProceed = () => {
    switch (currentStep) {
      case 'upload':
        return state.currentJob?.sourceAudio && state.currentJob.status === 'idle';
      case 'voice-selection':
        return state.selectedVoice;
      case 'processing':
        return false;
      case 'results':
        return state.currentJob?.status === 'completed';
      default:
        return false;
    }
  };

  const handleNext = () => {
    switch (currentStep) {
      case 'upload':
        if (canProceed()) {
          setCurrentStep('voice-selection');
        }
        break;
      case 'voice-selection':
        if (canProceed()) {
          handleStartProcessing();
        }
        break;
    }
  };

  return (
    <div className="min-h-screen pb-20 bg-background">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="py-6 max-w-4xl mx-auto px-4"
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleBack}
              className="p-2"
            >
              <ArrowLeftIcon className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Voice Changer</h1>
              <p className="text-muted-foreground">Transform any voice with AI</p>
            </div>
          </div>
          
          {state.currentJob && (
            <Button
              variant="outline"
              onClick={handleNewTransformation}
              className="text-sm"
            >
              New Transformation
            </Button>
          )}
        </div>

        {/* Progress Steps */}
        <Card className="p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Progress</h2>
            <span className="text-sm text-muted-foreground">
              Step {getCurrentStepIndex() + 1} of {steps.length}
            </span>
          </div>

          <div className="flex items-center justify-between mb-6">
            {steps.map((step, index) => {
              const isActive = step.id === currentStep;
              const isCompleted = getCurrentStepIndex() > index;
              const isAccessible = getCurrentStepIndex() >= index;

              return (
                <div key={step.id} className="flex flex-col items-center flex-1">
                  {/* Step Circle */}
                  <div className="relative">
                    <div
                      className={`w-10 h-10 rounded-full border-2 flex items-center justify-center transition-all ${
                        isCompleted
                          ? 'bg-green-500 border-green-500 text-white'
                          : isActive
                          ? 'bg-blue-500 border-blue-500 text-white'
                          : isAccessible
                          ? 'border-blue-300 text-blue-500'
                          : 'border-gray-300 text-gray-400'
                      }`}
                    >
                      {isCompleted ? (
                        <CheckCircleIcon className="w-5 h-5" />
                      ) : (
                        <span className="text-sm font-semibold">{index + 1}</span>
                      )}
                    </div>

                    {/* Active Step Pulse */}
                    {isActive && (
                      <motion.div
                        className="absolute inset-0 rounded-full border-2 border-blue-500"
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ duration: 2, repeat: Infinity }}
                      />
                    )}
                  </div>

                  {/* Step Title */}
                  <div className="mt-2 text-center">
                    <div className={`text-sm font-medium ${
                      isActive ? 'text-foreground' : 'text-muted-foreground'
                    }`}>
                      {step.title}
                    </div>
                    <div className="text-xs text-muted-foreground mt-1 max-w-24">
                      {step.description}
                    </div>
                  </div>

                  {/* Connection Line */}
                  {index < steps.length - 1 && (
                    <div className="absolute top-5 left-1/2 w-full h-0.5 bg-gray-200 dark:bg-gray-700 -z-10">
                      <div
                        className={`h-full transition-all duration-500 ${
                          getCurrentStepIndex() > index ? 'bg-green-500 w-full' : 'bg-gray-200 dark:bg-gray-700 w-0'
                        }`}
                      />
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Overall Progress Bar */}
          <div className="mt-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">Overall Progress</span>
              <span className="text-sm font-medium">
                {Math.round(((getCurrentStepIndex() + 1) / steps.length) * 100)}%
              </span>
            </div>
            <Progress 
              value={((getCurrentStepIndex() + 1) / steps.length) * 100} 
              className="h-2"
            />
          </div>
        </Card>

        {/* Error Display */}
        <AnimatePresence>
          {state.error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mb-6"
            >
              <Card className="p-4 bg-red-50 border-red-200 dark:bg-red-950 dark:border-red-800">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <ExclamationTriangleIcon className="w-5 h-5 text-red-600" />
                    <div>
                      <div className="font-medium text-red-600">Processing Error</div>
                      <div className="text-sm text-red-600">{state.error}</div>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm" onClick={clearError}>
                    <XMarkIcon className="w-4 h-4" />
                  </Button>
                </div>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Step Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            {currentStep === 'upload' && (
              <AudioUploadStep
                onFileUpload={handleFileUpload}
                isUploading={state.isUploading}
                uploadProgress={state.uploadProgress}
                uploadedFile={state.currentJob?.sourceAudio}
                error={state.error}
              />
            )}

            {currentStep === 'voice-selection' && (
              <VoiceSelectionStep
                voices={state.availableVoices}
                selectedVoice={state.selectedVoice}
                onVoiceSelect={handleVoiceSelect}
                sourceAudio={state.currentJob?.sourceAudio}
              />
            )}

            {currentStep === 'processing' && (
              <ProcessingStep
                job={state.currentJob}
                progress={state.processingProgress}
                isProcessing={state.isProcessing}
              />
            )}

            {currentStep === 'results' && (
              <ResultsStep
                job={state.currentJob}
                onDownload={downloadResult}
                onShare={shareResult}
                onNewTransformation={handleNewTransformation}
              />
            )}
          </motion.div>
        </AnimatePresence>

        {/* Navigation */}
        <AnimatePresence>
          {(currentStep === 'upload' || currentStep === 'voice-selection') && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="flex items-center justify-between mt-6"
            >
              <Button
                variant="outline"
                onClick={handleBack}
                disabled={currentStep === 'upload'}
              >
                Back
              </Button>

              <Button
                onClick={handleNext}
                disabled={!canProceed() || state.isProcessing}
                className="bg-blue-500 hover:bg-blue-600 text-white"
              >
                {currentStep === 'upload' ? 'Continue' : 'Start Processing'}
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};

export default VoiceChangerWorkflow;