import React, { useRef, useState } from 'react';
import { Button } from './ui/button';
import { Progress } from './ui/progress';

interface AudioUploaderProps {
  onUpload: (file: File) => void;
  isLoading: boolean;
}

const AudioUploader: React.FC<AudioUploaderProps> = ({ onUpload, isLoading }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragActive, setDragActive] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      simulateUpload(file);
    }
  };

  const handleDrag = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      simulateUpload(file);
    }
  };

  const simulateUpload = (file: File) => {
    setUploadProgress(0);
    const interval = setInterval(() => {
      setUploadProgress((prevProgress) => {
        if (prevProgress >= 100) {
          clearInterval(interval);
          onUpload(file);
          return 100;
        }
        return prevProgress + 10;
      });
    }, 100);
  };

  return (
    <div
      className={`border-2 border-dashed rounded-lg p-8 text-center ${
        dragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
      }`}
      onDragEnter={handleDrag}
      onDragLeave={handleDrag}
      onDragOver={handleDrag}
      onDrop={handleDrop}
    >
      <input
        type="file"
        accept="audio/*"
        onChange={handleFileChange}
        ref={fileInputRef}
        className="hidden"
      />
      <p className="mb-4">Drag and drop an audio file here, or click to select a file</p>
      <Button
        onClick={() => fileInputRef.current?.click()}
        disabled={isLoading}
      >
        {isLoading ? 'Uploading...' : 'Select File'}
      </Button>
      {uploadProgress > 0 && uploadProgress < 100 && (
        <Progress value={uploadProgress} className="mt-4" />
      )}
    </div>
  );
};

export default AudioUploader;

