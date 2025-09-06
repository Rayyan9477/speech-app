import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { Progress } from '../ui/progress';
import { Checkbox } from '../ui/checkbox';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { useTheme } from '../../lib/theme-provider';
import {
  ArrowDownTrayIcon,
  CheckCircleIcon,
  DocumentArrowDownIcon,
  Cog6ToothIcon,
  ShareIcon,
  PlayIcon,
  XMarkIcon,
  InformationCircleIcon
} from '@heroicons/react/24/outline';

interface ExportSettings {
  format: 'mp3' | 'wav' | 'aac' | 'flac';
  quality: 'low' | 'medium' | 'high' | 'lossless';
  includeBlocks: string[];
  mergeBlocks: boolean;
  addSilence: boolean;
  silenceDuration: number;
  normalizeAudio: boolean;
  fadeInOut: boolean;
}

interface TTSExportWorkflowProps {
  isOpen: boolean;
  onClose: () => void;
  projectTitle: string;
  textBlocks: Array<{
    id: string;
    content: string;
    audioUrl?: string;
    duration?: number;
    voice: any;
  }>;
  onExport: (settings: ExportSettings) => Promise<void>;
}

const TTSExportWorkflow: React.FC<TTSExportWorkflowProps> = ({
  isOpen,
  onClose,
  projectTitle,
  textBlocks,
  onExport
}) => {
  const { theme } = useTheme();
  const [currentStep, setCurrentStep] = useState<'ready' | 'settings' | 'exporting' | 'completed'>('ready');
  const [exportProgress, setExportProgress] = useState(0);
  const [exportSettings, setExportSettings] = useState<ExportSettings>({
    format: 'mp3',
    quality: 'high',
    includeBlocks: textBlocks.filter(b => b.audioUrl).map(b => b.id),
    mergeBlocks: true,
    addSilence: false,
    silenceDuration: 0.5,
    normalizeAudio: true,
    fadeInOut: false
  });
  const [exportedFileUrl, setExportedFileUrl] = useState<string>('');
  const [exportedFileSize, setExportedFileSize] = useState<string>('');

  useEffect(() => {
    if (isOpen) {
      setCurrentStep('ready');
      setExportProgress(0);
      setExportedFileUrl('');
    }
  }, [isOpen]);

  const audioBlocks = textBlocks.filter(block => block.audioUrl);
  const totalDuration = audioBlocks.reduce((sum, block) => sum + (block.duration || 0), 0);

  const formatOptions = [
    {
      id: 'mp3',
      name: 'MP3',
      description: 'Best for most uses, small file size',
      icon: '🎵',
      recommended: true
    },
    {
      id: 'wav',
      name: 'WAV',
      description: 'Uncompressed, highest quality',
      icon: '🔊'
    },
    {
      id: 'aac',
      name: 'AAC',
      description: 'Great quality, Apple compatible',
      icon: '📱'
    },
    {
      id: 'flac',
      name: 'FLAC',
      description: 'Lossless compression',
      icon: '💎'
    }
  ];

  const qualityOptions = {
    mp3: [
      { id: 'low', name: 'Low (128 kbps)', size: 'Small' },
      { id: 'medium', name: 'Medium (192 kbps)', size: 'Medium' },
      { id: 'high', name: 'High (320 kbps)', size: 'Large', recommended: true }
    ],
    wav: [
      { id: 'high', name: 'CD Quality (44.1kHz)', size: 'Large', recommended: true },
      { id: 'lossless', name: 'Studio Quality (48kHz)', size: 'Largest' }
    ],
    aac: [
      { id: 'medium', name: 'Good (128 kbps)', size: 'Small' },
      { id: 'high', name: 'High (256 kbps)', size: 'Medium', recommended: true }
    ],
    flac: [
      { id: 'lossless', name: 'Lossless', size: 'Large', recommended: true }
    ]
  };

  const handleNext = () => {
    if (currentStep === 'ready') {
      setCurrentStep('settings');
    } else if (currentStep === 'settings') {
      handleStartExport();
    }
  };

  const handleStartExport = async () => {
    setCurrentStep('exporting');
    
    try {
      // Simulate export progress
      for (let i = 0; i <= 100; i += 2) {
        setExportProgress(i);
        await new Promise(resolve => setTimeout(resolve, 50));
      }
      
      // Simulate file creation
      setExportedFileUrl('https://example.com/exported-audio.mp3');
      setExportedFileSize('2.4 MB');
      
      await onExport(exportSettings);
      setCurrentStep('completed');
    } catch (error) {
      console.error('Export failed:', error);
      setCurrentStep('ready');
    }
  };

  const handleDownload = () => {
    // In real implementation, trigger download
    const link = document.createElement('a');
    link.href = exportedFileUrl;
    link.download = `${projectTitle}.${exportSettings.format}`;
    link.click();
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: projectTitle,
        url: exportedFileUrl
      });
    }
  };

  const updateSettings = (key: keyof ExportSettings, value: any) => {
    setExportSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const toggleBlock = (blockId: string) => {
    setExportSettings(prev => ({
      ...prev,
      includeBlocks: prev.includeBlocks.includes(blockId)
        ? prev.includeBlocks.filter(id => id !== blockId)
        : [...prev.includeBlocks, blockId]
    }));
  };

  const renderReadyStep = () => (
    <div className="space-y-6">
      <div className="text-center">
        <div className="w-16 h-16 mx-auto mb-4 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
          <CheckCircleIcon className="w-8 h-8 text-green-600" />
        </div>
        <h2 className="text-xl font-semibold text-foreground mb-2">
          Ready for Export
        </h2>
        <p className="text-muted-foreground">
          Your project is ready to be exported as an audio file
        </p>
      </div>

      <Card className="p-4">
        <div className="space-y-3">
          <div className="flex justify-between">
            <span className="text-sm text-muted-foreground">Project:</span>
            <span className="text-sm font-medium">{projectTitle}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-muted-foreground">Audio Blocks:</span>
            <span className="text-sm font-medium">{audioBlocks.length} blocks</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-muted-foreground">Total Duration:</span>
            <span className="text-sm font-medium">
              {Math.floor(totalDuration / 60)}:{String(Math.floor(totalDuration % 60)).padStart(2, '0')}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-muted-foreground">Export Format:</span>
            <span className="text-sm font-medium uppercase">{exportSettings.format}</span>
          </div>
        </div>
      </Card>

      <div className="bg-blue-50 dark:bg-blue-950 p-4 rounded-lg">
        <div className="flex items-start space-x-2">
          <InformationCircleIcon className="w-5 h-5 text-blue-600 mt-0.5" />
          <div className="text-sm">
            <div className="font-medium text-blue-900 dark:text-blue-100 mb-1">
              Before Exporting
            </div>
            <ul className="text-blue-800 dark:text-blue-200 space-y-1">
              <li>• All blocks have been generated successfully</li>
              <li>• You can customize export settings in the next step</li>
              <li>• Export typically takes 30-60 seconds</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );

  const renderSettingsStep = () => (
    <div className="space-y-6 max-h-96 overflow-y-auto">
      <div className="text-center">
        <div className="w-16 h-16 mx-auto mb-4 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
          <Cog6ToothIcon className="w-8 h-8 text-blue-600" />
        </div>
        <h2 className="text-xl font-semibold text-foreground mb-2">
          Export Settings
        </h2>
        <p className="text-muted-foreground">
          Customize your audio export preferences
        </p>
      </div>

      {/* Format Selection */}
      <div>
        <h3 className="font-semibold mb-3">Audio Format</h3>
        <div className="grid grid-cols-2 gap-3">
          {formatOptions.map((format) => (
            <Card
              key={format.id}
              className={`p-3 cursor-pointer transition-all hover:shadow-md ${
                exportSettings.format === format.id
                  ? 'border-primary bg-primary/5'
                  : 'border-border hover:border-primary/50'
              }`}
              onClick={() => updateSettings('format', format.id)}
            >
              <div className="flex items-center space-x-3">
                <div className="text-2xl">{format.icon}</div>
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <span className="font-medium">{format.name}</span>
                    {format.recommended && (
                      <span className="bg-primary/10 text-primary text-xs px-2 py-0.5 rounded-full">
                        Recommended
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {format.description}
                  </p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Quality Selection */}
      <div>
        <h3 className="font-semibold mb-3">Audio Quality</h3>
        <div className="space-y-2">
          {qualityOptions[exportSettings.format]?.map((quality) => (
            <Card
              key={quality.id}
              className={`p-3 cursor-pointer transition-all hover:shadow-md ${
                exportSettings.quality === quality.id
                  ? 'border-primary bg-primary/5'
                  : 'border-border hover:border-primary/50'
              }`}
              onClick={() => updateSettings('quality', quality.id)}
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="font-medium">{quality.name}</span>
                    {quality.recommended && (
                      <span className="bg-primary/10 text-primary text-xs px-2 py-0.5 rounded-full">
                        Recommended
                      </span>
                    )}
                  </div>
                  <span className="text-xs text-muted-foreground">
                    File size: {quality.size}
                  </span>
                </div>
                {exportSettings.quality === quality.id && (
                  <CheckCircleIcon className="w-5 h-5 text-primary" />
                )}
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Block Selection */}
      <div>
        <h3 className="font-semibold mb-3">Include Audio Blocks</h3>
        <div className="space-y-2 max-h-32 overflow-y-auto">
          {audioBlocks.map((block, index) => (
            <div key={block.id} className="flex items-center space-x-3 p-2 rounded border">
              <Checkbox
                checked={exportSettings.includeBlocks.includes(block.id)}
                onCheckedChange={() => toggleBlock(block.id)}
              />
              <div className="flex-1">
                <div className="text-sm font-medium">
                  Block {index + 1}
                </div>
                <div className="text-xs text-muted-foreground truncate">
                  {block.content.substring(0, 50)}...
                </div>
              </div>
              <div className="text-xs text-muted-foreground">
                {block.duration?.toFixed(1)}s
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Advanced Options */}
      <div>
        <h3 className="font-semibold mb-3">Advanced Options</h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-sm font-medium">Merge all blocks</span>
              <p className="text-xs text-muted-foreground">
                Combine blocks into single file
              </p>
            </div>
            <Checkbox
              checked={exportSettings.mergeBlocks}
              onCheckedChange={(checked) => updateSettings('mergeBlocks', checked)}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <span className="text-sm font-medium">Normalize audio</span>
              <p className="text-xs text-muted-foreground">
                Balance volume levels
              </p>
            </div>
            <Checkbox
              checked={exportSettings.normalizeAudio}
              onCheckedChange={(checked) => updateSettings('normalizeAudio', checked)}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <span className="text-sm font-medium">Add fade in/out</span>
              <p className="text-xs text-muted-foreground">
                Smooth start and end
              </p>
            </div>
            <Checkbox
              checked={exportSettings.fadeInOut}
              onCheckedChange={(checked) => updateSettings('fadeInOut', checked)}
            />
          </div>
        </div>
      </div>
    </div>
  );

  const renderExportingStep = () => (
    <div className="space-y-6 text-center">
      <div className="w-16 h-16 mx-auto mb-4 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
      
      <div>
        <h2 className="text-xl font-semibold text-foreground mb-2">
          Exporting Your Audio
        </h2>
        <p className="text-muted-foreground mb-6">
          Please wait while we process your audio blocks...
        </p>
        
        <div className="space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span>Progress</span>
            <span>{exportProgress}%</span>
          </div>
          <Progress value={exportProgress} className="h-3" />
          
          <div className="text-sm text-muted-foreground">
            {exportProgress < 30 && 'Preparing audio blocks...'}
            {exportProgress >= 30 && exportProgress < 70 && 'Processing audio...'}
            {exportProgress >= 70 && exportProgress < 100 && 'Finalizing export...'}
            {exportProgress === 100 && 'Almost done...'}
          </div>
        </div>
      </div>
    </div>
  );

  const renderCompletedStep = () => (
    <div className="space-y-6 text-center">
      <div className="w-16 h-16 mx-auto mb-4 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
        <CheckCircleIcon className="w-8 h-8 text-green-600" />
      </div>
      
      <div>
        <h2 className="text-xl font-semibold text-foreground mb-2">
          Export Completed! 🎉
        </h2>
        <p className="text-muted-foreground mb-6">
          Your audio file has been successfully created
        </p>
      </div>

      <Card className="p-4">
        <div className="space-y-3">
          <div className="flex justify-between">
            <span className="text-sm text-muted-foreground">File name:</span>
            <span className="text-sm font-medium">
              {projectTitle}.{exportSettings.format}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-muted-foreground">File size:</span>
            <span className="text-sm font-medium">{exportedFileSize}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-muted-foreground">Format:</span>
            <span className="text-sm font-medium uppercase">
              {exportSettings.format} ({exportSettings.quality})
            </span>
          </div>
        </div>
      </Card>

      <div className="flex space-x-3">
        <Button onClick={handleDownload} className="flex-1">
          <ArrowDownTrayIcon className="w-4 h-4 mr-2" />
          Download
        </Button>
        <Button variant="outline" onClick={handleShare} className="flex-1">
          <ShareIcon className="w-4 h-4 mr-2" />
          Share
        </Button>
      </div>
    </div>
  );

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <DocumentArrowDownIcon className="w-5 h-5" />
            <span>Export Audio</span>
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto py-4">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              {currentStep === 'ready' && renderReadyStep()}
              {currentStep === 'settings' && renderSettingsStep()}
              {currentStep === 'exporting' && renderExportingStep()}
              {currentStep === 'completed' && renderCompletedStep()}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Footer */}
        <div className="flex justify-between items-center pt-4 border-t">
          {currentStep === 'ready' && (
            <>
              <Button variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button onClick={handleNext}>
                Customize Export
              </Button>
            </>
          )}
          
          {currentStep === 'settings' && (
            <>
              <Button variant="outline" onClick={() => setCurrentStep('ready')}>
                Back
              </Button>
              <Button 
                onClick={handleNext}
                disabled={exportSettings.includeBlocks.length === 0}
              >
                Start Export
              </Button>
            </>
          )}
          
          {currentStep === 'exporting' && (
            <div className="w-full text-center">
              <p className="text-sm text-muted-foreground">
                Please don't close this window...
              </p>
            </div>
          )}
          
          {currentStep === 'completed' && (
            <>
              <Button variant="outline" onClick={onClose}>
                Close
              </Button>
              <Button onClick={handleDownload}>
                Download File
              </Button>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TTSExportWorkflow;