import React, { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { Card, CardContent } from '../ui/card';
import { apiClient } from '../../api/client';
import { Slider } from '../ui/slider';

interface TTSControlsProps {
  text: string;
  onAudioGenerated: (audioUrl: string) => void;
  onError: (error: string) => void;
  selectedVoiceClone?: string;
}

const TTSControls: React.FC<TTSControlsProps> = ({ 
  text, 
  onAudioGenerated, 
  onError,
  selectedVoiceClone 
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [language, setLanguage] = useState('en');
  const [voiceStyle, setVoiceStyle] = useState('neutral');
  const [emotion, setEmotion] = useState('neutral');
  const [speed, setSpeed] = useState(1.0);
  const [pitch, setPitch] = useState(1.0);
  
  const [availableVoices, setAvailableVoices] = useState<{
    voice_styles: string[];
    emotions: string[];
    languages: string[];
  }>({
    voice_styles: [],
    emotions: [],
    languages: []
  });

  useEffect(() => {
    const loadAvailableVoices = async () => {
      try {
        const voices = await apiClient.getAvailableVoices();
        setAvailableVoices(voices);
        
        // Set defaults if available
        if (voices.voice_styles.length > 0 && !voices.voice_styles.includes('neutral')) {
          setVoiceStyle(voices.voice_styles[0]);
        }
        if (voices.emotions.length > 0 && !voices.emotions.includes('neutral')) {
          setEmotion(voices.emotions[0]);
        }
        if (voices.languages.length > 0 && !voices.languages.includes('en')) {
          setLanguage(voices.languages[0]);
        }
      } catch (error) {
        console.error('Failed to load available voices:', error);
      }
    };

    loadAvailableVoices();
  }, []);

  const handleSynthesize = async () => {
    if (!text.trim()) {
      onError('Please enter text to synthesize');
      return;
    }

    setIsLoading(true);
    try {
      if (selectedVoiceClone) {
        // Use voice cloning
        const response = await apiClient.synthesizeWithClonedVoice(
          text, 
          selectedVoiceClone, 
          language
        );
        onAudioGenerated(response.audio_path);
      } else {
        // Use regular TTS
        const response = await apiClient.synthesizeSpeech(
          text,
          language,
          voiceStyle,
          emotion,
          speed,
          pitch
        );
        const audioUrl = apiClient.getAudioFile(response.filename);
        onAudioGenerated(audioUrl);
      }
    } catch (error) {
      onError(error instanceof Error ? error.message : 'Speech synthesis failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardContent className="p-6">
        <h3 className="text-xl font-semibold mb-4">
          {selectedVoiceClone ? 'Voice Clone Synthesis' : 'Advanced Text-to-Speech'}
        </h3>

        <div className="space-y-6">
          {/* Language Selection */}
          <div>
            <label htmlFor="language" className="block text-sm font-medium text-gray-700 mb-2">
              Language
            </label>
            <select
              id="language"
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {availableVoices.languages.map((lang) => (
                <option key={lang} value={lang}>
                  {lang.toUpperCase()}
                </option>
              ))}
            </select>
          </div>

          {/* Voice Clone Info */}
          {selectedVoiceClone && (
            <div className="p-3 bg-green-50 rounded-lg">
              <div className="text-sm text-green-800">
                <strong>Using Voice Clone:</strong> {selectedVoiceClone.substring(0, 8)}...
              </div>
              <div className="text-xs text-green-600 mt-1">
                Voice cloning will override style and emotion settings
              </div>
            </div>
          )}

          {/* Regular TTS Controls (only show if no voice clone selected) */}
          {!selectedVoiceClone && (
            <>
              {/* Voice Style */}
              <div>
                <label htmlFor="voice-style" className="block text-sm font-medium text-gray-700 mb-2">
                  Voice Style
                </label>
                <select
                  id="voice-style"
                  value={voiceStyle}
                  onChange={(e) => setVoiceStyle(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {availableVoices.voice_styles.map((style) => (
                    <option key={style} value={style}>
                      {style.charAt(0).toUpperCase() + style.slice(1)}
                    </option>
                  ))}
                </select>
              </div>

              {/* Emotion */}
              <div>
                <label htmlFor="emotion" className="block text-sm font-medium text-gray-700 mb-2">
                  Emotion
                </label>
                <select
                  id="emotion"
                  value={emotion}
                  onChange={(e) => setEmotion(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {availableVoices.emotions.map((emo) => (
                    <option key={emo} value={emo}>
                      {emo.charAt(0).toUpperCase() + emo.slice(1)}
                    </option>
                  ))}
                </select>
              </div>

              {/* Speed Control */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Speed: {speed.toFixed(1)}x
                </label>
                <Slider
                  value={[speed]}
                  onValueChange={(value) => setSpeed(value[0])}
                  min={0.5}
                  max={2.0}
                  step={0.1}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>0.5x (Slower)</span>
                  <span>2.0x (Faster)</span>
                </div>
              </div>

              {/* Pitch Control */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Pitch: {pitch.toFixed(1)}x
                </label>
                <Slider
                  value={[pitch]}
                  onValueChange={(value) => setPitch(value[0])}
                  min={0.5}
                  max={2.0}
                  step={0.1}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>0.5x (Lower)</span>
                  <span>2.0x (Higher)</span>
                </div>
              </div>
            </>
          )}

          {/* Generate Button */}
          <Button
            onClick={handleSynthesize}
            disabled={isLoading || !text.trim()}
            className="w-full"
          >
            {isLoading 
              ? 'Generating Speech...' 
              : selectedVoiceClone 
                ? 'Generate with Cloned Voice'
                : 'Generate Speech'
            }
          </Button>

          {/* Character Count */}
          <div className="text-xs text-gray-500 text-center">
            {text.length}/5000 characters
            {text.length > 5000 && (
              <span className="text-red-500 ml-2">Text too long</span>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default TTSControls;