import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui/button';
import { useTheme } from '../../lib/theme-provider';

interface WalkthroughSlide {
  title: string;
  description: string;
  illustration: string;
}

const slides: WalkthroughSlide[] = [
  {
    title: "Voicify – Your Creative Sound Studio!",
    description: "Experience the magic of Text to Speech, Voice Changer, and Translate Audio seamlessly. Let your voice be the masterpiece!",
    illustration: "🎭"
  },
  {
    title: "Voicify Learns Your Voice, Make it Awesome!",
    description: "Voicify learns your voice, allowing you to use it in Text to Speech. Your expressions, your way – a new dimension in creative storytelling.",
    illustration: "🎯"
  },
  {
    title: "Upgrade to Premium, Unlock Your Creativity",
    description: "Enjoy unlimited access, export projects in various formats (MP3, WAV, AAC, FLAC), and elevate your creations.",
    illustration: "⭐"
  }
];

const Walkthrough = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const navigate = useNavigate();
  const { theme } = useTheme();

  const nextSlide = () => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide(currentSlide + 1);
    } else {
      navigate('/');
    }
  };

  const skipWalkthrough = () => {
    navigate('/');
  };

  const slideVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 1000 : -1000,
      opacity: 0
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1
    },
    exit: (direction: number) => ({
      zIndex: 0,
      x: direction < 0 ? 1000 : -1000,
      opacity: 0
    })
  };

  return (
    <div className={`min-h-screen flex flex-col ${
      theme === 'dark' ? 'bg-slate-950' : 'bg-white'
    }`}>
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-12">
        {/* Skip Button */}
        <div className="absolute top-8 right-6">
          <Button 
            variant="ghost" 
            onClick={skipWalkthrough}
            className="text-muted-foreground hover:text-foreground"
          >
            Skip
          </Button>
        </div>

        <div className="w-full max-w-md text-center">
          {/* Phone Mockup */}
          <div className="mx-auto mb-8 relative">
            <div className="w-72 h-96 mx-auto rounded-[3rem] bg-gradient-to-b from-blue-500 to-purple-600 p-1 shadow-2xl">
              <div className={`w-full h-full rounded-[2.7rem] ${
                theme === 'dark' ? 'bg-slate-900' : 'bg-white'
              } overflow-hidden relative`}>
                {/* Status Bar */}
                <div className="flex justify-between items-center px-6 pt-4 pb-2">
                  <span className="text-sm font-medium">9:41</span>
                  <div className="flex items-center space-x-1">
                    <div className="flex space-x-1">
                      <div className="w-1 h-1 bg-current rounded-full"></div>
                      <div className="w-1 h-1 bg-current rounded-full"></div>
                      <div className="w-1 h-1 bg-current rounded-full"></div>
                      <div className="w-1 h-1 bg-current rounded-full"></div>
                    </div>
                    <div className="ml-1 text-sm">📶</div>
                    <div className="text-sm">🔋</div>
                  </div>
                </div>

                {/* App Content */}
                <div className="px-6 py-4">
                  <div className="flex items-center justify-between mb-6">
                    <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                      <span className="text-white text-xs font-bold">V</span>
                    </div>
                    <h1 className="font-bold text-lg">Voicify</h1>
                    <div className="w-6 h-6 rounded-full bg-gray-300 flex items-center justify-center">
                      <span className="text-xs">🔔</span>
                    </div>
                  </div>

                  {/* Feature Cards */}
                  <div className="space-y-3">
                    <div className="bg-gradient-to-r from-blue-100 to-purple-100 dark:from-blue-900/30 dark:to-purple-900/30 rounded-2xl p-4">
                      <div className="flex justify-between items-start mb-2">
                        <div className="bg-white dark:bg-slate-800 w-12 h-12 rounded-full flex items-center justify-center">
                          <span className="text-lg">👑</span>
                        </div>
                        <div className="text-right">
                          <span className="text-xs bg-white dark:bg-slate-800 px-2 py-1 rounded-full">💬</span>
                        </div>
                      </div>
                      <h3 className="font-semibold text-sm mb-1">Upgrade to Pro!</h3>
                      <p className="text-xs text-gray-600 dark:text-gray-300 mb-3">Enjoy all benefits without any restrictions</p>
                      <Button size="sm" className="bg-blue-500 hover:bg-blue-600 text-white text-xs px-4 py-1 h-auto rounded-full">
                        Upgrade
                      </Button>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div className="bg-white dark:bg-slate-800 rounded-2xl p-3 shadow-sm">
                        <div className="text-2xl mb-2">🎤</div>
                        <h4 className="font-medium text-xs mb-1">AI Voice Changer</h4>
                        <p className="text-xs text-gray-500 mb-2">Change your voice to someone else's voice.</p>
                        <Button size="sm" variant="outline" className="text-xs px-3 py-1 h-auto">Create</Button>
                      </div>
                      
                      <div className="bg-white dark:bg-slate-800 rounded-2xl p-3 shadow-sm">
                        <div className="text-2xl mb-2">🌐</div>
                        <h4 className="font-medium text-xs mb-1">AI Voice Translate</h4>
                        <p className="text-xs text-gray-500 mb-2">Translate your voice into another language.</p>
                        <Button size="sm" variant="outline" className="text-xs px-3 py-1 h-auto">Create</Button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Slide Content */}
          <AnimatePresence mode="wait" custom={1}>
            <motion.div
              key={currentSlide}
              custom={1}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{
                x: { type: "spring", stiffness: 300, damping: 30 },
                opacity: { duration: 0.2 }
              }}
              className="mb-8"
            >
              <div className="text-6xl mb-6">{slides[currentSlide].illustration}</div>
              <h2 className="text-2xl font-bold text-foreground mb-4">
                {slides[currentSlide].title}
              </h2>
              <p className="text-muted-foreground leading-relaxed max-w-sm mx-auto">
                {slides[currentSlide].description}
              </p>
            </motion.div>
          </AnimatePresence>

          {/* Pagination Dots */}
          <div className="flex justify-center space-x-2 mb-8">
            {slides.map((_, index) => (
              <div
                key={index}
                className={`w-2 h-2 rounded-full transition-colors ${
                  index === currentSlide
                    ? 'bg-blue-500'
                    : 'bg-gray-300 dark:bg-gray-600'
                }`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Actions */}
      <div className="px-6 pb-8">
        {currentSlide === slides.length - 1 ? (
          <Button 
            onClick={nextSlide}
            className="w-full bg-blue-500 hover:bg-blue-600 text-white py-3 rounded-2xl font-medium"
          >
            Get Started
          </Button>
        ) : (
          <Button 
            onClick={nextSlide}
            className="w-full bg-blue-500 hover:bg-blue-600 text-white py-3 rounded-2xl font-medium"
          >
            Continue
          </Button>
        )}
      </div>
    </div>
  );
};

export default Walkthrough;