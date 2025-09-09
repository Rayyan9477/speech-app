import React, { useRef, useState, useEffect, useCallback } from 'react';
import { Button } from '../ui/button';
import { Slider } from '../ui/slider';
import { Progress } from '../ui/progress';
import { Card } from '../ui/card';
import { 
  PlayIcon, 
  PauseIcon, 
  StopIcon, 
  SpeakerWaveIcon,
  SpeakerXMarkIcon,
  ForwardIcon,
  BackwardIcon
} from '@heroicons/react/24/outline';
import {
  PlayIcon as PlayIconSolid,
  PauseIcon as PauseIconSolid,
} from '@heroicons/react/24/solid';
import { motion, AnimatePresence } from 'framer-motion';

interface WaveformAudioPlayerProps {
  audioUrl?: string;
  waveformData?: number[];
  isPlaying?: boolean;
  onPlayStateChange?: (isPlaying: boolean) => void;
  onTimeUpdate?: (currentTime: number) => void;
  showControls?: boolean;
  showWaveform?: boolean;
  className?: string;
  title?: string;
  textSegments?: Array<{
    start: number;
    end: number;
    text: string;
  }>;
}

const WaveformAudioPlayer: React.FC<WaveformAudioPlayerProps> = ({
  audioUrl,
  waveformData = [],
  isPlaying = false,
  onPlayStateChange,
  onTimeUpdate,
  showControls = true,
  showWaveform = true,
  className = '',
  title,
  textSegments = []
}) => {
  const audioRef = useRef<HTMLAudioElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const waveformContainerRef = useRef<HTMLDivElement>(null);
  
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.8);
  const [isMuted, setIsMuted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1.0);
  const [isDragging, setIsDragging] = useState(false);

  // Audio event handlers
  const handleLoadStart = () => setIsLoading(true);
  const handleLoadedData = () => setIsLoading(false);
  
  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
      setIsLoading(false);
    }
  };

  const handleTimeUpdate = () => {
    if (audioRef.current && !isDragging) {
      const newCurrentTime = audioRef.current.currentTime;
      setCurrentTime(newCurrentTime);
      onTimeUpdate?.(newCurrentTime);
    }
  };

  const handleEnded = () => {
    setCurrentTime(0);
    onPlayStateChange?.(false);
  };

  const handleError = (e: React.SyntheticEvent<HTMLAudioElement, Event>) => {
    console.error('Audio playback error:', e);
    setIsLoading(false);
    onPlayStateChange?.(false);
  };

  // Playback controls
  const togglePlayPause = useCallback(() => {
    if (!audioRef.current || !audioUrl) return;

    try {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      onPlayStateChange?.(!isPlaying);
    } catch (error) {
      console.error('Playback error:', error);
    }
  }, [isPlaying, audioUrl, onPlayStateChange]);

  const handleStop = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      setCurrentTime(0);
      onPlayStateChange?.(false);
    }
  }, [onPlayStateChange]);

  const handleSeek = useCallback((newTime: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = newTime;
      setCurrentTime(newTime);
      onTimeUpdate?.(newTime);
    }
  }, [onTimeUpdate]);

  const handleVolumeChange = useCallback((newVolume: number) => {
    if (audioRef.current) {
      audioRef.current.volume = newVolume;
      setVolume(newVolume);
      setIsMuted(newVolume === 0);
    }
  }, []);

  const toggleMute = useCallback(() => {
    if (audioRef.current) {
      const newMutedState = !isMuted;
      audioRef.current.muted = newMutedState;
      setIsMuted(newMutedState);
    }
  }, [isMuted]);

  const skipForward = useCallback(() => {
    const newTime = Math.min(currentTime + 10, duration);
    handleSeek(newTime);
  }, [currentTime, duration, handleSeek]);

  const skipBackward = useCallback(() => {
    const newTime = Math.max(currentTime - 10, 0);
    handleSeek(newTime);
  }, [currentTime, handleSeek]);

  // Waveform visualization
  const drawWaveform = useCallback(() => {
    if (!canvasRef.current || !waveformData.length) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { width, height } = canvas;
    
    // Clear canvas
    ctx.clearRect(0, 0, width, height);

    // Set up styling
    ctx.lineWidth = 1;
    ctx.lineCap = 'round';

    const barWidth = width / waveformData.length;
    const centerY = height / 2;

    // Draw waveform bars
    waveformData.forEach((amplitude, index) => {
      const x = index * barWidth;
      const barHeight = Math.abs(amplitude) * centerY * 0.8;
      
      // Color based on playback progress
      const progress = duration > 0 ? currentTime / duration : 0;
      const isPlayed = index < progress * waveformData.length;
      
      ctx.fillStyle = isPlayed 
        ? 'rgb(59, 130, 246)' // Blue for played portion
        : 'rgb(148, 163, 184)'; // Gray for unplayed
      
      // Draw the bar (centered vertically)
      ctx.fillRect(x, centerY - barHeight / 2, Math.max(barWidth - 1, 1), barHeight);
    });

    // Draw text segment markers
    if (textSegments.length > 0 && duration > 0) {
      textSegments.forEach((segment, index) => {
        const startX = (segment.start / duration) * width;
        const endX = (segment.end / duration) * width;
        
        // Draw segment boundary lines
        ctx.strokeStyle = 'rgba(34, 197, 94, 0.6)';
        ctx.lineWidth = 2;
        ctx.setLineDash([5, 5]);
        
        ctx.beginPath();
        ctx.moveTo(startX, 0);
        ctx.lineTo(startX, height);
        ctx.stroke();
        
        ctx.beginPath();
        ctx.moveTo(endX, 0);
        ctx.lineTo(endX, height);
        ctx.stroke();
        
        ctx.setLineDash([]);
      });
    }

    // Draw playhead
    if (duration > 0) {
      const playheadX = (currentTime / duration) * width;
      ctx.strokeStyle = 'rgb(239, 68, 68)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(playheadX, 0);
      ctx.lineTo(playheadX, height);
      ctx.stroke();
    }
  }, [waveformData, currentTime, duration, textSegments]);

  // Handle waveform click for seeking
  const handleWaveformClick = useCallback((event: React.MouseEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current || duration === 0) return;

    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const clickRatio = x / canvas.width;
    const newTime = clickRatio * duration;
    
    handleSeek(newTime);
  }, [duration, handleSeek]);

  // Update canvas size and redraw on resize
  useEffect(() => {
    const updateCanvasSize = () => {
      if (canvasRef.current && waveformContainerRef.current) {
        const container = waveformContainerRef.current;
        const { width, height } = container.getBoundingClientRect();
        
        canvasRef.current.width = width * 2; // High DPI
        canvasRef.current.height = height * 2;
        canvasRef.current.style.width = `${width}px`;
        canvasRef.current.style.height = `${height}px`;
        
        const ctx = canvasRef.current.getContext('2d');
        if (ctx) {
          ctx.scale(2, 2); // High DPI scaling
        }
        
        drawWaveform();
      }
    };

    updateCanvasSize();
    window.addEventListener('resize', updateCanvasSize);
    
    return () => window.removeEventListener('resize', updateCanvasSize);
  }, [drawWaveform]);

  // Redraw waveform when relevant data changes
  useEffect(() => {
    drawWaveform();
  }, [drawWaveform]);

  // Format time display
  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <Card className={`p-4 ${className}`}>
      <audio
        ref={audioRef}
        src={audioUrl}
        onLoadStart={handleLoadStart}
        onLoadedData={handleLoadedData}
        onLoadedMetadata={handleLoadedMetadata}
        onTimeUpdate={handleTimeUpdate}
        onEnded={handleEnded}
        onError={handleError}
        preload="metadata"
      />

      {title && (
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-foreground">{title}</h3>
        </div>
      )}

      {/* Waveform Visualization */}
      {showWaveform && (
        <div className="mb-4">
          <div 
            ref={waveformContainerRef}
            className="relative w-full h-20 bg-muted/20 rounded-lg overflow-hidden cursor-pointer"
          >
            <canvas
              ref={canvasRef}
              onClick={handleWaveformClick}
              className="absolute inset-0 w-full h-full"
            />
            
            {isLoading && (
              <div className="absolute inset-0 flex items-center justify-center bg-background/80">
                <div className="flex items-center space-x-2">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary"></div>
                  <span className="text-sm text-muted-foreground">Loading audio...</span>
                </div>
              </div>
            )}

            {!audioUrl && !isLoading && (
              <div className="absolute inset-0 flex items-center justify-center text-muted-foreground">
                <SpeakerWaveIcon className="w-8 h-8 mr-2" />
                <span className="text-sm">No audio available</span>
              </div>
            )}
          </div>

          {/* Progress info */}
          <div className="flex items-center justify-between mt-2 text-sm text-muted-foreground">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>
      )}

      {/* Playback Controls */}
      {showControls && (
        <AnimatePresence>
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            {/* Main Controls */}
            <div className="flex items-center justify-center space-x-4">
              <Button
                variant="outline"
                size="sm"
                onClick={skipBackward}
                disabled={!audioUrl || currentTime === 0}
              >
                <BackwardIcon className="w-4 h-4" />
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={togglePlayPause}
                disabled={!audioUrl || isLoading}
                className="w-12 h-12 rounded-full"
              >
                {isLoading ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-current"></div>
                ) : isPlaying ? (
                  <PauseIconSolid className="w-5 h-5" />
                ) : (
                  <PlayIconSolid className="w-5 h-5" />
                )}
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={handleStop}
                disabled={!audioUrl || (!isPlaying && currentTime === 0)}
              >
                <StopIcon className="w-4 h-4" />
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={skipForward}
                disabled={!audioUrl || currentTime >= duration}
              >
                <ForwardIcon className="w-4 h-4" />
              </Button>
            </div>

            {/* Volume and Speed Controls */}
            <div className="flex items-center justify-between space-x-4">
              <div className="flex items-center space-x-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={toggleMute}
                  disabled={!audioUrl}
                >
                  {isMuted || volume === 0 ? (
                    <SpeakerXMarkIcon className="w-4 h-4" />
                  ) : (
                    <SpeakerWaveIcon className="w-4 h-4" />
                  )}
                </Button>
                <Slider
                  value={[volume]}
                  max={1}
                  step={0.01}
                  onValueChange={(value) => handleVolumeChange(value[0])}
                  className="w-20"
                />
              </div>

              <div className="flex items-center space-x-2">
                <span className="text-sm text-muted-foreground">Speed:</span>
                <select
                  value={playbackRate}
                  onChange={(e) => {
                    const rate = parseFloat(e.target.value);
                    setPlaybackRate(rate);
                    if (audioRef.current) {
                      audioRef.current.playbackRate = rate;
                    }
                  }}
                  className="text-sm bg-background border rounded px-2 py-1"
                >
                  <option value={0.5}>0.5x</option>
                  <option value={0.75}>0.75x</option>
                  <option value={1}>1x</option>
                  <option value={1.25}>1.25x</option>
                  <option value={1.5}>1.5x</option>
                  <option value={2}>2x</option>
                </select>
              </div>
            </div>

            {/* Progress bar for non-waveform mode */}
            {!showWaveform && (
              <div className="space-y-2">
                <Slider
                  value={[currentTime]}
                  max={duration || 100}
                  step={0.1}
                  onValueChange={(value) => {
                    setIsDragging(true);
                    handleSeek(value[0]);
                  }}
                  // Commit on mouse up
                  className="w-full"
                />
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      )}
    </Card>
  );
};

export default WaveformAudioPlayer;