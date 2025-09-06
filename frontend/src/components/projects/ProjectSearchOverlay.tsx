import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { useProjectManagement } from '../../contexts/ProjectManagementContext';
import {
  ClockIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';

interface ProjectSearchOverlayProps {
  isVisible: boolean;
  searchQuery: string;
  onSearchSubmit: (query: string) => void;
  onClose: () => void;
}

const ProjectSearchOverlay: React.FC<ProjectSearchOverlayProps> = ({
  isVisible,
  searchQuery,
  onSearchSubmit,
  onClose
}) => {
  const {
    state,
    clearRecentSearches
  } = useProjectManagement();

  if (!isVisible) {
    return null;
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        className="absolute top-full left-0 right-0 mt-2 z-50"
      >
        <Card className="p-4 shadow-lg border-border/50 backdrop-blur-sm bg-background/95">
          {state.recentSearches.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium text-foreground">Recent Searches</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearRecentSearches}
                  className="text-xs text-muted-foreground hover:text-foreground p-0 h-auto"
                >
                  <XMarkIcon className="w-4 h-4" />
                </Button>
              </div>

              <div className="space-y-1">
                {state.recentSearches.map((search, index) => (
                  <button
                    key={index}
                    onClick={() => onSearchSubmit(search)}
                    className="w-full flex items-center space-x-3 p-2 rounded-md hover:bg-accent transition-colors text-left"
                  >
                    <ClockIcon className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                    <span className="text-sm text-foreground truncate">{search}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        // Remove this specific search
                      }}
                      className="p-1 h-auto opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <XMarkIcon className="w-3 h-3" />
                    </Button>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Popular Searches */}
          <div className="space-y-3 mt-4">
            <h3 className="text-sm font-medium text-foreground">Popular Searches</h3>
            <div className="flex flex-wrap gap-2">
              {[
                'Social Media Promotions',
                'Young People Podcast',
                'Motivational Speech',
                'Travel & Adventure Story',
                'Cloth Promotions Audio',
                'Instagram Ads Promotions',
                'Summer School Project'
              ].map((suggestion) => (
                <button
                  key={suggestion}
                  onClick={() => onSearchSubmit(suggestion)}
                  className="px-3 py-1 text-xs bg-muted hover:bg-accent rounded-full text-muted-foreground hover:text-foreground transition-colors"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>

          {/* Search Tips */}
          <div className="mt-4 pt-3 border-t border-border">
            <p className="text-xs text-muted-foreground">
              💡 Tip: Search by project name, description, voice, or tags
            </p>
          </div>
        </Card>
      </motion.div>
    </AnimatePresence>
  );
};

export default ProjectSearchOverlay;