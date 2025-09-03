import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '../../components/ui/button';
import { Card } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Input } from '../../components/ui/input';
import { useTheme } from '../../lib/theme-provider';
import {
  AdjustmentsHorizontalIcon,
  SpeakerWaveIcon,
  PlayIcon,
  PauseIcon,
  StopIcon,
  MicrophoneIcon,
  SparklesIcon,
  ArrowPathIcon,
  SaveIcon,
  ShareIcon,
  DownloadIcon
} from '@heroicons/react/24/outline';
import {
  PlayIcon as PlayIconSolid,
  PauseIcon as PauseIconSolid,
  StopIcon as StopIconSolid
} from '@heroicons/react/24/solid';

const VoiceCustomizer = () => {
  const { theme } = useTheme();
  const [selectedVoice, setSelectedVoice] = useState('Emma');
  const [isPlaying, setIsPlaying] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [customSettings, setCustomSettings] = useState({
    pitch: 1.0,
    speed: 1.0,
    volume: 0.8,
    reverb: 0.3,
    echo: 0.2,
    distortion: 0.1,
    warmth: 0.7,
    brightness: 0.6
  });
  const [presets, setPresets] = useState([
    { name: 'Natural', settings: { pitch: 1.0, speed: 1.0, volume: 0.8, reverb: 0.2, echo: 0.1, distortion: 0.0, warmth: 0.8, brightness: 0.6 } },
    { name: 'Deep & Powerful', settings: { pitch: 0.7, speed: 0.9, volume: 1.0, reverb: 0.4, echo: 0.3, distortion: 0.1, warmth: 0.9, brightness: 0.4 } },
    { name: 'Bright & Energetic', settings: { pitch: 1.2, speed: 1.1, volume: 0.9, reverb: 0.1, echo: 0.0, distortion: 0.0, warmth: 0.6, brightness: 0.9 } },
    { name: 'Warm & Soothing', settings: { pitch: 0.9, speed: 0.95, volume: 0.7, reverb: 0.5, echo: 0.2, distortion: 0.0, warmth: 0.95, brightness: 0.5 } },
    { name: 'Robot', settings: { pitch: 1.0, speed: 1.0, volume: 0.8, reverb: 0.0, echo: 0.0, distortion: 0.8, warmth: 0.2, brightness: 0.9 } },
    { name: 'Vintage Radio', settings: { pitch: 1.0, speed: 1.0, volume: 0.6, reverb: 0.7, echo: 0.6, distortion: 0.3, warmth: 0.8, brightness: 0.3 } }
  ]);

  const voices = [
    { name: 'Emma', language: 'English', style: 'Natural', avatar: '👩' },
    { name: 'Marcus', language: 'English', style: 'Professional', avatar: '👨' },
    { name: 'Luna', language: 'Spanish', style: 'Friendly', avatar: '👩' },
    { name: 'Hans', language: 'German', style: 'Technical', avatar: '👨' },
    { name: 'Sophie', language: 'French', style: 'Elegant', avatar: '👩' },
  ];

  const handleSettingChange = (setting: string, value: number) => {
    setCustomSettings(prev => ({
      ...prev,
      [setting]: value
    }));
  };

  const handlePresetSelect = (preset: any) => {
    setCustomSettings(preset.settings);
  };

  const handleSavePreset = () => {
    const presetName = prompt('Enter preset name:');
    if (presetName) {
      setPresets(prev => [...prev, { name: presetName, settings: customSettings }]);
    }
  };

  const handlePlay = () => {
    if (isPlaying) {
      setIsPlaying(false);
    } else {
      setIsPlaying(true);
    }
  };

  const handleRecord = () => {
    if (isRecording) {
      setIsRecording(false);
    } else {
      setIsRecording(true);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.6,
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.4 }
    }
  };

  return (
    <div className="min-h-screen pb-20">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="py-6 space-y-6"
      >
        {/* Header */}
        <motion.div variants={itemVariants} className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Voice Customizer</h1>
            <p className="text-muted-foreground mt-1">Create your perfect voice</p>
          </div>
          <Badge variant="outline" className="rounded-full">
            <SparklesIcon className="w-4 h-4 mr-1" />
            Advanced
          </Badge>
        </motion.div>

        {/* Voice Selection */}
        <motion.div variants={itemVariants}>
          <Card className="p-4">
            <h2 className="text-lg font-semibold text-foreground mb-4">Base Voice</h2>
            <div className="grid grid-cols-1 gap-3">
              {voices.map((voice) => (
                <div
                  key={voice.name}
                  onClick={() => setSelectedVoice(voice.name)}
                  className={`p-3 rounded-lg border cursor-pointer transition-all ${
                    selectedVoice === voice.name
                      ? 'border-primary bg-primary/5'
                      : theme === 'dark'
                      ? 'border-slate-700 hover:border-slate-600'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <div className="text-2xl">{voice.avatar}</div>
                    <div className="flex-1">
                      <h3 className="font-medium text-foreground">{voice.name}</h3>
                      <p className="text-sm text-muted-foreground">{voice.language} • {voice.style}</p>
                    </div>
                    {selectedVoice === voice.name && (
                      <div className="w-5 h-5 bg-primary rounded-full flex items-center justify-center">
                        <div className="w-2 h-2 bg-white rounded-full" />
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </motion.div>

        {/* Presets */}
        <motion.div variants={itemVariants}>
          <Card className="p-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-foreground">Presets</h2>
              <Button onClick={handleSavePreset} variant="outline" size="sm">
                <SaveIcon className="w-4 h-4 mr-2" />
                Save Current
              </Button>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {presets.map((preset) => (
                <Button
                  key={preset.name}
                  onClick={() => handlePresetSelect(preset)}
                  variant="outline"
                  className="h-auto p-3 flex flex-col items-center space-y-2"
                >
                  <span className="text-sm font-medium">{preset.name}</span>
                  <div className="flex space-x-1">
                    {Object.entries(preset.settings).slice(0, 4).map(([key, value]) => (
                      <div
                        key={key}
                        className="w-2 h-2 rounded-full bg-primary opacity-60"
                        style={{ opacity: value as number * 0.6 + 0.4 }}
                      />
                    ))}
                  </div>
                </Button>
              ))}
            </div>
          </Card>
        </motion.div>

        {/* Voice Controls */}
        <motion.div variants={itemVariants}>
          <Card className="p-6">
            <h2 className="text-lg font-semibold text-foreground mb-6">Voice Adjustments</h2>

            <div className="space-y-6">
              {/* Basic Controls */}
              <div className="grid grid-cols-1 gap-4">
                {[
                  { key: 'pitch', label: 'Pitch', min: 0.5, max: 2.0, step: 0.1 },
                  { key: 'speed', label: 'Speed', min: 0.5, max: 2.0, step: 0.1 },
                  { key: 'volume', label: 'Volume', min: 0, max: 1, step: 0.1 }
                ].map((control) => (
                  <div key={control.key}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-foreground">{control.label}</span>
                      <span className="text-sm text-muted-foreground">
                        {control.key === 'volume'
                          ? `${Math.round(customSettings[control.key as keyof typeof customSettings] * 100)}%`
                          : `${customSettings[control.key as keyof typeof customSettings]}x`
                        }
                      </span>
                    </div>
                    <input
                      type="range"
                      min={control.min}
                      max={control.max}
                      step={control.step}
                      value={customSettings[control.key as keyof typeof customSettings]}
                      onChange={(e) => handleSettingChange(control.key, parseFloat(e.target.value))}
                      className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer slider"
                      aria-label={`${control.label} adjustment control`}
                      title={`Adjust ${control.label.toLowerCase()} from ${control.min} to ${control.max}`}
                    />
                  </div>
                ))}
              </div>

              {/* Advanced Controls */}
              <div className="border-t border-border pt-6">
                <h3 className="text-sm font-semibold text-foreground mb-4 flex items-center">
                  <AdjustmentsHorizontalIcon className="w-4 h-4 mr-2" />
                  Advanced Effects
                </h3>
                <div className="grid grid-cols-1 gap-4">
                  {[
                    { key: 'reverb', label: 'Reverb', min: 0, max: 1, step: 0.1 },
                    { key: 'echo', label: 'Echo', min: 0, max: 1, step: 0.1 },
                    { key: 'distortion', label: 'Distortion', min: 0, max: 1, step: 0.1 },
                    { key: 'warmth', label: 'Warmth', min: 0, max: 1, step: 0.1 },
                    { key: 'brightness', label: 'Brightness', min: 0, max: 1, step: 0.1 }
                  ].map((control) => (
                    <div key={control.key}>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-foreground">{control.label}</span>
                        <span className="text-xs text-muted-foreground">
                          {Math.round(customSettings[control.key as keyof typeof customSettings] * 100)}%
                        </span>
                      </div>
                      <input
                        type="range"
                        min={control.min}
                        max={control.max}
                        step={control.step}
                        value={customSettings[control.key as keyof typeof customSettings]}
                        onChange={(e) => handleSettingChange(control.key, parseFloat(e.target.value))}
                        className="w-full h-1.5 bg-muted rounded-lg appearance-none cursor-pointer slider"
                        aria-label={`${control.label} adjustment control`}
                        title={`Adjust ${control.label.toLowerCase()} from ${control.min} to ${control.max}`}
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Test & Playback */}
        <motion.div variants={itemVariants}>
          <Card className="p-6">
            <div className="text-center space-y-6">
              {/* Test Input */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Test your voice with sample text
                </label>
                <textarea
                  placeholder="Type something to test your customized voice..."
                  className={`w-full h-20 p-3 rounded-lg border resize-none focus:outline-none focus:ring-2 focus:ring-primary/20 transition-colors ${
                    theme === 'dark'
                      ? 'bg-slate-800 border-slate-700 text-white placeholder-slate-400'
                      : 'bg-white border-slate-200 text-slate-900 placeholder-slate-500'
                  }`}
                />
              </div>

              {/* Playback Controls */}
              <div className="flex items-center justify-center space-x-6">
                <Button
                  onClick={handleRecord}
                  variant={isRecording ? "destructive" : "outline"}
                  size="lg"
                  className="w-14 h-14 rounded-full"
                >
                  <MicrophoneIcon className="w-6 h-6" />
                </Button>

                <Button
                  onClick={handlePlay}
                  size="lg"
                  className="w-16 h-16 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white shadow-lg"
                >
                  {isPlaying ? (
                    <PauseIconSolid className="w-8 h-8" />
                  ) : (
                    <PlayIconSolid className="w-8 h-8" />
                  )}
                </Button>

                <Button
                  variant="outline"
                  size="lg"
                  className="w-14 h-14 rounded-full"
                >
                  <StopIconSolid className="w-6 h-6" />
                </Button>
              </div>

              {/* Action Buttons */}
              <div className="flex space-x-3">
                <Button className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white">
                  <SpeakerWaveIcon className="w-4 h-4 mr-2" />
                  Generate Voice
                </Button>
                <Button variant="outline" className="flex-1">
                  <SaveIcon className="w-4 h-4 mr-2" />
                  Save Preset
                </Button>
              </div>

              <div className="flex space-x-3">
                <Button variant="outline" size="sm">
                  <DownloadIcon className="w-4 h-4 mr-2" />
                  Export
                </Button>
                <Button variant="outline" size="sm">
                  <ShareIcon className="w-4 h-4 mr-2" />
                  Share
                </Button>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Audio Visualization */}
        {(isPlaying || isRecording) && (
          <motion.div
            variants={itemVariants}
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
          >
            <Card className="p-4">
              <div className="flex items-end justify-center space-x-1 h-16 bg-muted/50 rounded-lg p-2">
                {[...Array(25)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="w-1 bg-primary rounded-full"
                    animate={{
                      height: (isPlaying || isRecording) ? Math.random() * 48 + 8 : 4
                    }}
                    transition={{
                      duration: 0.1,
                      repeat: isPlaying || isRecording ? Infinity : 0,
                      repeatType: "reverse"
                    }}
                  />
                ))}
              </div>
              <p className="text-xs text-center text-muted-foreground mt-2">
                {isRecording ? 'Recording...' : isPlaying ? 'Playing...' : 'Audio waveform'}
              </p>
            </Card>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
};

export default VoiceCustomizer;
