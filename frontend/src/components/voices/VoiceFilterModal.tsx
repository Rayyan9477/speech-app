import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Slider } from '../ui/slider';
import { Checkbox } from '../ui/checkbox';
import { Input } from '../ui/input';
import { VoiceFilters } from '../../contexts/VoiceExplorerContext';
import {
  XMarkIcon,
  FunnelIcon,
  MagnifyingGlassIcon,
  StarIcon,
  SparklesIcon,
  TrashIcon
} from '@heroicons/react/24/outline';

interface FilterOption {
  value: string;
  label: string;
  count: number;
}

interface VoiceFilterModalProps {
  isOpen: boolean;
  onClose: () => void;
  filters: VoiceFilters;
  onFiltersChange: (filters: VoiceFilters) => void;
  onClearFilters: () => void;
  filterOptions: {
    languages: FilterOption[];
    genders: FilterOption[];
    ageGroups: FilterOption[];
    categories: FilterOption[];
    providers: FilterOption[];
  };
}

const VoiceFilterModal: React.FC<VoiceFilterModalProps> = ({
  isOpen,
  onClose,
  filters,
  onFiltersChange,
  onClearFilters,
  filterOptions
}) => {
  const [searchQueries, setSearchQueries] = useState({
    languages: '',
    providers: ''
  });

  const [minRating, setMinRating] = useState(filters.rating || 0);

  useEffect(() => {
    setMinRating(filters.rating || 0);
  }, [filters.rating]);

  const handleFilterChange = (filterType: keyof VoiceFilters, values: string[]) => {
    onFiltersChange({
      ...filters,
      [filterType]: values
    });
  };

  const toggleFilter = (filterType: keyof VoiceFilters, value: string) => {
    const currentValues = filters[filterType] as string[];
    const newValues = currentValues.includes(value)
      ? currentValues.filter(v => v !== value)
      : [...currentValues, value];
    
    handleFilterChange(filterType, newValues);
  };

  const handlePremiumToggle = () => {
    onFiltersChange({
      ...filters,
      isPremium: filters.isPremium === undefined ? true : filters.isPremium ? false : undefined
    });
  };

  const handleRatingChange = (value: number[]) => {
    const rating = value[0];
    onFiltersChange({
      ...filters,
      rating: rating > 0 ? rating : undefined
    });
    setMinRating(rating);
  };

  const getActiveFilterCount = () => {
    let count = 0;
    count += filters.languages.length;
    count += filters.genders.length;
    count += filters.ageGroups.length;
    count += filters.categories.length;
    count += filters.providers.length;
    if (filters.isPremium !== undefined) count += 1;
    if (filters.rating && filters.rating > 0) count += 1;
    return count;
  };

  const filterSections = [
    {
      key: 'languages' as const,
      title: 'Languages',
      options: filterOptions.languages.filter(lang => 
        !searchQueries.languages || 
        lang.label.toLowerCase().includes(searchQueries.languages.toLowerCase())
      ),
      searchable: true
    },
    {
      key: 'genders' as const,
      title: 'Gender',
      options: filterOptions.genders,
      searchable: false
    },
    {
      key: 'ageGroups' as const,
      title: 'Age Group',
      options: filterOptions.ageGroups,
      searchable: false
    },
    {
      key: 'categories' as const,
      title: 'Category',
      options: filterOptions.categories,
      searchable: false
    },
    {
      key: 'providers' as const,
      title: 'Providers',
      options: filterOptions.providers.filter(provider => 
        !searchQueries.providers || 
        provider.label.toLowerCase().includes(searchQueries.providers.toLowerCase())
      ),
      searchable: true
    }
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[85vh] flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <DialogTitle className="flex items-center space-x-2">
                <FunnelIcon className="w-5 h-5" />
                <span>Filter Voices</span>
              </DialogTitle>
              {getActiveFilterCount() > 0 && (
                <Badge variant="secondary" className="px-2 py-1">
                  {getActiveFilterCount()} active
                </Badge>
              )}
            </div>
            
            <div className="flex items-center space-x-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={onClearFilters}
                className="text-muted-foreground hover:text-foreground"
              >
                <TrashIcon className="w-4 h-4 mr-1" />
                Clear All
              </Button>
              <Button variant="ghost" size="sm" onClick={onClose}>
                <XMarkIcon className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto space-y-6 pr-2">
          {/* Premium Filter */}
          <div>
            <h3 className="text-sm font-semibold text-foreground mb-3">Premium</h3>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => onFiltersChange({ ...filters, isPremium: undefined })}
                className={`px-3 py-2 rounded-lg text-sm transition-colors ${
                  filters.isPremium === undefined
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-muted-foreground hover:bg-muted/80'
                }`}
              >
                All
              </button>
              <button
                onClick={() => onFiltersChange({ ...filters, isPremium: false })}
                className={`px-3 py-2 rounded-lg text-sm transition-colors ${
                  filters.isPremium === false
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-muted-foreground hover:bg-muted/80'
                }`}
              >
                Free
              </button>
              <button
                onClick={() => onFiltersChange({ ...filters, isPremium: true })}
                className={`px-3 py-2 rounded-lg text-sm flex items-center space-x-1 transition-colors ${
                  filters.isPremium === true
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-muted-foreground hover:bg-muted/80'
                }`}
              >
                <SparklesIcon className="w-4 h-4" />
                <span>Premium</span>
              </button>
            </div>
          </div>

          {/* Rating Filter */}
          <div>
            <h3 className="text-sm font-semibold text-foreground mb-3">Minimum Rating</h3>
            <div className="space-y-3">
              <Slider
                value={[minRating]}
                onValueChange={handleRatingChange}
                max={5}
                min={0}
                step={0.5}
                className="w-full"
              />
              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <div className="flex items-center space-x-1">
                  <StarIcon className="w-4 h-4" />
                  <span>{minRating.toFixed(1)}+</span>
                </div>
                <span>5.0</span>
              </div>
            </div>
          </div>

          {/* Filter Sections */}
          {filterSections.map((section) => (
            <div key={section.key}>
              <h3 className="text-sm font-semibold text-foreground mb-3">
                {section.title}
              </h3>
              
              {section.searchable && (
                <div className="mb-3">
                  <div className="relative">
                    <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      placeholder={`Search ${section.title.toLowerCase()}...`}
                      className="pl-10"
                      value={searchQueries[section.key as keyof typeof searchQueries] || ''}
                      onChange={(e) => 
                        setSearchQueries(prev => ({
                          ...prev,
                          [section.key]: e.target.value
                        }))
                      }
                    />
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 gap-2 max-h-48 overflow-y-auto">
                {section.options.map((option) => {
                  const isSelected = (filters[section.key] as string[]).includes(
                    section.key === 'languages' ? (option as any).code || option.value : option.value
                  );
                  
                  return (
                    <motion.div
                      key={option.value}
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.99 }}
                    >
                      <button
                        onClick={() => toggleFilter(
                          section.key, 
                          section.key === 'languages' ? (option as any).code || option.value : option.value
                        )}
                        className={`w-full flex items-center justify-between p-3 rounded-lg border transition-colors ${
                          isSelected
                            ? 'border-primary bg-primary/5 text-primary'
                            : 'border-border hover:border-primary/50 hover:bg-muted/50'
                        }`}
                      >
                        <div className="flex items-center space-x-3">
                          <Checkbox 
                            checked={isSelected}
                            onChange={() => {}} // Handled by button click
                            className="pointer-events-none"
                          />
                          <span className="text-sm font-medium">
                            {option.label}
                          </span>
                        </div>
                        <Badge variant="secondary" className="text-xs">
                          {option.count}
                        </Badge>
                      </button>
                    </motion.div>
                  );
                })}
              </div>
              
              {section.options.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <span className="text-sm">No {section.title.toLowerCase()} found</span>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="flex-shrink-0 flex items-center justify-between pt-4 border-t">
          <div className="text-sm text-muted-foreground">
            {getActiveFilterCount()} filter{getActiveFilterCount() !== 1 ? 's' : ''} applied
          </div>
          
          <div className="flex items-center space-x-2">
            <Button variant="outline" onClick={onClearFilters}>
              Clear All
            </Button>
            <Button onClick={onClose}>
              Apply Filters
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default VoiceFilterModal;