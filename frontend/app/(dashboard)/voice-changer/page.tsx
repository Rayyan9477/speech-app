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
  PauseIcon,
  ArrowUpTrayIcon
} from '@heroicons/react/24/outline';

const recentUploads = [
  { id: 1, name: 'voice-sample-01.mp3', duration: '0:45', size: '2.1 MB', uploadedAt: '2 hours ago' },
  { id: 2, name: 'podcast-intro.wav', duration: '1:23', size: '5.2 MB', uploadedAt: '1 day ago' },
  { id: 3, name: 'recording-003.m4a', duration: '0:38', size: '1.8 MB', uploadedAt: '3 days ago' }
];

const quickRecordingOptions = [
  { id: 'quick', name: 'Quick Test', duration: '10 seconds', description: 'Record a quick sample to test voice changing' },
  { id: 'short', name: 'Short Recording', duration: '30 seconds', description: 'Perfect for voice samples and demos' },
  { id: 'medium', name: 'Medium Recording', duration: '2 minutes', description: 'Ideal for longer content and speeches' }
];

export default function VoiceChangerPage() {
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);
  
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const recordingInterval = useRef<NodeJS.Timeout | null>(null);

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
        setUploadedFile(file);
        handleProceedWithFile(file);
      }
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const file = files[0];
      setUploadedFile(file);
      handleProceedWithFile(file);
    }
  };

  const handleProceedWithFile = (file: File) => {
    // Navigate to voice selection with file data
    router.push(`/dashboard/voice-changer/upload?file=${file.name}`);
  };

  const startRecording = () => {
    setIsRecording(true);
    setRecordingDuration(0);
    
    recordingInterval.current = setInterval(() => {
      setRecordingDuration(prev => prev + 1);
    }, 1000);
  };

  const stopRecording = () => {
    setIsRecording(false);
    if (recordingInterval.current) {
      clearInterval(recordingInterval.current);
    }
    
    // Simulate recording completion and proceed
    router.push('/dashboard/voice-changer/upload?type=recording');
  };

  const handleRecentFileSelect = (fileId: number) => {
    router.push(`/dashboard/voice-changer/upload?recent=${fileId}`);
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
              <h1 className="text-lg font-semibold text-gray-900">AI Voice Changer</h1>
              <p className="text-sm text-gray-500">Transform any voice into another</p>
            </div>
          </div>
        </div>
      </div>

      <div className="px-6 py-6 space-y-8">
        {/* Upload Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Upload Audio File</h2>
          
          <div
            className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors ${
              dragActive 
                ? 'border-primary-500 bg-primary-50' 
                : 'border-gray-300 hover:border-gray-400'
            }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <div className="max-w-sm mx-auto">
              <CloudArrowUpIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Drop your audio file here
              </h3>
              
              <p className="text-gray-600 mb-4">
                Support for MP3, WAV, M4A, FLAC files up to 100MB
              </p>
              
              <Button 
                onClick={() => fileInputRef.current?.click()}
                className="mb-2"
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
              
              <p className="text-sm text-gray-500">
                Or drag and drop your file here
              </p>
            </div>
          </div>
        </motion.div>

        {/* Recording Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Record New Audio</h2>
          
          <div className="bg-gray-50 rounded-xl p-6">
            {!isRecording ? (
              <div className="text-center">
                <div className="w-20 h-20 bg-gradient-to-r from-red-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <MicrophoneIcon className="w-8 h-8 text-white" />
                </div>
                
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Record Voice Sample
                </h3>
                
                <p className="text-gray-600 mb-6">
                  Record a clear voice sample for the best transformation results
                </p>

                <div className="grid grid-cols-1 gap-3 mb-6">
                  {quickRecordingOptions.map((option) => (
                    <button
                      key={option.id}
                      onClick={() => setSelectedOption(option.id)}
                      className={`p-3 rounded-lg border text-left transition-colors ${
                        selectedOption === option.id
                          ? 'border-primary-500 bg-primary-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex justify-between items-center">
                        <div>
                          <h4 className="font-medium text-gray-900">{option.name}</h4>
                          <p className="text-sm text-gray-600">{option.description}</p>
                        </div>
                        <span className="text-sm font-medium text-gray-500">{option.duration}</span>
                      </div>
                    </button>
                  ))}
                </div>
                
                <Button 
                  onClick={startRecording}
                  disabled={!selectedOption}
                  size="lg"
                  className="w-full"
                >
                  <MicrophoneIcon className="w-5 h-5 mr-2" />
                  Start Recording
                </Button>
              </div>
            ) : (
              <div className="text-center">
                <div className="w-20 h-20 bg-red-500 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
                  <MicrophoneIcon className="w-8 h-8 text-white" />
                </div>
                
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Recording...
                </h3>
                
                <div className="text-3xl font-bold text-red-500 mb-4">
                  {formatDuration(recordingDuration)}
                </div>
                
                <div className="w-full bg-gray-200 rounded-full h-2 mb-6">
                  <div 
                    className="bg-red-500 h-2 rounded-full transition-all duration-1000"
                    style={{ 
                      width: selectedOption === 'quick' 
                        ? `${(recordingDuration / 10) * 100}%`
                        : selectedOption === 'short'
                        ? `${(recordingDuration / 30) * 100}%`
                        : `${(recordingDuration / 120) * 100}%`
                    }}
                  />
                </div>
                
                <Button 
                  onClick={stopRecording}
                  variant="outline"
                  size="lg"
                  className="w-full"
                >
                  <PauseIcon className="w-5 h-5 mr-2" />
                  Stop Recording
                </Button>
              </div>
            )}
          </div>
        </motion.div>

        {/* Recent Files */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Audio Files</h2>
          
          <div className="space-y-3">
            {recentUploads.map((file) => (
              <button
                key={file.id}
                onClick={() => handleRecentFileSelect(file.id)}
                className="w-full bg-gray-50 rounded-xl p-4 text-left hover:bg-gray-100 transition-colors"
              >
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center">
                    <PlayIcon className="w-6 h-6 text-white" />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-gray-900 truncate">{file.name}</h3>
                    <div className="flex items-center space-x-2 mt-1">
                      <span className="text-sm text-gray-500">{file.duration}</span>
                      <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                      <span className="text-sm text-gray-500">{file.size}</span>
                      <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                      <span className="text-sm text-gray-500">{file.uploadedAt}</span>
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

        {/* Tips */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="bg-blue-50 rounded-xl p-4"
        >
          <h3 className="font-medium text-blue-900 mb-2">💡 Tips for Best Results</h3>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Use clear, high-quality audio recordings</li>
            <li>• Minimize background noise for better processing</li>
            <li>• Speak at a normal pace and volume</li>
            <li>• Recordings should be at least 10 seconds long</li>
          </ul>
        </motion.div>
      </div>
    </div>
  );
}