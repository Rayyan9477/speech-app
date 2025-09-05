'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';

const walkthroughSteps = [
  {
    id: 1,
    title: "AI Text-to-Speech",
    description: "Convert your text into natural-sounding speech with our advanced AI voices. Choose from hundreds of realistic voices in multiple languages.",
    icon: (
      <svg className="w-16 h-16" fill="currentColor" viewBox="0 0 24 24">
        <path d="M12 14c1.66 0 2.99-1.34 2.99-3L15 5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3zm5.3-3c0 3-2.54 5.1-5.3 5.1S6.7 14 6.7 11H5c0 3.41 2.72 6.23 6 6.72V21h2v-3.28c3.28-.48 6-3.3 6-6.72h-1.7z"/>
      </svg>
    ),
    gradient: "from-blue-500 to-cyan-500"
  },
  {
    id: 2,
    title: "Voice Transformation",
    description: "Transform any voice into another with our AI voice changer. Perfect for content creation, privacy, or just having fun with different personas.",
    icon: (
      <svg className="w-16 h-16" fill="currentColor" viewBox="0 0 24 24">
        <path d="M7.5 5.6L5 7l1.4-2.5L5 2l2.5 1.4L10 2 8.6 4.5 10 7 7.5 5.6zm12 9.8L17 14l1.4 2.5L17 19l2.5-1.4L22 19l-1.4-2.5L22 14l-2.5 1.4zM22 2l-2.5 1.4L17 2l1.4 2.5L17 7l2.5-1.4L22 7l-1.4-2.5L22 2zM13.34 12.78c-.72-.45-1.23-1.25-1.23-2.25 0-.81.42-1.43.9-1.84.27-.24.71-.4 1.1-.4.4 0 .82.17 1.13.42.34.27.65.66.65 1.31 0 .22-.06.42-.17.59-.24.4-.64.67-1.12.67-.18 0-.35-.04-.49-.11-.24-.12-.43-.31-.43-.6 0-.19.09-.39.26-.49.08-.05.18-.06.27-.06.17 0 .31.09.42.21.06.06.09.15.09.24 0 .11-.05.19-.12.24-.03.02-.07.03-.11.03-.09 0-.16-.07-.16-.16 0-.05.02-.09.06-.12.01-.01.03-.02.04-.02 0-.01-.01-.01-.02-.01-.07 0-.12.05-.12.12 0 .06.04.11.09.11.02 0 .04 0 .05-.01.08-.02.13-.09.13-.17 0-.13-.07-.24-.17-.31-.08-.06-.18-.09-.29-.09-.24 0-.43.19-.43.43 0 .28.22.5.5.5.42 0 .77-.34.77-.77 0-.65-.31-1.04-.65-1.31-.31-.25-.73-.42-1.13-.42-.39 0-.83.16-1.1.4-.48.41-.9 1.03-.9 1.84 0 1 .51 1.8 1.23 2.25.36.22.8.25 1.2.25.22 0 .42-.02.6-.07.49-.14.87-.55.87-1.05 0-.65-.42-1.18-1.05-1.18-.18 0-.35.04-.49.11-.31.16-.52.5-.52.87 0 .55.45 1 1 1 .17 0 .33-.04.46-.12.2-.12.34-.32.34-.55 0-.38-.31-.69-.69-.69-.09 0-.17.02-.24.06-.14.08-.23.23-.23.4 0 .25.2.45.45.45.06 0 .11-.01.16-.03.08-.03.14-.09.14-.18 0-.11-.09-.2-.2-.2-.04 0-.08.01-.11.03-.02.01-.03.03-.03.05 0 .03.02.05.05.05.01 0 .02 0 .03-.01.01-.01.02-.02.02-.03 0-.02-.01-.03-.03-.03-.04 0-.07.03-.07.07 0 .02.01.04.03.05.01 0 .02.01.03.01.05 0 .09-.04.09-.09 0-.07-.06-.13-.13-.13-.04 0-.08.02-.11.05-.05.05-.08.12-.08.2 0 .15.12.27.27.27.08 0 .15-.03.2-.08.07-.07.11-.16.11-.27 0-.21-.17-.38-.38-.38-.11 0-.21.05-.28.12-.1.1-.16.24-.16.39 0 .3.24.54.54.54.15 0 .29-.06.39-.16.14-.14.23-.34.23-.56 0-.43-.35-.78-.78-.78-.22 0-.42.09-.57.24-.21.21-.34.5-.34.82 0 .64.52 1.16 1.16 1.16.32 0 .61-.13.82-.34.28-.28.46-.67.46-1.1 0-.85-.69-1.54-1.54-1.54-.43 0-.82.18-1.1.46-.38.38-.62.91-.62 1.5 0 1.17.95 2.12 2.12 2.12.59 0 1.12-.24 1.5-.62.5-.5.82-1.19.82-1.96 0-1.53-1.24-2.77-2.77-2.77-.77 0-1.46.32-1.96.82-.66.66-1.08 1.57-1.08 2.58 0 2.01 1.63 3.64 3.64 3.64 1.01 0 1.92-.42 2.58-1.08.82-.82 1.33-1.96 1.33-3.22 0-2.51-2.04-4.55-4.55-4.55-1.26 0-2.4.51-3.22 1.33-1 1-1.62 2.38-1.62 3.9 0 3.04 2.46 5.5 5.5 5.5 1.52 0 2.9-.62 3.9-1.62 1.18-1.18 1.91-2.81 1.91-4.61 0-3.59-2.91-6.5-6.5-6.5-1.8 0-3.43.73-4.61 1.91C1.73 8.07 1 9.7 1 11.5c0 4.14 3.36 7.5 7.5 7.5 2.09 0 3.96-.85 5.32-2.21 1.54-1.54 2.5-3.67 2.5-6.02 0-4.69-3.81-8.5-8.5-8.5C3.33 2.27.73 4.87.27 8.18c-.08.58.32 1.09.9 1.09.51 0 .93-.39.98-.89C2.47 6.04 4.64 4.27 7.32 4.27c2.32 0 4.23 1.64 4.71 3.82.08.37.4.64.78.64.47 0 .85-.38.85-.85 0-.05-.01-.1-.02-.14-.58-2.86-3.14-5.01-6.32-5.01-3.52 0-6.37 2.85-6.37 6.37 0 .47.38.85.85.85s.85-.38.85-.85c0-2.58 2.09-4.67 4.67-4.67 2.58 0 4.67 2.09 4.67 4.67 0 .47.38.85.85.85s.85-.38.85-.85c0-3.52-2.85-6.37-6.37-6.37S1 4.58 1 8.1c0 .47.38.85.85.85s.85-.38.85-.85c0-2.58 2.09-4.67 4.67-4.67s4.67 2.09 4.67 4.67z"/>
      </svg>
    ),
    gradient: "from-purple-500 to-pink-500"
  },
  {
    id: 3,
    title: "Voice Translation",
    description: "Translate speech in real-time across 50+ languages while maintaining the original speaker's tone and emotion. Break language barriers effortlessly.",
    icon: (
      <svg className="w-16 h-16" fill="currentColor" viewBox="0 0 24 24">
        <path d="M12.87 15.07l-2.54-2.51.03-.03A17.52 17.52 0 0014.07 6H17V4h-7V2H8v2H1v2h11.17C11.5 7.92 10.44 9.75 9 11.35 8.07 10.32 7.3 9.19 6.69 8h-2c.73 1.63 1.73 3.17 2.98 4.56l-5.09 5.02L4 19l5-5 3.11 3.11.76-2.04zM18.5 10h-2L12 22h2l1.12-3h4.75L21 22h2l-4.5-12zm-2.62 7l1.62-4.33L19.12 17h-3.24z"/>
      </svg>
    ),
    gradient: "from-green-500 to-teal-500"
  }
];

export default function WalkthroughPage() {
  const [currentStep, setCurrentStep] = useState(0);
  const router = useRouter();

  const nextStep = () => {
    if (currentStep < walkthroughSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      router.push('/welcome');
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const skipWalkthrough = () => {
    router.push('/welcome');
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Header */}
      <div className="flex justify-between items-center p-6">
        <div className="flex space-x-2">
          {walkthroughSteps.map((_, index) => (
            <div
              key={index}
              className={`w-2 h-2 rounded-full transition-all ${
                index === currentStep ? 'bg-primary-500 w-6' : 'bg-gray-300'
              }`}
            />
          ))}
        </div>
        <Button 
          variant="ghost" 
          onClick={skipWalkthrough}
          className="text-gray-500 hover:text-gray-700"
        >
          Skip
        </Button>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 pb-24">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.3 }}
            className="text-center max-w-sm"
          >
            {/* Icon */}
            <div className={`w-32 h-32 mx-auto mb-8 bg-gradient-to-r ${walkthroughSteps[currentStep].gradient} rounded-full flex items-center justify-center text-white`}>
              {walkthroughSteps[currentStep].icon}
            </div>

            {/* Title */}
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              {walkthroughSteps[currentStep].title}
            </h2>

            {/* Description */}
            <p className="text-gray-600 leading-relaxed">
              {walkthroughSteps[currentStep].description}
            </p>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-6">
        <div className="flex justify-between items-center">
          <Button
            variant="ghost"
            onClick={prevStep}
            disabled={currentStep === 0}
            className="flex items-center space-x-2"
          >
            <ChevronLeftIcon className="w-4 h-4" />
            <span>Previous</span>
          </Button>

          <Button
            onClick={nextStep}
            className="flex items-center space-x-2"
          >
            <span>{currentStep === walkthroughSteps.length - 1 ? 'Get Started' : 'Next'}</span>
            <ChevronRightIcon className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}