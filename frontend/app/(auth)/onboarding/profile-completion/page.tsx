'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar } from '@/components/ui/avatar';
import { CameraIcon } from '@heroicons/react/24/outline';

export default function ProfileCompletionPage() {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    avatar: null as File | null
  });
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const router = useRouter();

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleAvatarChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setFormData(prev => ({ ...prev, avatar: file }));
      const reader = new FileReader();
      reader.onload = (e) => {
        setAvatarPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleComplete = () => {
    // Validate form
    if (formData.firstName && formData.lastName && formData.email) {
      // Navigate to dashboard or next step
      router.push('/dashboard/home');
    }
  };

  const isFormValid = formData.firstName && formData.lastName && formData.email;

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Header */}
      <div className="pt-12 px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Complete your profile</h1>
          <p className="text-gray-600">Just a few more details to get started</p>
        </motion.div>
      </div>

      {/* Progress Indicator */}
      <div className="px-6 mt-6">
        <div className="flex items-center justify-center space-x-2">
          <div className="w-8 h-1 bg-primary-500 rounded-full"></div>
          <div className="w-8 h-1 bg-primary-500 rounded-full"></div>
          <div className="w-8 h-1 bg-primary-500 rounded-full"></div>
          <div className="w-8 h-1 bg-primary-500 rounded-full"></div>
        </div>
        <p className="text-center text-sm text-gray-500 mt-2">4 of 4</p>
      </div>

      {/* Profile Form */}
      <div className="flex-1 px-6 py-8">
        <div className="max-w-md mx-auto space-y-6">
          {/* Avatar Upload */}
          <motion.div
            className="text-center"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
          >
            <div className="relative inline-block">
              <div className="w-24 h-24 rounded-full overflow-hidden bg-gray-200 border-4 border-white shadow-lg">
                {avatarPreview ? (
                  <Image 
                    src={avatarPreview} 
                    alt="Avatar preview" 
                    className="w-full h-full object-cover"
                    width={96}
                    height={96}
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center text-white text-2xl font-bold">
                    {formData.firstName.charAt(0) || 'U'}
                  </div>
                )}
              </div>
              
              {/* Camera Button */}
              <label className="absolute bottom-0 right-0 w-8 h-8 bg-primary-500 rounded-full flex items-center justify-center cursor-pointer shadow-lg hover:bg-primary-600 transition-colors">
                <CameraIcon className="w-4 h-4 text-white" />
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarChange}
                  className="hidden"
                />
              </label>
            </div>
            <p className="text-sm text-gray-500 mt-2">Add a profile photo</p>
          </motion.div>

          {/* Form Fields */}
          <motion.div
            className="space-y-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            {/* First Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                First Name *
              </label>
              <Input
                type="text"
                value={formData.firstName}
                onChange={(e) => handleInputChange('firstName', e.target.value)}
                placeholder="Enter your first name"
                className="h-12"
              />
            </div>

            {/* Last Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Last Name *
              </label>
              <Input
                type="text"
                value={formData.lastName}
                onChange={(e) => handleInputChange('lastName', e.target.value)}
                placeholder="Enter your last name"
                className="h-12"
              />
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address *
              </label>
              <Input
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                placeholder="Enter your email address"
                className="h-12"
              />
            </div>
          </motion.div>

          {/* Terms and Privacy */}
          <motion.div
            className="text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <p className="text-xs text-gray-500 leading-relaxed">
              By completing your profile, you agree to our{' '}
              <button className="underline text-primary-600">Terms of Service</button>{' '}
              and{' '}
              <button className="underline text-primary-600">Privacy Policy</button>
            </p>
          </motion.div>
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
          onClick={handleComplete}
          disabled={!isFormValid}
          className="flex-1 h-12 font-medium"
        >
          Complete Setup
        </Button>
      </div>

      {/* Success Animation */}
      {isFormValid && (
        <motion.div
          className="fixed inset-0 pointer-events-none flex items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          <motion.div
            className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center"
            initial={{ scale: 0 }}
            animate={{ scale: [0, 1.2, 1] }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
            </svg>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}