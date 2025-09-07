'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { 
  ArrowLeftIcon, 
  CloudArrowUpIcon,
  MicrophoneIcon,
  PlayIcon,
  GlobeAltIcon,
  ArrowUpTrayIcon
} from '@heroicons/react/24/outline';

const supportedLanguages = [
  { code: 'en', name: 'English', flag: '🇺🇸', popular: true },
  { code: 'es', name: 'Spanish', flag: '🇪🇸', popular: true },
  { code: 'fr', name: 'French', flag: '🇫🇷', popular: true },
  { code: 'de', name: 'German', flag: '🇩🇪', popular: true },
  { code: 'it', name: 'Italian', flag: '🇮🇹', popular: false },
  { code: 'pt', name: 'Portuguese', flag: '🇵🇹', popular: false },
  { code: 'ru', name: 'Russian', flag: '🇷🇺', popular: false },
  { code: 'ja', name: 'Japanese', flag: '🇯🇵', popular: true },
  { code: 'ko', name: 'Korean', flag: '🇰🇷', popular: false },
  { code: 'zh', name: 'Chinese', flag: '🇨🇳', popular: true },
  { code: 'ar', name: 'Arabic', flag: '🇸🇦', popular: false },
  { code: 'hi', name: 'Hindi', flag: '🇮🇳', popular: false }
];

const recentTranslations = [
  { 
    id: 1, 
    name: 'Business Meeting Recording', 
    fromLang: 'English', 
    toLang: 'Spanish', 
    duration: '5:34', 
    createdAt: '2 hours ago',
    fromFlag: '🇺🇸',
    toFlag: '🇪🇸'
  },
  { 
    id: 2, 
    name: 'Podcast Episode', 
    fromLang: 'French', 
    toLang: 'English', 
    duration: '12:45', 
    createdAt: '1 day ago',
    fromFlag: '🇫🇷',
    toFlag: '🇺🇸'
  },
  { 
    id: 3, 
    name: 'Interview Audio', 
    fromLang: 'German', 
    toLang: 'English', 
    duration: '8:12', 
    createdAt: '3 days ago',
    fromFlag: '🇩🇪',
    toFlag: '🇺🇸'
  }
];

export default function VoiceTranslatePage() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      const file = files[0];
      if (file.type.startsWith('audio/')) {
        setSelectedFile(file);
        handleProceedWithFile(file);
      }
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const file = files[0];
      setSelectedFile(file);
      handleProceedWithFile(file);
    }
  };

  const handleProceedWithFile = (file: File) => {
    router.push(`/dashboard/voice-translate/language-select?file=${file.name}`);
  };

  const startRecording = () => {
    setIsRecording(true);
    setRecordingDuration(0);
    
    const interval = setInterval(() => {
      setRecordingDuration(prev => prev + 1);
    }, 1000);
    
    setTimeout(() => {
      clearInterval(interval);
      setIsRecording(false);
      router.push('/dashboard/voice-translate/language-select?type=recording');
    }, 5000);
  };

  const handleRecentSelect = (translationId: number) => {
    router.push(`/dashboard/voice-translate/results?recent=${translationId}`);
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
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
              <h1 className="text-lg font-semibold text-gray-900">AI Voice Translate</h1>
              <p className="text-sm text-gray-500">Translate speech across 50+ languages</p>
            </div>
          </div>
        </div>
      </div>

      <div className="px-6 py-6 space-y-8">
        {/* Language Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-gradient-to-r from-green-500 to-teal-500 rounded-xl p-6 text-white"
        >
          <div className="flex items-center space-x-3 mb-4">
            <GlobeAltIcon className="w-8 h-8" />
            <div>
              <h2 className="text-xl font-bold">50+ Languages Supported</h2>
              <p className="text-green-100">Real-time voice translation with emotion preservation</p>
            </div>
          </div>
          
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold">98%</div>
              <div className="text-sm text-green-100">Accuracy</div>
            </div>
            <div>
              <div className="text-2xl font-bold">3s</div>
              <div className="text-sm text-green-100">Avg Speed</div>
            </div>
            <div>
              <div className="text-2xl font-bold">24/7</div>
              <div className="text-sm text-green-100">Available</div>
            </div>
          </div>
        </motion.div>

        {/* Popular Language Pairs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Popular Language Pairs</h2>
          <div className="grid grid-cols-2 gap-3">
            {[
              { from: '🇺🇸 English', to: '🇪🇸 Spanish' },
              { from: '🇺🇸 English', to: '🇫🇷 French' },
              { from: '🇯🇵 Japanese', to: '🇺🇸 English' },
              { from: '🇨🇳 Chinese', to: '🇺🇸 English' }
            ].map((pair, index) => (
              <button
                key={index}
                onClick={() => router.push(`/dashboard/voice-translate/language-select?from=${pair.from}&to=${pair.to}`)}
                className="p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors text-left"
              >
                <div className="text-sm font-medium text-gray-900">{pair.from}</div>
                <div className="text-xs text-gray-500 flex items-center mt-1">
                  <span>→</span>
                  <span className="ml-1">{pair.to}</span>
                </div>
              </button>
            ))}
          </div>
        </motion.div>

        {/* Upload Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Upload Audio File</h2>
          
          <div
            className={`border-2 border-dashed rounded-xl p-6 text-center transition-colors ${
              dragActive 
                ? 'border-green-500 bg-green-50' 
                : 'border-gray-300 hover:border-gray-400'
            }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <CloudArrowUpIcon className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <h3 className="text-base font-medium text-gray-900 mb-2">
              Drop your audio file here
            </h3>
            <p className="text-gray-600 text-sm mb-4">
              MP3, WAV, M4A files up to 100MB
            </p>
            
            <Button 
              onClick={() => fileInputRef.current?.click()}
              size="sm"
            >
              <ArrowUpTrayIcon className="w-4 h-4 mr-2" />
              Browse Files
            </Button>
            
            <input
              ref={fileInputRef}
              type="file"
              accept="audio/*"
              onChange={handleFileSelect}
              className="hidden"
            />
          </div>
        </motion.div>

        {/* Quick Record */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Record</h2>
          
          <div className="bg-gray-50 rounded-xl p-6 text-center">
            {!isRecording ? (
              <div>
                <div className="w-16 h-16 bg-gradient-to-r from-red-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <MicrophoneIcon className="w-8 h-8 text-white" />
                </div>
                
                <h3 className="text-base font-medium text-gray-900 mb-2">
                  Record & Translate
                </h3>
                
                <p className="text-gray-600 text-sm mb-4">
                  Record your voice and translate it instantly
                </p>
                
                <Button onClick={startRecording} size="sm">
                  <MicrophoneIcon className="w-4 h-4 mr-2" />
                  Start Recording
                </Button>
              </div>
            ) : (
              <div>
                <div className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
                  <MicrophoneIcon className="w-8 h-8 text-white" />
                </div>
                
                <h3 className="text-base font-medium text-gray-900 mb-2">
                  Recording...
                </h3>
                
                <div className="text-2xl font-bold text-red-500 mb-4">
                  {formatDuration(recordingDuration)}
                </div>
              </div>
            )}
          </div>
        </motion.div>

        {/* Recent Translations */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Recent Translations</h2>
            <Button variant="ghost" size="sm" onClick={() => router.push('/dashboard/projects')}>
              View All
            </Button>
          </div>
          
          <div className="space-y-3">
            {recentTranslations.map((translation) => (
              <button
                key={translation.id}
                onClick={() => handleRecentSelect(translation.id)}
                className="w-full bg-gray-50 rounded-xl p-4 text-left hover:bg-gray-100 transition-colors"
              >
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-teal-500 rounded-lg flex items-center justify-center">
                    <GlobeAltIcon className="w-6 h-6 text-white" />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-gray-900 truncate">{translation.name}</h3>
                    <div className="flex items-center space-x-2 mt-1">
                      <span className="text-sm text-gray-600">
                        {translation.fromFlag} {translation.fromLang}
                      </span>
                      <span className="text-gray-400">→</span>
                      <span className="text-sm text-gray-600">
                        {translation.toFlag} {translation.toLang}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2 mt-1">
                      <span className="text-xs text-gray-500">{translation.duration}</span>
                      <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                      <span className="text-xs text-gray-500">{translation.createdAt}</span>
                    </div>
                  </div>
                  
                  <div className="text-gray-400">
                    <ArrowLeftIcon className="w-5 h-5 rotate-180" />
                  </div>
                </div>
              </button>
            ))}
          </div>
        </motion.div>

        {/* Features Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="bg-blue-50 rounded-xl p-4"
        >
          <h3 className="font-medium text-blue-900 mb-2">🌟 Advanced Features</h3>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Preserves original speaker&apos;s tone and emotion</li>
            <li>• Real-time translation with 98% accuracy</li>
            <li>• Support for 50+ languages and dialects</li>
            <li>• Batch processing for multiple files</li>
          </ul>
        </motion.div>
      </div>
    </div>
  );
}