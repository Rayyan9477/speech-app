import React from 'react';
import { VoiceExplorerProvider } from '../../contexts/VoiceExplorerContext';
import EnhancedVoiceExplorer from '../../components/voices/EnhancedVoiceExplorer';

const ExploreVoices = () => {
  return (
    <VoiceExplorerProvider>
      <EnhancedVoiceExplorer />
    </VoiceExplorerProvider>
  );
};

export default ExploreVoices;