import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { Slider } from '../ui/slider';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import {
  AdjustmentsHorizontalIcon,
  SpeakerWaveIcon,
  ForwardIcon,
  PauseIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';

interface AudioSettings {
  pitch: number;
  speed: number;
  volume: number;
  pause: {
    duration: number;
    position: number;
  };
}

interface AudioControlsPanelProps {
  isOpen: boolean;
  onClose: () => void;
  settings: AudioSettings;
  onSettingsChange: (settings: AudioSettings) => void;
  onAddPause: (position: number, duration: number) => void;
  blockId: string;
  blockDuration?: number;
}

const AudioControlsPanel: React.FC<AudioControlsPanelProps> = ({
  isOpen,
  onClose,
  settings,
  onSettingsChange,
  onAddPause,
  blockId,
  blockDuration = 30
}) => {
  const [activeTab, setActiveTab] = useState<'pitch' | 'speed' | 'pause' | 'volume'>('pitch');
  const [pauseDuration, setPauseDuration] = useState(1);
  const [pausePosition, setPausePosition] = useState(0);

  const handlePitchChange = (value: number[]) => {
    onSettingsChange({
      ...settings,
      pitch: value[0]
    });
  };

  const handleSpeedChange = (value: number[]) => {
    onSettingsChange({
      ...settings,
      speed: value[0]
    });
  };

  const handleVolumeChange = (value: number[]) => {
    onSettingsChange({
      ...settings,
      volume: value[0]
    });
  };

  const handleAddPause = () => {
    onAddPause(pausePosition, pauseDuration);
    onClose();
  };

  const pitchPresets = [
    { label: 'Very Low', value: -10 },
    { label: 'Low', value: -5 },
    { label: 'Normal', value: 0 },
    { label: 'High', value: 5 },
    { label: 'Very High', value: 10 }
  ];

  const speedPresets = [
    { label: 'Very Slow', value: 0.5 },
    { label: 'Slow', value: 0.75 },
    { label: 'Normal', value: 1.0 },
    { label: 'Fast', value: 1.25 },
    { label: 'Very Fast', value: 1.5 }
  ];

  const pausePresets = [
    { label: 'Short', value: 0.5 },
    { label: 'Medium', value: 1.0 },
    { label: 'Long', value: 2.0 },
    { label: 'Extended', value: 3.0 }
  ];

  const tabContent = {
    pitch: (
      <div className="space-y-6">
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Pitch Adjustment</h3>
            <span className="text-sm text-muted-foreground">
              {settings.pitch > 0 ? '+' : ''}{settings.pitch} semitones
            </span>
          </div>
          
          <div className="space-y-4">
            <Slider
              value={[settings.pitch]}
              onValueChange={handlePitchChange}
              min={-12}
              max={12}
              step={1}
              className="w-full"
            />
            
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Lower</span>
              <span>Normal</span>
              <span>Higher</span>
            </div>
          </div>
        </div>

        <div>
          <h4 className="text-sm font-medium mb-3">Quick Presets</h4>
          <div className="grid grid-cols-5 gap-2">
            {pitchPresets.map((preset) => (
              <Button
                key={preset.label}
                variant={settings.pitch === preset.value ? "default" : "outline"}
                size="sm"
                onClick={() => handlePitchChange([preset.value])}
                className="text-xs p-2 h-auto"
              >
                <div className="text-center">
                  <div className="font-medium">{preset.label}</div>
                  <div className="text-xs opacity-70">
                    {preset.value > 0 ? '+' : ''}{preset.value}
                  </div>
                </div>
              </Button>
            ))}
          </div>
        </div>

        <div className="bg-blue-50 dark:bg-blue-950 p-4 rounded-lg">
          <div className="flex items-start space-x-2">
            <SpeakerWaveIcon className="w-5 h-5 text-blue-600 mt-0.5" />
            <div className="text-sm">
              <div className="font-medium text-blue-900 dark:text-blue-100 mb-1">
                Pitch Tips
              </div>
              <ul className="text-blue-800 dark:text-blue-200 space-y-1">
                <li>• Negative values make voice deeper</li>
                <li>• Positive values make voice higher</li>
                <li>• Small adjustments (±2-3) sound more natural</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    ),
    
    speed: (
      <div className="space-y-6">
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Speed Control</h3>
            <span className="text-sm text-muted-foreground">
              {settings.speed}x speed
            </span>
          </div>
          
          <div className="space-y-4">
            <Slider
              value={[settings.speed]}
              onValueChange={handleSpeedChange}
              min={0.25}
              max={2.0}
              step={0.05}
              className="w-full"
            />
            
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>0.25x</span>
              <span>1.0x</span>
              <span>2.0x</span>
            </div>
          </div>
        </div>

        <div>
          <h4 className="text-sm font-medium mb-3">Quick Presets</h4>
          <div className="grid grid-cols-5 gap-2">
            {speedPresets.map((preset) => (
              <Button
                key={preset.label}
                variant={Math.abs(settings.speed - preset.value) < 0.01 ? "default" : "outline"}
                size="sm"
                onClick={() => handleSpeedChange([preset.value])}
                className="text-xs p-2 h-auto"
              >
                <div className="text-center">
                  <div className="font-medium">{preset.label}</div>
                  <div className="text-xs opacity-70">{preset.value}x</div>
                </div>
              </Button>
            ))}
          </div>
        </div>

        <div className="bg-green-50 dark:bg-green-950 p-4 rounded-lg">
          <div className="flex items-start space-x-2">
            <ForwardIcon className="w-5 h-5 text-green-600 mt-0.5" />
            <div className="text-sm">
              <div className="font-medium text-green-900 dark:text-green-100 mb-1">
                Speed Tips
              </div>
              <ul className="text-green-800 dark:text-green-200 space-y-1">
                <li>• 0.75x-1.25x maintains natural flow</li>
                <li>• Slower speeds improve comprehension</li>
                <li>• Faster speeds work well for summaries</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    ),

    volume: (
      <div className="space-y-6">
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Volume Level</h3>
            <span className="text-sm text-muted-foreground">
              {Math.round(settings.volume)}%
            </span>
          </div>
          
          <div className="space-y-4">
            <Slider
              value={[settings.volume]}
              onValueChange={handleVolumeChange}
              min={0}
              max={100}
              step={5}
              className="w-full"
            />
            
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Silent</span>
              <span>Normal</span>
              <span>Max</span>
            </div>
          </div>
        </div>
      </div>
    ),

    pause: (
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-semibold mb-4">Add Pause</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Insert a pause at a specific position in your audio
          </p>
          
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">
                Position in Audio
              </label>
              <Slider
                value={[pausePosition]}
                onValueChange={(value) => setPausePosition(value[0])}
                min={0}
                max={blockDuration}
                step={0.1}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-muted-foreground mt-2">
                <span>Start</span>
                <span>{pausePosition.toFixed(1)}s</span>
                <span>End ({blockDuration}s)</span>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">
                Pause Duration
              </label>
              <Slider
                value={[pauseDuration]}
                onValueChange={(value) => setPauseDuration(value[0])}
                min={0.1}
                max={5.0}
                step={0.1}
                className="w-full"
              />
              <div className="text-center text-sm text-muted-foreground mt-2">
                {pauseDuration.toFixed(1)} seconds
              </div>
            </div>
          </div>
        </div>

        <div>
          <h4 className="text-sm font-medium mb-3">Pause Presets</h4>
          <div className="grid grid-cols-4 gap-2">
            {pausePresets.map((preset) => (
              <Button
                key={preset.label}
                variant={Math.abs(pauseDuration - preset.value) < 0.01 ? "default" : "outline"}
                size="sm"
                onClick={() => setPauseDuration(preset.value)}
                className="text-xs p-2 h-auto"
              >
                <div className="text-center">
                  <div className="font-medium">{preset.label}</div>
                  <div className="text-xs opacity-70">{preset.value}s</div>
                </div>
              </Button>
            ))}
          </div>
        </div>

        <Button
          onClick={handleAddPause}
          className="w-full bg-primary hover:bg-primary/90"
        >
          <PauseIcon className="w-4 h-4 mr-2" />
          Add Pause
        </Button>
      </div>
    )
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <AdjustmentsHorizontalIcon className="w-5 h-5" />
            <span>Audio Controls</span>
          </DialogTitle>
        </DialogHeader>

        {/* Tabs */}
        <div className="flex space-x-1 bg-muted rounded-lg p-1">
          {[
            { key: 'pitch', label: 'Pitch', icon: '♪' },
            { key: 'speed', label: 'Speed', icon: '⚡' },
            { key: 'volume', label: 'Volume', icon: '🔊' },
            { key: 'pause', label: 'Pause', icon: '⏸' }
          ].map((tab) => (
            <Button
              key={tab.key}
              variant={activeTab === tab.key ? "default" : "ghost"}
              size="sm"
              onClick={() => setActiveTab(tab.key as any)}
              className="flex-1 text-xs"
            >
              <span className="mr-1">{tab.icon}</span>
              {tab.label}
            </Button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto py-4">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
            >
              {tabContent[activeTab]}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Footer */}
        <div className="flex justify-between items-center pt-4 border-t">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={onClose}>
            Apply Changes
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AudioControlsPanel;