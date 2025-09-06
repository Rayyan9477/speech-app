import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card } from '../../ui/card';
import { Progress } from '../../ui/progress';
import { Badge } from '../../ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '../../ui/avatar';
import { ProcessingJob } from '../../../contexts/VoiceProcessingContext';
import {
  CpuChipIcon,
  SpeakerWaveIcon,
  ClockIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';

interface ProcessingStepProps {
  job?: ProcessingJob;
  progress: number;
  isProcessing: boolean;
}

const ProcessingStep: React.FC<ProcessingStepProps> = ({
  job,
  progress,
  isProcessing
}) => {
  const [currentStage, setCurrentStage] = useState(0);
  const [timeElapsed, setTimeElapsed] = useState(0);

  const processingStages = [
    {
      id: 0,
      title: 'Analyzing Audio',
      description: 'AI is analyzing the speech patterns and characteristics',
      icon: SpeakerWaveIcon,
      duration: 20
    },
    {
      id: 1,
      title: 'Voice Mapping',
      description: 'Creating voice transformation mapping',
      icon: CpuChipIcon,
      duration: 40
    },
    {
      id: 2,
      title: 'Applying Transformation',
      description: 'Transforming audio to target voice',
      icon: SpeakerWaveIcon,
      duration: 70
    },
    {
      id: 3,
      title: 'Finalizing',
      description: 'Optimizing audio quality and preparing output',
      icon: CheckCircleIcon,
      duration: 100
    }
  ];

  // Update current stage based on progress
  useEffect(() => {
    const stage = processingStages.findIndex((stage, index) => {
      const nextStage = processingStages[index + 1];
      return progress >= stage.duration && (!nextStage || progress < nextStage.duration);
    });
    
    if (stage !== -1) {
      setCurrentStage(stage);
    }
  }, [progress]);

  // Timer for elapsed time
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isProcessing) {
      interval = setInterval(() => {
        setTimeElapsed(prev => prev + 1);
      }, 1000);
    } else {
      setTimeElapsed(0);
    }

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [isProcessing]);

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getEstimatedTimeRemaining = (): string => {
    if (progress === 0) return '~3 min';
    
    const rate = progress / timeElapsed;
    const remainingProgress = 100 - progress;
    const estimatedSeconds = Math.round(remainingProgress / rate);
    
    if (estimatedSeconds < 60) {
      return `~${estimatedSeconds}s`;
    } else {
      return `~${Math.round(estimatedSeconds / 60)}m`;
    }
  };

  if (!job) {
    return (
      <Card className="p-8 text-center">
        <ExclamationTriangleIcon className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-foreground mb-2">No Processing Job Found</h3>
        <p className="text-muted-foreground">Please start from the beginning</p>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Processing Header */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-semibold text-foreground">AI Voice Transformation</h2>
            <p className="text-muted-foreground">
              Transforming your audio with advanced AI technology
            </p>
          </div>
          
          <Badge 
            variant={isProcessing ? 'default' : job.status === 'completed' ? 'default' : 'destructive'}
            className={
              isProcessing 
                ? 'bg-blue-500 text-white' 
                : job.status === 'completed' 
                ? 'bg-green-500 text-white'
                : 'bg-red-500 text-white'
            }
          >
            {isProcessing ? 'Processing' : job.status === 'completed' ? 'Completed' : 'Failed'}
          </Badge>
        </div>

        {/* Progress Overview */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-foreground">Overall Progress</span>
            <span className="text-sm font-bold text-foreground">{Math.round(progress)}%</span>
          </div>
          
          <Progress value={progress} className="h-3" />
          
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <div className="flex items-center space-x-2">
              <ClockIcon className="w-4 h-4" />
              <span>Elapsed: {formatTime(timeElapsed)}</span>
            </div>
            {isProcessing && (
              <span>Estimated remaining: {getEstimatedTimeRemaining()}</span>
            )}
          </div>
        </div>
      </Card>

      {/* Job Details */}
      <Card className="p-6">
        <h3 className="font-semibold text-foreground mb-4">Transformation Details</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Source Audio */}
          <div>
            <h4 className="font-medium text-foreground mb-3">Source Audio</h4>
            <div className="flex items-center space-x-3 p-3 bg-muted/50 rounded-lg">
              <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
                <SpeakerWaveIcon className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <div className="font-medium text-sm">{job.sourceAudio.name}</div>
                <div className="text-xs text-muted-foreground">
                  {Math.floor(job.sourceAudio.duration)}s • {job.sourceAudio.format.replace('audio/', '').toUpperCase()}
                </div>
              </div>
            </div>
          </div>

          {/* Target Voice */}
          <div>
            <h4 className="font-medium text-foreground mb-3">Target Voice</h4>
            <div className="flex items-center space-x-3 p-3 bg-muted/50 rounded-lg">
              <Avatar className="w-10 h-10">
                <AvatarImage src="/api/placeholder/40/40" />
                <AvatarFallback className="bg-gradient-to-br from-purple-400 to-pink-400 text-white font-semibold text-sm">
                  AI
                </AvatarFallback>
              </Avatar>
              <div>
                <div className="font-medium text-sm">Selected Voice</div>
                <div className="text-xs text-muted-foreground">
                  AI-generated voice transformation
                </div>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Processing Stages */}
      <Card className="p-6">
        <h3 className="font-semibold text-foreground mb-4">Processing Stages</h3>
        
        <div className="space-y-4">
          {processingStages.map((stage, index) => {
            const isActive = currentStage === index && isProcessing;
            const isCompleted = progress >= stage.duration;
            const stageProgress = isActive 
              ? Math.min(100, ((progress - (processingStages[index - 1]?.duration || 0)) / 
                  (stage.duration - (processingStages[index - 1]?.duration || 0))) * 100)
              : isCompleted ? 100 : 0;

            return (
              <div
                key={stage.id}
                className={`flex items-start space-x-4 p-4 rounded-lg transition-all ${
                  isActive ? 'bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800' : 
                  isCompleted ? 'bg-green-50 dark:bg-green-950' : 'bg-muted/30'
                }`}
              >
                {/* Stage Icon */}
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  isCompleted ? 'bg-green-500' :
                  isActive ? 'bg-blue-500' : 'bg-muted'
                }`}>
                  <stage.icon className={`w-5 h-5 ${
                    isCompleted || isActive ? 'text-white' : 'text-muted-foreground'
                  }`} />
                </div>

                {/* Stage Content */}
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className={`font-medium ${
                      isActive ? 'text-blue-800 dark:text-blue-200' :
                      isCompleted ? 'text-green-800 dark:text-green-200' : 'text-muted-foreground'
                    }`}>
                      {stage.title}
                    </h4>
                    
                    {isActive && (
                      <Badge variant="secondary" className="text-xs">
                        {Math.round(stageProgress)}%
                      </Badge>
                    )}
                    
                    {isCompleted && !isActive && (
                      <CheckCircleIcon className="w-5 h-5 text-green-500" />
                    )}
                  </div>
                  
                  <p className={`text-sm ${
                    isActive ? 'text-blue-700 dark:text-blue-300' :
                    isCompleted ? 'text-green-700 dark:text-green-300' : 'text-muted-foreground'
                  }`}>
                    {stage.description}
                  </p>

                  {/* Stage Progress Bar */}
                  {isActive && (
                    <div className="mt-3">
                      <Progress value={stageProgress} className="h-2" />
                    </div>
                  )}
                </div>

                {/* Active Animation */}
                {isActive && (
                  <motion.div
                    className="w-3 h-3 bg-blue-500 rounded-full"
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  />
                )}
              </div>
            );
          })}
        </div>
      </Card>

      {/* Processing Tips */}
      {isProcessing && (
        <Card className="p-4 bg-yellow-50 dark:bg-yellow-950 border-yellow-200 dark:border-yellow-800">
          <h3 className="font-medium text-yellow-800 dark:text-yellow-200 mb-2">
            🎯 What's Happening Now
          </h3>
          <div className="text-sm text-yellow-700 dark:text-yellow-300">
            <p className="mb-2">
              Our AI is analyzing your audio and applying voice transformation technology:
            </p>
            <div className="space-y-1">
              <div>• Speech pattern analysis for natural results</div>
              <div>• Voice characteristic mapping and matching</div>
              <div>• High-quality audio processing and optimization</div>
              <div>• Quality assurance and final touches</div>
            </div>
          </div>
        </Card>
      )}

      {/* Error State */}
      {job.status === 'failed' && (
        <Card className="p-6 bg-red-50 dark:bg-red-950 border-red-200 dark:border-red-800">
          <div className="flex items-center space-x-3">
            <ExclamationTriangleIcon className="w-6 h-6 text-red-600" />
            <div>
              <h3 className="font-semibold text-red-800 dark:text-red-200">
                Processing Failed
              </h3>
              <p className="text-sm text-red-600 dark:text-red-400 mt-1">
                {job.error || 'An error occurred during processing. Please try again.'}
              </p>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};

export default ProcessingStep;