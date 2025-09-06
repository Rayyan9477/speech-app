import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card } from '../../ui/card';
import { Input } from '../../ui/input';
import { Badge } from '../../ui/badge';
import { useVoiceTranslation, Language, AudioFile } from '../../../contexts/VoiceTranslationContext';
import WaveformAudioPlayer from '../../tts/WaveformAudioPlayer';
import {
  MagnifyingGlassIcon,
  CheckCircleIcon,
  ChevronRightIcon,
  LanguageIcon,
  GlobeAltIcon
} from '@heroicons/react/24/outline';

interface LanguageSelectionStepProps {
  languages: Language[];
  selectedLanguage?: Language;
  onLanguageSelect: (language: Language) => void;
  sourceAudio?: AudioFile;
}

const LanguageSelectionStep: React.FC<LanguageSelectionStepProps> = ({
  languages,
  selectedLanguage,
  onLanguageSelect,
  sourceAudio
}) => {
  const { selectLanguage } = useVoiceTranslation();
  const [searchQuery, setSearchQuery] = useState('');

  const filteredLanguages = languages.filter(language =>
    language.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    language.nativeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    language.code.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleLanguageSelect = (language: Language) => {
    selectLanguage(language);
  };

  // Group languages by region
  const languagesByRegion = filteredLanguages.reduce((acc, language) => {
    const region = language.region || 'Other';
    if (!acc[region]) {
      acc[region] = [];
    }
    acc[region].push(language);
    return acc;
  }, {} as Record<string, Language[]>);

  return (
    <div className="space-y-6">
      {/* Source Audio Preview */}
      {sourceAudio && (
        <Card className="p-6">
          <h3 className="font-semibold text-foreground mb-4 flex items-center space-x-2">
            <LanguageIcon className="w-5 h-5" />
            <span>Source Audio</span>
          </h3>
          <WaveformAudioPlayer
            audioUrl={sourceAudio.url}
            waveformData={sourceAudio.waveformData}
            showControls={true}
            showWaveform={true}
            title="Original audio to translate"
            className="bg-muted/20"
          />
        </Card>
      )}

      {/* Language Selection */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-semibold text-foreground flex items-center space-x-2">
              <GlobeAltIcon className="w-6 h-6" />
              <span>Translate to</span>
            </h2>
            <p className="text-muted-foreground">
              Choose your target language for translation
            </p>
          </div>
          
          {selectedLanguage && (
            <Badge variant="default" className="bg-green-500 text-white">
              Language Selected
            </Badge>
          )}
        </div>

        {/* Search */}
        <div className="relative mb-6">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <Input
            placeholder="Search by Language"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 h-12 bg-muted/50 border-border"
          />
        </div>

        {/* Popular Languages First */}
        {!searchQuery && (
          <div className="mb-6">
            <h3 className="font-medium text-foreground mb-3">Popular Languages</h3>
            <div className="grid grid-cols-1 gap-3">
              {languages.slice(0, 4).map((language) => (
                <motion.div
                  key={language.id}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                >
                  <Card
                    className={`p-4 cursor-pointer transition-all duration-200 hover:shadow-md ${
                      selectedLanguage?.id === language.id
                        ? 'ring-2 ring-blue-500 bg-blue-50 dark:bg-blue-950'
                        : 'hover:bg-accent'
                    }`}
                    onClick={() => handleLanguageSelect(language)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="text-2xl">{language.flag}</div>
                        <div>
                          <h3 className="font-semibold text-foreground">{language.name}</h3>
                          <p className="text-sm text-muted-foreground">{language.nativeName}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        {selectedLanguage?.id === language.id ? (
                          <CheckCircleIcon className="w-6 h-6 text-green-600" />
                        ) : (
                          <ChevronRightIcon className="w-5 h-5 text-muted-foreground" />
                        )}
                      </div>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* All Languages by Region */}
        <div className="space-y-6">
          <AnimatePresence>
            {Object.entries(languagesByRegion).map(([region, regionLanguages]) => (
              <motion.div
                key={region}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.2 }}
              >
                <h3 className="font-medium text-foreground mb-3">{region}</h3>
                <div className="grid grid-cols-1 gap-3">
                  {regionLanguages.map((language) => (
                    <motion.div
                      key={language.id}
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.99 }}
                    >
                      <Card
                        className={`p-4 cursor-pointer transition-all duration-200 hover:shadow-md ${
                          selectedLanguage?.id === language.id
                            ? 'ring-2 ring-blue-500 bg-blue-50 dark:bg-blue-950'
                            : 'hover:bg-accent'
                        }`}
                        onClick={() => handleLanguageSelect(language)}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4">
                            <div className="text-2xl">{language.flag}</div>
                            <div>
                              <h3 className="font-semibold text-foreground">{language.name}</h3>
                              <p className="text-sm text-muted-foreground">{language.nativeName}</p>
                            </div>
                          </div>
                          
                          <div className="flex items-center space-x-2">
                            {selectedLanguage?.id === language.id ? (
                              <CheckCircleIcon className="w-6 h-6 text-green-600" />
                            ) : (
                              <ChevronRightIcon className="w-5 h-5 text-muted-foreground" />
                            )}
                          </div>
                        </div>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* No Results */}
        {filteredLanguages.length === 0 && (
          <div className="text-center py-8">
            <GlobeAltIcon className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">No languages found</h3>
            <p className="text-muted-foreground">
              Try adjusting your search terms
            </p>
          </div>
        )}
      </Card>

      {/* Selection Summary */}
      {selectedLanguage && (
        <Card className="p-4 bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <CheckCircleIcon className="w-6 h-6 text-green-600" />
              <div>
                <h3 className="font-semibold text-green-800 dark:text-green-200">
                  Target Language Selected!
                </h3>
                <p className="text-sm text-green-600 dark:text-green-400">
                  Your audio will be translated to {selectedLanguage.name}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-2xl">{selectedLanguage.flag}</span>
            </div>
          </div>
        </Card>
      )}

      {/* Translation Info */}
      <Card className="p-4 bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800">
        <h3 className="font-medium text-blue-800 dark:text-blue-200 mb-2">
          🌍 About Translation
        </h3>
        <div className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
          <div>• AI will translate speech while preserving natural tone</div>
          <div>• Original speaker characteristics are maintained</div>
          <div>• High accuracy translation with context awareness</div>
          <div>• Multiple voice options available per language</div>
        </div>
      </Card>
    </div>
  );
};

export default LanguageSelectionStep;