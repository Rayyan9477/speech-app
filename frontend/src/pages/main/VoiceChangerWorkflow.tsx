import React from 'react';
import { VoiceProcessingProvider } from '../../contexts/VoiceProcessingContext';
import VoiceChangerWorkflow from '../../components/voice-processing/VoiceChangerWorkflow';
const VoiceChangerWorkflowPage = () => {
  return (
    <VoiceProcessingProvider>
      <VoiceChangerWorkflow />
    </VoiceProcessingProvider>
  );
};

export default VoiceChangerWorkflow;