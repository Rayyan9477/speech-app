'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import {
  ArrowLeftIcon,
  CloudArrowDownIcon,
  ShareIcon,
  DocumentDuplicateIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';

const exportFormats = [
  {
    id: 'mp3',
    name: 'MP3',
    description: 'Universal audio format, good quality',
    fileSize: '~2.3 MB',
    icon: '🎵',
    recommended: true
  },
  {
    id: 'wav',
    name: 'WAV',
    description: 'Uncompressed, highest quality',
    fileSize: '~15.2 MB',
    icon: '🎼',
    recommended: false
  },
  {
    id: 'aac',
    name: 'AAC',
    description: 'Compressed, good for mobile',
    fileSize: '~1.8 MB',
    icon: '📱',
    recommended: false
  },
  {
    id: 'ogg',
    name: 'OGG',
    description: 'Open format, good compression',
    fileSize: '~1.5 MB',
    icon: '🎧',
    recommended: false
  }
];

const exportOptions = [
  {
    id: 'full-project',
    name: 'Full Project',
    description: 'Complete audio with all segments',
    duration: '4:32'
  },
  {
    id: 'selected-segments',
    name: 'Selected Segments',
    description: 'Only export highlighted segments',
    duration: '2:15'
  },
  {
    id: 'current-segment',
    name: 'Current Segment',
    description: 'Export only the active segment',
    duration: '1:08'
  }
];

export default function TTSExportPage() {
  const [selectedFormat, setSelectedFormat] = useState('mp3');
  const [selectedOption, setSelectedOption] = useState('full-project');
  const [isExporting, setIsExporting] = useState(false);
  const [exportComplete, setExportComplete] = useState(false);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);

  const router = useRouter();
  const searchParams = useSearchParams();
  const projectName = searchParams.get('name') || 'Untitled Project';

  const handleExport = async () => {
    setIsExporting(true);

    // Simulate export process
    await new Promise(resolve => setTimeout(resolve, 3000));

    setIsExporting(false);
    setExportComplete(true);
    setDownloadUrl('#'); // In real app, this would be the actual download URL
  };

  const handleDownload = () => {
    // In real app, trigger actual download
    console.log('Downloading file...');
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: `${projectName} - TTS Export`,
        text: 'Check out my AI-generated voice content!',
        url: downloadUrl || '#'
      });
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(downloadUrl || '#');
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(downloadUrl || '#');
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Header */}
      <div className="sticky top-0 bg-white border-b border-gray-200 z-10">
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center space-x-3">
            <Button variant="ghost" size="icon" onClick={() => router.back()}>
              <ArrowLeftIcon className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-lg font-semibold text-gray-900">{projectName}</h1>
              <p className="text-sm text-gray-500">Export Audio</p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 px-6 py-6 space-y-8">
        {!exportComplete ? (
          <>
            {/* Export Options */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <h2 className="text-lg font-semibold text-gray-900 mb-4">What to Export</h2>
              <div className="space-y-3">
                {exportOptions.map((option) => (
                  <button
                    key={option.id}
                    onClick={() => setSelectedOption(option.id)}
                    className={`w-full p-4 rounded-xl border-2 text-left transition-all ${
                      selectedOption === option.id
                        ? 'border-primary-500 bg-primary-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium text-gray-900">{option.name}</h3>
                        <p className="text-sm text-gray-600 mt-1">{option.description}</p>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-medium text-gray-900">{option.duration}</div>
                        <div className="text-xs text-gray-500">Duration</div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </motion.div>

            {/* Format Selection */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Audio Format</h2>
              <div className="grid grid-cols-2 gap-3">
                {exportFormats.map((format) => (
                  <button
                    key={format.id}
                    onClick={() => setSelectedFormat(format.id)}
                    className={`p-4 rounded-xl border-2 text-left transition-all ${
                      selectedFormat === format.id
                        ? 'border-primary-500 bg-primary-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center space-x-3 mb-2">
                      <div className="text-2xl">{format.icon}</div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <h3 className="font-medium text-gray-900">{format.name}</h3>
                          {format.recommended && (
                            <span className="px-2 py-0.5 bg-green-100 text-green-800 text-xs rounded-full font-medium">
                              Recommended
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600">{format.description}</p>
                    <p className="text-xs text-gray-500 mt-1">{format.fileSize}</p>
                  </button>
                ))}
              </div>
            </motion.div>

            {/* Export Summary */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="bg-gray-50 rounded-xl p-4"
            >
              <h3 className="font-medium text-gray-900 mb-3">Export Summary</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Format:</span>
                  <span className="font-medium">{exportFormats.find(f => f.id === selectedFormat)?.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Content:</span>
                  <span className="font-medium">{exportOptions.find(o => o.id === selectedOption)?.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Estimated size:</span>
                  <span className="font-medium">{exportFormats.find(f => f.id === selectedFormat)?.fileSize}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Duration:</span>
                  <span className="font-medium">{exportOptions.find(o => o.id === selectedOption)?.duration}</span>
                </div>
              </div>
            </motion.div>

            {/* Export Button */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <Button
                onClick={handleExport}
                disabled={isExporting}
                fullWidth
                size="lg"
                className="h-12 font-medium"
              >
                {isExporting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                    Exporting Audio...
                  </>
                ) : (
                  <>
                    <CloudArrowDownIcon className="w-5 h-5 mr-2" />
                    Export Audio
                  </>
                )}
              </Button>
            </motion.div>
          </>
        ) : (
          /* Export Complete */
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="text-center py-12"
          >
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircleIcon className="w-10 h-10 text-green-600" />
            </div>

            <h2 className="text-2xl font-bold text-gray-900 mb-2">Export Complete!</h2>
            <p className="text-gray-600 mb-8">
              Your audio file has been successfully generated and is ready for download.
            </p>

            <div className="bg-gray-50 rounded-xl p-6 mb-8">
              <h3 className="font-medium text-gray-900 mb-3">File Details</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Filename:</span>
                  <span className="font-medium">{projectName}.mp3</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Format:</span>
                  <span className="font-medium">MP3</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Size:</span>
                  <span className="font-medium">2.3 MB</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Duration:</span>
                  <span className="font-medium">4:32</span>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <Button
                onClick={handleDownload}
                fullWidth
                size="lg"
                className="h-12 font-medium"
              >
                <CloudArrowDownIcon className="w-5 h-5 mr-2" />
                Download Audio
              </Button>

              <div className="flex space-x-3">
                <Button
                  onClick={handleShare}
                  variant="outline"
                  className="flex-1"
                >
                  <ShareIcon className="w-4 h-4 mr-2" />
                  Share
                </Button>
                <Button
                  onClick={handleCopyLink}
                  variant="outline"
                  className="flex-1"
                >
                  <DocumentDuplicateIcon className="w-4 h-4 mr-2" />
                  Copy Link
                </Button>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-gray-200">
              <Button
                onClick={() => router.push('/dashboard/tts/create')}
                variant="ghost"
                className="text-primary-600 hover:text-primary-700"
              >
                Create Another Project
              </Button>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
