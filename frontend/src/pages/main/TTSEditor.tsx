import React from 'react';
import { TTSProjectProvider } from '../../contexts/TTSProjectContext';
import EnhancedTTSEditor from '../../components/tts/EnhancedTTSEditor';
const TTSEditor = () => {
  return (
    <TTSProjectProvider>
      <EnhancedTTSEditor />
    </TTSProjectProvider>
  );
};

export default TTSEditor;