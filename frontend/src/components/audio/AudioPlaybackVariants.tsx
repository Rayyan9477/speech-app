import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { Slider } from '../ui/slider';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import {
  PlayIcon,
  PauseIcon,
  SpeakerWaveIcon,
  SpeakerXMarkIcon,
  ShareIcon,
  ArrowDownTrayIcon,
  BackwardIcon,
  ForwardIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';

interface AudioPlaybackProps {
  audioUrl: string;
  title: string;
  duration?: number;
  waveformData?: number[];
  variant: 'minimal' | 'standard' | 'detailed' | 'waveform';
  autoPlay?: boolean;
  showControls?: boolean;
  onShare?: () => void;
  onDownload?: () => void;
}

const AudioPlaybackVariants: React.FC<AudioPlaybackProps> = ({
  audioUrl,
  title,
  duration = 0,
  waveformData = [],
  variant = 'standard',
  autoPlay = false,
  showControls = true,
  onShare,
  onDownload
}) => {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [showShareDialog, setShowShareDialog] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleTimeUpdate = () => setCurrentTime(audio.currentTime);
    const handleLoadStart = () => setIsLoading(true);
    const handleCanPlay = () => setIsLoading(false);
    const handleEnded = () => setIsPlaying(false);

    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('loadstart', handleLoadStart);
    audio.addEventListener('canplay', handleCanPlay);
    audio.addEventListener('ended', handleEnded);

    if (autoPlay) {
      audio.play().then(() => setIsPlaying(true));
    }

    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('loadstart', handleLoadStart);
      audio.removeEventListener('canplay', handleCanPlay);
      audio.removeEventListener('ended', handleEnded);
    };
  }, [autoPlay]);

  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
    } else {
      audio.play().then(() => setIsPlaying(true));
    }
  };

  const handleSeek = (value: number[]) => {
    const audio = audioRef.current;
    if (!audio) return;

    const time = (value[0] / 100) * audio.duration;
    audio.currentTime = time;
    setCurrentTime(time);
  };

  const handleVolumeChange = (value: number[]) => {
    const audio = audioRef.current;
    if (!audio) return;

    const newVolume = value[0] / 100;
    setVolume(newVolume);
    audio.volume = newVolume;
    setIsMuted(newVolume === 0);
  };

  const toggleMute = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isMuted) {
      audio.volume = volume;
      setIsMuted(false);
    } else {
      audio.volume = 0;
      setIsMuted(true);
    }
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  const renderWaveform = () => {
    if (waveformData.length === 0) {
      // Generate fake waveform data for demo
      const fakeData = Array.from({ length: 100 }, () => Math.random());
      return fakeData.map((height, index) => (
        <div
          key={index}
          className={`w-1 bg-current transition-all duration-200 ${
            index / 100 <= progress / 100 ? 'text-primary' : 'text-muted-foreground/30'
          }`}
          style={{ height: `${Math.max(2, height * 40)}px` }}
        />
      ));
    }

    return waveformData.map((height, index) => (
      <div
        key={index}
        className={`w-1 bg-current transition-all duration-200 ${
          index / waveformData.length <= progress / 100 ? 'text-primary' : 'text-muted-foreground/30'
        }`}
        style={{ height: `${Math.max(2, height * 40)}px` }}
      />
    ));
  };

  // Variant 1: Minimal Player
  if (variant === 'minimal') {
    return (
      <div className="flex items-center space-x-3 p-3 bg-background rounded-lg border">
        <audio ref={audioRef} src={audioUrl} preload="metadata" />
        
        <Button
          size="sm"
          variant="ghost"
          onClick={togglePlay}
          disabled={isLoading}
          className="w-8 h-8 p-0"
        >
          {isLoading ? (
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
          ) : isPlaying ? (
            <PauseIcon className="w-4 h-4" />
          ) : (
            <PlayIcon className="w-4 h-4" />
          )}
        </Button>

        <div className="flex-1">
          <div className="text-sm font-medium truncate">{title}</div>
          <div className="text-xs text-muted-foreground">
            {formatTime(currentTime)} / {formatTime(duration)}
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {onShare && (
            <Button size="sm" variant="ghost" onClick={onShare} className="w-8 h-8 p-0">
              <ShareIcon className="w-4 h-4" />
            </Button>
          )}
          {onDownload && (
            <Button size="sm" variant="ghost" onClick={onDownload} className="w-8 h-8 p-0">
              <ArrowDownTrayIcon className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>
    );
  }

  // Variant 2: Standard Player
  if (variant === 'standard') {
    return (
      <Card className="p-4">
        <audio ref={audioRef} src={audioUrl} preload="metadata" />
        
        <div className="space-y-4">
          <div className="text-center">
            <h3 className="font-semibold truncate">{title}</h3>
            <p className="text-sm text-muted-foreground">
              {formatTime(currentTime)} / {formatTime(duration)}
            </p>
          </div>

          <div className="flex items-center justify-center space-x-4">
            <Button size="sm" variant="outline" onClick={() => handleSeek([Math.max(0, progress - 10)])}>
              <BackwardIcon className="w-4 h-4" />
            </Button>
            
            <Button
              size="lg"
              onClick={togglePlay}
              disabled={isLoading}
              className="w-12 h-12 rounded-full"
            >
              {isLoading ? (
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
              ) : isPlaying ? (
                <PauseIcon className="w-6 h-6" />
              ) : (
                <PlayIcon className="w-6 h-6" />
              )}
            </Button>
            
            <Button size="sm" variant="outline" onClick={() => handleSeek([Math.min(100, progress + 10)])}>
              <ForwardIcon className="w-4 h-4" />
            </Button>
          </div>

          <div className="space-y-2">
            <Slider
              value={[progress]}
              onValueChange={handleSeek}
              max={100}
              step={0.1}
              className="w-full"
            />
          </div>

          {showControls && (
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Button size="sm" variant="ghost" onClick={toggleMute}>
                  {isMuted ? (
                    <SpeakerXMarkIcon className="w-4 h-4" />
                  ) : (
                    <SpeakerWaveIcon className="w-4 h-4" />
                  )}
                </Button>
                <Slider
                  value={[isMuted ? 0 : volume * 100]}
                  onValueChange={handleVolumeChange}
                  max={100}
                  step={1}
                  className="w-20"
                />
              </div>

              <div className="flex items-center space-x-2">
                {onShare && (
                  <Button size="sm" variant="outline" onClick={() => setShowShareDialog(true)}>
                    <ShareIcon className="w-4 h-4" />
                  </Button>
                )}
                {onDownload && (
                  <Button size="sm" variant="outline" onClick={onDownload}>
                    <ArrowDownTrayIcon className="w-4 h-4" />
                  </Button>
                )}
              </div>
            </div>
          )}
        </div>
      </Card>
    );
  }

  // Variant 3: Detailed Player
  if (variant === 'detailed') {
    return (
      <Card className="p-6">
        <audio ref={audioRef} src={audioUrl} preload="metadata" />
        
        <div className="space-y-6">
          {/* Header */}
          <div className="text-center">
            <h2 className="text-xl font-semibold mb-2">{title}</h2>
            <div className="flex items-center justify-center space-x-4 text-sm text-muted-foreground">
              <span>Duration: {formatTime(duration)}</span>
              <span>•</span>
              <span>Current: {formatTime(currentTime)}</span>
            </div>
          </div>

          {/* Main Controls */}
          <div className="flex items-center justify-center space-x-6">
            <Button size="sm" variant="outline" onClick={() => handleSeek([Math.max(0, progress - 15)])}>
              <BackwardIcon className="w-5 h-5" />
              <span className="ml-2">15s</span>
            </Button>
            
            <Button
              size="lg"
              onClick={togglePlay}
              disabled={isLoading}
              className="w-16 h-16 rounded-full"
            >
              {isLoading ? (
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
              ) : isPlaying ? (
                <PauseIcon className="w-8 h-8" />
              ) : (
                <PlayIcon className="w-8 h-8" />
              )}
            </Button>
            
            <Button size="sm" variant="outline" onClick={() => handleSeek([Math.min(100, progress + 15)])}>
              <span className="mr-2">15s</span>
              <ForwardIcon className="w-5 h-5" />
            </Button>
          </div>

          {/* Progress Bar */}
          <div className="space-y-2">
            <Slider
              value={[progress]}
              onValueChange={handleSeek}
              max={100}
              step={0.1}
              className="w-full h-2"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>{formatTime(currentTime)}</span>
              <span>{formatTime(duration - currentTime)}</span>
            </div>
          </div>

          {/* Volume and Actions */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Button size="sm" variant="ghost" onClick={toggleMute}>
                {isMuted ? (
                  <SpeakerXMarkIcon className="w-5 h-5" />
                ) : (
                  <SpeakerWaveIcon className="w-5 h-5" />
                )}
              </Button>
              <Slider
                value={[isMuted ? 0 : volume * 100]}
                onValueChange={handleVolumeChange}
                max={100}
                step={1}
                className="w-24"
              />
              <span className="text-xs text-muted-foreground w-8">
                {Math.round(isMuted ? 0 : volume * 100)}%
              </span>
            </div>

            <div className="flex items-center space-x-3">
              {onShare && (
                <Button variant="outline" onClick={() => setShowShareDialog(true)}>
                  <ShareIcon className="w-4 h-4 mr-2" />
                  Share
                </Button>
              )}
              {onDownload && (
                <Button variant="outline" onClick={onDownload}>
                  <ArrowDownTrayIcon className="w-4 h-4 mr-2" />
                  Download
                </Button>
              )}
            </div>
          </div>
        </div>
      </Card>
    );
  }

  // Variant 4: Waveform Player
  if (variant === 'waveform') {
    return (
      <Card className="p-4">
        <audio ref={audioRef} src={audioUrl} preload="metadata" />
        
        <div className="space-y-4">
          <div className="text-center">
            <h3 className="font-semibold">{title}</h3>
          </div>

          {/* Waveform Visualization */}
          <div className="relative">
            <div className="flex items-end justify-center space-x-px h-20 overflow-hidden rounded bg-muted/30 p-2">
              {renderWaveform()}
            </div>
            
            {/* Progress Overlay */}
            <div 
              className="absolute top-0 left-0 h-full bg-primary/10 rounded transition-all duration-200"
              style={{ width: `${progress}%` }}
            />
          </div>

          {/* Controls */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Button
                size="sm"
                onClick={togglePlay}
                disabled={isLoading}
                className="w-10 h-10 rounded-full"
              >
                {isLoading ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                ) : isPlaying ? (
                  <PauseIcon className="w-4 h-4" />
                ) : (
                  <PlayIcon className="w-4 h-4" />
                )}
              </Button>
              
              <div className="text-sm font-mono">
                {formatTime(currentTime)} / {formatTime(duration)}
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Button size="sm" variant="ghost" onClick={toggleMute}>
                {isMuted ? (
                  <SpeakerXMarkIcon className="w-4 h-4" />
                ) : (
                  <SpeakerWaveIcon className="w-4 h-4" />
                )}
              </Button>
              
              {onShare && (
                <Button size="sm" variant="ghost" onClick={() => setShowShareDialog(true)}>
                  <ShareIcon className="w-4 h-4" />
                </Button>
              )}
              
              {onDownload && (
                <Button size="sm" variant="ghost" onClick={onDownload}>
                  <ArrowDownTrayIcon className="w-4 h-4" />
                </Button>
              )}
            </div>
          </div>
        </div>
      </Card>
    );
  }

  return null;
};

// Share Dialog Component
export const AudioShareDialog: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  audioUrl: string;
  title: string;
}> = ({ isOpen, onClose, audioUrl, title }) => {
  const [copied, setCopied] = useState(false);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(audioUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const shareOptions = [
    { name: 'Twitter', icon: '🐦', color: 'bg-blue-500' },
    { name: 'Facebook', icon: '📘', color: 'bg-blue-600' },
    { name: 'LinkedIn', icon: '💼', color: 'bg-blue-700' },
    { name: 'WhatsApp', icon: '💬', color: 'bg-green-500' },
    { name: 'Email', icon: '📧', color: 'bg-gray-500' },
    { name: 'Discord', icon: '🎮', color: 'bg-indigo-500' }
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Share Audio</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="text-center p-4 bg-muted/50 rounded-lg">
            <h3 className="font-medium mb-1">{title}</h3>
            <p className="text-sm text-muted-foreground">Share this audio with others</p>
          </div>

          {/* Share Options */}
          <div>
            <h4 className="text-sm font-medium mb-3">Share via</h4>
            <div className="grid grid-cols-3 gap-3">
              {shareOptions.map((option) => (
                <Button
                  key={option.name}
                  variant="outline"
                  className="h-auto p-3 flex flex-col items-center space-y-1"
                >
                  <div className={`w-8 h-8 rounded-full ${option.color} flex items-center justify-center text-white`}>
                    {option.icon}
                  </div>
                  <span className="text-xs">{option.name}</span>
                </Button>
              ))}
            </div>
          </div>

          {/* Copy Link */}
          <div>
            <h4 className="text-sm font-medium mb-2">Or copy link</h4>
            <div className="flex space-x-2">
              <input
                type="text"
                value={audioUrl}
                readOnly
                className="flex-1 px-3 py-2 text-sm border rounded bg-muted/50"
              />
              <Button size="sm" onClick={handleCopyLink}>
                {copied ? 'Copied!' : 'Copy'}
              </Button>
            </div>
          </div>

          <div className="flex justify-end">
            <Button onClick={onClose}>Done</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AudioPlaybackVariants;