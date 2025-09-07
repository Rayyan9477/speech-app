'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  ArrowLeftIcon, 
  MagnifyingGlassIcon,
  ArrowsRightLeftIcon,
  PlayIcon,
  SpeakerWaveIcon
} from '@heroicons/react/24/outline';

const languages = [
  { code: 'en-US', name: 'English', region: 'United States', flag: '🇺🇸', popular: true },
  { code: 'en-GB', name: 'English', region: 'United Kingdom', flag: '🇬🇧', popular: true },
  { code: 'es-ES', name: 'Spanish', region: 'Spain', flag: '🇪🇸', popular: true },
  { code: 'es-MX', name: 'Spanish', region: 'Mexico', flag: '🇲🇽', popular: true },
  { code: 'fr-FR', name: 'French', region: 'France', flag: '🇫🇷', popular: true },
  { code: 'fr-CA', name: 'French', region: 'Canada', flag: '🇨🇦', popular: false },
  { code: 'de-DE', name: 'German', region: 'Germany', flag: '🇩🇪', popular: true },
  { code: 'it-IT', name: 'Italian', region: 'Italy', flag: '🇮🇹', popular: false },
  { code: 'pt-BR', name: 'Portuguese', region: 'Brazil', flag: '🇧🇷', popular: false },
  { code: 'pt-PT', name: 'Portuguese', region: 'Portugal', flag: '🇵🇹', popular: false },
  { code: 'ru-RU', name: 'Russian', region: 'Russia', flag: '🇷🇺', popular: false },
  { code: 'ja-JP', name: 'Japanese', region: 'Japan', flag: '🇯🇵', popular: true },
  { code: 'ko-KR', name: 'Korean', region: 'Korea', flag: '🇰🇷', popular: false },
  { code: 'zh-CN', name: 'Chinese', region: 'Simplified', flag: '🇨🇳', popular: true },
  { code: 'zh-TW', name: 'Chinese', region: 'Traditional', flag: '🇹🇼', popular: false },
  { code: 'ar-SA', name: 'Arabic', region: 'Saudi Arabia', flag: '🇸🇦', popular: false },
  { code: 'hi-IN', name: 'Hindi', region: 'India', flag: '🇮🇳', popular: false },
  { code: 'th-TH', name: 'Thai', region: 'Thailand', flag: '🇹🇭', popular: false },
  { code: 'vi-VN', name: 'Vietnamese', region: 'Vietnam', flag: '🇻🇳', popular: false },
  { code: 'nl-NL', name: 'Dutch', region: 'Netherlands', flag: '🇳🇱', popular: false }
];

export default function LanguageSelectPage() {
  const [fromLanguage, setFromLanguage] = useState(languages[0]);
  const [toLanguage, setToLanguage] = useState(languages[2]);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'from' | 'to'>('from');
  const [showAllLanguages, setShowAllLanguages] = useState(false);
  
  const router = useRouter();
  const searchParams = useSearchParams();

  const popularLanguages = languages.filter(lang => lang.popular);
  const displayLanguages = showAllLanguages ? languages : popularLanguages;
  
  const filteredLanguages = displayLanguages.filter(language =>
    language.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    language.region.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleLanguageSelect = (language: typeof languages[0]) => {
    if (activeTab === 'from') {
      setFromLanguage(language);
    } else {
      setToLanguage(language);
    }
  };

  const handleSwapLanguages = () => {
    const temp = fromLanguage;
    setFromLanguage(toLanguage);
    setToLanguage(temp);
  };

  const handleContinue = () => {
    const fileParam = searchParams.get('file');
    const typeParam = searchParams.get('type');
    
    let nextUrl = `/dashboard/voice-translate/processing?from=${fromLanguage.code}&to=${toLanguage.code}`;
    if (fileParam) nextUrl += `&file=${fileParam}`;
    if (typeParam) nextUrl += `&type=${typeParam}`;
    
    router.push(nextUrl);
  };

  const handlePreviewLanguage = (language: typeof languages[0]) => {
    // Play sample audio in selected language
    console.log('Playing preview for:', language.name);
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="sticky top-0 bg-white border-b border-gray-200 z-10">
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center space-x-3">
            <Button variant="ghost" size="icon" onClick={() => router.back()}>
              <ArrowLeftIcon className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-lg font-semibold text-gray-900">Select Languages</h1>
              <p className="text-sm text-gray-500">Choose source and target languages</p>
            </div>
          </div>
        </div>
      </div>

      {/* Language Selection Cards */}
      <div className="px-6 py-6">
        <div className="space-y-4 mb-6">
          {/* From Language */}
          <div 
            className={`bg-white border-2 rounded-xl p-4 cursor-pointer transition-all ${
              activeTab === 'from' ? 'border-primary-500 bg-primary-50' : 'border-gray-200'
            }`}
            onClick={() => setActiveTab('from')}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">From</p>
                <div className="flex items-center space-x-3 mt-1">
                  <span className="text-2xl">{fromLanguage.flag}</span>
                  <div>
                    <h3 className="font-semibold text-gray-900">{fromLanguage.name}</h3>
                    <p className="text-sm text-gray-600">{fromLanguage.region}</p>
                  </div>
                </div>
              </div>
              <Button 
                variant="ghost" 
                size="icon"
                onClick={(e) => {
                  e.stopPropagation();
                  handlePreviewLanguage(fromLanguage);
                }}
              >
                <PlayIcon className="w-5 h-5" />
              </Button>
            </div>
          </div>

          {/* Swap Button */}
          <div className="flex justify-center">
            <Button
              variant="outline"
              size="icon"
              onClick={handleSwapLanguages}
              className="rounded-full"
            >
              <ArrowsRightLeftIcon className="w-5 h-5" />
            </Button>
          </div>

          {/* To Language */}
          <div 
            className={`bg-white border-2 rounded-xl p-4 cursor-pointer transition-all ${
              activeTab === 'to' ? 'border-primary-500 bg-primary-50' : 'border-gray-200'
            }`}
            onClick={() => setActiveTab('to')}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">To</p>
                <div className="flex items-center space-x-3 mt-1">
                  <span className="text-2xl">{toLanguage.flag}</span>
                  <div>
                    <h3 className="font-semibold text-gray-900">{toLanguage.name}</h3>
                    <p className="text-sm text-gray-600">{toLanguage.region}</p>
                  </div>
                </div>
              </div>
              <Button 
                variant="ghost" 
                size="icon"
                onClick={(e) => {
                  e.stopPropagation();
                  handlePreviewLanguage(toLanguage);
                }}
              >
                <PlayIcon className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>

        {/* Current Selection Info */}
        <div className="bg-gradient-to-r from-green-500 to-teal-500 rounded-xl p-4 text-white mb-6">
          <div className="flex items-center space-x-2 text-sm">
            <span>{fromLanguage.flag} {fromLanguage.name}</span>
            <span>→</span>
            <span>{toLanguage.flag} {toLanguage.name}</span>
          </div>
          <p className="text-green-100 text-sm mt-1">
            Tap &quot;{activeTab === 'from' ? 'From' : 'To'}&quot; section above to change {activeTab === 'from' ? 'source' : 'target'} language
          </p>
        </div>

        {/* Search */}
        <div className="relative mb-4">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search languages..."
            className="pl-10 h-10"
          />
        </div>

        {/* Language Tabs */}
        <div className="flex space-x-1 bg-gray-100 rounded-lg p-1 mb-4">
          <button
            onClick={() => setShowAllLanguages(false)}
            className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-colors ${
              !showAllLanguages
                ? 'bg-white text-primary-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Popular ({popularLanguages.length})
          </button>
          <button
            onClick={() => setShowAllLanguages(true)}
            className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-colors ${
              showAllLanguages
                ? 'bg-white text-primary-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            All ({languages.length})
          </button>
        </div>

        {/* Language List */}
        <div className="space-y-2 mb-6">
          {filteredLanguages.map((language, index) => (
            <motion.button
              key={language.code}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2, delay: index * 0.05 }}
              onClick={() => handleLanguageSelect(language)}
              className={`w-full p-4 rounded-lg border-2 text-left transition-all ${
                (activeTab === 'from' ? fromLanguage.code : toLanguage.code) === language.code
                  ? 'border-primary-500 bg-primary-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">{language.flag}</span>
                  <div>
                    <h3 className="font-medium text-gray-900">{language.name}</h3>
                    <p className="text-sm text-gray-600">{language.region}</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  {language.popular && (
                    <span className="px-2 py-1 bg-orange-100 text-orange-800 text-xs rounded-full font-medium">
                      Popular
                    </span>
                  )}
                  <Button 
                    variant="ghost" 
                    size="icon"
                    onClick={(e) => {
                      e.stopPropagation();
                      handlePreviewLanguage(language);
                    }}
                    className="h-8 w-8"
                  >
                    <SpeakerWaveIcon className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </motion.button>
          ))}
        </div>

        {filteredLanguages.length === 0 && (
          <div className="text-center py-8">
            <div className="text-4xl mb-4">🔍</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No languages found</h3>
            <p className="text-gray-600">Try adjusting your search terms</p>
          </div>
        )}

        {/* Continue Button */}
        <div className="sticky bottom-0 bg-white pt-4 pb-8">
          <Button
            onClick={handleContinue}
            fullWidth
            className="h-12 font-medium"
            disabled={fromLanguage.code === toLanguage.code}
          >
            Continue Translation
          </Button>
          
          {fromLanguage.code === toLanguage.code && (
            <p className="text-sm text-gray-500 text-center mt-2">
              Please select different source and target languages
            </p>
          )}
        </div>
      </div>
    </div>
  );
}