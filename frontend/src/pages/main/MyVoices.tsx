import React from 'react';
import { VoiceManagementProvider } from '../../contexts/VoiceManagementContext';
import VoiceManagement from '../../components/voices/VoiceManagement';

const MyVoices = () => {
  return (
    <VoiceManagementProvider>
      <div className="min-h-screen pb-20 py-6">
        <VoiceManagement />
      </div>
    </VoiceManagementProvider>
  );
};

export default MyVoices;