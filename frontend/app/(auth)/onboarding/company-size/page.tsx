'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { CheckIcon } from '@heroicons/react/24/solid';

const companySizes = [
  {
    id: 'solo',
    title: 'Just me',
    description: 'Individual creator or freelancer',
    icon: (
      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
        <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
      </svg>
    )
  },
  {
    id: 'small',
    title: '2-10 people',
    description: 'Small team or startup',
    icon: (
      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
        <path d="M16 4c0-1.11.89-2 2-2s2 .89 2 2-.89 2-2 2-2-.89-2-2zM4 4c0-1.11.89-2 2-2s2 .89 2 2-.89 2-2 2-2-.89-2-2zm5 0c0-1.11.89-2 2-2s2 .89 2 2-.89 2-2 2-2-.89-2-2zM16.85 7.35l1.41 1.41c.31.31.85.09.85-.35V6.5c0-.28-.22-.5-.5-.5H17c-.44 0-.66.54-.35.85L16.85 7.35zM1.79 12L1 11.21l.79-.79L0 10 1.79 8.21 1 7.42l.79-.79L1 6 2.21 6 2.42 5.79l.79.79L4 5.79l.21.21.79-.79L6 6.21 6.79 6l.79.79L8.21 6 9 6.79l.79-.79L10 6.21l.79.79L11.79 6 12 6.21v1.58c0 .44.54.66.85.35l1.41-1.41c.31-.31.09-.85-.35-.85H12.5c-.28 0-.5.22-.5.5v2.5c0 .28.22.5.5.5H15v1H9v2H7v-3H5v1H3v-2z"/>
      </svg>
    )
  },
  {
    id: 'medium',
    title: '11-50 people',
    description: 'Growing company',
    icon: (
      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
        <path d="M12 6c1.1 0 2 .9 2 2 0 1.1-.9 2-2 2s-2-.9-2-2c0-1.1.9-2 2-2m0 10c2.7 0 5.8 1.29 6 2H6c.23-.72 3.31-2 6-2m0-12C9.79 4 8 5.79 8 8s1.79 4 4 4 4-1.79 4-4-1.79-4-4-4zm0 10c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
      </svg>
    )
  },
  {
    id: 'large',
    title: '51-200 people',
    description: 'Established business',
    icon: (
      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
        <path d="M17 12c-2.76 0-5 2.24-5 5s2.24 5 5 5 5-2.24 5-5-2.24-5-5-5zm1.65 7.35L16.5 17.2V14h1v2.79l1.85 1.85-.7.71zM18 3h-3.18C14.4 1.84 13.3 1 12 1s-2.4.84-2.82 2H6c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h6.11c-.59-.57-1.07-1.25-1.42-2H6V5h2v3h8V5h2v5.08c.71.1 1.38.31 2 .58V5c0-1.1-.9-2-2-2zM12 5c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1z"/>
      </svg>
    )
  },
  {
    id: 'enterprise',
    title: '200+ people',
    description: 'Large enterprise',
    icon: (
      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
        <path d="M12 7V3H2v18h20V7H12zM6 19H4v-2h2v2zm0-4H4v-2h2v2zm0-4H4V9h2v2zm0-4H4V5h2v2zm4 12H8v-2h2v2zm0-4H8v-2h2v2zm0-4H8V9h2v2zm0-4H8V5h2v2zm10 12h-8v-2h2v-2h-2v-2h2v-2h-2V9h8v10zm-2-8h-2v2h2v-2zm0 4h-2v2h2v-2z"/>
      </svg>
    )
  }
];

export default function CompanySizePage() {
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const router = useRouter();

  const handleContinue = () => {
    if (selectedSize) {
      router.push('/onboarding/content-type');
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Header */}
      <div className="pt-12 px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-2xl font-bold text-gray-900 mb-2">How big is your team?</h1>
          <p className="text-gray-600">This helps us recommend the right features</p>
        </motion.div>
      </div>

      {/* Progress Indicator */}
      <div className="px-6 mt-6">
        <div className="flex items-center justify-center space-x-2">
          <div className="w-8 h-1 bg-primary-500 rounded-full"></div>
          <div className="w-8 h-1 bg-primary-500 rounded-full"></div>
          <div className="w-8 h-1 bg-gray-200 rounded-full"></div>
          <div className="w-8 h-1 bg-gray-200 rounded-full"></div>
        </div>
        <p className="text-center text-sm text-gray-500 mt-2">2 of 4</p>
      </div>

      {/* Company Size Selection */}
      <div className="flex-1 px-6 py-8">
        <div className="space-y-3 max-w-md mx-auto">
          {companySizes.map((size, index) => (
            <motion.div
              key={size.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
            >
              <button
                onClick={() => setSelectedSize(size.id)}
                className={`w-full p-4 rounded-xl border-2 transition-all text-left ${
                  selectedSize === size.id
                    ? 'border-primary-500 bg-primary-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center space-x-4">
                  {/* Icon */}
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                    selectedSize === size.id ? 'bg-primary-500 text-white' : 'bg-gray-100 text-gray-600'
                  }`}>
                    {size.icon}
                  </div>

                  {/* Content */}
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">{size.title}</h3>
                    <p className="text-sm text-gray-600">{size.description}</p>
                  </div>

                  {/* Check Icon */}
                  {selectedSize === size.id && (
                    <div className="w-6 h-6 bg-primary-500 rounded-full flex items-center justify-center">
                      <CheckIcon className="w-4 h-4 text-white" />
                    </div>
                  )}
                </div>
              </button>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Navigation */}
      <div className="px-6 pb-8 flex space-x-3">
        <Button
          variant="ghost"
          onClick={() => router.back()}
          className="flex-1 h-12 font-medium"
        >
          Back
        </Button>
        <Button
          onClick={handleContinue}
          disabled={!selectedSize}
          className="flex-1 h-12 font-medium"
        >
          Continue
        </Button>
      </div>
    </div>
  );
}