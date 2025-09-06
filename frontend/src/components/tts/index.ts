// TTS Components Export
export { default as EnhancedTTSEditor } from './EnhancedTTSEditor';
export { default as WaveformAudioPlayer } from './WaveformAudioPlayer';
export { default as DraggableTextBlock } from './DraggableTextBlock';

// Context and Hooks
export { TTSProjectProvider, useTTSProject } from '../../contexts/TTSProjectContext';
export { useTTSAPI } from '../../hooks/useTTSAPI';

// Types
export type {
  Voice,
  TextBlock,
  AudioSettings,
  ProjectMetadata,
  TTSProjectState
} from '../../contexts/TTSProjectContext';