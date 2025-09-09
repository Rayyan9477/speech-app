import React, { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import WaveformAudioPlayer from './WaveformAudioPlayer';
import { TextBlock } from '../../contexts/TTSProjectContext';
import {
  PlayIcon,
  PauseIcon,
  EllipsisVerticalIcon,
  Bars3Icon,
  XMarkIcon,
  SpeakerWaveIcon
} from '@heroicons/react/24/outline';

interface DraggableTextBlockProps {
  block: TextBlock;
  index: number;
  onUpdate: (updates: Partial<TextBlock>) => void;
  onRemove: () => void;
  onPlay: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onGenerateAudio: () => void;
  isFirst: boolean;
  isLast: boolean;
  isDragEnabled?: boolean;
  className?: string;
}

const DraggableTextBlock: React.FC<DraggableTextBlockProps> = ({
  block,
  index,
  onUpdate,
  onRemove,
  onPlay,
  onMoveUp,
  onMoveDown,
  onGenerateAudio,
  isFirst,
  isLast,
  isDragEnabled = true,
  className = ''
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [showOptions, setShowOptions] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  
  const blockRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<HTMLDivElement>(null);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (!isDragEnabled || !dragRef.current) return;
    
    e.preventDefault();
    setIsDragging(true);
    
    const rect = dragRef.current.getBoundingClientRect();
    setDragOffset({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    });

    const handleMouseMove = (e: MouseEvent) => {
      if (dragRef.current) {
        dragRef.current.style.transform = `translate(${e.clientX - dragOffset.x}px, ${e.clientY - dragOffset.y}px)`;
        dragRef.current.style.zIndex = '1000';
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      if (dragRef.current) {
        dragRef.current.style.transform = '';
        dragRef.current.style.zIndex = '';
      }
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  }, [isDragEnabled, dragOffset.x, dragOffset.y]);

  const handleContentChange = useCallback((content: string) => {
    onUpdate({ content });
  }, [onUpdate]);

  const handlePlayToggle = useCallback(() => {
    if (block.audioUrl) {
      onPlay();
    } else {
      onGenerateAudio();
    }
  }, [block.audioUrl, onPlay, onGenerateAudio]);

  const blockVariants: any = {
    hidden: { opacity: 0, y: 20, scale: 0.95 },
    visible: { 
      opacity: 1, 
      y: 0, 
      scale: 1,
      transition: { duration: 0.3, ease: "easeOut" }
    },
    exit: { 
      opacity: 0, 
      y: -20, 
      scale: 0.95,
      transition: { duration: 0.2 }
    }
  };

  const dragVariants: any = {
    dragging: { 
      scale: 1.05, 
      rotate: 2,
      boxShadow: "0 10px 30px rgba(0,0,0,0.3)",
      transition: { duration: 0.1 }
    },
    notDragging: { 
      scale: 1, 
      rotate: 0,
      boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
      transition: { duration: 0.2 }
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        ref={blockRef}
        variants={blockVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
        className={`relative ${className}`}
      >
        <motion.div
          ref={dragRef}
          variants={dragVariants}
          animate={isDragging ? "dragging" : "notDragging"}
        >
          <Card className={`p-4 transition-all duration-200 ${isDragging ? 'cursor-grabbing' : 'cursor-default'} ${block.isPlaying ? 'ring-2 ring-blue-500' : ''}`}>
            <div className="flex items-start space-x-3">
              {/* Drag Handle */}
              <div className="flex flex-col items-center space-y-2 flex-shrink-0">
                <div
                  onMouseDown={handleMouseDown}
                  className={`p-2 rounded-md hover:bg-muted/50 transition-colors ${isDragEnabled ? 'cursor-grab' : 'cursor-not-allowed'} ${isDragging ? 'cursor-grabbing' : ''}`}
                  title={isDragEnabled ? "Drag to reorder" : "Drag disabled"}
                >
                  <Bars3Icon className="w-5 h-5 text-muted-foreground" />
                </div>
                
                {/* Block Number */}
                <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center">
                  <span className="text-xs font-medium text-primary">{index + 1}</span>
                </div>
              </div>

              {/* Content Area */}
              <div className="flex-1 min-w-0">
                <div className="space-y-3">
                  {/* Text Input */}
                  <textarea
                    value={block.content}
                    onChange={(e) => handleContentChange(e.target.value)}
                    placeholder="Enter your text here..."
                    className="w-full min-h-[80px] p-3 border rounded-lg resize-none bg-transparent focus:outline-none focus:ring-2 focus:ring-primary/20 transition-colors"
                    rows={3}
                  />

                  {/* Audio Visualization */}
                  {(block.audioUrl || block.waveformData) && (
                    <div className="mt-3">
                      <WaveformAudioPlayer
                        audioUrl={block.audioUrl}
                        waveformData={block.waveformData}
                        isPlaying={block.isPlaying}
                        onPlayStateChange={(playing) => onUpdate({ isPlaying: playing })}
                        showControls={true}
                        showWaveform={true}
                        className="bg-muted/20"
                        title={`Block ${index + 1} Audio`}
                      />
                    </div>
                  )}

                  {/* Block Stats */}
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <div className="flex items-center space-x-4">
                      <span>{block.content.length} characters</span>
                      <span>~{Math.ceil(block.content.length / 150)} min</span>
                      {block.duration > 0 && (
                        <span>{Math.floor(block.duration)}s audio</span>
                      )}
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      {block.voice && (
                        <span className="text-xs bg-muted/50 px-2 py-1 rounded">
                          {block.voice.name}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Controls */}
              <div className="flex flex-col space-y-2 flex-shrink-0">
                {/* Play Button */}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handlePlayToggle}
                  className="p-2"
                  title={block.audioUrl ? "Play audio" : "Generate and play audio"}
                >
                  {block.audioUrl ? (
                    block.isPlaying ? (
                      <PauseIcon className="w-5 h-5 text-blue-500" />
                    ) : (
                      <PlayIcon className="w-5 h-5 text-blue-500" />
                    )
                  ) : (
                    <SpeakerWaveIcon className="w-5 h-5 text-muted-foreground" />
                  )}
                </Button>

                {/* Options Menu */}
                <div className="relative">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="p-2"
                    onClick={() => setShowOptions(!showOptions)}
                  >
                    <EllipsisVerticalIcon className="w-5 h-5 text-muted-foreground" />
                  </Button>

                  <AnimatePresence>
                    {showOptions && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: -10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: -10 }}
                        className="absolute right-0 top-full mt-1 w-48 bg-background border rounded-lg shadow-lg z-50"
                      >
                        <div className="py-1">
                          <button
                            onClick={() => {
                              onGenerateAudio();
                              setShowOptions(false);
                            }}
                            className="w-full px-3 py-2 text-left text-sm hover:bg-muted/50 transition-colors"
                          >
                            Generate Audio
                          </button>
                          
                          <div className="border-t my-1"></div>
                          
                          <button
                            onClick={() => {
                              onMoveUp();
                              setShowOptions(false);
                            }}
                            disabled={isFirst}
                            className="w-full px-3 py-2 text-left text-sm hover:bg-muted/50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            Move Up
                          </button>
                          
                          <button
                            onClick={() => {
                              onMoveDown();
                              setShowOptions(false);
                            }}
                            disabled={isLast}
                            className="w-full px-3 py-2 text-left text-sm hover:bg-muted/50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            Move Down
                          </button>
                          
                          <div className="border-t my-1"></div>
                          
                          <button
                            onClick={() => {
                              setIsExpanded(!isExpanded);
                              setShowOptions(false);
                            }}
                            className="w-full px-3 py-2 text-left text-sm hover:bg-muted/50 transition-colors"
                          >
                            {isExpanded ? 'Collapse' : 'Expand'}
                          </button>
                          
                          <div className="border-t my-1"></div>
                          
                          <button
                            onClick={() => {
                              onRemove();
                              setShowOptions(false);
                            }}
                            className="w-full px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-950 transition-colors"
                          >
                            Remove Block
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </div>

            {/* Expanded Content */}
            <AnimatePresence>
              {isExpanded && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mt-4 pt-4 border-t"
                >
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <label className="font-medium text-muted-foreground">Voice:</label>
                      <p>{block.voice?.name || 'No voice selected'}</p>
                    </div>
                    <div>
                      <label className="font-medium text-muted-foreground">Duration:</label>
                      <p>{block.duration ? `${Math.floor(block.duration)}s` : 'Not generated'}</p>
                    </div>
                    <div>
                      <label className="font-medium text-muted-foreground">Word Count:</label>
                      <p>{block.content.split(' ').filter(w => w.length > 0).length} words</p>
                    </div>
                    <div>
                      <label className="font-medium text-muted-foreground">Status:</label>
                      <p className={`font-medium ${block.audioUrl ? 'text-green-600' : 'text-yellow-600'}`}>
                        {block.audioUrl ? 'Generated' : 'Pending'}
                      </p>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Loading Indicator */}
            {isDragging && (
              <div className="absolute inset-0 bg-background/80 flex items-center justify-center rounded-lg">
                <div className="text-sm text-muted-foreground">Moving block...</div>
              </div>
            )}
          </Card>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default DraggableTextBlock;