import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '../../components/ui/button';
import { Card } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { useTheme } from '../../lib/theme-provider';
import {
  MicrophoneIcon,
  ArrowPathIcon,
  SpeakerWaveIcon,
  PlayIcon,
  PauseIcon,
  StopIcon,
  LanguageIcon,
  DocumentTextIcon
} from '@heroicons/react/24/outline';
import {
  MicrophoneIcon as MicrophoneIconSolid,
  PlayIcon as PlayIconSolid,
  PauseIcon as PauseIconSolid,
  StopIcon as StopIconSolid
} from '@heroicons/react/24/solid';

const VoiceTranslate = () => {
  const { theme } = useTheme();
  const [inputText, setInputText] = useState('');
  const [translatedText, setTranslatedText] = useState('');
  const [sourceLang, setSourceLang] = useState('English');
  const [targetLang, setTargetLang] = useState('Spanish');
  const [isRecording, setIsRecording] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isTranslating, setIsTranslating] = useState(false);

  const languages = [
    { code: 'en', name: 'English', flag: '🇺🇸' },
    { code: 'es', name: 'Spanish', flag: '🇪🇸' },
    { code: 'fr', name: 'French', flag: '🇫🇷' },
    { code: 'de', name: 'German', flag: '🇩🇪' },
    { code: 'it', name: 'Italian', flag: '🇮🇹' },
    { code: 'pt', name: 'Portuguese', flag: '🇵🇹' },
    { code: 'ja', name: 'Japanese', flag: '🇯🇵' },
    { code: 'ko', name: 'Korean', flag: '🇰🇷' },
    { code: 'zh', name: 'Chinese', flag: '🇨🇳' },
    { code: 'ar', name: 'Arabic', flag: '🇸🇦' },
  ];

  const handleRecord = () => {
    if (isRecording) {
      setIsRecording(false);
      // Simulate voice recognition
      setTimeout(() => {
        setInputText('Hello, how are you today? I hope you are doing well.');
      }, 1000);
    } else {
      setIsRecording(true);
      setInputText('');
    }
  };

  const handleTranslate = () => {
    if (!inputText.trim()) return;

    setIsTranslating(true);
    // Simulate translation
    setTimeout(() => {
      const translations = {
        'Spanish': 'Hola, ¿cómo estás hoy? Espero que estés bien.',
        'French': 'Bonjour, comment allez-vous aujourd\'hui ? J\'espère que vous allez bien.',
        'German': 'Hallo, wie geht es Ihnen heute? Ich hoffe, es geht Ihnen gut.',
        'Italian': 'Ciao, come stai oggi? Spero che tu stia bene.',
        'Portuguese': 'Olá, como você está hoje? Espero que você esteja bem.',
        'Japanese': 'こんにちは、今日はお元気ですか？お元気でお過ごしでしょうか。',
        'Korean': '안녕하세요, 오늘 어떻게 지내세요? 잘 지내고 있기를 바랍니다.',
        'Chinese': '你好，今天怎么样？我希望你一切都好。',
        'Arabic': 'مرحبا، كيف حالك اليوم؟ أتمنى أن تكون بخير.'
      };
      setTranslatedText(translations[targetLang] || 'Translation not available');
      setIsTranslating(false);
    }, 1500);
  };

  const handlePlay = () => {
    if (isPlaying) {
      setIsPlaying(false);
    } else {
      setIsPlaying(true);
    }
  };

  const handleStop = () => {
    setIsPlaying(false);
  };

  const swapLanguages = () => {
    const temp = sourceLang;
    setSourceLang(targetLang);
    setTargetLang(temp);
    const tempText = inputText;
    setInputText(translatedText);
    setTranslatedText(tempText);
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.6,
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.4 }
    }
  };

  return (
    <div className="min-h-screen pb-20">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="py-6 space-y-6"
      >
        {/* Header */}
        <motion.div variants={itemVariants} className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Voice Translate</h1>
            <p className="text-muted-foreground mt-1">Translate and speak in any language</p>
          </div>
          <Badge variant="outline" className="rounded-full">
            <LanguageIcon className="w-4 h-4 mr-1" />
            AI Powered
          </Badge>
        </motion.div>

        {/* Language Selection */}
        <motion.div variants={itemVariants}>
          <Card className="p-4">
            <div className="flex items-center justify-between">
              {/* Source Language */}
              <div className="flex-1">
                <label className="text-sm font-medium text-muted-foreground mb-2 block">
                  From
                </label>
                <select
                  value={sourceLang}
                  onChange={(e) => setSourceLang(e.target.value)}
                  className={`w-full p-3 rounded-lg border focus:outline-none focus:ring-2 focus:ring-primary/20 transition-colors ${
                    theme === 'dark'
                      ? 'bg-slate-800 border-slate-700 text-white'
                      : 'bg-white border-slate-200 text-slate-900'
                  }`}
                  aria-label="Select source language for translation"
                  title="Choose the language to translate from"
                >
                  {languages.map((lang) => (
                    <option key={lang.code} value={lang.name}>
                      {lang.flag} {lang.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Swap Button */}
              <div className="mx-4 flex items-center">
                <Button
                  onClick={swapLanguages}
                  variant="outline"
                  size="sm"
                  className="w-10 h-10 rounded-full p-0"
                >
                  <ArrowPathIcon className="w-4 h-4" />
                </Button>
              </div>

              {/* Target Language */}
              <div className="flex-1">
                <label className="text-sm font-medium text-muted-foreground mb-2 block">
                  To
                </label>
                <select
                  value={targetLang}
                  onChange={(e) => setTargetLang(e.target.value)}
                  className={`w-full p-3 rounded-lg border focus:outline-none focus:ring-2 focus:ring-primary/20 transition-colors ${
                    theme === 'dark'
                      ? 'bg-slate-800 border-slate-700 text-white'
                      : 'bg-white border-slate-200 text-slate-900'
                  }`}
                  aria-label="Select target language for translation"
                  title="Choose the language to translate to"
                >
                  {languages.map((lang) => (
                    <option key={lang.code} value={lang.name}>
                      {lang.flag} {lang.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Input Section */}
        <motion.div variants={itemVariants}>
          <Card className="p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2">
                <DocumentTextIcon className="w-5 h-5 text-muted-foreground" />
                <span className="text-sm font-medium text-foreground">Input Text</span>
              </div>
              <Button
                onClick={handleRecord}
                variant={isRecording ? "destructive" : "outline"}
                size="sm"
                className="rounded-full"
              >
                <MicrophoneIcon className={`w-4 h-4 mr-2 ${
                  isRecording ? 'animate-pulse' : ''
                }`} />
                {isRecording ? 'Recording...' : 'Voice Input'}
              </Button>
            </div>

            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Type your text here or use voice input..."
              className={`w-full h-24 p-3 rounded-lg border resize-none focus:outline-none focus:ring-2 focus:ring-primary/20 transition-colors ${
                theme === 'dark'
                  ? 'bg-slate-800 border-slate-700 text-white placeholder-slate-400'
                  : 'bg-white border-slate-200 text-slate-900 placeholder-slate-500'
              }`}
            />
          </Card>
        </motion.div>

        {/* Translate Button */}
        <motion.div variants={itemVariants}>
          <Button
            onClick={handleTranslate}
            size="lg"
            className="w-full h-12 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-semibold rounded-xl shadow-lg"
            disabled={!inputText.trim() || isTranslating}
          >
            {isTranslating ? (
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Translating...</span>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <LanguageIcon className="w-5 h-5" />
                <span>Translate & Generate Voice</span>
              </div>
            )}
          </Button>
        </motion.div>

        {/* Translation Output */}
        {translatedText && (
          <motion.div
            variants={itemVariants}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card className="p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-2">
                  <SpeakerWaveIcon className="w-5 h-5 text-muted-foreground" />
                  <span className="text-sm font-medium text-foreground">Translation</span>
                  <Badge variant="outline" className="text-xs">
                    {targetLang}
                  </Badge>
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    onClick={handleStop}
                    variant="outline"
                    size="sm"
                    className="w-8 h-8 rounded-full p-0"
                    disabled={!isPlaying}
                  >
                    <StopIcon className="w-4 h-4" />
                  </Button>
                  <Button
                    onClick={handlePlay}
                    variant="outline"
                    size="sm"
                    className="w-8 h-8 rounded-full p-0"
                  >
                    {isPlaying ? (
                      <PauseIcon className="w-4 h-4" />
                    ) : (
                      <PlayIcon className="w-4 h-4" />
                    )}
                  </Button>
                </div>
              </div>

              <div className={`p-3 rounded-lg ${
                theme === 'dark' ? 'bg-slate-800' : 'bg-slate-50'
              }`}>
                <p className="text-foreground leading-relaxed">{translatedText}</p>
              </div>

              {/* Audio Waveform */}
              {isPlaying && (
                <div className="mt-4">
                  <div className="flex items-end justify-center space-x-1 h-12 bg-muted/50 rounded-lg p-2">
                    {[...Array(15)].map((_, i) => (
                      <motion.div
                        key={i}
                        className="w-1 bg-primary rounded-full"
                        animate={{
                          height: Math.random() * 32 + 8
                        }}
                        transition={{
                          duration: 0.2,
                          repeat: Infinity,
                          repeatType: "reverse"
                        }}
                      />
                    ))}
                  </div>
                </div>
              )}
            </Card>
          </motion.div>
        )}

        {/* Popular Translations */}
        <motion.div variants={itemVariants}>
          <h2 className="text-lg font-semibold text-foreground mb-4">Popular Translations</h2>
          <div className="grid grid-cols-2 gap-3">
            {[
              { from: 'Hello', to: 'Hola', fromLang: 'EN', toLang: 'ES' },
              { from: 'Thank you', to: 'Merci', fromLang: 'EN', toLang: 'FR' },
              { from: 'How are you?', to: 'Wie geht\'s?', fromLang: 'EN', toLang: 'DE' },
              { from: 'Good morning', to: 'Buenos días', fromLang: 'EN', toLang: 'ES' }
            ].map((phrase, index) => (
              <Card
                key={index}
                className="p-3 cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => {
                  setInputText(phrase.from);
                  setSourceLang('English');
                  setTargetLang(languages.find(l => l.name.includes(phrase.toLang))?.name || 'Spanish');
                }}
              >
                <div className="text-center">
                  <p className="text-sm text-muted-foreground mb-1">{phrase.from}</p>
                  <p className="text-sm font-medium text-foreground">{phrase.to}</p>
                  <div className="flex items-center justify-center space-x-1 mt-1">
                    <span className="text-xs text-muted-foreground">{phrase.fromLang}</span>
                    <ArrowPathIcon className="w-3 h-3 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">{phrase.toLang}</span>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </motion.div>

        {/* Usage Stats */}
        <motion.div variants={itemVariants}>
          <Card className="p-4 bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-950 dark:to-blue-950">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <LanguageIcon className="w-5 h-5 text-green-600" />
                <div>
                  <p className="text-sm font-medium text-foreground">Translation Credits</p>
                  <p className="text-xs text-muted-foreground">Resets monthly</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium text-foreground">47 / 100</p>
                <div className="w-20 bg-white/50 rounded-full h-1.5 mt-1">
                  <div className="bg-green-600 h-1.5 rounded-full w-1/2"></div>
                </div>
              </div>
            </div>
          </Card>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default VoiceTranslate;
