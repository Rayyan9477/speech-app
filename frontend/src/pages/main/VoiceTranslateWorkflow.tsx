import React from 'react';
import { VoiceTranslationProvider } from '../../contexts/VoiceTranslationContext';
import VoiceTranslationWorkflow from '../../components/voice-translation/VoiceTranslationWorkflow';

const VoiceTranslateWorkflow = () => {
  return (
    <VoiceTranslationProvider>
      <VoiceTranslationWorkflow />
    </VoiceTranslationProvider>
  );
};

export default VoiceTranslateWorkflow;