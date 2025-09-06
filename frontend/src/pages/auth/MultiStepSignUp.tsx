import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui/button';
import { Card } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { Progress } from '../../components/ui/progress';
import { useTheme } from '../../lib/theme-provider';
import {
  ArrowLeftIcon,
  CheckCircleIcon,
  UserIcon,
  BuildingOfficeIcon,
  DocumentTextIcon,
  CameraIcon
} from '@heroicons/react/24/outline';

interface SignUpData {
  role: string;
  companySize: string;
  contentType: string;
  profile: {
    company: string;
    position: string;
    industry: string;
    bio: string;
    website: string;
    avatar?: File;
  };
}

const MultiStepSignUp = () => {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const [currentStep, setCurrentStep] = useState(1);
  const [signUpData, setSignUpData] = useState<SignUpData>({
    role: '',
    companySize: '',
    contentType: '',
    profile: {
      company: '',
      position: '',
      industry: '',
      bio: '',
      website: ''
    }
  });

  const [isLoading, setIsLoading] = useState(false);
  const totalSteps = 4;
  const progress = (currentStep / totalSteps) * 100;

  const roles = [
    {
      id: 'content-creator',
      title: 'Content Creator',
      description: 'I create content for social media, YouTube, podcasts, etc.',
      icon: '🎬',
      popular: true
    },
    {
      id: 'business-owner',
      title: 'Business Owner',
      description: 'I own a business and need voice content for marketing',
      icon: '💼'
    },
    {
      id: 'educator',
      title: 'Educator',
      description: 'I create educational content and training materials',
      icon: '🎓'
    },
    {
      id: 'marketer',
      title: 'Marketer',
      description: 'I work in marketing and need voice content for campaigns',
      icon: '📈'
    },
    {
      id: 'developer',
      title: 'Developer',
      description: 'I build applications that need voice integration',
      icon: '💻'
    },
    {
      id: 'other',
      title: 'Other',
      description: 'My role is not listed above',
      icon: '✨'
    }
  ];

  const companySizes = [
    { id: '1', label: 'Just me', description: 'Individual creator' },
    { id: '2-10', label: '2-10 employees', description: 'Small team' },
    { id: '11-50', label: '11-50 employees', description: 'Growing company' },
    { id: '51-200', label: '51-200 employees', description: 'Established business' },
    { id: '201-500', label: '201-500 employees', description: 'Large company' },
    { id: '500+', label: '500+ employees', description: 'Enterprise' }
  ];

  const contentTypes = [
    {
      id: 'social-media',
      title: 'Social Media',
      description: 'Instagram, TikTok, YouTube Shorts',
      icon: '📱'
    },
    {
      id: 'podcasts',
      title: 'Podcasts & Audio',
      description: 'Podcasts, audiobooks, voice-overs',
      icon: '🎧'
    },
    {
      id: 'marketing',
      title: 'Marketing Content',
      description: 'Ads, product demos, explainers',
      icon: '📢'
    },
    {
      id: 'education',
      title: 'Educational Content',
      description: 'Online courses, tutorials, training',
      icon: '🎓'
    },
    {
      id: 'entertainment',
      title: 'Entertainment',
      description: 'Stories, games, creative projects',
      icon: '🎭'
    },
    {
      id: 'business',
      title: 'Business Communications',
      description: 'Presentations, meetings, announcements',
      icon: '💼'
    }
  ];

  const handleNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    } else {
      navigate('/signup');
    }
  };

  const handleComplete = async () => {
    setIsLoading(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Navigate to success page
    navigate('/signup-complete');
  };

  const updateSignUpData = (field: string, value: any) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setSignUpData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent as keyof SignUpData],
          [child]: value
        }
      }));
    } else {
      setSignUpData(prev => ({
        ...prev,
        [field]: value
      }));
    }
  };

  const isStepValid = () => {
    switch (currentStep) {
      case 1:
        return signUpData.role !== '';
      case 2:
        return signUpData.companySize !== '';
      case 3:
        return signUpData.contentType !== '';
      case 4:
        return signUpData.profile.company !== '' && signUpData.profile.position !== '';
      default:
        return false;
    }
  };

  const slideVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 300 : -300,
      opacity: 0
    }),
    center: {
      x: 0,
      opacity: 1
    },
    exit: (direction: number) => ({
      x: direction > 0 ? -300 : 300,
      opacity: 0
    })
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-foreground mb-2">What's your role?</h2>
              <p className="text-muted-foreground">Help us personalize your experience</p>
            </div>

            <div className="grid grid-cols-1 gap-4">
              {roles.map((role) => (
                <Card
                  key={role.id}
                  className={`p-4 cursor-pointer transition-all hover:shadow-md ${
                    signUpData.role === role.id
                      ? 'border-primary bg-primary/5 shadow-sm'
                      : 'border-border hover:border-primary/50'
                  }`}
                  onClick={() => updateSignUpData('role', role.id)}
                >
                  <div className="flex items-center space-x-4">
                    <div className="text-3xl">{role.icon}</div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <h3 className="font-semibold">{role.title}</h3>
                        {role.popular && (
                          <span className="bg-primary/10 text-primary text-xs px-2 py-1 rounded-full">
                            Popular
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">{role.description}</p>
                    </div>
                    {signUpData.role === role.id && (
                      <CheckCircleIcon className="w-6 h-6 text-primary" />
                    )}
                  </div>
                </Card>
              ))}
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-foreground mb-2">Company size</h2>
              <p className="text-muted-foreground">How big is your team?</p>
            </div>

            <div className="grid grid-cols-1 gap-3">
              {companySizes.map((size) => (
                <Card
                  key={size.id}
                  className={`p-4 cursor-pointer transition-all hover:shadow-md ${
                    signUpData.companySize === size.id
                      ? 'border-primary bg-primary/5 shadow-sm'
                      : 'border-border hover:border-primary/50'
                  }`}
                  onClick={() => updateSignUpData('companySize', size.id)}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold">{size.label}</h3>
                      <p className="text-sm text-muted-foreground">{size.description}</p>
                    </div>
                    {signUpData.companySize === size.id && (
                      <CheckCircleIcon className="w-6 h-6 text-primary" />
                    )}
                  </div>
                </Card>
              ))}
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-foreground mb-2">Content type</h2>
              <p className="text-muted-foreground">What kind of content do you create?</p>
            </div>

            <div className="grid grid-cols-1 gap-4">
              {contentTypes.map((type) => (
                <Card
                  key={type.id}
                  className={`p-4 cursor-pointer transition-all hover:shadow-md ${
                    signUpData.contentType === type.id
                      ? 'border-primary bg-primary/5 shadow-sm'
                      : 'border-border hover:border-primary/50'
                  }`}
                  onClick={() => updateSignUpData('contentType', type.id)}
                >
                  <div className="flex items-center space-x-4">
                    <div className="text-3xl">{type.icon}</div>
                    <div className="flex-1">
                      <h3 className="font-semibold">{type.title}</h3>
                      <p className="text-sm text-muted-foreground">{type.description}</p>
                    </div>
                    {signUpData.contentType === type.id && (
                      <CheckCircleIcon className="w-6 h-6 text-primary" />
                    )}
                  </div>
                </Card>
              ))}
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-foreground mb-2">Complete your profile</h2>
              <p className="text-muted-foreground">Tell us more about yourself</p>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-1 block">Company *</label>
                  <Input
                    placeholder="Your company name"
                    value={signUpData.profile.company}
                    onChange={(e) => updateSignUpData('profile.company', e.target.value)}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">Position *</label>
                  <Input
                    placeholder="Your job title"
                    value={signUpData.profile.position}
                    onChange={(e) => updateSignUpData('profile.position', e.target.value)}
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium mb-1 block">Industry</label>
                <Input
                  placeholder="e.g., Technology, Marketing, Education"
                  value={signUpData.profile.industry}
                  onChange={(e) => updateSignUpData('profile.industry', e.target.value)}
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-1 block">Website</label>
                <Input
                  placeholder="https://your-website.com"
                  value={signUpData.profile.website}
                  onChange={(e) => updateSignUpData('profile.website', e.target.value)}
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-1 block">Bio</label>
                <textarea
                  className="w-full p-3 border border-border rounded-lg resize-none h-24 bg-background"
                  placeholder="Tell us about yourself and what you do..."
                  value={signUpData.profile.bio}
                  onChange={(e) => updateSignUpData('profile.bio', e.target.value)}
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-1 block">Profile Picture</label>
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                    <CameraIcon className="w-6 h-6 text-primary" />
                  </div>
                  <Button variant="outline" size="sm">
                    Choose Photo
                  </Button>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="max-w-2xl mx-auto px-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleBack}
            className="p-2"
          >
            <ArrowLeftIcon className="w-5 h-5" />
          </Button>
          
          <div className="text-center">
            <div className="text-sm text-muted-foreground mb-2">
              Step {currentStep} of {totalSteps}
            </div>
            <Progress value={progress} className="w-32 h-2" />
          </div>
          
          <div className="w-10" /> {/* Spacer */}
        </div>

        {/* Step Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{
              x: { type: "spring", stiffness: 300, damping: 30 },
              opacity: { duration: 0.2 }
            }}
          >
            {renderStepContent()}
          </motion.div>
        </AnimatePresence>

        {/* Footer */}
        <div className="mt-12 flex justify-between items-center">
          <Button
            variant="ghost"
            onClick={handleBack}
            disabled={isLoading}
          >
            Back
          </Button>
          
          <Button
            onClick={handleNext}
            disabled={!isStepValid() || isLoading}
            className="min-w-24"
          >
            {isLoading ? (
              <div className="flex items-center space-x-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span>Creating...</span>
              </div>
            ) : currentStep === totalSteps ? (
              'Complete'
            ) : (
              'Continue'
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default MultiStepSignUp;