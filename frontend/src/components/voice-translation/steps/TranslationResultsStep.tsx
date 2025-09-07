import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Card } from '../../ui/card';
import { Button } from '../../ui/button';
import { Badge } from '../../ui/badge';
import { TranslationJob } from '../../../contexts/VoiceTranslationContext';
import WaveformAudioPlayer from '../../tts/WaveformAudioPlayer';
import {
  CheckCircleIcon,
  ArrowDownTrayIcon,
  ShareIcon,
  SparklesIcon,
  PlayIcon,
  ExclamationTriangleIcon,
  ClockIcon,
  DocumentIcon,
  SpeakerWaveIcon,
  LanguageIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';

interface TranslationResultsStepProps {
  job?: TranslationJob;
  onDownload: (jobId: string) => Promise<void>;
  onShare: (jobId: string) => Promise<void>;
  onNewTranslation: () => void;
}

const TranslationResultsStep: React.FC<TranslationResultsStepProps> = ({
  job,
  onDownload,
  onShare,
  onNewTranslation
}) => {
  const [isDownloading, setIsDownloading] = useState(false);
  const [isSharing, setIsSharing] = useState(false);

  if (!job) {
    return (
      <Card className="p-8 text-center">
        <ExclamationTriangleIcon className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-foreground mb-2">No Results Found</h3>
        <p className="text-muted-foreground">Please start a new translation</p>
      </Card>
    );
  }

  const handleDownload = async () => {
    setIsDownloading(true);
    try {
      await onDownload(job.id);
    } finally {
      setIsDownloading(false);
    }
  };

  const handleShare = async () => {
    setIsSharing(true);
    try {
      await onShare(job.id);
    } finally {
      setIsSharing(false);
    }
  };

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

  const getProcessingTime = (): string => {
    if (!job.createdAt || !job.completedAt) return 'Unknown';
    const diff = job.completedAt.getTime() - job.createdAt.getTime();
    const seconds = Math.floor(diff / 1000);
    return `${seconds}s`;
  };

  if (job.status === 'failed') {
    return (
      <div className="space-y-6">
        {/* Error State */}
        <Card className="p-8 text-center bg-red-50 dark:bg-red-950 border-red-200 dark:border-red-800">
          <ExclamationTriangleIcon className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-red-800 dark:text-red-200 mb-2">
            Translation Failed
          </h2>
          <p className="text-red-600 dark:text-red-400 mb-6">
            {job.error || 'An error occurred during translation. Please try again with a different audio file or language.'}
          </p>
          
          <Button
            onClick={onNewTranslation}
            className="bg-blue-500 hover:bg-blue-600 text-white"
          >
            Try New Translation
          </Button>
        </Card>

        {/* Troubleshooting Tips */}
        <Card className="p-6">
          <h3 className="font-semibold text-foreground mb-4">Troubleshooting Tips</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <h4 className="font-medium mb-2">Audio Quality Issues:</h4>
              <ul className="space-y-1 text-muted-foreground">
                <li>• Use clear, high-quality audio</li>
                <li>• Minimize background noise</li>
                <li>• Ensure single speaker only</li>
                <li>• Keep duration under 10 minutes</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-2">Translation Issues:</h4>
              <ul className="space-y-1 text-muted-foreground">
                <li>• Try a different target language</li>
                <li>• Check if source language is supported</li>
                <li>• Avoid heavy accents or dialects</li>
                <li>• Retry with stable connection</li>
              </ul>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Success Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card className="p-8 text-center bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
          >
            <CheckCircleIcon className="w-16 h-16 text-green-500 mx-auto mb-4" />
          </motion.div>
          
          <h2 className="text-2xl font-bold text-green-800 dark:text-green-200 mb-2">
            Voice Translation Completed! 🎉
          </h2>
          <p className="text-green-600 dark:text-green-400 mb-6">
            Your audio has been successfully translated. Listen to the result below!
          </p>

          <div className="flex items-center justify-center space-x-6 text-sm text-green-700 dark:text-green-300">
            <div className="flex items-center space-x-2">
              <ClockIcon className="w-4 h-4" />
              <span>Processed in {getProcessingTime()}</span>
            </div>
            <div className="flex items-center space-x-2">
              <LanguageIcon className="w-4 h-4" />
              <span>{job.targetLanguage.name}</span>
            </div>
            <div className="flex items-center space-x-2">
              <SparklesIcon className="w-4 h-4" />
              <span>AI Enhanced</span>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Translation Success Message */}
      <Card className="p-6 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950 dark:to-purple-950">
        <div className="text-center">
          <h3 className="text-lg font-semibold text-foreground mb-2">
            Translation Complete!
          </h3>
          <p className="text-muted-foreground">
            Translating the audio sound &quot;{job.sourceAudio.name}&quot; is complete!
          </p>
        </div>
      </Card>

      {/* Audio Comparison */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Original Audio */}
        <Card className="p-6">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
              <DocumentIcon className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground">Original Audio</h3>
              <p className="text-sm text-muted-foreground">Source language</p>
            </div>
          </div>

          <WaveformAudioPlayer
            audioUrl={job.sourceAudio.url}
            waveformData={job.sourceAudio.waveformData}
            showControls={true}
            showWaveform={true}
            className="bg-muted/20"
          />

          <div className="mt-3 flex items-center justify-between text-sm text-muted-foreground">
            <span>{job.sourceAudio.name}</span>
            <span>{formatDuration(job.sourceAudio.duration)}</span>
          </div>
        </Card>

        {/* Translated Audio */}
        <Card className="p-6 bg-gradient-to-br from-green-50 to-blue-50 dark:from-green-950 dark:to-blue-950">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-blue-500 rounded-lg flex items-center justify-center">
              <SpeakerWaveIcon className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground">Translated Audio</h3>
              <p className="text-sm text-muted-foreground">AI voice translation</p>
            </div>
            <Badge className="bg-gradient-to-r from-green-500 to-blue-500 text-white">
              <SparklesIcon className="w-3 h-3 mr-1" />
              New
            </Badge>
          </div>

          {job.result && (
            <WaveformAudioPlayer
              audioUrl={job.result.audioUrl}
              waveformData={job.result.waveformData}
              showControls={true}
              showWaveform={true}
              className="bg-white/50 dark:bg-black/20"
            />
          )}

          <div className="mt-3 flex items-center justify-between text-sm text-muted-foreground">
            <span>translated-{job.id.slice(-6)}.mp3</span>
            <span>{job.result ? formatDuration(job.result.duration) : '--:--'}</span>
          </div>
        </Card>
      </div>

      {/* Translation Summary */}
      <Card className="p-6">
        <h3 className="font-semibold text-foreground mb-4">Translation Summary</h3>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div>
            <div className="text-2xl font-bold text-foreground">{getProcessingTime()}</div>
            <div className="text-sm text-muted-foreground">Processing Time</div>
          </div>
          
          <div>
            <div className="text-2xl font-bold text-foreground">
              {job.targetLanguage.name}
            </div>
            <div className="text-sm text-muted-foreground">Target Language</div>
          </div>
          
          <div>
            <div className="text-2xl font-bold text-foreground">
              {job.selectedVoice.name}
            </div>
            <div className="text-sm text-muted-foreground">AI Voice</div>
          </div>
          
          <div>
            <div className="text-2xl font-bold text-foreground">
              {job.result?.format.replace('audio/', '').toUpperCase() || 'MP3'}
            </div>
            <div className="text-sm text-muted-foreground">Format</div>
          </div>
        </div>
      </Card>

      {/* Audio Player Controls */}
      <Card className="p-6 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950 dark:to-pink-950">
        <div className="text-center space-y-4">
          <div className="flex justify-center">
            <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
              <PlayIcon className="w-8 h-8 text-white" />
            </div>
          </div>
          
          <div>
            <div className="text-sm font-medium text-muted-foreground mb-1">00:00</div>
            <div className="w-full bg-white/50 dark:bg-black/20 rounded-full h-2 mb-1">
              <div className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full w-0"></div>
            </div>
            <div className="text-sm font-medium text-muted-foreground">
              {job.result ? formatDuration(job.result.duration) : '05:46'}
            </div>
          </div>
        </div>
      </Card>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-4">
        <Button
          onClick={() => console.log('Share')}
          variant="outline"
          className="flex-1 h-12 bg-gray-600 text-white hover:bg-gray-700"
        >
          <ShareIcon className="w-5 h-5 mr-2" />
          Share
        </Button>

        <Button
          onClick={handleDownload}
          disabled={isDownloading || !job.result}
          className="flex-1 bg-blue-600 hover:bg-blue-700 text-white h-12"
        >
          <ArrowDownTrayIcon className="w-5 h-5 mr-2" />
          {isDownloading ? 'Downloading...' : 'Download'}
        </Button>
      </div>

      {/* Quality Feedback */}
      <Card className="p-4 bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-950 dark:to-orange-950">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <SparklesIcon className="w-5 h-5 text-yellow-600" />
            <div>
              <p className="font-medium text-foreground">Excellent translation quality!</p>
              <p className="text-sm text-muted-foreground">AI successfully preserved your speaking style</p>
            </div>
          </div>
          
          <div className="text-right">
            <p className="text-sm font-medium text-foreground">Quality Score</p>
            <div className="flex items-center space-x-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <SparklesIcon
                  key={star}
                  className="w-4 h-4 text-yellow-400 fill-current"
                />
              ))}
            </div>
          </div>
        </div>
      </Card>

      {/* Tips for Next Time */}
      <Card className="p-4 bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800">
        <h3 className="font-medium text-blue-800 dark:text-blue-200 mb-2">
          💡 Tips for Even Better Translations
        </h3>
        <div className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
          <div>• Try different voices to find the perfect match</div>
          <div>• Use studio-quality recordings for best results</div>
          <div>• Speak clearly and at a moderate pace</div>
          <div>• Consider cultural context for business translations</div>
        </div>
      </Card>
    </div>
  );
};

export default TranslationResultsStep;