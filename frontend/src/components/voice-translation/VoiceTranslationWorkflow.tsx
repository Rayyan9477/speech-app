import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Progress } from '../ui/progress';
import { useVoiceTranslation } from '../../contexts/VoiceTranslationContext';
import TranslationUploadStep from './steps/TranslationUploadStep';
import LanguageSelectionStep from './steps/LanguageSelectionStep';
import TranslationVoiceSelectionStep from './steps/TranslationVoiceSelectionStep';
import TranslationProcessingStep from './steps/TranslationProcessingStep';
import TranslationResultsStep from './steps/TranslationResultsStep';
import {
  ArrowLeftIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';

const VoiceTranslationWorkflow: React.FC = () => {
  const {
    state,
    nextStep,
    previousStep,
    resetWorkflow,
    canProceedToNext,
    startTranslation
  } = useVoiceTranslation();

  const steps = [
    { id: 'upload', title: 'Upload Audio', description: 'Upload your audio file' },
    { id: 'language', title: 'Choose Language', description: 'Select target language' },
    { id: 'voice', title: 'Select Voice', description: 'Choose AI voice' },
    { id: 'processing', title: 'Processing', description: 'AI translation in progress' },
    { id: 'results', title: 'Results', description: 'Translation complete' }
  ];

  const currentStepIndex = steps.findIndex(step => step.id === state.currentStep);
  const progressPercentage = ((currentStepIndex + 1) / steps.length) * 100;

  const handleNext = () => {
    if (state.currentStep === 'voice' && canProceedToNext()) {
      startTranslation();
    } else {
      nextStep();
    }
  };

  const handleBack = () => {
    if (state.currentStep === 'upload') {
      // Navigate back to main page or close workflow
      resetWorkflow();
    } else {
      previousStep();
    }
  };

  const renderCurrentStep = () => {
    switch (state.currentStep) {
      case 'upload':
        return (
          <TranslationUploadStep
            onFileUpload={async (file) => {
              // Upload is handled by context
            }}
            isUploading={state.isUploading}
            uploadProgress={state.uploadProgress}
            uploadedFile={state.uploadedFile || undefined}
            error={state.error || undefined}
          />
        );
      case 'language':
        return (
          <LanguageSelectionStep
            languages={state.availableLanguages}
            selectedLanguage={state.selectedLanguage || undefined}
            onLanguageSelect={(lang) => {
              // Selection is handled by context
            }}
            sourceAudio={state.uploadedFile || undefined}
          />
        );
      case 'voice':
        return (
          <TranslationVoiceSelectionStep
            voices={state.availableVoices}
            selectedVoice={state.selectedVoice || undefined}
            onVoiceSelect={(voice) => {
              // Selection is handled by context
            }}
            targetLanguage={state.selectedLanguage || undefined}
            sourceAudio={state.uploadedFile || undefined}
          />
        );
      case 'processing':
        return (
          <TranslationProcessingStep
            job={state.currentJob || undefined}
            progress={state.processingProgress}
            isProcessing={state.isProcessing}
          />
        );
      case 'results':
        return (
          <TranslationResultsStep
            job={state.currentJob || undefined}
            onDownload={async (jobId) => {
              console.log('Download:', jobId);
            }}
            onShare={async (jobId) => {
              console.log('Share:', jobId);
            }}
            onNewTranslation={() => resetWorkflow()}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-sm border-b border-border">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleBack}
              className="p-2"
            >
              {state.currentStep === 'upload' ? (
                <XMarkIcon className="w-5 h-5" />
              ) : (
                <ArrowLeftIcon className="w-5 h-5" />
              )}
            </Button>
            <div>
              <h1 className="text-lg font-semibold text-foreground">
                AI Voice Translate
              </h1>
              <p className="text-sm text-muted-foreground">
                {steps[currentStepIndex]?.description}
              </p>
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="px-4 pb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-foreground">
              Step {currentStepIndex + 1} of {steps.length}
            </span>
            <span className="text-sm text-muted-foreground">
              {Math.round(progressPercentage)}%
            </span>
          </div>
          <Progress value={progressPercentage} className="h-2" />
        </div>

        {/* Step Indicators */}
        <div className="flex items-center justify-between px-4 pb-4">
          {steps.map((step, index) => (
            <div
              key={step.id}
              className={`flex items-center space-x-2 ${
                index <= currentStepIndex ? 'text-primary' : 'text-muted-foreground'
              }`}
            >
              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${
                  index < currentStepIndex
                    ? 'bg-primary text-primary-foreground'
                    : index === currentStepIndex
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-muted-foreground'
                }`}
              >
                {index + 1}
              </div>
              <span className="text-xs font-medium hidden sm:inline">
                {step.title}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="p-4 pb-24">
        <AnimatePresence mode="wait">
          <motion.div
            key={state.currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            {renderCurrentStep()}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Bottom Actions */}
      {state.currentStep !== 'results' && (
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-background/80 backdrop-blur-sm border-t border-border">
          <div className="flex space-x-3">
            {state.currentStep !== 'upload' && state.currentStep !== 'processing' && (
              <Button
                variant="outline"
                onClick={previousStep}
                disabled={state.isUploading || state.isProcessing}
                className="flex-1"
              >
                Back
              </Button>
            )}
            
            {state.currentStep !== 'processing' && (
              <Button
                onClick={handleNext}
                disabled={!canProceedToNext() || state.isUploading || state.isProcessing}
                className={`${
                  state.currentStep === 'upload' || !canProceedToNext() ? 'flex-1' : 'flex-1'
                } bg-blue-600 hover:bg-blue-700 text-white`}
              >
                {state.currentStep === 'upload' && 'Continue'}
                {state.currentStep === 'language' && 'Continue'}
                {state.currentStep === 'voice' && 'Start Translation'}
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default VoiceTranslationWorkflow;