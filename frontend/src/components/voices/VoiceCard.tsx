import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Badge } from '../ui/badge';
import { Voice } from '../../contexts/VoiceExplorerContext';
import {
  PlayIcon,
  PauseIcon,
  HeartIcon,
  StarIcon,
  SparklesIcon,
  SpeakerWaveIcon
} from '@heroicons/react/24/outline';
import {
  HeartIcon as HeartIconSolid,
  PlayIcon as PlayIconSolid,
  PauseIcon as PauseIconSolid
} from '@heroicons/react/24/solid';

interface VoiceCardProps {
  voice: Voice;
  viewMode: 'grid' | 'list';
  isPlaying: boolean;
  isPreviewing: boolean;
  onPlay: () => void;
  onPause: () => void;
  onToggleFavorite: () => void;
  onSelect?: () => void;
  showSelectButton?: boolean;
  className?: string;
}

const VoiceCard: React.FC<VoiceCardProps> = ({
  voice,
  viewMode,
  isPlaying,
  isPreviewing,
  onPlay,
  onPause,
  onToggleFavorite,
  onSelect,
  showSelectButton = false,
  className = ''
}) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  const handlePlayPause = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isPlaying) {
      onPause();
    } else {
      onPlay();
    }
  };

  const handleFavoriteToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    onToggleFavorite();
  };

  const handleCardClick = () => {
    if (onSelect) {
      onSelect();
    }
  };

  const renderRatingStars = () => {
    const stars = [];
    const rating = Math.round(voice.rating * 2) / 2; // Round to nearest 0.5
    
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <StarIcon
          key={i}
          className={`w-3 h-3 ${
            i <= rating
              ? 'text-yellow-400 fill-current'
              : 'text-gray-300'
          }`}
        />
      );
    }
    
    return stars;
  };

  const cardVariants = {
    idle: { scale: 1, y: 0 },
    hover: { scale: 1.02, y: -2 },
    tap: { scale: 0.98 }
  };

  if (viewMode === 'list') {
    return (
      <motion.div
        variants={cardVariants}
        initial="idle"
        whileHover="hover"
        whileTap="tap"
        className={className}
      >
        <Card 
          className={`p-4 cursor-pointer transition-all duration-200 ${
            isPreviewing ? 'ring-2 ring-blue-500' : 'hover:shadow-md'
          }`}
          onClick={handleCardClick}
        >
          <div className="flex items-center space-x-4">
            {/* Avatar */}
            <div className="relative">
              <Avatar className="w-12 h-12">
                <AvatarImage 
                  src={voice.avatar} 
                  onLoad={() => setImageLoaded(true)}
                  onError={() => setImageError(true)}
                />
                <AvatarFallback className="bg-gradient-to-br from-blue-400 to-purple-400 text-white font-semibold">
                  {voice.name.substring(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              
              {voice.isNew && (
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full"></div>
              )}
            </div>

            {/* Voice Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-2 mb-1">
                <h3 className="font-semibold text-foreground truncate">
                  {voice.name.replace(/_.*/, '')}
                </h3>
                <Badge variant={voice.gender === 'F' ? 'default' : 'secondary'} className="text-xs">
                  {voice.gender}
                </Badge>
                {voice.isPremium && (
                  <Badge variant="premium" className="text-xs">
                    <SparklesIcon className="w-3 h-3 mr-1" />
                    Premium
                  </Badge>
                )}
              </div>
              
              <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                <span>{voice.language}</span>
                <span>•</span>
                <span>{voice.style}</span>
                <span>•</span>
                <span className="capitalize">{voice.category}</span>
              </div>
              
              <div className="flex items-center space-x-2 mt-1">
                <div className="flex items-center">
                  {renderRatingStars()}
                  <span className="ml-1 text-xs text-muted-foreground">
                    ({voice.rating.toFixed(1)})
                  </span>
                </div>
                <span className="text-xs text-muted-foreground">
                  {voice.usageCount.toLocaleString()} uses
                </span>
              </div>
            </div>

            {/* Controls */}
            <div className="flex items-center space-x-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={handlePlayPause}
                disabled={!voice.sampleUrl}
                className="p-2"
              >
                {isPlaying ? (
                  <PauseIconSolid className="w-4 h-4 text-blue-500" />
                ) : (
                  <PlayIconSolid className="w-4 h-4 text-blue-500" />
                )}
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={handleFavoriteToggle}
                className="p-2"
              >
                {voice.isFavorite ? (
                  <HeartIconSolid className="w-4 h-4 text-red-500" />
                ) : (
                  <HeartIcon className="w-4 h-4 text-muted-foreground hover:text-red-500" />
                )}
              </Button>
              
              {showSelectButton && (
                <Button size="sm" className="px-4">
                  Select
                </Button>
              )}
            </div>
          </div>
        </Card>
      </motion.div>
    );
  }

  // Grid view
  return (
    <motion.div
      variants={cardVariants}
      initial="idle"
      whileHover="hover"
      whileTap="tap"
      className={className}
    >
      <Card 
        className={`p-4 cursor-pointer transition-all duration-200 h-full flex flex-col ${
          isPreviewing ? 'ring-2 ring-blue-500' : 'hover:shadow-md'
        }`}
        onClick={handleCardClick}
      >
        {/* Header with Avatar and Favorite */}
        <div className="flex items-start justify-between mb-3">
          <div className="relative">
            <Avatar className="w-16 h-16">
              <AvatarImage 
                src={voice.avatar}
                onLoad={() => setImageLoaded(true)}
                onError={() => setImageError(true)}
              />
              <AvatarFallback className="bg-gradient-to-br from-blue-400 to-purple-400 text-white font-semibold text-lg">
                {voice.name.substring(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            
            {voice.isNew && (
              <div className="absolute -top-1 -right-1">
                <Badge className="text-xs bg-green-500 text-white px-1">New</Badge>
              </div>
            )}
          </div>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={handleFavoriteToggle}
            className="p-2"
          >
            {voice.isFavorite ? (
              <HeartIconSolid className="w-5 h-5 text-red-500" />
            ) : (
              <HeartIcon className="w-5 h-5 text-muted-foreground hover:text-red-500" />
            )}
          </Button>
        </div>

        {/* Voice Info */}
        <div className="flex-1">
          <div className="flex items-center space-x-2 mb-2">
            <h3 className="font-semibold text-foreground truncate">
              {voice.name.replace(/_.*/, '')}
            </h3>
            <Badge variant={voice.gender === 'F' ? 'default' : 'secondary'} className="text-xs">
              {voice.gender}
            </Badge>
          </div>
          
          <div className="space-y-1 text-sm text-muted-foreground mb-3">
            <div>{voice.language}</div>
            <div className="capitalize">{voice.style} • {voice.category}</div>
            <div className="text-xs">{voice.provider}</div>
          </div>
          
          <div className="flex items-center justify-between text-xs text-muted-foreground mb-3">
            <div className="flex items-center">
              {renderRatingStars()}
              <span className="ml-1">({voice.rating.toFixed(1)})</span>
            </div>
            <span>{(voice.usageCount / 1000).toFixed(0)}k uses</span>
          </div>

          {voice.isPremium && (
            <Badge variant="premium" className="text-xs mb-3">
              <SparklesIcon className="w-3 h-3 mr-1" />
              Premium
            </Badge>
          )}

          {voice.description && (
            <p className="text-xs text-muted-foreground line-clamp-2 mb-3">
              {voice.description}
            </p>
          )}
        </div>

        {/* Controls */}
        <div className="flex items-center justify-between pt-3 border-t">
          <Button
            variant="ghost"
            size="sm"
            onClick={handlePlayPause}
            disabled={!voice.sampleUrl}
            className="flex-1 mr-2"
          >
            {isPlaying ? (
              <>
                <PauseIconSolid className="w-4 h-4 mr-2 text-blue-500" />
                Playing
              </>
            ) : (
              <>
                <PlayIconSolid className="w-4 h-4 mr-2" />
                Preview
              </>
            )}
          </Button>
          
          {showSelectButton && (
            <Button size="sm" className="flex-1 ml-2">
              Select
            </Button>
          )}
        </div>

        {/* Playing Indicator */}
        {isPlaying && (
          <motion.div
            className="absolute inset-0 pointer-events-none"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <div className="absolute bottom-2 left-2">
              <div className="flex items-center space-x-1">
                {[0, 1, 2].map((i) => (
                  <motion.div
                    key={i}
                    className="w-1 bg-blue-500 rounded-full"
                    animate={{
                      height: [4, 12, 4],
                    }}
                    transition={{
                      duration: 1,
                      repeat: Infinity,
                      delay: i * 0.2,
                    }}
                  />
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </Card>
    </motion.div>
  );
};

export default VoiceCard;