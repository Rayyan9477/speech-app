import React, { useCallback } from 'react';
import { motion } from 'framer-motion';
import { Card } from '../../ui/card';
import { Button } from '../../ui/button';
import { Progress } from '../../ui/progress';
import { useVoiceTranslation, AudioFile } from '../../../contexts/VoiceTranslationContext';
import WaveformAudioPlayer from '../../tts/WaveformAudioPlayer';
import {
  CloudArrowUpIcon,
  DocumentIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  TrashIcon,
  MicrophoneIcon
} from '@heroicons/react/24/outline';

interface TranslationUploadStepProps {
  onFileUpload: (file: File) => void;
  isUploading: boolean;
  uploadProgress: number;
  uploadedFile?: AudioFile;
  error?: string;
}

const TranslationUploadStep: React.FC<TranslationUploadStepProps> = ({
  onFileUpload,
  isUploading,
  uploadProgress,
  uploadedFile,
  error
}) => {
  const { uploadFile } = useVoiceTranslation();

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files);
    const audioFile = files.find(file => file.type.startsWith('audio/'));
    
    if (audioFile) {
      uploadFile(audioFile);
    }
  }, [uploadFile]);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      uploadFile(file);
    }
  }, [uploadFile]);

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (uploadedFile && !isUploading) {
    return (
      <div className="space-y-6">
        {/* Success Message */}
        <Card className="p-6 bg-green-50 border-green-200 dark:bg-green-950 dark:border-green-800">
          <div className="flex items-center space-x-3">
            <CheckCircleIcon className="w-6 h-6 text-green-600" />
            <div>
              <h3 className="font-semibold text-green-800 dark:text-green-200">
                Audio file is ready!
              </h3>
              <p className="text-sm text-green-600 dark:text-green-400">
                Your audio is ready for translation
              </p>
            </div>
          </div>
        </Card>

        {/* File Details */}
        <Card className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
                <MicrophoneIcon className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">{uploadedFile.name}</h3>
                <div className="flex items-center space-x-4 text-sm text-muted-foreground mt-1">
                  <span>{formatFileSize(uploadedFile.size)}</span>
                  <span>•</span>
                  <span>{formatDuration(uploadedFile.duration)}</span>
                  <span>•</span>
                  <span className="capitalize">{uploadedFile.format.replace('audio/', '')}</span>
                </div>
              </div>
            </div>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={() => window.location.reload()} // Simple way to reset
              className="text-muted-foreground hover:text-foreground"
            >
              <TrashIcon className="w-4 h-4" />
            </Button>
          </div>

          {/* Audio Player */}
          <WaveformAudioPlayer
            audioUrl={uploadedFile.url}
            waveformData={uploadedFile.waveformData}
            showControls={true}
            showWaveform={true}
            title="Source Audio for Translation"
            className="mt-4"
          />
        </Card>

        {/* Translation Info */}
        <Card className="p-4 bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800">
          <h3 className="font-medium text-blue-800 dark:text-blue-200 mb-2">
            🌍 Ready for Translation
          </h3>
          <p className="text-sm text-blue-700 dark:text-blue-300">
            Your audio will be translated to your selected language while preserving natural speech patterns and intonation.
          </p>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-xl font-semibold text-foreground mb-2">
          Upload Audio File 🎤
        </h2>
        <p className="text-muted-foreground">
          Upload your audio file to get started.
        </p>
      </div>

      {/* Upload Area */}
      <Card className="p-8">
        <div
          onDrop={handleDrop}
          onDragOver={(e) => e.preventDefault()}
          className={`border-2 border-dashed rounded-xl p-12 text-center transition-colors ${
            isUploading
              ? 'border-blue-300 bg-blue-50 dark:bg-blue-950'
              : 'border-gray-300 hover:border-blue-400 hover:bg-blue-50/50 dark:hover:bg-blue-950/50'
          }`}
        >
          {isUploading ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-4"
            >
              <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center mx-auto">
                <CloudArrowUpIcon className="w-8 h-8 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-foreground">Uploading Audio...</h3>
                <p className="text-muted-foreground">Preparing your file for translation</p>
              </div>
              <div className="max-w-xs mx-auto">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-muted-foreground">Progress</span>
                  <span className="text-sm font-medium">{uploadProgress}%</span>
                </div>
                <Progress value={uploadProgress} className="h-2" />
              </div>
            </motion.div>
          ) : (
            <div className="space-y-6">
              <div className="w-20 h-20 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mx-auto">
                <CloudArrowUpIcon className="w-10 h-10 text-blue-600" />
              </div>
              
              <div>
                <h3 className="text-xl font-semibold text-foreground mb-2">
                  Upload Your Audio File
                </h3>
                <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                  Drop your audio file here or click to browse. We&apos;ll translate it to your chosen language.
                </p>
              </div>
              
              <div className="space-y-4">
                <label htmlFor="audio-upload" className="cursor-pointer">
                  <Button
                    className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 text-base"
                    asChild
                  >
                    <span>Choose Audio File</span>
                  </Button>
                </label>
                <input
                  id="audio-upload"
                  type="file"
                  accept="audio/*"
                  onChange={handleFileSelect}
                  className="hidden"
                />
                
                <div className="text-sm text-muted-foreground">
                  or drag and drop your file here
                </div>
                
                <div className="text-xs text-muted-foreground mt-4">
                  Supports .mp3, .wav, .flac, .aac
                </div>
              </div>
            </div>
          )}
        </div>
      </Card>

      {/* Error Display */}
      {error && (
        <Card className="p-4 bg-red-50 border-red-200 dark:bg-red-950 dark:border-red-800">
          <div className="flex items-center space-x-3">
            <ExclamationTriangleIcon className="w-5 h-5 text-red-600" />
            <div>
              <div className="font-medium text-red-600">Upload Failed</div>
              <div className="text-sm text-red-600">{error}</div>
            </div>
          </div>
        </Card>
      )}

      {/* Requirements */}
      <Card className="p-6">
        <h3 className="font-semibold text-foreground mb-4">Translation Requirements</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-medium text-foreground mb-2">Supported Formats</h4>
            <div className="space-y-1 text-sm text-muted-foreground">
              <div>• MP3, WAV, FLAC, AAC</div>
              <div>• M4A, OGG, WMA</div>
            </div>
          </div>
          
          <div>
            <h4 className="font-medium text-foreground mb-2">Quality Guidelines</h4>
            <div className="space-y-1 text-sm text-muted-foreground">
              <div>• Duration: 5 seconds - 15 minutes</div>
              <div>• File size: Max 150MB</div>
              <div>• Clear speech, minimal noise</div>
            </div>
          </div>
        </div>
      </Card>

      {/* Translation Features */}
      <Card className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950 dark:to-pink-950">
        <h3 className="font-medium text-foreground mb-2">
          ✨ AI Translation Features
        </h3>
        <div className="text-sm text-muted-foreground space-y-1">
          <div>• Natural voice preservation during translation</div>
          <div>• Support for 20+ languages</div>
          <div>• High-quality AI voice synthesis</div>
          <div>• Maintains emotional tone and speaking style</div>
        </div>
      </Card>
    </div>
  );
};

export default TranslationUploadStep;