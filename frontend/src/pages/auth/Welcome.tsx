import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '../../components/ui/button';
import { useTheme } from '../../lib/theme-provider';
import { Mic, Sparkles, Volume2 } from 'lucide-react';

const Welcome = () => {
  const { theme } = useTheme();

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.6,
        staggerChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.6
      }
    }
  };

  return (
    <div className={`min-h-screen flex flex-col ${
      theme === 'dark'
        ? 'bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900'
        : 'bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50'
    }`}>
      {/* Header */}
      <header className="p-6 flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center">
            <Mic className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-bold text-foreground">Voicify</span>
        </div>

        <Button
          variant="ghost"
          size="sm"
          className="text-muted-foreground hover:text-foreground"
        >
          Skip
        </Button>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 text-center">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="max-w-md"
        >
          {/* Animated Icons */}
          <motion.div
            variants={itemVariants}
            className="mb-8 relative"
          >
            <div className="w-32 h-32 mx-auto rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center mb-6">
              <div className="w-24 h-24 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                <Volume2 className="w-12 h-12 text-white" />
              </div>
            </div>

            {/* Floating elements */}
            <motion.div
              animate={{
                y: [0, -10, 0],
                rotate: [0, 5, 0]
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut"
              }}
              className="absolute -top-4 -right-4 w-8 h-8 rounded-full bg-yellow-400 flex items-center justify-center"
            >
              <Sparkles className="w-4 h-4 text-white" />
            </motion.div>

            <motion.div
              animate={{
                y: [0, 10, 0],
                rotate: [0, -5, 0]
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 1
              }}
              className="absolute -bottom-4 -left-4 w-6 h-6 rounded-full bg-pink-400 flex items-center justify-center"
            >
              <Mic className="w-3 h-3 text-white" />
            </motion.div>
          </motion.div>

          {/* Title */}
          <motion.h1
            variants={itemVariants}
            className="text-4xl font-bold text-foreground mb-4"
          >
            Transform Your Voice
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            variants={itemVariants}
            className="text-lg text-muted-foreground mb-8 leading-relaxed"
          >
            Create stunning voice content with AI-powered text-to-speech,
            voice cloning, and real-time translation. Your words, their voice.
          </motion.p>

          {/* Features */}
          <motion.div
            variants={itemVariants}
            className="flex justify-center space-x-8 mb-8"
          >
            <div className="text-center">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-2">
                <Volume2 className="w-6 h-6 text-primary" />
              </div>
              <span className="text-sm text-muted-foreground">TTS</span>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-2">
                <Mic className="w-6 h-6 text-primary" />
              </div>
              <span className="text-sm text-muted-foreground">Clone</span>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-2">
                <Sparkles className="w-6 h-6 text-primary" />
              </div>
              <span className="text-sm text-muted-foreground">Translate</span>
            </div>
          </motion.div>

          {/* Action Buttons */}
          <motion.div
            variants={itemVariants}
            className="space-y-4"
          >
            <Link to="/signup" className="block">
              <Button
                size="lg"
                className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-semibold py-3 rounded-xl shadow-lg"
              >
                Get Started
              </Button>
            </Link>

            <Link to="/login" className="block">
              <Button
                variant="outline"
                size="lg"
                className="w-full border-2 border-border hover:bg-accent font-semibold py-3 rounded-xl"
              >
                I Already Have an Account
              </Button>
            </Link>
          </motion.div>
        </motion.div>
      </main>

      {/* Footer */}
      <footer className="p-6 text-center">
        <p className="text-sm text-muted-foreground">
          By continuing, you agree to our{' '}
          <Link to="#" className="text-primary hover:underline">
            Terms of Service
          </Link>{' '}
          and{' '}
          <Link to="#" className="text-primary hover:underline">
            Privacy Policy
          </Link>
        </p>
      </footer>
    </div>
  );
};

export default Welcome;
