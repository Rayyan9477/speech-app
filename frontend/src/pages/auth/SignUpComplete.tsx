import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui/button';
import { Card } from '../../components/ui/card';
import { useTheme } from '../../lib/theme-provider';
import {
  CheckCircleIcon,
  SparklesIcon,
  ArrowRightIcon
} from '@heroicons/react/24/outline';

const SignUpComplete = () => {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    setShowConfetti(true);
    const timer = setTimeout(() => {
      setShowConfetti(false);
    }, 3000);
    return () => clearTimeout(timer);
  }, []);

  const handleGetStarted = () => {
    navigate('/app');
  };

  const features = [
    {
      icon: '🎯',
      title: 'Personalized Experience',
      description: 'Your dashboard is customized based on your role and preferences'
    },
    {
      icon: '🚀',
      title: 'Free Trial Access',
      description: 'Start with 10 free voice generations to explore our features'
    },
    {
      icon: '💡',
      title: 'Smart Recommendations',
      description: 'Get AI-powered suggestions for voices and content types'
    }
  ];

  return (
    <div className="min-h-screen bg-background flex items-center justify-center py-8 px-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6 }}
        className="max-w-md w-full"
      >
        {/* Success Animation */}
        <div className="text-center mb-8 relative">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="w-24 h-24 mx-auto mb-6 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center relative"
          >
            <CheckCircleIcon className="w-12 h-12 text-green-600" />
            
            {/* Confetti Effect */}
            {showConfetti && (
              <>
                {[...Array(8)].map((_, i) => (
                  <motion.div
                    key={i}
                    initial={{ scale: 0, rotate: 0 }}
                    animate={{ 
                      scale: [0, 1, 0],
                      rotate: [0, 180, 360],
                      x: [0, (i % 2 === 0 ? 1 : -1) * (20 + i * 10)],
                      y: [0, -30 - i * 5, 10]
                    }}
                    transition={{ 
                      duration: 2,
                      delay: i * 0.1,
                      ease: "easeOut"
                    }}
                    className="absolute w-2 h-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"
                  />
                ))}
              </>
            )}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <h1 className="text-3xl font-bold text-foreground mb-3">
              Welcome to Voicify! 🎉
            </h1>
            <p className="text-muted-foreground text-lg">
              Your account has been created successfully
            </p>
          </motion.div>
        </div>

        {/* Features Preview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="space-y-4 mb-8"
        >
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.8 + index * 0.1 }}
            >
              <Card className="p-4 bg-primary/5 border-primary/20">
                <div className="flex items-start space-x-3">
                  <div className="text-2xl">{feature.icon}</div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-foreground mb-1">
                      {feature.title}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {feature.description}
                    </p>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.2 }}
          className="space-y-3"
        >
          <Button
            onClick={handleGetStarted}
            className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-semibold py-3 rounded-xl shadow-lg"
            size="lg"
          >
            <span className="flex items-center justify-center space-x-2">
              <SparklesIcon className="w-5 h-5" />
              <span>Start Creating</span>
              <ArrowRightIcon className="w-4 h-4" />
            </span>
          </Button>
          
          <div className="text-center">
            <p className="text-sm text-muted-foreground">
              Ready to transform your voice content?
            </p>
          </div>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.4 }}
          className="mt-8 text-center"
        >
          <div className="grid grid-cols-3 gap-4 p-4 bg-muted/50 rounded-lg">
            <div>
              <div className="text-2xl font-bold text-primary">10</div>
              <div className="text-xs text-muted-foreground">Free Generations</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-primary">50+</div>
              <div className="text-xs text-muted-foreground">AI Voices</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-primary">30+</div>
              <div className="text-xs text-muted-foreground">Languages</div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default SignUpComplete;