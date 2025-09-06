import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { Input } from '../ui/input';
import { Progress } from '../ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { useTheme } from '../../lib/theme-provider';
import { useTTSProject } from '../../contexts/TTSProjectContext';
import { useTTSAPI } from '../../hooks/useTTSAPI';
import DraggableTextBlock from './DraggableTextBlock';
import WaveformAudioPlayer from './WaveformAudioPlayer';
import {
  ArrowLeftIcon,
  EllipsisVerticalIcon,
  PlusIcon,
  PlayIcon,
  PauseIcon,
  StopIcon,
  ChevronDownIcon,
  ShareIcon,
  ArrowDownTrayIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';

const EnhancedTTSEditor = () => {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const {
    state,
    setProjectTitle,
    addTextBlock,
    updateTextBlock,
    removeTextBlock,
    selectVoice,
    generateAudioForBlock,
    generateAudioForAllBlocks
  } = useTTSProject();
  
  const { 
    generateSpeech,
    isGenerating,
    progress,
    error,
    clearError
  } = useTTSAPI();

  const [showVoiceSelector, setShowVoiceSelector] = useState(false);
  const [showExportDialog, setShowExportDialog] = useState(false);
  const [activeTab, setActiveTab] = useState('ai-voices');
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentPlayingBlock, setCurrentPlayingBlock] = useState<string | null>(null);

  // Auto-save project title
  useEffect(() => {
    if (state.metadata.title !== 'New TTS Project') {
      document.title = `${state.metadata.title} - TTS Editor`;
    }
  }, [state.metadata.title]);

  const handleTitleChange = (title: string) => {
    setProjectTitle(title);
  };

  const handleAddBlock = () => {
    addTextBlock({ voice: state.selectedVoice });
  };

  const handleUpdateBlock = (blockId: string, updates: any) => {
    updateTextBlock(blockId, updates);
  };

  const handleRemoveBlock = (blockId: string) => {
    removeTextBlock(blockId);
  };

  const handleMoveBlockUp = (index: number) => {
    if (index > 0) {
      const blocks = [...state.textBlocks];
      [blocks[index - 1], blocks[index]] = [blocks[index], blocks[index - 1]];
      // Update order and dispatch reorder
      blocks.forEach((block, idx) => {
        updateTextBlock(block.id, { order: idx });
      });
    }
  };

  const handleMoveBlockDown = (index: number) => {
    if (index < state.textBlocks.length - 1) {
      const blocks = [...state.textBlocks];
      [blocks[index], blocks[index + 1]] = [blocks[index + 1], blocks[index]];
      // Update order and dispatch reorder
      blocks.forEach((block, idx) => {
        updateTextBlock(block.id, { order: idx });
      });
    }
  };

  const handleGenerateBlockAudio = async (blockId: string) => {
    try {
      clearError();
      const block = state.textBlocks.find(b => b.id === blockId);
      if (!block) return;

      const result = await generateSpeech({
        text: block.content,
        voice: block.voice,
        settings: state.audioSettings
      });

      updateTextBlock(blockId, {
        audioUrl: result.audioUrl,
        waveformData: result.waveformData,
        duration: result.duration
      });
    } catch (err) {
      console.error('Audio generation failed:', err);
    }
  };

  const handlePlayBlock = (blockId: string) => {
    if (currentPlayingBlock === blockId) {
      setCurrentPlayingBlock(null);
      updateTextBlock(blockId, { isPlaying: false });
    } else {
      // Stop other playing blocks
      if (currentPlayingBlock) {
        updateTextBlock(currentPlayingBlock, { isPlaying: false });
      }
      setCurrentPlayingBlock(blockId);
      updateTextBlock(blockId, { isPlaying: true });
    }
  };

  const handlePlayAll = async () => {
    if (isPlaying) {
      setIsPlaying(false);
      setCurrentPlayingBlock(null);
      state.textBlocks.forEach(block => {
        updateTextBlock(block.id, { isPlaying: false });
      });
    } else {
      setIsPlaying(true);
      // Generate audio for all blocks if needed, then play sequentially
      await generateAudioForAllBlocks();
    }
  };

  const handleExport = () => {
    setShowExportDialog(true);
  };

  const calculateTotalStats = () => {
    const totalCharacters = state.textBlocks.reduce((sum, block) => sum + block.content.length, 0);
    const totalWords = state.textBlocks.reduce((sum, block) => 
      sum + block.content.split(' ').filter(w => w.length > 0).length, 0);
    const totalDuration = state.textBlocks.reduce((sum, block) => sum + (block.duration || 0), 0);
    
    return { totalCharacters, totalWords, totalDuration };
  };

  const stats = calculateTotalStats();

  return (
    <div className="min-h-screen pb-20 bg-background">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="py-4 max-w-4xl mx-auto px-4"
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4 flex-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate(-1)}
              className="p-2"
            >
              <ArrowLeftIcon className="w-5 h-5" />
            </Button>
            <Input
              value={state.metadata.title}
              onChange={(e) => handleTitleChange(e.target.value)}
              className="text-lg font-bold bg-transparent border-none p-0 focus-visible:ring-0 max-w-md"
              placeholder="Project Title"
            />
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleExport}
              className="bg-blue-500 hover:bg-blue-600 text-white border-blue-500"
              disabled={state.textBlocks.every(block => !block.audioUrl)}
            >
              Export
            </Button>
            <Button variant="ghost" size="sm" className="p-2">
              <EllipsisVerticalIcon className="w-5 h-5 text-muted-foreground" />
            </Button>
          </div>
        </div>

        {/* Error Display */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mb-4"
            >
              <Card className="p-4 bg-red-50 border-red-200 dark:bg-red-950 dark:border-red-800">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <ExclamationTriangleIcon className="w-5 h-5 text-red-600" />
                    <span className="text-red-600 text-sm font-medium">{error}</span>
                  </div>
                  <Button variant="ghost" size="sm" onClick={clearError}>
                    <XMarkIcon className="w-4 h-4" />
                  </Button>
                </div>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Generation Progress */}
        <AnimatePresence>
          {isGenerating && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mb-4"
            >
              <Card className="p-4">
                <div className="flex items-center space-x-3">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary"></div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">Generating audio...</span>
                      <span className="text-sm text-muted-foreground">{Math.round(progress)}%</span>
                    </div>
                    <Progress value={progress} className="h-2" />
                  </div>
                </div>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Voice Selector */}
        <div className="mb-6">
          <Button
            variant="outline"
            onClick={() => setShowVoiceSelector(true)}
            className="w-full justify-between p-4 h-auto"
          >
            <div className="flex items-center space-x-3">
              <Avatar className="w-10 h-10">
                <AvatarImage src={state.selectedVoice.avatar} />
                <AvatarFallback>{state.selectedVoice.name[0]}</AvatarFallback>
              </Avatar>
              <div className="text-left">
                <div className="font-medium">
                  {state.selectedVoice.name} ({state.selectedVoice.gender}) - {state.selectedVoice.language}
                </div>
                <div className="text-sm text-muted-foreground">
                  {state.selectedVoice.style} • {state.selectedVoice.provider}
                </div>
              </div>
            </div>
            <ChevronDownIcon className="w-5 h-5 text-muted-foreground" />
          </Button>
        </div>

        {/* Project Stats */}
        <Card className="mb-6 p-4">
          <div className="grid grid-cols-4 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-primary">{state.textBlocks.length}</div>
              <div className="text-sm text-muted-foreground">Blocks</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-primary">{stats.totalWords}</div>
              <div className="text-sm text-muted-foreground">Words</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-primary">{Math.floor(stats.totalDuration)}s</div>
              <div className="text-sm text-muted-foreground">Duration</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-primary">
                {state.textBlocks.filter(b => b.audioUrl).length}
              </div>
              <div className="text-sm text-muted-foreground">Generated</div>
            </div>
          </div>
        </Card>

        {/* Global Controls */}
        <div className="mb-6">
          <Card className="p-4">
            <div className="flex items-center justify-center space-x-4">
              <Button
                variant="outline"
                size="lg"
                onClick={handlePlayAll}
                className="w-16 h-16 rounded-full"
                disabled={isGenerating}
              >
                {isPlaying ? (
                  <PauseIcon className="w-6 h-6" />
                ) : (
                  <PlayIcon className="w-6 h-6" />
                )}
              </Button>
              
              <Button
                variant="outline"
                onClick={() => generateAudioForAllBlocks()}
                disabled={isGenerating}
              >
                Generate All Audio
              </Button>
            </div>
          </Card>
        </div>

        {/* Text Blocks */}
        <div className="space-y-4 mb-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Script Blocks</h2>
            <div className="text-sm text-muted-foreground">
              {stats.totalCharacters} characters • ~{Math.ceil(stats.totalCharacters / 150)} min read
            </div>
          </div>

          <AnimatePresence>
            {state.textBlocks
              .sort((a, b) => a.order - b.order)
              .map((block, index) => (
                <DraggableTextBlock
                  key={block.id}
                  block={block}
                  index={index}
                  onUpdate={(updates) => handleUpdateBlock(block.id, updates)}
                  onRemove={() => handleRemoveBlock(block.id)}
                  onPlay={() => handlePlayBlock(block.id)}
                  onMoveUp={() => handleMoveBlockUp(index)}
                  onMoveDown={() => handleMoveBlockDown(index)}
                  onGenerateAudio={() => handleGenerateBlockAudio(block.id)}
                  isFirst={index === 0}
                  isLast={index === state.textBlocks.length - 1}
                  isDragEnabled={!isGenerating}
                />
              ))
            }
          </AnimatePresence>

          {/* Add Block Button */}
          <Button
            variant="outline"
            onClick={handleAddBlock}
            className="w-full py-3 border-dashed border-2 flex items-center justify-center space-x-2 hover:border-blue-500 hover:text-blue-500"
            disabled={isGenerating}
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
                {state.voiceLibrary.aiVoices.map((voice) => (
                  <Card
                    key={voice.id}
                    className="p-3 cursor-pointer hover:shadow-md transition-all"
                    onClick={() => {
                      selectVoice(voice);
                      setShowVoiceSelector(false);
                    }}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <Avatar className="w-10 h-10">
                          <AvatarImage src={voice.avatar} />
                          <AvatarFallback>{voice.name[0]}</AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium">{voice.name} ({voice.gender})</div>
                          <div className="text-sm text-muted-foreground">
                            {voice.language} • {voice.style}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button variant="ghost" size="sm" className="p-2">
                          <PlayIcon className="w-4 h-4 text-blue-500" />
                        </Button>
                        {state.selectedVoice.id === voice.id ? (
                          <CheckCircleIcon className="w-5 h-5 text-green-500" />
                        ) : (
                          <Button size="sm" className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded-full text-xs">
                            Select
                          </Button>
                        )}
                      </div>
                    </div>
                  </Card>
                ))}
              </TabsContent>
              
              <TabsContent value="my-voices" className="space-y-3 mt-0">
                {state.voiceLibrary.myVoices.map((voice) => (
                  <Card
                    key={voice.id}
                    className="p-3 cursor-pointer hover:shadow-md transition-all"
                    onClick={() => {
                      selectVoice(voice);
                      setShowVoiceSelector(false);
                    }}
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
                      {state.selectedVoice.id === voice.id ? (
                        <CheckCircleIcon className="w-5 h-5 text-green-500" />
                      ) : (
                        <Button size="sm" className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded-full text-xs">
                          Select
                        </Button>
                      )}
                    </div>
                  </Card>
                ))}
              </TabsContent>
              
              <TabsContent value="favorites" className="space-y-3 mt-0">
                {state.voiceLibrary.favoriteVoices.map((voice) => (
                  <Card
                    key={voice.id}
                    className="p-3 cursor-pointer hover:shadow-md transition-all"
                    onClick={() => {
                      selectVoice(voice);
                      setShowVoiceSelector(false);
                    }}
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
                      {state.selectedVoice.id === voice.id ? (
                        <CheckCircleIcon className="w-5 h-5 text-green-500" />
                      ) : (
                        <Button size="sm" className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded-full text-xs">
                          Select
                        </Button>
                      )}
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
            <DialogTitle>Export Project</DialogTitle>
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
    </div>
  );
};

export default EnhancedTTSEditor;