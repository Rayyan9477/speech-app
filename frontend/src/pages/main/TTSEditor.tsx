import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui/button';
import { Card } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { Slider } from '../../components/ui/slider';
import { Avatar, AvatarFallback, AvatarImage } from '../../components/ui/avatar';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../components/ui/dialog';
import { useTheme } from '../../lib/theme-provider';
import {
  ArrowLeftIcon,
  EllipsisVerticalIcon,
  PlayIcon,
  PauseIcon,
  StopIcon,
  PlusIcon,
  Bars3Icon,
  ChevronDownIcon,
  AdjustmentsHorizontalIcon,
  ShareIcon,
  ArrowDownTrayIcon,
  ClockIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';

interface TextBlock {
  id: string;
  content: string;
  voice: Voice;
  isPlaying: boolean;
  duration: number;
}

interface Voice {
  id: string;
  name: string;
  gender: string;
  language: string;
  avatar: string;
  isPremium: boolean;
}

interface AudioSettings {
  pitch: number;
  speed: number;
  pause: number;
}

const TTSEditor = () => {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const [projectTitle, setProjectTitle] = useState('Nikka Shoes Promotions Au...');
  const [selectedVoice, setSelectedVoice] = useState<Voice>({
    id: '1',
    name: 'Olivia',
    gender: 'F',
    language: 'English',
    avatar: '/api/placeholder/48/48',
    isPremium: false
  });
  
  const [textBlocks, setTextBlocks] = useState<TextBlock[]>([
    {
      id: '1',
      content: 'Enter your text here...',
      voice: selectedVoice,
      isPlaying: false,
      duration: 0
    }
  ]);

  const [audioSettings, setAudioSettings] = useState<AudioSettings>({
    pitch: 0,
    speed: 0,
    pause: 0
  });

  const [showVoiceSelector, setShowVoiceSelector] = useState(false);
  const [showExportDialog, setShowExportDialog] = useState(false);
  const [showSettingsPanel, setShowSettingsPanel] = useState<'pitch' | 'speed' | 'pause' | null>(null);
  const [activeTab, setActiveTab] = useState('ai-voices');

  const availableVoices: Voice[] = [
    {
      id: '1',
      name: 'Olivia',
      gender: 'F',
      language: 'English',
      avatar: '/api/placeholder/48/48',
      isPremium: false
    },
    {
      id: '2',
      name: 'Marcus',
      gender: 'M',
      language: 'English',
      avatar: '/api/placeholder/48/48',
      isPremium: true
    },
    {
      id: '3',
      name: 'Luna',
      gender: 'F',
      language: 'Spanish',
      avatar: '/api/placeholder/48/48',
      isPremium: false
    }
  ];

  const myVoices: Voice[] = [
    {
      id: '4',
      name: 'My Voice Clone',
      gender: 'F',
      language: 'English',
      avatar: '/api/placeholder/48/48',
      isPremium: false
    }
  ];

  const favoriteVoices: Voice[] = [
    {
      id: '1',
      name: 'Olivia',
      gender: 'F',
      language: 'English',
      avatar: '/api/placeholder/48/48',
      isPremium: false
    }
  ];

  const addTextBlock = () => {
    const newBlock: TextBlock = {
      id: Date.now().toString(),
      content: 'Enter your text here...',
      voice: selectedVoice,
      isPlaying: false,
      duration: 0
    };
    setTextBlocks([...textBlocks, newBlock]);
  };

  const updateTextBlock = (id: string, content: string) => {
    setTextBlocks(textBlocks.map(block =>
      block.id === id ? { ...block, content } : block
    ));
  };

  const removeTextBlock = (id: string) => {
    if (textBlocks.length > 1) {
      setTextBlocks(textBlocks.filter(block => block.id !== id));
    }
  };

  const togglePlayBlock = (id: string) => {
    setTextBlocks(textBlocks.map(block =>
      block.id === id ? { ...block, isPlaying: !block.isPlaying } : block
    ));
  };

  const selectVoice = (voice: Voice) => {
    setSelectedVoice(voice);
    setShowVoiceSelector(false);
  };

  return (
    <div className="min-h-screen pb-20">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="py-4"
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6 px-4">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate(-1)}
              className="p-2"
            >
              <ArrowLeftIcon className="w-5 h-5" />
            </Button>
            <h1 className="text-lg font-bold text-foreground truncate max-w-48">
              {projectTitle}
            </h1>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowExportDialog(true)}
              className="bg-blue-500 hover:bg-blue-600 text-white border-blue-500"
            >
              Export
            </Button>
            <Button variant="ghost" size="sm" className="p-2">
              <EllipsisVerticalIcon className="w-5 h-5 text-muted-foreground" />
            </Button>
          </div>
        </div>

        {/* Voice Selector */}
        <div className="px-4 mb-6">
          <Button
            variant="outline"
            onClick={() => setShowVoiceSelector(true)}
            className="w-full justify-between p-4 h-auto"
          >
            <div className="flex items-center space-x-3">
              <Avatar className="w-10 h-10">
                <AvatarImage src={selectedVoice.avatar} />
                <AvatarFallback>{selectedVoice.name[0]}</AvatarFallback>
              </Avatar>
              <div className="text-left">
                <div className="font-medium">{selectedVoice.name} ({selectedVoice.gender}) - {selectedVoice.language}</div>
                <div className="text-sm text-muted-foreground flex items-center">
                  <span className="mr-2">🇺🇸</span>
                </div>
              </div>
            </div>
            <ChevronDownIcon className="w-5 h-5 text-muted-foreground" />
          </Button>
        </div>

        {/* Audio Controls */}
        <div className="px-4 mb-6">
          <div className="grid grid-cols-4 gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowSettingsPanel('pitch')}
              className="flex flex-col items-center py-3 h-auto"
            >
              <span className="text-xs font-medium">Pitch</span>
              <span className="text-lg font-bold">{audioSettings.pitch}%</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowSettingsPanel('speed')}
              className="flex flex-col items-center py-3 h-auto"
            >
              <span className="text-xs font-medium">Speed</span>
              <span className="text-lg font-bold">{audioSettings.speed}%</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowSettingsPanel('pause')}
              className="flex flex-col items-center py-3 h-auto"
            >
              <span className="text-xs font-medium">Add Pause</span>
              <ClockIcon className="w-5 h-5" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="flex flex-col items-center py-3 h-auto"
            >
              <span className="text-xs font-medium">Pronunciation</span>
              <span className="text-xs">ABC</span>
            </Button>
          </div>
        </div>

        {/* Script Section */}
        <div className="px-4 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Script</h2>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-muted-foreground">0 s</span>
              <Button variant="ghost" size="sm" className="p-2">
                <PlayIcon className="w-5 h-5 text-blue-500" />
              </Button>
            </div>
          </div>

          {/* Text Blocks */}
          <div className="space-y-4">
            {textBlocks.map((block, index) => (
              <Card key={block.id} className="p-4">
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 mt-1">
                    <Bars3Icon className="w-5 h-5 text-muted-foreground cursor-move" />
                  </div>
                  <div className="flex-1">
                    <textarea
                      value={block.content}
                      onChange={(e) => updateTextBlock(block.id, e.target.value)}
                      placeholder="Enter your text here..."
                      className="w-full min-h-[80px] p-3 border rounded-lg resize-none bg-transparent"
                      rows={3}
                    />
                  </div>
                  <div className="flex flex-col space-y-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => togglePlayBlock(block.id)}
                      className="p-2"
                    >
                      {block.isPlaying ? (
                        <PauseIcon className="w-5 h-5 text-blue-500" />
                      ) : (
                        <PlayIcon className="w-5 h-5 text-blue-500" />
                      )}
                    </Button>
                    <Button variant="ghost" size="sm" className="p-2">
                      <EllipsisVerticalIcon className="w-5 h-5 text-muted-foreground" />
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          {/* Add Block Button */}
          <Button
            variant="outline"
            onClick={addTextBlock}
            className="w-full mt-4 py-3 border-dashed border-2 flex items-center justify-center space-x-2 hover:border-blue-500 hover:text-blue-500"
          >
            <PlusIcon className="w-5 h-5" />
            <span>Add a Block</span>
          </Button>
        </div>
      </motion.div>

      {/* Voice Selector Modal */}
      <Dialog open={showVoiceSelector} onOpenChange={setShowVoiceSelector}>
        <DialogContent className="max-w-md max-h-[80vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle>Select AI Voice</DialogTitle>
          </DialogHeader>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="ai-voices">AI Voices</TabsTrigger>
              <TabsTrigger value="my-voices">My Voices</TabsTrigger>
              <TabsTrigger value="favorites">Favorites</TabsTrigger>
            </TabsList>
            
            <div className="flex-1 overflow-y-auto mt-4">
              <TabsContent value="ai-voices" className="space-y-3 mt-0">
                {availableVoices.map((voice) => (
                  <Card
                    key={voice.id}
                    className="p-3 cursor-pointer hover:shadow-md transition-all"
                    onClick={() => selectVoice(voice)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <Avatar className="w-10 h-10">
                          <AvatarImage src={voice.avatar} />
                          <AvatarFallback>{voice.name[0]}</AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium">{voice.name} ({voice.gender})</div>
                          <div className="text-sm text-muted-foreground">{voice.language}</div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button variant="ghost" size="sm" className="p-2">
                          <PlayIcon className="w-4 h-4 text-blue-500" />
                        </Button>
                        <Button size="sm" className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded-full text-xs">
                          Select
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </TabsContent>
              
              <TabsContent value="my-voices" className="space-y-3 mt-0">
                {myVoices.map((voice) => (
                  <Card
                    key={voice.id}
                    className="p-3 cursor-pointer hover:shadow-md transition-all"
                    onClick={() => selectVoice(voice)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <Avatar className="w-10 h-10">
                          <AvatarImage src={voice.avatar} />
                          <AvatarFallback>{voice.name[0]}</AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium">{voice.name}</div>
                          <div className="text-sm text-muted-foreground">{voice.language}</div>
                        </div>
                      </div>
                      <Button size="sm" className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded-full text-xs">
                        Select
                      </Button>
                    </div>
                  </Card>
                ))}
              </TabsContent>
              
              <TabsContent value="favorites" className="space-y-3 mt-0">
                {favoriteVoices.map((voice) => (
                  <Card
                    key={voice.id}
                    className="p-3 cursor-pointer hover:shadow-md transition-all"
                    onClick={() => selectVoice(voice)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <Avatar className="w-10 h-10">
                          <AvatarImage src={voice.avatar} />
                          <AvatarFallback>{voice.name[0]}</AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium">{voice.name} ({voice.gender})</div>
                          <div className="text-sm text-muted-foreground">{voice.language}</div>
                        </div>
                      </div>
                      <Button size="sm" className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded-full text-xs">
                        Select
                      </Button>
                    </div>
                  </Card>
                ))}
              </TabsContent>
            </div>
          </Tabs>
        </DialogContent>
      </Dialog>

      {/* Export Dialog */}
      <Dialog open={showExportDialog} onOpenChange={setShowExportDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Export Settings</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Audio Format</label>
              <div className="grid grid-cols-2 gap-2">
                {['MP3', 'WAV', 'AAC', 'FLAC'].map((format) => (
                  <Button
                    key={format}
                    variant="outline"
                    className="py-2"
                  >
                    {format}
                  </Button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Quality</label>
              <div className="space-y-2">
                {['High (320 kbps)', 'Medium (192 kbps)', 'Low (128 kbps)'].map((quality) => (
                  <div key={quality} className="flex items-center">
                    <input type="radio" name="quality" className="mr-2" defaultChecked={quality.includes('High')} />
                    <label className="text-sm">{quality}</label>
                  </div>
                ))}
              </div>
            </div>
            <Button className="w-full bg-blue-500 hover:bg-blue-600 text-white">
              <ArrowDownTrayIcon className="w-4 h-4 mr-2" />
              Export Audio
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Settings Panel */}
      <AnimatePresence>
        {showSettingsPanel && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/50 flex items-end"
            onClick={() => setShowSettingsPanel(null)}
          >
            <motion.div
              initial={{ y: 300 }}
              animate={{ y: 0 }}
              exit={{ y: 300 }}
              className="w-full bg-white dark:bg-slate-900 rounded-t-2xl p-6 max-h-[60vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold capitalize">{showSettingsPanel} Settings</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowSettingsPanel(null)}
                  className="p-2"
                >
                  <XMarkIcon className="w-5 h-5" />
                </Button>
              </div>

              {showSettingsPanel === 'pitch' && (
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm">Pitch</span>
                      <span className="text-sm font-medium">{audioSettings.pitch}%</span>
                    </div>
                    <Slider
                      value={[audioSettings.pitch]}
                      onValueChange={(value) => setAudioSettings(prev => ({ ...prev, pitch: value[0] }))}
                      max={100}
                      min={-100}
                      step={1}
                      className="w-full"
                    />
                  </div>
                </div>
              )}

              {showSettingsPanel === 'speed' && (
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm">Speed</span>
                      <span className="text-sm font-medium">{audioSettings.speed}%</span>
                    </div>
                    <Slider
                      value={[audioSettings.speed]}
                      onValueChange={(value) => setAudioSettings(prev => ({ ...prev, speed: value[0] }))}
                      max={100}
                      min={-100}
                      step={1}
                      className="w-full"
                    />
                  </div>
                </div>
              )}

              {showSettingsPanel === 'pause' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-3 gap-3">
                    {[0.5, 1.0, 2.0].map((duration) => (
                      <Button
                        key={duration}
                        variant="outline"
                        className="py-3 flex flex-col items-center"
                      >
                        <span className="text-lg font-bold">{duration}s</span>
                        <span className="text-xs">Short</span>
                      </Button>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default TTSEditor;