import React, { useState } from 'react';
import { Button } from '../ui/button';
import { Card, CardContent } from '../ui/card';
import { apiClient } from '../../api/client';
import type { VoiceCloneResponse } from '../../api/client';

interface VoiceCloneCreatorProps {
  onCloneCreated: (clone: VoiceCloneResponse) => void;
  onError: (error: string) => void;
}

const VoiceCloneCreator: React.FC<VoiceCloneCreatorProps> = ({ 
  onCloneCreated, 
  onError 
}) => {
  const [name, setName] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file type
      const allowedTypes = ['audio/wav', 'audio/mp3', 'audio/ogg', 'audio/m4a', 'audio/flac'];
      if (!allowedTypes.includes(file.type)) {
        onError('Please select a valid audio file (WAV, MP3, OGG, M4A, or FLAC)');
        return;
      }
      
      // Validate file size (max 50MB)
      if (file.size > 50 * 1024 * 1024) {
        onError('File size must be less than 50MB');
        return;
      }
      
      setSelectedFile(file);
    }
  };

  const handleCreateClone = async () => {
    if (!name.trim()) {
      onError('Please enter a name for your voice clone');
      return;
    }

    if (!selectedFile) {
      onError('Please select an audio file');
      return;
    }

    setIsUploading(true);
    try {
      const response = await apiClient.createVoiceClone(name.trim(), selectedFile);
      onCloneCreated(response);
      
      // Reset form
      setName('');
      setSelectedFile(null);
      const fileInput = document.getElementById('voice-sample-input') as HTMLInputElement;
      if (fileInput) fileInput.value = '';
      
    } catch (error) {
      onError(error instanceof Error ? error.message : 'Voice clone creation failed');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Card>
      <CardContent className="p-6">
        <h3 className="text-xl font-semibold mb-4">Create Voice Clone</h3>
        
        <div className="space-y-4">
          <div>
            <label htmlFor="clone-name" className="block text-sm font-medium text-gray-700 mb-1">
              Voice Clone Name
            </label>
            <input
              id="clone-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., My Voice, Professional Voice"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              maxLength={100}
            />
          </div>

          <div>
            <label htmlFor="voice-sample-input" className="block text-sm font-medium text-gray-700 mb-1">
              Voice Sample Audio
            </label>
            <input
              id="voice-sample-input"
              type="file"
              accept="audio/*"
              onChange={handleFileSelect}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <p className="text-xs text-gray-500 mt-1">
              Upload a clear audio sample (10-60 seconds recommended). Supported formats: WAV, MP3, OGG, M4A, FLAC. Max size: 50MB.
            </p>
          </div>

          {selectedFile && (
            <div className="text-sm text-gray-600">
              Selected: {selectedFile.name} ({(selectedFile.size / (1024 * 1024)).toFixed(2)} MB)
            </div>
          )}

          <Button
            onClick={handleCreateClone}
            disabled={isUploading || !name.trim() || !selectedFile}
            className="w-full"
          >
            {isUploading ? 'Creating Voice Clone...' : 'Create Voice Clone'}
          </Button>
        </div>

        <div className="mt-4 p-3 bg-blue-50 rounded-lg">
          <h4 className="font-medium text-blue-800 mb-2">Tips for Best Results:</h4>
          <ul className="text-sm text-blue-700 space-y-1">
            <li>• Use clear, high-quality audio with minimal background noise</li>
            <li>• 10-60 seconds of speech works best</li>
            <li>• Speak in a natural, consistent tone</li>
            <li>• Avoid music or multiple speakers in the background</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};

export default VoiceCloneCreator;