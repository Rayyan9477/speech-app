'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { 
  ArrowLeftIcon, 
  PlayIcon, 
  PauseIcon, 
  SpeakerWaveIcon,
  Cog6ToothIcon,
  DocumentDuplicateIcon,
  ShareIcon
} from '@heroicons/react/24/outline';
import { HeartIcon } from '@heroicons/react/24/solid';

const voiceCategories = [
  {
    id: 'ai-voices',
    name: 'AI Voices',
    voices: [
      { id: 'sarah', name: 'Sarah', gender: 'Female', accent: 'American', age: 'Young Adult', preview: 'Hello, this is Sarah speaking...', avatar: '👩' },
      { id: 'james', name: 'James', gender: 'Male', accent: 'British', age: 'Middle-aged', preview: 'Good day, I\'m James...', avatar: '👨' },
      { id: 'maria', name: 'Maria', gender: 'Female', accent: 'Spanish', age: 'Young Adult', preview: 'Hola, soy Maria...', avatar: '👩‍🦱' },
      { id: 'david', name: 'David', gender: 'Male', accent: 'Australian', age: 'Young Adult', preview: 'G\'day mate, I\'m David...', avatar: '👨‍🦲' }
    ]
  },
  {
    id: 'my-voices',
    name: 'My Voices',
    voices: [
      { id: 'custom1', name: 'My Voice', gender: 'Custom', accent: 'Personal', age: 'Custom', preview: 'This is your cloned voice...', avatar: '🎭' }
    ]
  },
  {
    id: 'favorites',
    name: 'Favorites',
    voices: [
      { id: 'sarah', name: 'Sarah', gender: 'Female', accent: 'American', age: 'Young Adult', preview: 'Hello, this is Sarah speaking...', avatar: '👩' }
    ]
  }
];

const audioBlocks = [
  { id: 1, text: 'Welcome to our comprehensive guide on artificial intelligence and its applications in modern business.', duration: '4.2s' },
  { id: 2, text: 'In this section, we\'ll explore how AI is revolutionizing various industries.', duration: '3.8s' },
  { id: 3, text: 'From healthcare to finance, AI is making significant impacts everywhere.', duration: '4.1s' }
];

export default function TTSEditorPage() {
  const [selectedVoiceCategory, setSelectedVoiceCategory] = useState('ai-voices');
  const [selectedVoice, setSelectedVoice] = useState(voiceCategories[0].voices[0]);
  const [scriptText, setScriptText] = useState('');
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentBlock, setCurrentBlock] = useState<number | null>(null);
  const [pitch, setPitch] = useState([1]);
  const [speed, setSpeed] = useState([1]);
  const [volume, setVolume] = useState([0.8]);
  const [showAdvanced, setShowAdvanced] = useState(false);
  
  const router = useRouter();
  const searchParams = useSearchParams();
  const projectName = searchParams.get('name') || 'Untitled Project';

  useEffect(() => {
    // Load template content if specified
    const template = searchParams.get('template');
    if (template && template !== 'blank') {
      const templateData = {
        'product-demo': 'Introducing our revolutionary new product that will transform the way you work and increase your productivity by 200%.',
        'podcast-intro': 'Welcome to [Podcast Name], the show where we dive deep into the latest trends and innovations that are shaping our future.',
        'tutorial': 'In this comprehensive tutorial, we\'ll walk you through step-by-step how to master this essential skill.',
        'advertisement': 'Don\'t miss out on this limited-time offer. Get 50% off when you order now and transform your life today!'
      };
      setScriptText(templateData[template as keyof typeof templateData] || '');
    }
  }, [searchParams]);

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const handleVoiceSelect = (voice: any) => {
    setSelectedVoice(voice);
  };

  const handleBlockPlay = (blockId: number) => {
    setCurrentBlock(currentBlock === blockId ? null : blockId);
  };

  const handleGenerate = () => {
    // Generate audio from text
    console.log('Generating audio...');
  };

  const handleExport = () => {
    router.push('/dashboard/tts/export');
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Header */}
      <div className="sticky top-0 bg-white border-b border-gray-200 z-10">
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center space-x-3">
            <Button variant="ghost" size="icon" onClick={() => router.back()}>
              <ArrowLeftIcon className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-lg font-semibold text-gray-900">{projectName}</h1>
              <p className="text-sm text-gray-500">Text-to-Speech Editor</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="icon">
              <ShareIcon className="w-5 h-5" />
            </Button>
            <Button variant="ghost" size="icon" onClick={() => setShowAdvanced(!showAdvanced)}>
              <Cog6ToothIcon className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </div>

      <div className="flex-1 flex flex-col">
        {/* Voice Selection */}
        <div className="border-b border-gray-200 bg-gray-50">
          <div className="px-6 py-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-medium text-gray-900">Selected Voice</h2>
              <Button variant="outline" size="sm" onClick={handlePlayPause}>
                {isPlaying ? <PauseIcon className="w-4 h-4 mr-2" /> : <PlayIcon className="w-4 h-4 mr-2" />}
                Preview
              </Button>
            </div>

            <div className="bg-white rounded-lg p-3 border border-gray-200">
              <div className="flex items-center space-x-3">
                <div className="text-2xl">{selectedVoice.avatar}</div>
                <div className="flex-1">
                  <h3 className="font-medium text-gray-900">{selectedVoice.name}</h3>
                  <p className="text-sm text-gray-500">
                    {selectedVoice.gender} • {selectedVoice.accent} • {selectedVoice.age}
                  </p>
                </div>
                <Button variant="ghost" size="sm" onClick={() => router.push('/dashboard/tts/voice-selection')}>
                  Change
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Advanced Controls */}
        {showAdvanced && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="border-b border-gray-200 bg-gray-50 overflow-hidden"
          >
            <div className="px-6 py-4 space-y-4">
              <h3 className="text-sm font-medium text-gray-900">Voice Controls</h3>
              
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-2">
                    Pitch: {pitch[0].toFixed(1)}x
                  </label>
                  <Slider
                    value={pitch}
                    onValueChange={setPitch}
                    min={0.5}
                    max={2}
                    step={0.1}
                    className="w-full"
                  />
                </div>
                
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-2">
                    Speed: {speed[0].toFixed(1)}x
                  </label>
                  <Slider
                    value={speed}
                    onValueChange={setSpeed}
                    min={0.25}
                    max={2}
                    step={0.05}
                    className="w-full"
                  />
                </div>
                
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-2">
                    Volume: {Math.round(volume[0] * 100)}%
                  </label>
                  <Slider
                    value={volume}
                    onValueChange={setVolume}
                    min={0}
                    max={1}
                    step={0.05}
                    className="w-full"
                  />
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Script Editor */}
        <div className="flex-1 px-6 py-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Script</h2>
            <div className="flex space-x-2">
              <Button variant="outline" size="sm">
                <DocumentDuplicateIcon className="w-4 h-4 mr-2" />
                Import
              </Button>
              <Button size="sm" onClick={handleGenerate}>
                Generate Audio
              </Button>
            </div>
          </div>

          <div className="space-y-4">
            {/* Text Input */}
            <div className="relative">
              <textarea
                value={scriptText}
                onChange={(e) => setScriptText(e.target.value)}
                placeholder="Enter your text here... You can type or paste content that you want to convert to speech."
                className="w-full h-40 p-4 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-base leading-relaxed"
              />
              <div className="absolute bottom-3 right-3 text-sm text-gray-400">
                {scriptText.length} characters
              </div>
            </div>

            {/* Audio Blocks */}
            {audioBlocks.length > 0 && (
              <div>
                <h3 className="text-sm font-medium text-gray-900 mb-3">Audio Blocks</h3>
                <div className="space-y-2">
                  {audioBlocks.map((block) => (
                    <div
                      key={block.id}
                      className={`bg-gray-50 rounded-lg p-3 border transition-colors ${
                        currentBlock === block.id ? 'border-primary-500 bg-primary-50' : 'border-gray-200'
                      }`}
                    >
                      <div className="flex items-start space-x-3">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="mt-1 flex-shrink-0"
                          onClick={() => handleBlockPlay(block.id)}
                        >
                          {currentBlock === block.id ? (
                            <PauseIcon className="w-4 h-4" />
                          ) : (
                            <PlayIcon className="w-4 h-4" />
                          )}
                        </Button>
                        
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-gray-900 leading-relaxed">{block.text}</p>
                          <p className="text-xs text-gray-500 mt-1">Duration: {block.duration}</p>
                        </div>
                        
                        <div className="flex items-center space-x-1 flex-shrink-0">
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <SpeakerWaveIcon className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Bottom Actions */}
        <div className="sticky bottom-0 bg-white border-t border-gray-200 p-6">
          <div className="flex space-x-3">
            <Button variant="outline" className="flex-1">
              Save Draft
            </Button>
            <Button onClick={handleExport} className="flex-1">
              Export
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}